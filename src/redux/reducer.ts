import {useDispatch} from 'react-redux';
import jobReducer, {IJobState} from './reducers/jobReducer';
import profileReducer, {IProfileState} from './reducers/profileReducer';
import salerLocationReducer, {
  ISalerState,
} from './reducers/userLocationReducer';
import store from './store';

const rootReducer = {
  saler: salerLocationReducer,
  profile: profileReducer,
  job: jobReducer,
};

export default rootReducer;

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();

export interface AppState {
  profile: IProfileState;
  saler: ISalerState;
  job: IJobState;
}
