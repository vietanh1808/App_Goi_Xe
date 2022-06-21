import {Dimensions, StatusBar} from 'react-native';
import {IUserParams} from './models/Saler';
import {IJobParams} from './models/Job';
import {Camera, Region} from 'react-native-maps';

// Map
export const MIN_ZOOM_MAP = 5;
export const MAX_ZOOM_MAP = 18;
export const PITCH_MAP = 0;
export const DEFAULT_ZOOM_MAP = 18;
export const MAP_API_KEY = 'AIzaSyBcBKJ9_VoTxKrxiftI7Kszxaqy3lX2urY';
export const ACCESS_TOKEN_MAP =
  'pk.eyJ1IjoidmlldGFuaDE4MDgiLCJhIjoiY2wyeXN0eHZ0MGp6YjNqc2JkMnRqNHAwZCJ9.KMP9C_3d70FGjeGJUHmdJQ';
// Main
export const COLOR_MAIN_TOPIC = '#228b22';

// Screen
export const HEIGHT_WINDOW = Dimensions.get('window').height;
export const statusBar = StatusBar.currentHeight || 0;
export const WIDTH_WINDOW = Dimensions.get('window').width;

// Image Require
export const sourceImage = {
  logoLogin: {
    imgName: 'logo',
    source: require('./asserts/logo.png'),
  },
  defaultAccount: {
    imgName: 'account',
    uri: 'https://win10faq.com/wp-content/uploads/2018/02/microsoft-img.png',
    source: require('./asserts/microsoft-img.png'),
  },
};

// Firebase
export const USER_COLLECTION = 'Users';
export const JOB_COLLECTION = 'Jobs';
export const USER_LOCATION_COLLECTION = 'User Location';
export const PASSWORD_FIELD = 'password';
export const EMAIL_FIELD = 'email';
export const USERNAME_FIELD = 'username';
export const PHONE_FIELD = 'phone';
export const AUTHOR_FIELD = 'authorization';
export const STATUS_FIELD = 'status';
export const BOOKER_FIELD = 'booker';
export const CAR_TYPE_FIELD = 'car_type';
export const DEPARTURE_NAME_FIELD = 'departure_name';
export const DEPARTURE_POINT_FIELD = 'departure_point';
export const DESTINATION_NAME_FIELD = 'destination_name';
export const DESTINATION_POINT_FIELD = 'destination_point';
export const DISTANCE_FIELD = 'distance';
export const DRIVER_FIELD = 'driver';
export const FEE_FIELD = 'feee';
export const TIMESTAMP_FIELD = 'timestamp';
export const ID_USERLOCATION_FIELD = 'idUserInfo';

// AsyncStorage
export const CURRENT_USER = 'currentUser';

// Color
export const GREY_COLOR = '#C0C0C0';

// Init Value
export const initUserInfor: IUserParams = {
  username: '',
  password: '',
  email: '',
  status: 'off',
  authorization: '',
  birthday: '',
  sex: '',
  phone: '',
  carType: '',
};

export const CloudBookingData = [
  {id: 1, title: 'Ngõ 11 Duy Tân'},
  {id: 2, title: '200 Đại Từ'},
  {id: 3, title: '15 Cầu Thanh Trì'},
  {id: 4, title: 'Văn Điển'},
  {id: 5, title: '68 Nguyễn Xiển'},
];

export const defaultLocation: Region = {
  latitude: 21.0031,
  longitude: 105.8201,
  latitudeDelta: 0,
  longitudeDelta: 0,
};

export const defaultCamera: Camera = {
  center: {
    latitude: 37.78825,
    longitude: -122.4324,
  },
  pitch: PITCH_MAP,
  altitude: 0,
  zoom: 15,
  heading: 10,
};

export const jobInitValue: IJobParams = {
  id: '',
  car_type: 'motor',
  departure: {place_name: '', region: defaultLocation},
  destination: {place_name: '', region: defaultLocation},
  distance: 0,
  driver: '',
  fee: 0,
  status: '',
  timestamp: 0,
};
