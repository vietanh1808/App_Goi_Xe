/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {
  NativeViewGestureHandlerProperties,
  TextInput,
} from 'react-native-gesture-handler';
import {
  AUTHOR_FIELD,
  COLOR_MAIN_TOPIC,
  EMAIL_FIELD,
  initUserInfor,
  PHONE_FIELD,
  sourceImage,
  USER_COLLECTION,
} from '../../constants';
import {IRegisterForm, IRegisterValidate} from '../../models/register';
import {useNavigation} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import SelectDropdown from 'react-native-select-dropdown';
import {isValidRegisterForm, validateRegisterForm} from './ultils/validate';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {ROUTES} from '../../configs/Routes';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const dropdownRef = useRef<any>();
  const [formValue, setFormValue] = useState<IRegisterForm>(initUserInfor);
  const [validate, setValidate] = useState<IRegisterValidate>({
    ...initUserInfor,
  });
  const [focus, setFocus] = useState('');
  const [modal, setModal] = useState({datePicker: false});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const _datePicker = useRef<any>(null);

  const onSubmit = async () => {
    const value = validateRegisterForm(formValue);
    if (value) {
      setValidate(value);
      if (isValidRegisterForm(value)) {
        setLoading(true);
        try {
          const emailExist = await firestore()
            .collection(USER_COLLECTION)
            .where(EMAIL_FIELD, '==', formValue.email)
            .get();
          const phoneExist = await firestore()
            .collection(USER_COLLECTION)
            .where(PHONE_FIELD, '==', formValue.phone)
            .get();

          if (!emailExist.empty) {
            setStatus('Email  ???? t???n t???i!');
            setLoading(false);
          } else if (!phoneExist.empty) {
            setStatus('S??? ??i???n tho???i n??y ???? t???n t???i!');
            setLoading(false);
          } else {
            console.log('Confimed Email!');
            await firestore().collection(USER_COLLECTION).add(formValue);
            await auth().createUserWithEmailAndPassword(
              formValue.email,
              formValue.password,
            );
            console.log('ADD DONE!');
            setLoading(false);
            setStatus('');
            ToastAndroid.show('????ng k?? th??nh c??ng', ToastAndroid.LONG);
            navigation.navigate(ROUTES.login as never);
          }
        } catch (error: any) {
          console.log(error);
          console.log('ADD FAILED!');
          setLoading(false);
          setStatus('C?? g?? ???? ??ang l???i. Vui l??ng th??? l???i sau!');
        }
      }
    }
  };

  return (
    <View style={styles.body}>
      {loading ? (
        <ActivityIndicator
          size={'large'}
          color="#00ff00"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
          }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <Image
            source={sourceImage.logoLogin.source}
            style={styles.logo}
            resizeMode="stretch"
          />

          <Text
            style={{
              ...styles.warning,
              display: status ? 'flex' : 'none',
              alignSelf: 'center',
              fontSize: 20,
            }}>
            {status}
          </Text>

          {/* Email Field */}
          <Text
            style={[
              styles.warning,
              {display: validate.email ? 'flex' : 'none'},
            ]}>
            {validate.email}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                elevation: focus === 'email' ? 10 : 0,
                borderColor: validate.email ? COLOR_MAIN_TOPIC : '#000',
              },
            ]}
            placeholder="Nh???p Email..."
            value={formValue.email}
            onChangeText={text => setFormValue({...formValue, email: text})}
            onFocus={e => {
              setFocus('email');
            }}
            keyboardType="email-address"
          />

          {/* Username Field */}
          <Text
            style={[
              styles.warning,
              {display: validate.username ? 'flex' : 'none'},
            ]}>
            {validate.username}
          </Text>
          <TextInput
            onFocus={e => {
              setFocus('username');
            }}
            style={[
              styles.input,
              {
                elevation: focus === 'username' ? 10 : 0,
                borderColor: validate.username ? COLOR_MAIN_TOPIC : '#000',
              },
            ]}
            placeholder="Nh???p t??n..."
            value={formValue.username}
            onChangeText={text => setFormValue({...formValue, username: text})}
          />

          {/* Password Field */}
          <Text
            style={[
              styles.warning,
              {display: validate.password ? 'flex' : 'none'},
            ]}>
            {validate.password}
          </Text>
          <TextInput
            onFocus={e => {
              setFocus('password');
            }}
            secureTextEntry
            style={[
              styles.input,
              {
                elevation: focus === 'password' ? 10 : 0,
                borderColor: validate.password ? COLOR_MAIN_TOPIC : '#000',
              },
            ]}
            placeholder="Nh???p M???t kh???u..."
            value={formValue.password}
            onChangeText={text => setFormValue({...formValue, password: text})}
          />

          {/* Phone Field */}
          <Text
            style={[
              styles.warning,
              {display: validate.phone ? 'flex' : 'none'},
            ]}>
            {validate.phone}
          </Text>
          <View
            style={[
              styles.input,
              {
                flexDirection: 'row',
                alignItems: 'center',
                elevation: focus === 'phone' ? 10 : 0,
                borderColor: validate.phone ? COLOR_MAIN_TOPIC : '#000',
              },
            ]}>
            <Text style={styles.labelPhone}>+84</Text>

            <TextInput
              onFocus={e => {
                setFocus('phone');
              }}
              placeholder="Nh???p s??? ??i???n tho???i..."
              value={formValue.phone}
              keyboardType="phone-pad"
              onChangeText={text => setFormValue({...formValue, phone: text})}
              style={{width: '100%'}}
            />
          </View>

          {/* birthday Field */}
          <Text
            style={[
              styles.warning,
              {display: validate.birthday ? 'flex' : 'none'},
            ]}>
            {validate.birthday}
          </Text>
          <TextInput
            ref={_datePicker}
            onFocus={e => {
              setFocus('birthday');
            }}
            style={[
              styles.input,
              {
                elevation: focus === 'birthday' ? 10 : 0,
                borderColor: validate.birthday ? COLOR_MAIN_TOPIC : '#000',
              },
            ]}
            placeholder="Nh???p Ng??y sinh"
            value={
              formValue.birthday
                ? new Date(+formValue.birthday).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''
            }
            onPressIn={e => setModal({datePicker: !modal.datePicker})}
          />
          <DatePicker
            modal
            open={modal.datePicker}
            date={
              formValue.birthday ? new Date(+formValue.birthday) : new Date()
            }
            onConfirm={date => {
              setModal({datePicker: !modal.datePicker});
              setFormValue({...formValue, birthday: date.getTime() + ''});
              _datePicker.current.blur();
            }}
            onCancel={() => {
              setModal({datePicker: !modal.datePicker});
              _datePicker.current.blur();
            }}
            mode="date"
          />

          {/* Sex Field */}
          <Text
            style={[styles.warning, {display: validate.sex ? 'flex' : 'none'}]}>
            {validate.sex}
          </Text>
          <SelectDropdown
            data={['f', 'm']}
            onSelect={(data, index) => setFormValue({...formValue, sex: data})}
            buttonTextAfterSelection={(selectedItem, index) => {
              switch (selectedItem) {
                case 'f':
                  return 'N???';
                case 'm':
                  return 'Nam';
                default:
                  return '';
              }
            }}
            rowTextForSelection={(item, index) => {
              switch (item) {
                case 'f':
                  return 'N???';
                case 'm':
                  return 'Nam';
                default:
                  return '';
              }
            }}
            buttonStyle={{
              ...styles.select,
              borderColor: validate.sex ? COLOR_MAIN_TOPIC : '#000',
            }}
            buttonTextStyle={{color: '#fff'}}
            defaultButtonText="Ch???n gi???i t??nh"
          />

          {/* Authorization Field */}
          <Text
            style={[
              styles.warning,
              {display: validate.authorization ? 'flex' : 'none'},
            ]}>
            {validate.authorization}
          </Text>
          <SelectDropdown
            ref={dropdownRef}
            data={['d', 's']}
            onSelect={(data, index) => {
              setFormValue({...formValue, authorization: data});
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              switch (selectedItem) {
                case 's':
                  return 'Ng?????i d??ng';
                case 'd':
                  return 'Ng?????i l??i xe';
                default:
                  return '';
              }
            }}
            rowTextForSelection={(item, index) => {
              switch (item) {
                case 's':
                  return 'Ng?????i d??ng';
                case 'd':
                  return 'Ng?????i l??i xe';
                default:
                  return '';
              }
            }}
            buttonStyle={{
              borderColor: validate.authorization ? COLOR_MAIN_TOPIC : '#000',
              ...styles.select,
            }}
            buttonTextStyle={{color: '#fff'}}
            defaultButtonText="Ch???n ki???u ng?????i d??ng"
          />

          {/* Car type Field */}
          <SelectDropdown
            ref={dropdownRef}
            data={['m', 'c']}
            onSelect={(data, index) => {
              setFormValue({...formValue, carType: data});
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              switch (selectedItem) {
                case 'm':
                  return 'Xe m??y';
                case 'c':
                  return '?? t??';
                default:
                  return '';
              }
            }}
            rowTextForSelection={(item, index) => {
              switch (item) {
                case 'm':
                  return 'Xe m??y';
                case 'c':
                  return '?? t??';
                default:
                  return '';
              }
            }}
            buttonStyle={{
              borderColor: COLOR_MAIN_TOPIC,
              ...styles.select,
              display: formValue.authorization === 'd' ? 'flex' : 'none',
            }}
            buttonTextStyle={{color: '#fff'}}
            defaultButtonText="Ch???n ki???u xe"
          />

          {/* End All FIELD Register */}

          <Pressable
            style={[styles.input, styles.loginButton]}
            onPress={onSubmit}>
            <Text style={{color: '#fff'}}>????ng K??</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 10,
  },
  logo: {
    width: '80%',
    height: 160,
    marginTop: 80,
    alignSelf: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: 120,
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d45ff',
    alignSelf: 'flex-end',
  },
  textRegister: {
    textDecorationLine: 'underline',
    color: '#00008b',
    margin: 10,
  },
  warning: {
    color: '#dc143c',
  },
  labelPhone: {
    backgroundColor: COLOR_MAIN_TOPIC,
    padding: 5,
    color: '#fff',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 10,
  },
  select: {
    marginVertical: 10,
    width: '100%',
    borderRadius: 10,
    backgroundColor: COLOR_MAIN_TOPIC,
  },
});
