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
import OnWork from '../screens/Driver/OnWork';
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
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitleStyle: {display: 'none'},
        }}
        name={ROUTES.detailUser}
        component={DetailUser}
      />
      <Stack.Screen
        name={ROUTES.mainDriver}
        options={{
          headerBackTitleVisible: false,
        }}
        component={HomeDriver}
      />
      <Stack.Screen
        options={{}}
        name={ROUTES.detaiBookingSaler}
        component={BookingDetail}
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
        name={ROUTES.onWorkDriver}
        options={{
          headerShown: false,
        }}
        component={OnWork}
      />
      <Stack.Screen
        name={ROUTES.routeToDeparture}
        options={{
          headerShown: false,
        }}
        component={RouteToDeparture}
      />
    </Stack.Navigator>
  );
};

export default StackScreen;

const styles = StyleSheet.create({});
