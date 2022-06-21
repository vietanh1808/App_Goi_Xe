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
  ID_USERLOCATION_FIELD,
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
import {resetBooking, setBooking} from '../../redux/reducers/jobReducer';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {
  setIdLocation,
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

  const onDetailBooking = (job: IJobParams, index: number) => {
    dispatch(setBooking({...job, id: jobIdList[index]}));
    dispatch(setUserLocation(userLocation));

    firestore() // Check If This Job is accept by another Driver
      .collection(JOB_COLLECTION)
      .doc(job.id)
      .get()
      .then(d => {
        if (d.data()?.driver) {
          ToastAndroid.show('Đơn này đã có người đặt rồi...', 4000);
        } else {
          navigation.navigate(ROUTES.detaiBookingDriver as never);
        }
      })
      .catch(e => {
        ToastAndroid.show('Đơn này đã bị lỗi...', 4000);
      });
  };

  const onRefresh = () => {
    getCreatedJob();
  };

  const updateUserLocationName = async (position: GeolocationResponse) => {
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
        idUserInfo: user.id || '',
        timestamp: position.timestamp,
        id: '',
      };
      dispatch(setUserLocation(userLocationData));
      onUpdateLocation(userLocationData);
    }
  };

  const onUpdateLocation = async (userLocationData: IUserLocation) => {
    const userLocationExist = await firestore()
      .collection(USER_LOCATION_COLLECTION)
      .where(ID_USERLOCATION_FIELD, '==', user.id)
      .get();

    if (userLocationExist.size === 0) {
      // Cannot find id User Location
      addUserLocation(userLocationData);
    } else {
      // Id User Location Exist -> Update
      const newData: IUserLocation = {
        ...userLocationData,
        id: userLocationExist.docs[0].id,
      };
      dispatch(setUserLocation(newData));
      await firestore()
        .collection(USER_LOCATION_COLLECTION)
        .doc(userLocationExist.docs[0].id)
        .update(newData)
        .catch(error => {
          console.log('Update Location To Firestore Failed!');
          console.log(error);
        })
        .then(() => {
          console.log('Update Location To Firestore Success!');
        });
    }
  };

  const addUserLocation = async (userLocationData: any) => {
    const addSnapshot = await firestore()
      .collection(USER_LOCATION_COLLECTION)
      .add(userLocationData);

    if (addSnapshot.id) {
      console.log('Firestore Add User Location Success! ');
      dispatch(setUserLocation({...userLocation, id: addSnapshot.id}));

      dispatch(setIdLocation(addSnapshot.id));
      await firestore() // Update Id Location
        .collection(USER_LOCATION_COLLECTION)
        .doc(addSnapshot.id)
        .update({...userLocationData, id: addSnapshot.id});
    } else {
      console.log('Firestore Add User Location Failed... ');
    }
  };

  const postDriverLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        updateUserLocationName(position);
      },
      error => {
        ToastAndroid.show('Bạn cần cấp quyền truy cập địa chỉ!', 4000);
        Geolocation.requestAuthorization();
      },
    );
  };

  const getCreatedJob = async () => {
    setRefreshing(true);
    const data = await firestore()
      .collection(JOB_COLLECTION)
      .where(STATUS_FIELD, '==', 'created')
      .get();
    setRefreshing(false);
    console.log('data: ', data.size);
    if (data.empty) {
      return;
    }
    const listData = data.docs.map(d => d.data());
    const listId = data.docs.map(d => d.id);
    setJobList(listData as IJobParams[]);
    setJobIdList(listId);
  };

  const getStatusBooking = (job: IJobParams) => {
    let result = '';
    switch (job.status) {
      case 'accept':
        result = 'Đã được nhận';
        break;
      case 'cancel':
        result = 'Đã bị hủy';
        break;
      case 'complete':
        result = 'Đã hoàn thành';
        break;
      case 'created':
        result = 'Vừa được tạo';
        break;
      case 'inprogressing':
        result = 'Đã được nhận';
        break;
    }
    return 'Trạng thái: ' + result;
  };

  useEffect(() => {
    if (jobState.jobState.id) {
      // If User is working
      navigation.navigate(ROUTES.detaiBookingDriver as never);
    }
    postDriverLocation();

    const subscriber = firestore()
      .collection(JOB_COLLECTION)
      .onSnapshot(data => {
        const listData = data.docs.filter(d => {
          return d.data()?.status === 'created';
        });
        setJobList(listData.map(d => d.data()) as IJobParams[]);

        const listId = listData.map(d => d.id);
        setJobIdList(listId);
      });
    return () => {
      console.log('Subcriber!');
      subscriber();
    };
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
              onPress={() => onDetailBooking(job, index)}
              key={index}>
              <Text style={styles.elementText}>
                {moment(job.timestamp).fromNow() +
                  ' - ' +
                  job.distance.toFixed(1) +
                  ' Km' +
                  ' - ' +
                  getStatusBooking(job)}
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
          dispatch(resetBooking());
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
