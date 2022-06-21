import {Region} from 'react-native-maps';

export interface IUserLocation {
  geoLocation: {region: Region; place_name: string};
  idUserInfo: string;
  timestamp: number;
  id: string;
}

export interface IUserParams {
  username: string;
  password: string;
  email: string;
  status: string;
  salary?: number;
  authorization: string;
  birthday: string;
  sex: string;
  phone: string;
  carType: string;
}

export interface IUpdateForm {
  username: string;
  phone: string;
  email: string;
}

export interface IUpdateValidate {
  username: string;
  phone: string;
  email: string;
}
