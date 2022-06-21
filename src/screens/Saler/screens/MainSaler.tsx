/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ACCESS_TOKEN_MAP,
  CloudBookingData,
  COLOR_MAIN_TOPIC,
  defaultCamera,
  DEFAULT_ZOOM_MAP,
  HEIGHT_WINDOW,
  PITCH_MAP,
  statusBar,
} from '../../../constants';
import Donut from '../../../components/Donut';
import CloudFlatList from '../../../components/CloudFlatList';
import {ROUTES} from '../../../configs/Routes';
import {useNavigation} from '@react-navigation/native';
// import auth from '@react-native-firebase/auth';
import {useSelector} from 'react-redux';
import {AppState, useAppDispatch} from '../../../redux/reducer';
import {standard_custom_map} from '../../../configs/mapStyle';
import MapView, {
  Camera,
  Marker,
  MarkerProps,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import {resetBooking, setBooking} from '../../../redux/reducers/jobReducer';
import {distance, point} from '@turf/turf';

const money_per_km = 5000;

const MainSaler = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const booking = useSelector((app: AppState) => app.job.jobState);
  const user = useSelector((state: AppState) => state.profile);
  const currentPicker = useSelector(
    (state: AppState) => state.saler.currentPickLocation,
  );
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState<MarkerProps>({
    description: '1',
    coordinate: {latitude: 0, longitude: 0},
    title: '1',
  });
  const [camera, setCamera] = useState<Camera>(defaultCamera);

  const onBooking = async () => {
    if (!booking.departure.place_name || !booking.destination.place_name) {
      ToastAndroid.show('Bạn cần điền đủ thông tin form...', 3000);
      return;
    }
    setupBooking();
  };
  const setupBooking = async () => {
    setLoading(true);
    const departure = booking.departure.region;
    const destination = booking.destination.region;
    const dataJson = await fetch(
      `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${departure.longitude},${departure.latitude};${destination.longitude},${destination.latitude}?access_token=${ACCESS_TOKEN_MAP}`,
    );
    const data = await dataJson.json();
    setLoading(false);
    if (data) {
      const fromPoint = point([departure.longitude, departure.latitude]);
      const toPoint = point([destination.longitude, destination.latitude]);
      const m_distance = distance(fromPoint, toPoint, {units: 'kilometers'});
      if (user) {
        dispatch(
          setBooking({
            ...booking,
            distance: parseFloat(m_distance.toFixed(2)),
            fee: money_per_km * parseFloat(m_distance.toFixed(2)),
            timestamp: new Date().getTime(),
            booker: user.id || '',
          }),
        );
        navigation.navigate(ROUTES.detaiBookingSaler as never);
      }
    } else {
      ToastAndroid.show('Lấy dữ liệu khoảng cách lỗi!', 4000);
    }
  };

  const onRegionChange = useCallback(
    (region: Region) => {
      setMarker({
        ...marker,
        coordinate: {
          longitude: region.longitude,
          latitude: region.latitude,
        },
      });
    },
    [setMarker],
  );

  const onRegionChangeComplete = useCallback(
    async (region: Region) => {
      const dataJson = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${region.longitude}%2C%20${region.latitude}.json?access_token=${ACCESS_TOKEN_MAP}`,
      );
      const data = await dataJson.json();
      if (data) {
        if (currentPicker === 'departure') {
          dispatch(
            setBooking({
              ...booking,
              departure: {
                place_name: data.features[0].place_name,
                region: region,
              },
            }),
          );
        } else {
          dispatch(
            setBooking({
              ...booking,
              destination: {
                place_name: data.features[0].place_name,
                region: region,
              },
            }),
          );
        }
      } else {
        console.log('Change Complete Region is Failed...');
      }
    },
    [dispatch, currentPicker],
  );

  useEffect(() => {
    if (currentPicker === 'destination') {
      console.log('Change View To Destination');
      setMarker({
        title: 'điểm đến',
        coordinate: {...booking.destination.region},
        pinColor: 'red',
      });
      setCamera({
        ...camera,
        center: {
          latitude: booking.destination.region.latitude,
          longitude: booking.destination.region.longitude,
        },
      });
    } else {
      console.log('Change View To Departure');
      setMarker({
        title: 'điểm đi',
        coordinate: {...booking.departure.region},
        pinColor: 'blue',
      });
      setCamera({
        ...camera,
        center: {
          latitude: booking.departure.region.latitude,
          longitude: booking.departure.region.longitude,
        },
      });
    }
  }, [currentPicker]);

  useEffect(() => {
    // dispatch(resetBooking());
    if (booking.status) {
      navigation.navigate(ROUTES.detaiBookingSaler as never);
    }
    return () => {};
  }, []);

  return (
    <View style={styles.body}>
      {loading ? (
        <ActivityIndicator color={COLOR_MAIN_TOPIC} size="large" />
      ) : (
        <View style={[styles.body]}>
          <MapView
            provider={PROVIDER_GOOGLE}
            camera={camera}
            customMapStyle={standard_custom_map}
            showsUserLocation
            showsMyLocationButton
            zoomEnabled
            zoomTapEnabled
            style={styles.mapContainer}
            onRegionChange={onRegionChange}
            onRegionChangeComplete={onRegionChangeComplete}>
            <Marker
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              pinColor={currentPicker === 'departure' ? 'blue' : 'red'}
            />
          </MapView>

          <View
            style={[
              styles.bookingContainer,
              {
                top: HEIGHT_WINDOW - statusBar - 200,
              },
            ]}>
            <View style={{flexDirection: 'row'}}>
              <Pressable style={styles.tabButton} onPress={onBooking}>
                <Text style={styles.tabText}>Đặt ngay</Text>
              </Pressable>
              <Pressable
                style={styles.tabButton}
                onPress={() => {
                  console.log('Hẹn giờ!');
                }}>
                <Text style={styles.tabText}> Hẹn giờ</Text>
              </Pressable>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Donut size={2} color="#007ca7" style={styles.donutView} />
                <View style={styles.groupDotView}>
                  <View style={styles.dotView} />
                  <View style={styles.dotView} />
                  <View style={styles.dotView} />
                  <View style={styles.dotView} />
                </View>
                <Donut size={2} color="#bf553d" style={styles.donutView} />
              </View>
              <View
                style={{
                  justifyContent: 'space-between',
                  marginLeft: 10,
                  width: '80%',
                }}>
                <TouchableOpacity>
                  <Text numberOfLines={1} style={{fontSize: 18}}>
                    {booking.departure.place_name || 'Bạn đang ở đâu?'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.lineView} />
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(
                      ROUTES.destinationSaler as never,
                      {} as never,
                    );
                  }}>
                  <Text numberOfLines={1} style={{fontSize: 18}}>
                    {booking.destination.place_name || 'Tôi muốn đến...'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <CloudFlatList
              style={{marginTop: 5, marginLeft: 10}}
              horizontal={true}
              data={CloudBookingData}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    height: HEIGHT_WINDOW - statusBar,
  },
  bookingContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 5,
    position: 'absolute',
    height: 190,
    width: '90%',
    left: '5%',
  },
  tabText: {
    color: '#28ae70',
    borderColor: '#28ae70',
    borderWidth: 1,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  lineView: {
    height: 0.5,
    width: '100%',
    backgroundColor: 'grey',
  },
  tabButton: {
    margin: 10,
  },
  dotView: {
    backgroundColor: 'grey',
    width: 2,
    height: 2,
    marginLeft: 10 + 2 * 4,
  },
  groupDotView: {
    marginVertical: 5,
    justifyContent: 'space-between',
    height: 25,
  },
  donutView: {
    marginLeft: 10,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  container: {
    height: 300,
    width: 300,
    backgroundColor: 'tomato',
  },
  map: {
    flex: 1,
  },
  buttonLocation: {
    width: 50,
    height: 50,
  },
});

export default MainSaler;
