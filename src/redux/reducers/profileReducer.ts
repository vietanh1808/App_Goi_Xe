/* eslint-disable @typescript-eslint/no-unused-vars */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IUserLocation, IUserParams} from '../../models/Saler';
import {initUserInfor} from '../../constants';

export interface IProfileState {
  user?: IUserParams;
  id?: string;
}

const profileState: IProfileState = {};

const profileSlice = createSlice({
  name: 'profile',
  initialState: profileState,
  reducers: {
    updateUser: (state, action: PayloadAction<IUserParams>) => {
      return {...state, user: action.payload};
    },
    clearProfile: state => {
      return {...state, user: undefined, id: undefined};
    },
    setProfile: (state, action: PayloadAction<IProfileState>) => {
      return {...state, user: action.payload.user, id: action.payload.id};
    },
  },
});

export default profileSlice.reducer;

export const {updateUser, clearProfile, setProfile} = profileSlice.actions;
