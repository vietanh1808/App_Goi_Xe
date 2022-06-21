/* eslint-disable @typescript-eslint/no-unused-vars */
import {Pressable, StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {TextInput, TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {ROUTES} from '../../../configs/Routes';
import {
  MAP_API_KEY,
  COLOR_MAIN_TOPIC,
  ACCESS_TOKEN_MAP,
} from '../../../constants';
import SelectDropdown from 'react-native-select-dropdown';
import {AppState, useAppDispatch} from '../../../redux/reducer';
import {setCurrentPickLocation} from '../../../redux/reducers/userLocationReducer';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useSelector} from 'react-redux';
import {setBooking} from '../../../redux/reducers/jobReducer';

const limitSearch = 5;
const language = 'vi';
const country = 'VN';

const DestinationScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const job = useSelector((state: AppState) => state.job.jobState);

  const [searchValue, setSearchValue] = useState('');
  const [features, setFeatures] = useState<any>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const onSubmit = async () => {
    const dataPlace = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchValue}.json?country=${country}&language=${language}&fuzzyMatch=true&access_token=${ACCESS_TOKEN_MAP}`,
    );
    const data = await dataPlace.json();
    setFeatures(data.features);
  };

  return (
    <View style={styles.body}>
      <TextInput
        value={searchValue}
        onChangeText={setSearchValue}
        style={styles.input}
      />
      <View
        style={{
          height: 150,
          display: features.length ? 'flex' : 'none',
        }}>
        <ScrollView style={{...styles.dropdownSearch}}>
          {features.map((f: any) => {
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => {
                  const data = {
                    region: {
                      latitude: f.center[1],
                      longitude: f.center[0],
                      latitudeDelta: 0,
                      longitudeDelta: 0,
                    },
                    place_name: f.place_name,
                  };
                  dispatch(setBooking({...job, destination: data}));
                  dispatch(setCurrentPickLocation('destination'));
                  navigation.navigate(ROUTES.mainSaler as never);
                }}
                style={{...styles.dropdownButton}}>
                <Text>{f.place_name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{flexDirection: 'row', width: '100%'}}>
        <Pressable
          onPress={onSubmit}
          style={{...styles.input, ...styles.button}}>
          <Text style={{...styles.text}}>Tìm kiếm</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default DestinationScreen;

const styles = StyleSheet.create({
  body: {flex: 1},
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    width: '90%',
  },
  button: {
    backgroundColor: COLOR_MAIN_TOPIC,
    paddingHorizontal: 15,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
  dropdownSearch: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    elevation: 3,
    borderTopWidth: 0,
    width: '90%',
    flex: 1,
  },
  dropdownButton: {
    borderTopWidth: 1,
    padding: 10,
    paddingVertical: 15,
  },
});
