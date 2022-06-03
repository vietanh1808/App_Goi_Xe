/* eslint-disable react-hooks/exhaustive-deps */
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../../../configs/Routes';
import {
  COLOR_MAIN_TOPIC,
  ID_USERLOCATION_FIELD,
  USER_LOCATION_COLLECTION,
} from '../../../constants';
import {AppState, useAppDispatch} from '../../../redux/reducer';
import {setUserLocation} from '../../../redux/reducers/userLocationReducer';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';

const HomeSaler = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useSelector((state: AppState) => state.profile);

  const onBackHandler = () => {
    BackHandler.exitApp();
    return true;
  };

  const updateUserLocation = (position: GeolocationResponse) => {
    const dataUpdate = {
      idUserInfo: user.id || '',
      geoLocation: {
        region: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0,
          longitudeDelta: 0,
        },
        place_name: '',
      },
      timestamp: position.timestamp,
    };
    dispatch(setUserLocation(dataUpdate));
    firestore()
      .collection(USER_LOCATION_COLLECTION)
      .where(ID_USERLOCATION_FIELD, '==', user.id)
      .get()
      .then(data => {
        if (!data.empty) {
          const id = data.docs[0].id;
          firestore()
            .collection(USER_LOCATION_COLLECTION)
            .doc(id)
            .update(dataUpdate)
            .then(() => console.log('Update User Location Success!'))
            .catch(error =>
              console.log('Update User Location Failed: ', error),
            );
        } else {
          firestore()
            .collection(USER_LOCATION_COLLECTION)
            .add(dataUpdate)
            .then(() => console.log('Add User Location Success!'))
            .catch(error => console.log('Add User Location Failed: ', error));
        }
      });
  };

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        // updateUserLocation(position);
      },
      error => {
        console.log('Faled to Get Current myLocation!... ', error);
        ToastAndroid.show('Bạn cần cấp quyền truy cập vị trí!', 3000);
      },
    );

    return () => {};
  }, []);

  return (
    <View style={styles.body}>
      <View>
        <Pressable
          style={{...styles.button}}
          onPress={() => {
            navigation.navigate(ROUTES.mainSaler as never);
          }}>
          <Text style={{...styles.textButton}}>Đặt xe</Text>
        </Pressable>
        <Pressable style={{...styles.button}}>
          <Text style={{...styles.textButton}}>Hướng dẫn sử dụng</Text>
        </Pressable>
        <Pressable
          style={{...styles.button}}
          onPress={() => {
            BackHandler.exitApp();
          }}>
          <Text style={{...styles.textButton}}>Thoát</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default HomeSaler;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    margin: 10,
    backgroundColor: COLOR_MAIN_TOPIC,
    borderRadius: 5,
    alignItems: 'center',
  },
  textButton: {
    color: '#fff',
    fontSize: 18,
  },
});
