/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';

interface Props {
  color?: string;
  size: number;
  style?: any;
}

const Donut = (props: Props) => {
  var {color, size, ...propss} = props;
  return (
    <View
      style={[
        styles.body,
        {
          backgroundColor: color || '#007ca7',
          width: size * 10,
          height: size * 10,
        },
        propss.style,
      ]}>
      <View style={[styles.center, {width: size * 3, height: size * 3}]} />
    </View>
  );
};

export default Donut;

const styles = StyleSheet.create({
  body: {justifyContent: 'center', borderRadius: 50},
  center: {
    backgroundColor: 'white',
    borderRadius: 50,
    alignSelf: 'center',
  },
});
