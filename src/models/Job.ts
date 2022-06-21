import {ILocation} from '../redux/reducers/userLocationReducer';

export interface IJobParams {
  booker?: string;
  car_type: 'motor' | 'car';
  departure: ILocation;
  destination: ILocation;
  distance: number;
  driver: string;
  fee: number;
  status: '' | 'created' | 'complete' | 'accept' | 'cancel' | 'inprogressing';
  timestamp: number;
  id: string;
}
