/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActivityIndicator,
  BackHandler,
  Button,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  StackActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import MapView, {
  Camera,
  Marker,
  MarkerProps,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {useSelector} from 'react-redux';
import {AppState, useAppDispatch} from '../../../redux/reducer';
import {
  ACCESS_TOKEN_MAP,
  BOOKER_FIELD,
  COLOR_MAIN_TOPIC,
  defaultLocation,
  ID_USERLOCATION_FIELD,
  JOB_COLLECTION,
  MAP_API_KEY,
  PITCH_MAP,
  USER_LOCATION_COLLECTION,
} from '../../../constants';
import {standard_custom_map} from '../../../configs/mapStyle';
import SelectDropdown from 'react-native-select-dropdown';
import {
  resetBooking,
  setBooking,
  setIdBooking,
  setStatusBooking,
} from '../../../redux/reducers/jobReducer';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {ROUTES} from '../../../configs/Routes';
import {setCurrentPickLocation} from '../../../redux/reducers/userLocationReducer';

const m_departure = {latitude: 20.9949, longitude: 105.8907};
const m_destination = {latitude: 20.976, longitude: 105.8803};
const money_per_km = 5000;

const BookingDetail = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useSelector((state: AppState) => state.profile);
  const job = useSelector((state: AppState) => state.job.jobState);
  const statusBooking = useSelector((state: AppState) => state.job.status);
  const jobId = useSelector((state: AppState) => state.job.id);

  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState<MarkerProps[]>([]);
  const [driverLocation, setDriverLocation] = useState<MarkerProps>({
    coordinate: {...defaultLocation},
  });
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
  const [polylines, setPolylines] = React.useState([]);

  // --------------- SET UP MAP ----------------
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
  const setupBooking = async () => {
    const departure = job.departure.region;
    const destination = job.destination.region;
    const dataJson = await fetch(
      `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${departure.longitude},${departure.latitude};${destination.longitude},${destination.latitude}?access_token=${ACCESS_TOKEN_MAP}`,
    );
    const data = await dataJson.json();
    if (data) {
      const distances = data.sources.map((d: any) => d.distance);
      const distance = distances.reduce((d1: any, d2: any) => {
        return d1 + d2;
      }, 0);
      if (user) {
        dispatch(
          setBooking({
            ...job,
            distance: distance,
            fee: money_per_km * Math.ceil(distance),
            timestamp: new Date().getTime(),
            booker: user.id || '',
          }),
        );
      }
    } else {
      ToastAndroid.show('Lấy dữ liệu khoảng cách lỗi!', 4000);
    }
  };
  const fetchPolyline = async () => {
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
  // --------------- END of SET UP MAP ----------------

  // --------------- EVENT CLICK ----------------
  const onConfirmBooking = async () => {
    setLoading(true);
    const dataFetch = await firestore().collection(JOB_COLLECTION).add(job);
    if (dataFetch.id) {
      dispatch(setIdBooking(dataFetch.id));
      dispatch(setStatusBooking('created'));
      ToastAndroid.show('Đặt xe thành công!', 4000);
    } else {
      ToastAndroid.show('Đặt xe thất bại!', 4000);
    }
    setLoading(false);
  };
  const onConfirmTask = async () => {
    console.log('A. ', job.status);
    let jobUpdate = job;
    switch (job.status) {
      case 'created':
        jobUpdate = {...job, status: 'inprogressing'};
        break;
      case 'inprogressing':
        jobUpdate = {...job, status: 'complete'};
        dispatch(resetBooking());
        break;
    }
    dispatch(setStatusBooking(jobUpdate.status));
    dispatch(setBooking(jobUpdate));
    await firestore()
      .collection(JOB_COLLECTION)
      .doc(jobId)
      .update(jobUpdate)
      .then(() => {
        if (jobUpdate.status === 'complete') {
          dispatch(resetBooking());
          navigation.navigate(ROUTES.mainSaler as never);
        }
      })
      .catch(() => {
        ToastAndroid.show('Có lỗi đã xảy ra. Vui lòng thử lại!', 3000);
      });
  };
  const onCancelTask = async () => {
    dispatch(setStatusBooking(''));
    dispatch(resetBooking());
    await firestore()
      .collection(JOB_COLLECTION)
      .doc(jobId)
      .update({...job, status: 'cancel'})
      .then(() => {
        dispatch(resetBooking());
        navigation.navigate(ROUTES.mainSaler as never);
      })
      .catch(() => {
        ToastAndroid.show('Có lỗi đã xảy ra. Vui lòng thử lại!', 3000);
      });
  };
  // --------------- END of EVENT CLICK ----------------

  // --------------- FIREBASE QUERY ----------------
  const onQueryIdDriverSuccess = (
    data: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => {
    console.log('Driver Id: ', data.data()?.driver);
    if (data.data()?.driver) {
      ToastAndroid.show('Your Booking is Accepted!', 4000);
    }
    dispatch(setBooking({...job, driver: data.data()?.driver || ''}));
  };
  const onQueryIdDriverFail = () => {
    console.log('Query Driver Id Failed...');
  };
  const onQueryDriverLocationSuccess = (
    data: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => {
    console.log(data.size);
    if (!data.empty) {
      if (data.docs[0]?.data()?.geoLocation?.region) {
        setDriverLocation({
          ...driverLocation,
          coordinate: {...data.docs[0]?.data()?.geoLocation.region},
        });
      }
    }
  };
  const onQueryDriverLocationFail = () => {
    console.log('Query Driver Location Failed...');
  };
  // --------------- END of FIREBASE QUERY ----------------

  useEffect(() => {
    dispatch(setCurrentPickLocation('departure'));

    setupMapView();
    setupBooking();
    fetchPolyline();

    let subscriber: any = null;
    if (job.driver) {
      console.log('Get Driver Location');
      subscriber = firestore()
        .collection(USER_LOCATION_COLLECTION)
        .where(ID_USERLOCATION_FIELD, '==', job.driver)
        .onSnapshot(onQueryDriverLocationSuccess, onQueryDriverLocationFail);
    } else {
      console.log('Get Driver Id');
      subscriber = firestore()
        .collection(JOB_COLLECTION)
        .doc(jobId)
        .onSnapshot(onQueryIdDriverSuccess, onQueryIdDriverFail);
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        dispatch(setCurrentPickLocation('departure'));
        return true;
      },
    );
    return () => {
      subscriber();
      backHandler.remove();
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
          <View
            style={{
              ...styles.section1,
              display: statusBooking ? 'none' : 'flex',
            }}>
            <View>
              <Text>Loại xe: </Text>
              <SelectDropdown
                data={['motor', 'car']}
                onSelect={(item, index) => {
                  console.log(item);
                }}
                buttonTextAfterSelection={(item, index) => {
                  switch (item) {
                    case 'motor':
                      return 'Xe máy';
                    case 'car':
                      return 'Ô tô';
                    default:
                      return '';
                  }
                }}
                rowTextForSelection={(item, index) => {
                  switch (item) {
                    case 'motor':
                      return 'Xe máy';
                    case 'car':
                      return 'Ô tô';
                    default:
                      return '';
                  }
                }}
                buttonStyle={{...styles.button, height: 43}}
                buttonTextStyle={styles.textButton}
                rowStyle={{padding: 10}}
                defaultValueByIndex={0}
                dropdownIconPosition="right"
              />
            </View>
            <View>
              <Text>Giá: </Text>
              <Text style={styles.feeText}>{job.fee} đ</Text>
            </View>
            <Pressable
              onPress={onConfirmBooking}
              style={{...styles.button, backgroundColor: '#ff1c27'}}>
              <Text style={styles.textButton}>Đặt xe</Text>
            </Pressable>
          </View>
          <MapView
            showsCompass={false}
            provider={PROVIDER_GOOGLE}
            customMapStyle={standard_custom_map}
            camera={camera}
            style={styles.mapContainer}>
            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={marker.coordinate}
                title={marker.title}
                pinColor={marker.pinColor}
              />
            ))}
            <Marker
              coordinate={driverLocation.coordinate}
              title={'Địa điểm người lái xe'}
              pinColor="green"
              style={{display: job.driver ? 'flex' : 'none'}}
            />
            <Polyline
              coordinates={polylines}
              strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
              strokeWidth={6}
            />
          </MapView>
          <View
            style={{
              ...styles.section1,
              display: statusBooking ? 'flex' : 'none',
              height: 50,
              alignItems: 'center',
            }}>
            <Pressable
              onPress={onCancelTask}
              style={{
                ...styles.button,
                backgroundColor: '#ff0000',
              }}>
              <Text style={{...styles.textButton}}>Hủy đơn</Text>
            </Pressable>
            <Pressable
              onPress={onConfirmTask}
              style={{
                ...styles.button,
                display: statusBooking === 'created' ? 'flex' : 'none',
                width: 200,
              }}>
              <Text style={{...styles.textButton}}>Người lái xe đã đón</Text>
            </Pressable>
            <Pressable
              onPress={onConfirmTask}
              style={{
                ...styles.button,
                display: statusBooking === 'inprogressing' ? 'flex' : 'none',
                width: 200,
              }}>
              <Text style={{...styles.textButton}}>Đã tới nơi</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default BookingDetail;

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '90%',
  },
  button: {
    padding: 10,
    backgroundColor: COLOR_MAIN_TOPIC,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {color: '#fff', fontSize: 18},
  section1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 10,
  },
  feeText: {
    color: '#000',
    fontSize: 19,
    alignSelf: 'center',
  },
});
