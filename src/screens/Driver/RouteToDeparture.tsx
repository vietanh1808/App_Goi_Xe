/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Button, StyleSheet, Text, ToastAndroid, View} from 'react-native';
import React from 'react';
import {ILocation} from '../../redux/reducers/userLocationReducer';
import MapView, {
  Camera,
  Marker,
  MarkerProps,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import {standard_custom_map} from '../../configs/mapStyle';
import {
  ACCESS_TOKEN_MAP,
  defaultLocation,
  JOB_COLLECTION,
  MAP_API_KEY,
} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {AppState, useAppDispatch} from '../../redux/reducer';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import {IJobParams} from '../../models/Job';
import {ROUTES} from '../../configs/Routes';
import ConfirmPayment from '../modals/ConfirmPayment';

const RouteToDeparture = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const jobState = useSelector((state: AppState) => state.job);
  const userLocaion = useSelector((state: AppState) => state.saler);
  const [polylines, setPolylines] = React.useState([]);
  const [curLocation, setCurLocation] = React.useState<{
    location: Region;
    placeName: string;
  }>({
    location: defaultLocation,
    placeName: '',
  });
  const [openCancelModal, setOpenCancelModal] = React.useState(false);

  const onConfirmTask = async () => {
    const dataStore = await firestore()
      .collection(JOB_COLLECTION)
      .doc(jobState.jobState.id)
      .get();
    console.log('Confirm Task: ', dataStore.exists);
    if (dataStore.exists) {
      if (dataStore.data()?.status === 'inprogressing') {
        navigation.goBack();
      } else {
        ToastAndroid.show('Bạn cần có xác nhận của Khách hàng', 3000);
      }
    }
  };

  const onCancelTask = async () => {
    const data: IJobParams = {
      ...jobState.jobState,
      status: 'cancel',
      driver: '',
    };
    await firestore()
      .collection(JOB_COLLECTION)
      .doc(jobState.jobState.id)
      .update(data)
      .then(() => {
        console.log('Cancel Task Successs');
        navigation.goBack();
      })
      .catch(e => {
        console.log('Cancel Task Failed!');
        navigation.goBack();
      });
  };

  const fetchPolyline = async () => {
    const dataFetch = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${userLocaion.userLocation.geoLocation.region.longitude}%2C${userLocaion.userLocation.geoLocation.region.latitude}%3B${jobState.jobState.departure.region.longitude}%2C${jobState.jobState.departure.region.latitude}.json?geometries=polyline&alternatives=true&steps=true&access_token=${ACCESS_TOKEN_MAP}`,
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

  const getLocationName = async () => {
    const region = curLocation.location;
    const dataJson = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${region.longitude}%2C%20${region.latitude}.json?access_token=${ACCESS_TOKEN_MAP}`,
    );
    const data = await dataJson.json();

    setCurLocation({
      ...curLocation,
      placeName: data.features[0].place_name,
      location: userLocaion.userLocation.geoLocation.region,
    });
  };

  React.useEffect(() => {
    getLocationName();
  }, [curLocation.location]);

  React.useEffect(() => {
    fetchPolyline();

    const subscriber = firestore()
      .collection(JOB_COLLECTION)
      .doc(jobState.jobState.id)
      .onSnapshot(data => {
        if (data.data()?.status === 'cancel') {
          setOpenCancelModal(true);
        }
      });
    return () => {
      subscriber();
    };
  }, []);

  return (
    <View>
      <ConfirmPayment
        title={'Đơn hàng đã bị hủy!'}
        onConfirm={() => {
          setOpenCancelModal(false);
          navigation.navigate(ROUTES.mainDriver as never);
        }}
        visible={openCancelModal}
        setVisible={setOpenCancelModal}
        style={{height: 200}}
      />
      <MapView
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
        showsCompass={false} // hiển thị la bàn
        provider={PROVIDER_GOOGLE}
        customMapStyle={standard_custom_map}
        camera={{
          center: {...userLocaion.userLocation.geoLocation.region},
          pitch: 5,
          heading: 10,
          zoom: 13,
          altitude: 0,
        }}
        style={{
          ...styles.mapContainer,
        }}>
        <Marker
          coordinate={userLocaion.userLocation.geoLocation.region}
          pinColor={'blue'}
          title={curLocation.placeName}
        />
        <Marker
          coordinate={jobState.jobState.departure.region}
          pinColor={'red'}
          title={jobState.jobState.departure.place_name}
        />

        <Polyline
          coordinates={polylines}
          strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
          strokeWidth={6}
        />
      </MapView>
      <Button title="hủy đơn" color={'#ff0000'} onPress={onCancelTask} />
      <Button title="hoàn thành điểm đón" onPress={onConfirmTask} />
    </View>
  );
};

export default RouteToDeparture;

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '89%',
  },
});
