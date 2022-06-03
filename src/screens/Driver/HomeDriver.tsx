/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  ACCESS_TOKEN_MAP,
  COLOR_MAIN_TOPIC,
  JOB_COLLECTION,
  STATUS_FIELD,
  USER_LOCATION_COLLECTION,
} from '../../constants';
import {IJobParams} from '../../models/Job';
import {Icon} from 'react-native-vector-icons/Icon';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../../configs/Routes';
import {AppState, useAppDispatch} from '../../redux/reducer';
import {clearProfile} from '../../redux/reducers/profileReducer';
import moment from 'moment';
import {setBooking, setIdBooking} from '../../redux/reducers/jobReducer';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {
  setIdUserLocation,
  setUserLocation,
} from '../../redux/reducers/userLocationReducer';
import {useSelector} from 'react-redux';
import {IUserLocation} from '../../models/Saler';

const HomeDriver = () => {
  const navigation = useNavigation();
  const user = useSelector((state: AppState) => state.profile);
  const jobState = useSelector((state: AppState) => state.job);
  const userLocation = useSelector(
    (state: AppState) => state.saler.userLocation,
  );
  const dispatch = useAppDispatch();
  const [jobList, setJobList] = useState<IJobParams[]>([]);
  const [jobIdList, setJobIdList] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getCreatedJob = async () => {
    setRefreshing(true);
    const data = await firestore()
      .collection(JOB_COLLECTION)
      // .where(STATUS_FIELD, '==', 'created')
      .get();
    setRefreshing(false);
    if (data.empty) {
      return;
    }
    const listData = data.docs.map(d => d.data());
    const listId = data.docs.map(d => d.id);
    setJobList(listData as IJobParams[]);
    setJobIdList(listId);
  };

  const onDetailBooking = (job: IJobParams, index: number) => {
    if (job.booker) {
      dispatch(
        setBooking({
          departure: job.departure,
          booker: job.booker,
          car_type: job.car_type,
          destination: job.destination,
          distance: job.distance,
          status: job.status,
          timestamp: job.timestamp,
          driver: job.driver,
          fee: job.fee,
        }),
      );
      dispatch(setIdBooking(jobIdList[index]));
    }
    navigation.navigate(ROUTES.detaiBookingDriver as never);
  };

  const onRefresh = () => {
    getCreatedJob();
  };

  const updateUserLocation = async (position: GeolocationResponse) => {
    if (user.user) {
      const dataJson = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude}%2C%20${position.coords.latitude}.json?access_token=${ACCESS_TOKEN_MAP}`,
      );
      const data = await dataJson.json();
      const userLocationData: IUserLocation = {
        geoLocation: {
          region: {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            latitudeDelta: 0,
            longitudeDelta: 0,
          },
          place_name: data.features[0].place_name,
        },
        userInfo: user.id || '',
        timestamp: position.timestamp,
      };
      dispatch(setUserLocation(userLocationData));
      onUpdate(userLocationData);
    }
  };

  const onUpdate = async (userLocationData: IUserLocation) => {
    const getUserLocation = await firestore()
      .collection(USER_LOCATION_COLLECTION)
      .get();

    const userLocationExist = getUserLocation.docs.find(d => {
      return d.data().userInfo === user.id;
    });

    // if (jobState.id) {
    //   navigation.navigate(ROUTES.detaiBookingDriver as never);
    // }

    if (!userLocationExist) {
      const addUserLocation = await firestore()
        .collection(USER_LOCATION_COLLECTION)
        .add(userLocationData);
      if (!addUserLocation.id) {
        ToastAndroid.show('Firestore Add Failed...', 2000);
      }
      return;
    } else {
      await firestore()
        .collection(USER_LOCATION_COLLECTION)
        .doc(userLocationExist.id)
        .update(userLocationData)
        .catch(() => {
          console.log('Update Location To Firestore Failed!');
          ToastAndroid.show('Firestore Update Failed...', 2000);
        });
      dispatch(setIdUserLocation(userLocationExist?.id));
      return;
    }
  };

  const postDriverLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        updateUserLocation(position);
      },
      error => {
        ToastAndroid.show('Bạn cần cấp quyền truy cập địa chỉ!', 4000);
        Geolocation.requestAuthorization();
      },
    );
  };

  useEffect(() => {
    // getCreatedJob();
    postDriverLocation();
  }, []);

  return (
    <View style={{flex: 2}}>
      <ScrollView
        style={{flex: 1}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {jobList.length ? (
          jobList.map((job, index) => (
            <Pressable
              style={styles.elementList}
              onPress={e => onDetailBooking(job, index)}
              key={index}>
              <Text style={styles.elementText}>
                {moment(job.timestamp).fromNow() +
                  ' - ' +
                  job.distance.toFixed(1) +
                  ' Km'}
              </Text>
              <Text style={styles.elementText}>
                Từ: {job.departure.place_name}
              </Text>
              <Text
                style={{
                  ...styles.elementText,
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                }}>
                Đến: {job.destination.place_name}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.notifyText}>Chưa có đơn đặt hàng...</Text>
        )}
      </ScrollView>

      <Button
        title="Đăng xuất"
        onPress={() => {
          dispatch(clearProfile());
          navigation.reset({
            index: 0,
            routes: [{name: ROUTES.login as never}],
          });
        }}
      />
    </View>
  );
};

export default HomeDriver;

const styles = StyleSheet.create({
  elementList: {
    margin: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  elementText: {
    fontSize: 15,
    borderBottomWidth: 1,
    padding: 10,
  },
  notifyText: {
    padding: 20,
    color: COLOR_MAIN_TOPIC,
    fontSize: 20,
  },
});
