import {createStore} from '@reduxjs/toolkit';
import rootReducer from './reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer, persistStore} from 'redux-persist';
import {combineReducers} from '@reduxjs/toolkit';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['profile', 'job'],
};
const persistedReducer = persistReducer(
  persistConfig,
  combineReducers(rootReducer),
);

const store = createStore(persistedReducer);
export const persistor = persistStore(store);

// const store = configureStore({
//   reducer: rootReducer,
// });
export default store;
