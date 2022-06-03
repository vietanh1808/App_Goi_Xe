/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import {
  View,
  Text,
  StatusBar,
  Dimensions,
  Touchable,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ICamera} from '../../../models/Maps';
import {
  ACCESS_TOKEN_MAP,
  CloudBookingData,
  COLOR_MAIN_TOPIC,
  DEFAULT_ZOOM_MAP,
  HEIGHT_WINDOW,
  JOB_COLLECTION,
  MAP_API_KEY,
  MAX_ZOOM_MAP,
  MIN_ZOOM_MAP,
  PITCH_MAP,
  statusBar,
} from '../../../constants';
import Donut from '../../../components/Donut';
import CloudFlatList from '../../../components/CloudFlatList';
import {ROUTES} from '../../../configs/Routes';
import {useNavigation, useRoute} from '@react-navigation/native';
// import auth from '@react-native-firebase/auth';
import {useDispatch, useSelector} from 'react-redux';
import {AppState, useAppDispatch} from '../../../redux/reducer';
import {standard_custom_map} from '../../../configs/mapStyle';
import MapView, {
  Camera,
  Marker,
  MarkerAnimated,
  MarkerProps,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import {setBooking, setStatusBooking} from '../../../redux/reducers/jobReducer';
import MapViewDirections from 'react-native-maps-directions';

const origin = {latitude: 21.0031, longitude: 105.8201};
const destination = {latitude: 21.0277, longitude: 105.8341};

const MainSaler = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const booking = useSelector((app: AppState) => app.job.jobState);
  const job = useSelector((app: AppState) => app.job);
  const currentPicker = useSelector(
    (state: AppState) => state.saler.currentPickLocation,
  );

  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState<MarkerProps>({
    description: '1',
    coordinate: {latitude: 0, longitude: 0},
    title: '1',
  });
  const [camera, setCamera] = useState<Camera>({
    center: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    pitch: PITCH_MAP,
    altitude: 0,
    zoom: DEFAULT_ZOOM_MAP,
    heading: 10,
  });

  const onBooking = async () => {
    if (!booking.departure.place_name || !booking.destination.place_name) {
      ToastAndroid.show('Bạn cần điền đủ thông tin form...', 3000);
      return;
    }
    navigation.navigate(ROUTES.detaiBookingSaler as never);
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

  const setUserView = () => {
    if (currentPicker === 'destination') {
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
  };

  useEffect(() => {
    if (job.status) {
      navigation.navigate(ROUTES.detaiBookingSaler as never);
    }

    setUserView();
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
