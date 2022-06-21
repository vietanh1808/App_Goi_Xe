/* eslint-disable react-hooks/exhaustive-deps */
import {
  BackHandler,
  Linking,
  Pressable,
  StyleSheet,
  Text,
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
import {IUserLocation} from '../../../models/Saler';
import ConfirmExit from '../../modals/ConfirmExit';
import {resetBooking} from '../../../redux/reducers/jobReducer';

const HomeSaler = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useSelector((state: AppState) => state.profile);
  const [alertModal, setAlertModal] = React.useState(false);

  const updateUserLocation = async (position: GeolocationResponse) => {
    const dataUpdate: IUserLocation = {
      id: '',
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
            .catch(error => console.log('Update User Location Failed: ', error))
            .finally(() => {
              navigation.navigate(ROUTES.mainSaler as never);
            });
        } else {
          let newData: IUserLocation = dataUpdate;
          firestore()
            .collection(USER_LOCATION_COLLECTION)
            .add(dataUpdate)
            .then(d => {
              console.log('Add User Location Success!');
              newData = {...dataUpdate, id: d.id};
              dispatch(setUserLocation(newData));
            })
            .catch(error => console.log('Add User Location Failed: ', error));

          firestore()
            .collection(USER_LOCATION_COLLECTION)
            .doc(newData.id)
            .update(newData)
            .then(() => {
              console.log('Update Id Location Success');
            })
            .catch(e => {
              console.log('Update Id Location Failed');
              console.log(e);
            })
            .finally(() => {
              navigation.navigate(ROUTES.mainSaler as never);
            });
        }
      });
  };

  const checkUserLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        updateUserLocation(position);
      },
      () => {
        setAlertModal(true); // Open Setting To Allow GPS
      },
    );
  };

  useEffect(() => {
    // checkUserLocation();
  }, []);

  return (
    <View style={styles.body}>
      <ConfirmExit
        title="Cảnh báo"
        content="Bạn cần cấp quyền truy cập địa chỉ"
        onConfirm={async () => {
          setAlertModal(false);
          Linking.openSettings();
        }}
        visible={alertModal}
        setVisible={setAlertModal}
      />
      <View>
        <Pressable style={{...styles.button}} onPress={checkUserLocation}>
          <Text style={{...styles.textButton}}>Đặt xe</Text>
        </Pressable>
        <Pressable style={{...styles.button}}>
          <Text style={{...styles.textButton}}>Hướng dẫn sử dụng</Text>
        </Pressable>
        <Pressable
          style={{...styles.button}}
          onPress={() => {
            dispatch(resetBooking());
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
