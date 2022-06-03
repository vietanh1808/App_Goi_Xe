/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActivityIndicator,
  Button,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import MapView, {
  Camera,
  Marker,
  MarkerProps,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {useSelector} from 'react-redux';
import {AppState, useAppDispatch} from '../../redux/reducer';
import {
  ACCESS_TOKEN_MAP,
  COLOR_MAIN_TOPIC,
  DEFAULT_ZOOM_MAP,
  JOB_COLLECTION,
  MAP_API_KEY,
  PITCH_MAP,
  USER_LOCATION_COLLECTION,
} from '../../constants';
import {standard_custom_map} from '../../configs/mapStyle';
import SelectDropdown from 'react-native-select-dropdown';
import MapViewDirections from 'react-native-maps-directions';
import {resetBooking, setBooking} from '../../redux/reducers/jobReducer';
import firestore from '@react-native-firebase/firestore';
import {ROUTES} from '../../configs/Routes';
import ConfirmExit from '../modals/ConfirmExit';
import ConfirmPayment from '../modals/ConfirmPayment';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';

const BookingDetailDriver = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const job = useSelector((state: AppState) => state.job.jobState);
  const jobId = useSelector((state: AppState) => state.job.id);
  const driverId = useSelector((state: AppState) => state.profile.id);
  const userLocation = useSelector((state: AppState) => state.saler);

  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState<MarkerProps[]>([]);
  const [camera, setCamera] = useState<Camera>({
    center: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    pitch: PITCH_MAP,
    altitude: 0,
    zoom: 15,
    heading: 10,
  });
  const [isShowHeader, setIsShowHeader] = useState(true);
  const [polylines, setPolylines] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);

  const onNavigateToDeparture = async () => {
    setLoading(true);
    if (jobId && driverId) {
      await firestore()
        .collection(JOB_COLLECTION)
        .doc(jobId)
        .update({...job, driver: driverId, status: 'accept'})
        .then(() => {
          navigation.navigate(ROUTES.routeToDeparture as never);
        })
        .catch(() => {
          ToastAndroid.show('Có lỗi đã xảy ra...', 3000);
        });
    }
    setLoading(false);
  };

  const onConfirmBooking = async () => {
    const dataStore = await firestore()
      .collection(JOB_COLLECTION)
      .doc(jobId)
      .get();
    if (dataStore.exists) {
      if (dataStore.data()?.status === 'created') {
        onNavigateToDeparture();
      } else if (dataStore.data()?.status === 'inprogressing') {
        setIsShowHeader(false);
        onDisableBackButton(true);
        setLocationTracking();
      } else if (dataStore.data()?.status === 'cancel') {
        ToastAndroid.show('Đơn này đã bị hủy', 4000);
        navigation.goBack();
      }
    }
  };

  const onDisableBackButton = (status: boolean) => {
    navigation.setOptions({
      headerShown: !status,
    });
  };

  const setLocationTracking = () => {
    setCamera({
      ...camera,
      zoom: 20,
      pitch: 5,
      center: {
        latitude: userLocation.userLocation.geoLocation.region.latitude,
        longitude: userLocation.userLocation.geoLocation.region.longitude,
      },
    });
  };

  const setupMapView = () => {
    const departure: MarkerProps = {
      coordinate: {...job.departure.region},
      title: job.departure.place_name,
      pinColor: 'blue',
    };
    const destination: MarkerProps = {
      coordinate: {...job.destination.region},
      title: job.destination.place_name,
      pinColor: 'red',
    };
    setMarkers([departure, destination]);
    setCamera({
      center: {
        latitude:
          (job.departure.region.latitude + job.destination.region.latitude) / 2,
        longitude:
          (job.departure.region.longitude + job.destination.region.longitude) /
          2,
      },
      pitch: PITCH_MAP,
      altitude: 0,
      zoom: 15,
      heading: 10,
    });
  };

  const setMapPolyline = async () => {
    const dataFetch = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${job.departure.region.longitude}%2C${job.departure.region.latitude}%3B${job.destination.region.longitude}%2C${job.destination.region.latitude}.json?geometries=polyline&alternatives=true&steps=true&access_token=${ACCESS_TOKEN_MAP}`,
    );
    const data = await dataFetch.json();
    setPolylines(
      data.routes[0].legs[0].steps.map((d: any) => {
        return {
          longitude: d.maneuver.location[0],
          latitude: d.maneuver.location[1],
        };
      }),
    );
  };

  const onPaymentConfirm = () => {
    ToastAndroid.show('Bạn đã hoàn thành đặt xe', 3000);
    navigation.navigate(ROUTES.mainDriver as never);
  };

  const onCompleteTask = async () => {
    const dataStore = await firestore()
      .collection(JOB_COLLECTION)
      .doc(jobId)
      .get();
    if (dataStore.exists) {
      if (dataStore.data()?.status === 'complete') {
        setOpenPaymentModal(true);
      } else {
        ToastAndroid.show('Bạn cần có xác nhận của Khách hàng', 4000);
      }
    }
  };

  const onCancelTask = async () => {
    await firestore()
      .collection(JOB_COLLECTION)
      .doc(jobId)
      .update({
        ...job,
        status: 'cancel',
      })
      .then(() => {
        navigation.navigate(ROUTES.mainDriver as never);
        ToastAndroid.show('Hủy đơn thành công!', 3000);
      })
      .catch(() => {
        ToastAndroid.show('Hủy đơn thất bại!', 4000);
      });
  };

  const checkStatusBooking = async () => {
    const dataStore = await firestore()
      .collection(JOB_COLLECTION)
      .doc(jobId)
      .get();
    if (dataStore.exists) {
      if (dataStore.data()?.status === 'inprogressing') {
        setIsShowHeader(false);
        onDisableBackButton(true);
        setLocationTracking();
      } else if (dataStore.data()?.status === 'cancel') {
      }
    }
  };

  useEffect(() => {
    setupMapView();
    setMapPolyline();

    const watchId = Geolocation.watchPosition(
      position => {
        console.log('Driver Moved');
        firestore()
          .collection(USER_LOCATION_COLLECTION)
          .doc(userLocation.id)
          .update({
            ...userLocation.userLocation,
            geoLocation: {...position.coords},
            timestamp: position.timestamp,
          });
      },
      error => {
        console.log(error);
        ToastAndroid.show('Bạn cần cấp quyền truy cập địa chỉ!', 4000);
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <View style={{flex: 1}}>
      {loading ? (
        <ActivityIndicator
          style={{flex: 1}}
          color={COLOR_MAIN_TOPIC}
          size="large"
        />
      ) : (
        <View style={{flex: 1}}>
          <ConfirmPayment
            title={'Đơn hàng đã bị hủy!'}
            onConfirm={() => {
              navigation.navigate(ROUTES.mainDriver as never);
            }}
            visible={openCancelModal}
            setVisible={setOpenCancelModal}
            style={{height: 200}}
          />
          <ConfirmPayment
            title={'Xác nhận thanh toán với số tiền: ' + job.fee}
            onConfirm={onPaymentConfirm}
            visible={openPaymentModal}
            setVisible={setOpenPaymentModal}
            style={{height: 200}}
          />
          <ConfirmExit
            content="Bạn chắc chắn muốn hủy đơn này?"
            setVisible={setIsOpenModal}
            visible={isOpenModal}
            onConfirm={onCancelTask}
          />
          <View
            style={{
              ...styles.section1,
              display: isShowHeader ? 'flex' : 'none',
            }}>
            <View>
              <Text>Khoảng cách</Text>
              <Text> {job.distance.toFixed(2) + ' Km'}</Text>
            </View>
            <View>
              <Text>Giá: </Text>
              <Text style={styles.feeText}>{job.fee} đ</Text>
            </View>
            <Pressable
              onPress={onConfirmBooking}
              style={{...styles.button, backgroundColor: '#ff1c27'}}>
              <Text style={styles.textButton}>Nhận đơn</Text>
            </Pressable>
          </View>
          <MapView
            showsUserLocation
            showsMyLocationButton
            followsUserLocation
            showsCompass={false}
            provider={PROVIDER_GOOGLE}
            customMapStyle={standard_custom_map}
            camera={camera}
            style={{
              ...styles.mapContainer,
              height: isShowHeader ? '90%' : '90%',
            }}>
            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={marker.coordinate}
                title={marker.title}
                pinColor={marker.pinColor}
              />
            ))}
            <Polyline
              coordinates={polylines}
              strokeColor="#000"
              strokeWidth={6}
            />
          </MapView>
          <View
            style={{
              ...styles.viewButton,
              display: isShowHeader ? 'none' : 'flex',
            }}>
            <Pressable
              onPress={() => setIsOpenModal(true)}
              style={{
                ...styles.button,
                width: '30%',
                backgroundColor: '#ff0000',
              }}>
              <Text style={{...styles.textButton}}>Hủy đơn</Text>
            </Pressable>
            <Pressable
              onPress={onCompleteTask}
              style={{
                ...styles.button,
                width: '60%',
              }}>
              <Text style={{...styles.textButton}}>Hoàn thành nhiệm vụ</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default BookingDetailDriver;

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '80%',
  },
  button: {
    padding: 10,
    backgroundColor: COLOR_MAIN_TOPIC,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textButton: {color: '#fff', fontSize: 18},
  section1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 50,
  },
  feeText: {
    color: '#000',
    fontSize: 19,
    alignSelf: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    height: '8%',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
});
