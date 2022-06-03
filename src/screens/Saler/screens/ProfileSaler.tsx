import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useCallback} from 'react';
import {COLOR_MAIN_TOPIC} from '../../../constants';
import {AppState, useAppDispatch} from '../../../redux/reducer';
import {clearProfile} from '../../../redux/reducers/profileReducer';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../../../configs/Routes';
import {useSelector} from 'react-redux';
import SectionContent from '../../../components/SectionContent';

const NewFlag = () => {
  return (
    <View
      style={{
        backgroundColor: '#e8451c',
        borderRadius: 10,
        justifyContent: 'center',
        paddingHorizontal: 8,
        height: 18,
      }}>
      <Text style={{color: '#fff', fontSize: 9}}>New</Text>
    </View>
  );
};

const ProfileSaler = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const user = useSelector((app: AppState) => app.profile.user);

  const onLogout = useCallback(() => {
    dispatch(clearProfile());
    navigation.reset({
      index: 0,
      routes: [{name: ROUTES.login as never}],
    });
    // navigation.navigate(ROUTES.login as never);
    return;
  }, [dispatch, navigation]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={styles.body}>
      <Pressable
        style={{...styles.buttonInfo}}
        onPress={() => {
          navigation.navigate(ROUTES.detailUser as never);
        }}>
        {/* <Image
          source={{
            uri: , // Get from Firebase Store
          }}
          style={{...styles.avatar}}
        /> */}
        <View style={{marginLeft: 10}}>
          <Text style={{fontWeight: '700', ...styles.textInfo}}>
            {user?.username}
          </Text>
          <Text style={{...styles.textInfo}}>Chỉnh sửa tài khoản &gt; </Text>
        </View>
      </Pressable>
      <SectionContent
        header="Ưu đãi và tiết kiệm"
        listItem={[
          {name: 'Ưu đãi'},
          {name: 'Gói Hội Viên', tag: <NewFlag />},
          {name: 'Thử thách', tag: <NewFlag />},
          {name: 'Giới thiệu', tag: <NewFlag />},
        ]}
      />
      <SectionContent
        header="Tài khoản của tôi"
        listItem={[
          {name: 'Ữu đãi cho thành viên', tag: <NewFlag />},
          {name: 'Đã đặt trước'},
          {name: 'Saved Places'},
          {name: 'Số liên hệ S.O.S'},
          {name: 'Hồ sơ doanh nghiệp'},
        ]}
      />
      <SectionContent
        header="Tổng quát"
        listItem={[
          {name: 'Trung tâm trợ giúp'},
          {name: 'Cài đặt'},
          {name: 'Chia sẻ phản hồi'},
        ]}
      />
      <SectionContent
        header="Cơ hội"
        listItem={[
          {name: 'Support the Environment', tag: <NewFlag />},
          {name: 'Lái xe cùng MyApp'},
        ]}
      />
      <Pressable onPress={onLogout} style={styles.button}>
        <Text style={styles.textButton}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
  );
};

export default ProfileSaler;

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  button: {
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#000',
    width: 100,
    borderRadius: 10,
    backgroundColor: COLOR_MAIN_TOPIC,
  },
  textButton: {
    color: '#fff',
  },
  avatar: {
    width: 70,
    height: 70,
  },
  textInfo: {
    fontSize: 15,
  },
  buttonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  sectionContent: {
    marginTop: 10,
    padding: 10,
  },
});
