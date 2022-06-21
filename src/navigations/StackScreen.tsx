/* eslint-disable @typescript-eslint/no-unused-vars */
import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ROUTES} from '../configs/Routes';
import DestinationScreen from '../screens/Saler/screens/DestinationScreen';
import MainNavigator from './MainNavigator';
import LoginScreen from '../screens/authen/LoginScreen';
import RegisterScreen from '../screens/authen/RegisterScreen';
import HomeDriver from '../screens/Driver/HomeDriver';
import {useSelector} from 'react-redux';
import {AppState} from '../redux/reducer';
import DetailUser from '../screens/Saler/screens/DetailUser';
import auth from '@react-native-firebase/auth';
import BookingDetailDriver from '../screens/Driver/BookingDetailDriver';
import BookingDetail from '../screens/Saler/screens/BookingDetail';
import RouteToDeparture from '../screens/Driver/RouteToDeparture';
import MainSaler from '../screens/Saler/screens/MainSaler';
const Stack = createStackNavigator();

const StackScreen = () => {
  const profile = useSelector((state: AppState) => state.profile);

  const authenScreen = () => {
    switch (profile.user?.authorization) {
      case 's':
        return ROUTES.mainNavigator;
      case 'd':
        return ROUTES.mainDriver;
      default:
        return ROUTES.login;
    }
  };
  // useEffect(() => {
  //   auth()
  //     .signInWithEmailAndPassword('admin@gmail.com', '123123')
  //     .then(() => console.log('Sign In Successfully!'))
  //     .catch(error => console.log('Sign In Failed: ', error));
  // }, []);

  return (
    <Stack.Navigator initialRouteName={authenScreen()}>
      {/* ---------- AUTHENTICATION SCREEN ZONE ---------- */}
      <Stack.Screen
        name={ROUTES.login}
        options={{
          headerShown: false,
        }}
        component={LoginScreen}
      />
      <Stack.Screen
        name={ROUTES.register}
        options={{
          headerShown: false,
        }}
        component={RegisterScreen}
      />
      {/* ---------- End Of AUTHENTICATION SCREEN ZONE ---------- */}

      {/* ---------- SALER SCREEN ZONE ---------- */}

      <Stack.Screen
        name={ROUTES.destinationSaler}
        component={DestinationScreen}
      />
      <Stack.Screen
        name={ROUTES.mainNavigator}
        options={{
          headerShown: false,
        }}
        component={MainNavigator}
      />
      <Stack.Screen
        name={ROUTES.mainSaler}
        options={{
          headerShown: false,
        }}
        component={MainSaler}
      />
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitleStyle: {display: 'none'},
        }}
        name={ROUTES.detailUser}
        component={DetailUser}
      />
      <Stack.Screen
        options={{}}
        name={ROUTES.detaiBookingSaler}
        component={BookingDetail}
      />
      {/* ---------- End Of SALER SCREEN ZONE ---------- */}

      {/* ---------- DRIVER SCREEN ZONE ---------- */}
      <Stack.Screen
        name={ROUTES.mainDriver}
        options={{
          headerBackTitleVisible: false,
        }}
        component={HomeDriver}
      />
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitleStyle: {display: 'none'},
        }}
        name={ROUTES.detaiBookingDriver}
        component={BookingDetailDriver}
      />
      <Stack.Screen
        name={ROUTES.routeToDeparture}
        options={{
          headerShown: false,
        }}
        component={RouteToDeparture}
      />
      {/* ---------- End Of DRIVER SCREEN ZONE ---------- */}
    </Stack.Navigator>
  );
};

export default StackScreen;

const styles = StyleSheet.create({});
