/* eslint-disable @typescript-eslint/no-unused-vars */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IUserLocation, IUserParams} from '../../models/Saler';
import {defaultLocation, initUserInfor} from '../../constants';
import {Region} from 'react-native-maps';

export interface ILocation {
  place_name: string;
  region: Region;
}

export const initUserLocation: IUserLocation = {
  idUserInfo: '',
  geoLocation: {place_name: '', region: defaultLocation},
  timestamp: 0,
  id: '',
};

export interface ISalerState {
  userLocation: IUserLocation;
  currentPickLocation: 'departure' | 'destination';
  id?: string;
}

export const initialState: ISalerState = {
  userLocation: initUserLocation,
  currentPickLocation: 'departure',
};

const userLocationSlice = createSlice({
  name: 'saler',
  initialState: initialState,
  reducers: {
    setCurrentPickLocation: (
      state,
      action: PayloadAction<'departure' | 'destination'>,
    ) => {
      return {
        ...state,
        currentPickLocation: action.payload,
      };
    },
    setUserLocation: (state, action: PayloadAction<IUserLocation>) => {
      return {
        ...state,
        userLocation: action.payload,
      };
    },
    setIdLocation: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        id: action.payload,
      };
    },
  },
});

export default userLocationSlice.reducer;

export const {setCurrentPickLocation, setUserLocation, setIdLocation} =
  userLocationSlice.actions;
