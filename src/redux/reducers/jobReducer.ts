/* eslint-disable @typescript-eslint/no-unused-vars */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {jobInitValue} from '../../constants';
import {IJobParams} from '../../models/Job';

export interface IJobState {
  jobState: IJobParams;
}

const initValue = {
  jobState: jobInitValue,
};

const jobSlice = createSlice({
  name: 'profile',
  initialState: initValue,
  reducers: {
    setBooking: (state, action: PayloadAction<IJobParams>) => {
      return {...state, jobState: action.payload};
    },
    resetBooking: () => {
      return {jobState: initValue.jobState};
    },
  },
});

export default jobSlice.reducer;

export const {setBooking, resetBooking} = jobSlice.actions;
