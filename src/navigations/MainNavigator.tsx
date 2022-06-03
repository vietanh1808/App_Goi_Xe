/* eslint-disable @typescript-eslint/no-unused-vars */
import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MainSaler from '../screens/Saler/screens/MainSaler';
import ProfileSaler from '../screens/Saler/screens/ProfileSaler';
import {ROUTES} from '../configs/Routes';
import DestinationScreen from '../screens/Saler/screens/DestinationScreen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLOR_MAIN_TOPIC} from '../constants';
import HomeSaler from '../screens/Saler/screens/HomeSaler';

const Tab = createBottomTabNavigator();
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={ROUTES.homeSaler}>
      <Tab.Screen
        options={{
          tabBarIcon: ({focused, color, size}) => {
            return focused ? (
              <Icon name="home" color={COLOR_MAIN_TOPIC} size={size} />
            ) : (
              <Icon name="home" color={color} size={size} />
            );
          },
          tabBarActiveTintColor: COLOR_MAIN_TOPIC,
          tabBarLabelStyle: {fontSize: 12},
        }}
        name={ROUTES.homeSaler}
        component={HomeSaler}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({focused, color, size}) => {
            return focused ? (
              <Icon name="user" color={COLOR_MAIN_TOPIC} size={size} />
            ) : (
              <Icon name="user" color={color} size={size} />
            );
          },
          tabBarActiveTintColor: COLOR_MAIN_TOPIC,
          tabBarLabelStyle: {fontSize: 12},
        }}
        name={ROUTES.profileSaler}
        component={ProfileSaler}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({});
