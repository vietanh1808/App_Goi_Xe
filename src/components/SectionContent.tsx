import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import React, {ReactNode} from 'react';

interface Props {
  header: string;
  listItem: Array<{name: string; tag?: ReactNode}>;
  styles?: StyleProp<ViewStyle>;
}

const SectionContent = (props: Props) => {
  return (
    // <View style={{...styles.body, ...props.style}}>
    <View style={{...styles.body, ...(props.styles as any)}}>
      <Text style={{...styles.header}}>{props.header}</Text>
      {props.listItem.map((item, index) => (
        <View key={index} style={{...styles.contentItem}}>
          <Text style={{...styles.textItem}}>{item.name}</Text>
          <View style={{flexDirection: 'row'}}>
            {item.tag}
            <Text style={{marginLeft: 10}}> {'>'} </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default SectionContent;

const styles = StyleSheet.create({
  body: {
    padding: 15,
  },
  header: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'notoserif',
  },
  contentItem: {
    fontSize: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    paddingVertical: 15,
  },
  textItem: {
    fontFamily: 'notoserif',
    fontSize: 15,
  },
});
