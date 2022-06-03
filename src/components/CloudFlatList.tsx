/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {ICloudParams} from '../models/FlatList';
import {IFormAddress} from '../models/Maps';

interface Props {
  horizontal?: boolean;
  data: any;
  children?: any;
  style?: any;
}

const CloudFlatList = (props: Props) => {
  const {horizontal, data, children, ...propOthers} = props;

  const renderItem: ListRenderItem<ICloudParams> = ({
    item,
  }: {
    item: ICloudParams;
  }) => {
    return (
      <TouchableOpacity
        style={{
          width: 100,
          borderWidth: 1,
          borderRadius: 50,
          justifyContent: 'center',
          paddingHorizontal: 5,
          height: 25,
          marginRight: 10,
          elevation: 4,
          backgroundColor: '#fff',
        }}>
        <Text style={{fontSize: 13, fontWeight: '600'}} numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        data={data}
        horizontal={horizontal || false}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={propOthers.style}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
};

export default CloudFlatList;

const styles = StyleSheet.create({});
