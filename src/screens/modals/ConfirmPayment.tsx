import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {COLOR_MAIN_TOPIC} from '../../constants';

interface Props {
  title?: string;
  visible?: boolean;
  setVisible?: any;
  onConfirm?: (e: any) => void;
  style?: StyleProp<ViewStyle>;
  content?: string;
}

const ConfirmPayment = (props: Props) => {
  return (
    <Modal
      visible={props.visible}
      onRequestClose={() => {
        props.setVisible(false);
      }}
      transparent>
      <View style={(props.style as never, {...styles.modal})}>
        <View style={{...styles.viewBody}}>
          <Text style={{...styles.header}}>{props.title}</Text>
          <View style={{...styles.body}}>
            <Text style={{...styles.textbody}}>{props.content}</Text>
          </View>
          <Pressable onPress={props.onConfirm} style={{...styles.button}}>
            <Text style={{...styles.textButton}}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmPayment;

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-around',
  },
  textbody: {
    fontSize: 18,
  },
  button: {
    padding: 15,
    backgroundColor: COLOR_MAIN_TOPIC,
    borderColor: COLOR_MAIN_TOPIC,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton: {
    color: '#fff',
  },
  text: {
    fontSize: 18,
    padding: 10,
  },
  header: {
    fontSize: 23,
    paddingBottom: 10,
  },
  modal: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    width: '100%',
  },
  viewBody: {
    height: 250,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    width: '90%',
    elevation: 10,
  },
});
