import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import StackScreen from './src/navigations/StackScreen';

const RouteApp = () => {
  return (
    <NavigationContainer>
      <StackScreen />
    </NavigationContainer>
  );
};

export default RouteApp;
