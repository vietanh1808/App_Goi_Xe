/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState, useEffect} from 'react';
import {
  COLOR_MAIN_TOPIC,
  CURRENT_USER,
  EMAIL_FIELD,
  PASSWORD_FIELD,
  sourceImage,
  USER_COLLECTION,
} from '../../constants';
import {ILoginParams, IValidateForm} from '../../models/login';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../../configs/Routes';
import {isValidForm, validateForm} from './ultils/validate';
import firestore from '@react-native-firebase/firestore';
import {setProfile} from '../../redux/reducers/profileReducer';
import {IUserParams} from '../../models/Saler';
import {AppState, useAppDispatch} from '../../redux/reducer';
import {useSelector} from 'react-redux';

const initForm = {
  username: '',
  password: '',
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [formLogin, setFormLogin] = useState<ILoginParams>(initForm);
  const [focus, setFocus] = useState('');
  const [validate, setValidate] = useState<IValidateForm>(initForm);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    // navigation.navigate(ROUTES.mainSaler as never);
    const valueForm = validateForm(formLogin);
    setValidate(valueForm);

    if (isValidForm(valueForm)) {
      setLoading(true);
      const data = await firestore()
        .collection(USER_COLLECTION)
        .where(EMAIL_FIELD, '==', formLogin.username)
        .where(PASSWORD_FIELD, '==', formLogin.password)
        .get();
      setLoading(false);
      const empty = data.empty;
      if (empty) {
        setStatus('Tài khoản hoặc mật khẩu sai!');
        return;
      }
      status && setStatus('');
      data.forEach(d => {
        dispatch(setProfile({user: d.data() as IUserParams, id: d.id}));

        if (d.data().authorization === 's') {
          navigation.navigate(ROUTES.mainSaler as never);
        } else if (d.data().authorization === 'd') {
          navigation.navigate(ROUTES.mainDriver as never);
        }
      });
    }
  }, [formLogin]);

  const onRegister = useCallback(() => {
    navigation.navigate(ROUTES.register as never);
  }, [navigation]);

  return (
    <View style={styles.body}>
      {loading ? (
        <ActivityIndicator
          size={'large'}
          color={COLOR_MAIN_TOPIC}
          style={{flex: 1, justifyContent: 'center'}}
        />
      ) : (
        <View>
          <Image
            source={sourceImage.logoLogin.source}
            style={styles.logo}
            resizeMode="stretch"
          />
          <Text
            style={{
              display: status ? 'flex' : 'none',
              ...styles.warning,
              alignSelf: 'center',
              fontSize: 20,
            }}>
            {status}
          </Text>

          <Text
            style={[
              styles.warning,
              {display: validate.username ? 'flex' : 'none'},
            ]}>
            {validate.username}
          </Text>

          <TextInput
            style={[styles.input, {elevation: focus === 'u' ? 10 : 0}]}
            placeholder="Nhập Username"
            value={formLogin.username}
            onChangeText={text => setFormLogin({...formLogin, username: text})}
            onFocus={e => {
              setFocus('u');
            }}
            keyboardType="email-address"
          />

          <Text
            style={[
              styles.warning,
              {display: validate.password ? 'flex' : 'none'},
            ]}>
            {validate.password}
          </Text>

          <TextInput
            onFocus={e => {
              setFocus('p');
            }}
            secureTextEntry
            style={[styles.input, {elevation: focus === 'p' ? 10 : 0}]}
            placeholder="Nhập Password"
            value={formLogin.password}
            onChangeText={text => setFormLogin({...formLogin, password: text})}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Pressable onPress={onRegister}>
              <Text style={styles.textRegister}>Đăng ký tài khoản</Text>
            </Pressable>
            <Pressable
              style={[styles.input, styles.loginButton]}
              onPress={onSubmit}>
              <Text style={{color: '#fff'}}>Đăng Nhập</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default LoginScreen;

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
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: 120,
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#228b22',
    alignSelf: 'flex-end',
  },
  textRegister: {
    textDecorationLine: 'underline',
    color: '#00008b',
  },
  warning: {
    color: '#dc143c',
  },
});
