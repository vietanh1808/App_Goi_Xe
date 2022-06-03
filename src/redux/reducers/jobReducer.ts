/* eslint-disable @typescript-eslint/no-unused-vars */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {jobInitValue} from '../../constants';
import {IJobParams} from '../../models/Job';

export interface IJobState {
  jobState: IJobParams;
  id?: string;
  status: '' | 'created' | 'inprogressing' | 'accept' | 'complete' | 'cancel';
}

const initValue = {
  jobState: jobInitValue,
  id: '',
  status: '',
};

const jobSlice = createSlice({
  name: 'profile',
  initialState: initValue,
  reducers: {
    setBooking: (state, action: PayloadAction<IJobParams>) => {
      return {...state, jobState: action.payload};
    },
    resetBooking: state => {
      return {...initValue};
    },
    setIdBooking: (state, action: PayloadAction<string>) => {
      return {...state, id: action.payload};
    },
    setStatusBooking: (
      state,
      action: PayloadAction<
        '' | 'created' | 'inprogressing' | 'accept' | 'complete' | 'cancel'
      >,
    ) => {
      return {...state, status: action.payload};
    },
  },
});

export default jobSlice.reducer;

export const {setBooking, resetBooking, setIdBooking, setStatusBooking} =
  jobSlice.actions;
