/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {
  COLOR_MAIN_TOPIC,
  GREY_COLOR,
  initUserInfor,
  sourceImage,
  USER_COLLECTION,
  WIDTH_WINDOW,
} from '../../../constants';
import {useSelector} from 'react-redux';
import {AppState, useAppDispatch} from '../../../redux/reducer';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {setProfile, updateUser} from '../../../redux/reducers/profileReducer';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ROUTES} from '../../../configs/Routes';
import ConfirmExit from '../../modals/ConfirmExit';
import firestore from '@react-native-firebase/firestore';
import {IRegisterValidate} from '../../../models/register';
import {
  isValidRegisterForm,
  isValidUpdateForm,
  validateForm,
  validateRegisterForm,
  validateUpdateForm,
} from '../../authen/ultils/validate';
import {IUpdateForm} from '../../../models/Saler';

const initForm = {
  username: '',
  phone: '',
  email: '',
};

const DetailUser = () => {
  const profile = useSelector((state: AppState) => state.profile);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [formValue, setFormValue] = useState<IUpdateForm>(initForm);
  const [visibleModal, setVisibleModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<IUpdateForm>(initForm);
  const [loading, setLoading] = useState(false);
  const [validate, setValidate] = useState<IUpdateForm>(initUserInfor);

  const onBackPress = useCallback(() => {
    setVisibleModal(true);
    return true;
  }, [setVisibleModal, dispatch, navigation]);

  const onUpdate = async () => {
    // dispatch to firestore update user
    const value = validateUpdateForm(formValue);
    if (value) {
      setValidate(value);
      if (isValidUpdateForm(value) && profile.user) {
        if (profile.user) {
          setLoading(true);
          firestore()
            .collection(USER_COLLECTION)
            .doc(profile.id)
            .update({
              ...profile.user,
              username: formValue.username,
              phone: formValue.phone,
              email: formValue.email,
            })
            .then(() => {
              if (profile.user) {
                dispatch(
                  updateUser({
                    ...profile.user,
                    username: formValue.username,
                    phone: formValue.phone,
                    email: formValue.email,
                  }),
                );
              }
              ToastAndroid.show('Cập nhật thành công!', 4000);
            })
            .catch(err => {
              console.log(err);
              ToastAndroid.show('Cập nhật thất bại!', 4000);
            });
          setLoading(false);
        }
      }
    }
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: (props: any) => {
        return (
          <View
            style={{
              marginRight: 20,
            }}>
            <Pressable onPress={onUpdate}>
              <Text style={{fontWeight: 'bold', fontSize: 20}}>Lưu</Text>
            </Pressable>
          </View>
        );
      },
      headerShown: !loading,
    });
  }, [navigation, formValue, loading]);

  React.useEffect(() => {
    if (profile.user) {
      setFormValue({
        username: profile.user?.username,
        phone: profile.user?.phone,
        email: profile.user?.email,
      });
      setCurrentUser({
        username: profile.user?.username,
        phone: profile.user?.phone,
        email: profile.user?.email,
      });
    }

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

  return (
    <View style={{...styles.body}}>
      {loading ? (
        <ActivityIndicator
          style={{...styles.indicator}}
          size="large"
          color={COLOR_MAIN_TOPIC}
        />
      ) : (
        <View style={{...styles.body}}>
          <ConfirmExit
            visible={visibleModal}
            setVisible={setVisibleModal}
            onConfirm={() => {
              navigation.navigate(ROUTES.profileSaler as never);
            }}
            title={'Cảnh báo!'}
            content="Bạn có muốn cập nhật người dùng không?"
          />
          <Image
            source={sourceImage.logoLogin.source}
            style={{...styles.banner}}
            resizeMode={'stretch'}
          />
          <Image
            source={sourceImage.defaultAccount.source}
            style={{...styles.avatar}}
            resizeMode="stretch"
          />
          <Text style={{...styles.text, alignSelf: 'center'}}>
            0 Điểm | Ưu đãi cho thành viên {'>'}
          </Text>
          <ScrollView style={{...styles.scrollView}}>
            <Text style={{...styles.text}}>Tên</Text>
            <Text
              style={{
                ...styles.validate,
                display: validate.username ? 'flex' : 'none',
              }}>
              {validate.username}
            </Text>
            <TextInput
              style={{...styles.textInput}}
              value={formValue.username}
              onChangeText={text => {
                setFormValue({...formValue, username: text});
              }}
            />
            <Text style={{...styles.text}}>Số điện thoại</Text>
            <Text
              style={{
                ...styles.validate,
                display: validate.phone ? 'flex' : 'none',
              }}>
              {validate.phone}
            </Text>
            <TextInput
              style={{...styles.textInput}}
              keyboardType={'phone-pad'}
              value={formValue.phone}
              onChangeText={text => {
                setFormValue({...formValue, phone: text});
              }}
            />
            <Text style={{...styles.text}}>Địa chỉ email</Text>
            <Text
              style={{
                ...styles.validate,
                display: validate.email ? 'flex' : 'none',
              }}>
              {validate.email}
            </Text>
            <TextInput
              style={{...styles.textInput}}
              keyboardType="email-address"
              value={formValue.email}
              onChangeText={text => {
                setFormValue({...formValue, email: text});
              }}
            />
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default DetailUser;

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  banner: {
    flex: 1,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: COLOR_MAIN_TOPIC,
  },
  avatar: {
    width: 60,
    height: 60,
    position: 'absolute',
    top: 150,
    left: WIDTH_WINDOW / 2 - 60 / 2,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: COLOR_MAIN_TOPIC,
  },
  text: {
    marginTop: 40,
    fontFamily: 'sans-serif-thin',
    fontWeight: '700',
  },
  scrollView: {
    paddingHorizontal: 50,
    flex: 1,
  },
  textInput: {
    borderColor: GREY_COLOR,
    borderBottomWidth: 1,
  },
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  validate: {
    color: '#ff0000',
  },
});
