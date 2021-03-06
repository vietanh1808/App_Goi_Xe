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
  defaultCamera,
  initUserInfor,
  JOB_COLLECTION,
  PITCH_MAP,
  USER_COLLECTION,
  USER_LOCATION_COLLECTION,
} from '../../constants';
import {standard_custom_map} from '../../configs/mapStyle';
import firestore from '@react-native-firebase/firestore';
import {ROUTES} from '../../configs/Routes';
import ConfirmExit from '../modals/ConfirmExit';
import ConfirmPayment from '../modals/ConfirmPayment';
import Geolocation from '@react-native-community/geolocation';
import {resetBooking, setBooking} from '../../redux/reducers/jobReducer';
import {IUserParams} from '../../models/Saler';

const BookingDetailDriver = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const job = useSelector((state: AppState) => state.job.jobState);
  const driverId = useSelector((state: AppState) => state.profile.id);
  const userLocation = useSelector((state: AppState) => state.saler);

  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState<MarkerProps[]>([]);
  const [camera, setCamera] = useState<Camera>(defaultCamera);
  const [isShowHeader, setIsShowHeader] = useState(true);
  const [polylines, setPolylines] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [booker, setBooker] = useState<IUserParams>(initUserInfor);
  const [driverInfoModal, setDriverInfoModal] = useState(false);
  const [statusBooking, setStatusBooking] = useState(false);

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

  const onNavigateToDeparture = async () => {
    setLoading(true);
    if (job.id && driverId) {
      await firestore()
        .collection(JOB_COLLECTION)
        .doc(job.id)
        .update({...job, driver: driverId, status: 'accept'})
        .then(() => {
          navigation.navigate(ROUTES.routeToDeparture as never);
        })
        .catch(() => {
          ToastAndroid.show('C?? l???i ???? x???y ra...', 3000);
        });
    }
    setLoading(false);
  };

  const onConfirmBooking = async () => {
    console.log('Booking Confirmed!');
    const dataStore = await firestore()
      .collection(JOB_COLLECTION)
      .doc(job.id)
      .get();
    if (dataStore.exists) {
      setStatusBooking(true); // Snapshot Status booking
      switch (dataStore.data()?.status) {
        case 'created':
          setStatusBooking(false); // disable snapshot and Navigate Screen
          onNavigateToDeparture();
          break;
        case 'inprogressing':
          setIsShowHeader(false);
          onDisableBackButton(true);
          setLocationTracking();
          break;
        case 'cancel':
          ToastAndroid.show('????n n??y ???? b??? h???y', 4000);
          dispatch(resetBooking());
          navigation.goBack();
          break;
        case 'accept':
          ToastAndroid.show('????n n??y ???? ???????c nh???n b???i ng?????i l??i xe kh??c', 4000);
          dispatch(resetBooking());
          navigation.goBack();
          break;
        case 'complete':
          ToastAndroid.show('????n n??y ???? ho??n th??nh', 4000);
          dispatch(resetBooking());
          navigation.goBack();
          break;
        default:
          ToastAndroid.show('??ang c?? l???i x???y ra. Vui l??ng th??? l???i sau', 4000);
          dispatch(resetBooking());
          navigation.goBack();
      }
    }
  };

  const onDisableBackButton = (status: boolean) => {
    navigation.setOptions({
      headerShown: !status,
    });
  };

  const onPaymentConfirm = () => {
    ToastAndroid.show('B???n ???? ho??n th??nh ?????t xe', 3000);
    dispatch(resetBooking());
    setOpenPaymentModal(false);
    navigation.navigate(ROUTES.mainDriver as never);
  };

  const onCompleteTask = async () => {
    const dataStore = await firestore()
      .collection(JOB_COLLECTION)
      .doc(job.id)
      .get();
    if (dataStore.exists) {
      if (dataStore.data()?.status === 'complete') {
        setOpenPaymentModal(true);
      } else {
        ToastAndroid.show('B???n c???n c?? x??c nh???n c???a Kh??ch h??ng', 4000);
      }
    }
  };

  const onCancelTask = async () => {
    setIsOpenModal(false);
    await firestore()
      .collection(JOB_COLLECTION)
      .doc(job.id)
      .update({
        ...job,
        status: 'cancel',
      })
      .then(() => {
        dispatch(resetBooking());
        navigation.navigate(ROUTES.mainDriver as never);
        ToastAndroid.show('H???y ????n th??nh c??ng!', 3000);
      })
      .catch(() => {
        ToastAndroid.show('H???y ????n th???t b???i!', 4000);
      });
  };

  const getBookerInfo = () => {
    firestore()
      .collection(USER_COLLECTION)
      .doc(job.booker)
      .get()
      .then(data => {
        setBooker(data.data() as never);
        console.log('Get Booker Success');
      })
      .catch(e => {
        console.log('Get Booker Error');
        console.log(e);
      });
  };

  const bookerInfoContent = () => {
    const name = booker.username;
    const sex = booker.sex;
    const sdt = booker.phone;
    return `Name: ${name} \n Gi???i t??nh: ${sex} \n S??? ??i???n tho???i: ${sdt}`;
  };

  useEffect(() => {
    if (!statusBooking) return;

    const subscriber = firestore()
      .collection(JOB_COLLECTION)
      .doc(job.id)
      .onSnapshot(data => {
        if (data.data()?.status === 'cancel') {
          setOpenCancelModal(true);
        }
      });

    return () => {
      subscriber();
    };
  }, [statusBooking]);

  useEffect(() => {
    setupMapView();
    setMapPolyline();
    getBookerInfo();

    const watchId = Geolocation.watchPosition(
      position => {
        console.log('Driver Moved');
        firestore()
          .collection(USER_LOCATION_COLLECTION)
          .doc(userLocation.userLocation.id)
          .update({
            ...userLocation.userLocation,
            geoLocation: {...position.coords},
            timestamp: position.timestamp,
          })
          .then(d => {
            console.log('Update Location Driver Completed');
          })
          .catch(e => {
            console.log('Update Location Driver Failed');
            console.log(e);
          });
      },
      error => {
        console.log(error);
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
          {/* ******* MODAL ********* */}
          <ConfirmPayment
            title={'????n h??ng ???? b??? h???y!'}
            onConfirm={() => {
              setOpenCancelModal(false);
              navigation.navigate(ROUTES.mainDriver as never);
            }}
            visible={openCancelModal}
            setVisible={setOpenCancelModal}
            style={{height: 200}}
          />
          <ConfirmPayment
            title={'X??c nh???n thanh to??n v???i s??? ti???n: ' + job.fee}
            onConfirm={onPaymentConfirm}
            visible={openPaymentModal}
            setVisible={setOpenPaymentModal}
            style={{height: 200}}
          />
          <ConfirmExit
            content="B???n ch???c ch???n mu???n h???y ????n n??y?"
            setVisible={setIsOpenModal}
            visible={isOpenModal}
            onConfirm={onCancelTask}
          />
          <ConfirmPayment
            title={'???? c?? ng?????i l??i xe nh???n ????n c???a b???n'}
            // content={`Name: ${booker.username} \n Gi???i t??nh: ${booker.sex} \n S??? ??i???n tho???i: ${booker.phone}`}
            content={bookerInfoContent()}
            style={{height: 200}}
            visible={driverInfoModal}
            setVisible={setDriverInfoModal}
            onConfirm={() => setDriverInfoModal(false)}
          />
          {/* **** END of MODAL ******* */}
          <View
            style={{
              ...styles.section1,
              display: isShowHeader ? 'flex' : 'none',
            }}>
            <View>
              <View>
                <Text>Kho???ng c??ch</Text>
                <Text> {job.distance.toFixed(2) + ' Km'}</Text>
              </View>
              <View>
                <Text>S??? ??i???n tho???i</Text>
                <Text> {booker?.phone}</Text>
              </View>
            </View>

            <View>
              <Text>Gi??: </Text>
              <Text style={styles.feeText}>{job.fee} ??</Text>
            </View>
            <Pressable
              onPress={onConfirmBooking}
              style={{...styles.button, backgroundColor: '#ff1c27'}}>
              <Text style={styles.textButton}>Nh???n ????n</Text>
            </Pressable>
          </View>
          <MapView
            showsUserLocation
            showsMyLocationButton
            followsUserLocation
            showsCompass={false}
            provider={PROVIDER_GOOGLE}
            customMapStyle={standard_custom_map}
            camera={{...camera, zoom: 13}}
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
                width: '20%',
                backgroundColor: '#ff0000',
              }}>
              <Text style={{...styles.textButton}}>H???y</Text>
            </Pressable>
            <Pressable
              onPress={() => setDriverInfoModal(true)}
              style={{
                ...styles.button,
                width: '20%',
                backgroundColor: '#ff0000',
              }}>
              <Text style={{...styles.textButton}}>Th??ng tin</Text>
            </Pressable>
            <Pressable
              onPress={onCompleteTask}
              style={{
                ...styles.button,
                width: '60%',
              }}>
              <Text style={{...styles.textButton}}>Ho??n th??nh nhi???m v???</Text>
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
