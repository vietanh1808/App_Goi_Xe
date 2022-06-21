/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
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
  defaultCamera,
  defaultLocation,
  ID_USERLOCATION_FIELD,
  initUserInfor,
  JOB_COLLECTION,
  MAP_API_KEY,
  PITCH_MAP,
  USER_COLLECTION,
  USER_LOCATION_COLLECTION,
} from '../../../constants';
import {standard_custom_map} from '../../../configs/mapStyle';
import SelectDropdown from 'react-native-select-dropdown';
import {resetBooking, setBooking} from '../../../redux/reducers/jobReducer';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {ROUTES} from '../../../configs/Routes';
import {setCurrentPickLocation} from '../../../redux/reducers/userLocationReducer';
import ConfirmPayment from '../../modals/ConfirmPayment';
import {IUserParams} from '../../../models/Saler';
import {IJobParams} from '../../../models/Job';

const m_departure = {latitude: 20.9949, longitude: 105.8907};
const m_destination = {latitude: 20.976, longitude: 105.8803};

const BookingDetail = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useSelector((state: AppState) => state.profile);
  const job = useSelector((state: AppState) => state.job.jobState);

  const subcriber = React.useRef();

  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState<MarkerProps[]>([]);
  const [driverLocation, setDriverLocation] = useState<MarkerProps>({
    coordinate: {...defaultLocation},
  });
  const [camera, setCamera] = useState<Camera>(defaultCamera);
  const [polylines, setPolylines] = React.useState([]);
  const [alertDriverAccept, setAlertDriverAccept] = useState(false);
  const [driver, setDriver] = useState<IUserParams>(initUserInfor);
  const [driverId, setDriverId] = useState<string>('');

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
    const bookingData: IJobParams = {
      ...job,
      status: 'created',
      booker: user.id,
      timestamp: new Date().getTime(),
    };
    dispatch(setBooking(bookingData));
    const dataFetch = await firestore()
      .collection(JOB_COLLECTION)
      .add(bookingData);
    if (dataFetch.id) {
      const newData = {...bookingData, id: dataFetch.id};
      dispatch(setBooking(newData));
      ToastAndroid.show('Đặt xe thành công!', 4000);
    } else {
      ToastAndroid.show('Đặt xe thất bại!', 4000);
    }
    setLoading(false);
  };
  const onConfirmTask = async () => {
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
    console.log('Change Status Booking: ', job.status);
    dispatch(setBooking(jobUpdate));
    await firestore()
      .collection(JOB_COLLECTION)
      .doc(job.id)
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
    dispatch(resetBooking());
    await firestore()
      .collection(JOB_COLLECTION)
      .doc(job.id)
      .update({...job, status: 'cancel'})
      .then(() => {
        navigation.navigate(ROUTES.mainSaler as never);
      })
      .catch(() => {
        ToastAndroid.show('Có lỗi đã xảy ra. Vui lòng thử lại!', 3000);
      });
  };
  // --------------- END of EVENT CLICK ----------------

  const driverInfo = () => {
    const name = driver.username;
    const sex = driver.sex;
    const sdt = driver.phone;
    return `Name: ${name} \n Giới tính: ${sex} \n Số điện thoại: ${sdt}`;
  };

  const onCameraToDriverLocation = () => {
    setCamera({
      ...camera,
      center: {
        latitude: driverLocation.coordinate.latitude as never,
        longitude: driverLocation.coordinate.longitude as never,
      },
    });
  };

  useEffect(() => {
    console.log('status changed: ', job.status);
    return () => {};
  }, [job.status]);

  // On Snapshot If Driver Accept Booking
  useEffect(() => {
    console.log('onSnapshot Get Driver Location with Id: ', driverId);
    const subscriber = firestore()
      .collection(USER_LOCATION_COLLECTION)
      .doc(driverId)
      .onSnapshot(data => {
        if (data.exists) {
          console.log('Update Geolocation Driver');
          if (data?.data()?.geoLocation?.region) {
            setDriverLocation({
              ...driverLocation,
              coordinate: {...data?.data()?.geoLocation.region},
            });
          } else {
            setDriverLocation({
              ...driverLocation,
              coordinate: {...data?.data()?.geoLocation},
            });
          }
        }
      });
    return () => {
      subscriber();
    };
  }, [driverId]);

  // Get Driverr Location Id
  useEffect(() => {
    console.log('Get Driver Id Location');
    let subscriber: any;
    firestore()
      .collection(USER_LOCATION_COLLECTION)
      .where(ID_USERLOCATION_FIELD, '==', job.driver)
      .get()
      .then(data => {
        if (!data.empty) {
          setDriverId(data.docs[0].id);
        } else {
          console.log('Data is Empty');
        }
      });
    return () => {};
  }, [job.driver]);

  // On Snapshot If Id is Existed -> Get Driver Booking
  useEffect(() => {
    const subscriber = firestore()
      .collection(JOB_COLLECTION)
      .doc(job.id)
      .onSnapshot(data => {
        console.log('onSnapshot Get Driver Id');
        if (data.data()?.driver) {
          console.log('Your Booking is Accepted!');
          setAlertDriverAccept(true);
          firestore() // Get Driver Id
            .collection(USER_COLLECTION)
            .doc(data.data()?.driver)
            .get()
            .then(d => {
              console.log(' Get Driver Id: ', data.data()?.driver);
              setDriver(d.data() as IUserParams);
            });
        }
        dispatch(setBooking({...job, driver: data.data()?.driver || ''}));
      });
    return () => {
      subscriber();
    };
  }, [job.id]);

  useEffect(() => {
    dispatch(setCurrentPickLocation('departure'));
    setupMapView();
    fetchPolyline();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        dispatch(setCurrentPickLocation('departure'));
        return true;
      },
    );
    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <View style={{flex: 1}}>
      <ActivityIndicator
        style={{flex: 1, display: loading ? 'flex' : 'none'}}
        color={COLOR_MAIN_TOPIC}
        size="large"
      />
      <View style={{flex: 1}}>
        <ConfirmPayment
          title={'Người lái xe nhận đơn của bạn'}
          content={`Name: ${driver.username} \n Giới tính: ${driver.sex} \n Số điện thoại: ${driver.phone}`}
          style={{height: 200}}
          visible={alertDriverAccept}
          setVisible={setAlertDriverAccept}
          onConfirm={() => setAlertDriverAccept(false)}
        />
        <View
          style={{
            ...styles.section1,
            display: job.status ? 'none' : 'flex',
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
              buttonStyle={{...styles.button, height: 43, width: 100}}
              buttonTextStyle={styles.textButton}
              rowStyle={{padding: 10}}
              defaultValueByIndex={0}
              dropdownIconPosition="right"
            />
          </View>
          <View>
            <Text>Khoảng cách: </Text>
            <Text>{job.distance} km</Text>
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
          style={{
            ...styles.mapContainer,
            height: job.status && job.driver ? '75%' : '85%',
          }}>
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
            ...styles.sectionBelow,
            display: job.status !== '' ? 'flex' : 'none',
          }}>
          <View style={{...styles.section1}}>
            <Pressable
              onPress={onCancelTask}
              style={{
                ...styles.button,
                backgroundColor: '#ff0000',
              }}>
              <Text style={{...styles.textButton}}>Hủy đơn</Text>
            </Pressable>
            <Pressable
              onPress={() => setAlertDriverAccept(true)}
              style={{
                ...styles.button,
                backgroundColor: '#ff0000',
              }}>
              <Text style={{...styles.textButton}}>Thông tin</Text>
            </Pressable>
          </View>
          <View style={{...styles.section1}}>
            <Pressable
              onPress={onCameraToDriverLocation}
              style={{
                ...styles.button,
                display:
                  job.status === 'created' && job.driver ? 'flex' : 'none',
              }}>
              <Text style={{...styles.textButton}}>Vị trí lái xe</Text>
            </Pressable>
            <Pressable
              onPress={onConfirmTask}
              style={{
                ...styles.button,
                display:
                  job.status === 'created' && job.driver ? 'flex' : 'none',
              }}>
              <Text style={{...styles.textButton}}>Xác nhận đã đón</Text>
            </Pressable>
            <Pressable
              onPress={onConfirmTask}
              style={{
                ...styles.button,
                display:
                  job.status === 'inprogressing' && job.driver
                    ? 'flex'
                    : 'none',
              }}>
              <Text style={{...styles.textButton}}>Xác nhận đến nhà</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BookingDetail;

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '75%',
  },
  button: {
    padding: 10,
    backgroundColor: COLOR_MAIN_TOPIC,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {color: '#fff', fontSize: 18},
  section1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  feeText: {
    color: '#000',
    fontSize: 19,
    alignSelf: 'center',
  },
  sectionBelow: {
    padding: 10,
  },
});
