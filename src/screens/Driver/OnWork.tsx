import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import MapViewDirections from 'react-native-maps-directions';
import MapView, {Marker} from 'react-native-maps';
import {COLOR_MAIN_TOPIC} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {AppState, useAppDispatch} from '../../redux/reducer';
import {useSelector} from 'react-redux';

const OnWork = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const job = useSelector((state: AppState) => state.job.jobState);
  const [loading, setLoading] = useState(false);
  return (
    <View style={{flex: 1}}>
      {loading ? (
        <ActivityIndicator
          style={{flex: 1}}
          color={COLOR_MAIN_TOPIC}
          size="large"
        />
      ) : (
        <View style={{flex: 1}}>
          <MapView
            showsCompass={false}
            provider={PROVIDER_GOOGLE}
            customMapStyle={standard_custom_map}
            camera={camera}
            style={styles.mapContainer}>
            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={marker.coordinate}
                title={marker.title}
                pinColor={marker.pinColor}
              />
            ))}
            <MapViewDirections
              origin={{...job.departure.region}}
              destination={{...job.destination.region}}
              apikey={MAP_API_KEY}
              strokeWidth={5}
              strokeColor="hotpink"
            />
          </MapView>
        </View>
      )}
    </View>
  );
};

export default OnWork;

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '80%',
  },
  button: {
    padding: 10,
    backgroundColor: COLOR_MAIN_TOPIC,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {color: '#fff', fontSize: 18},
  section1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 50,
  },
  feeText: {
    color: '#000',
    fontSize: 19,
    alignSelf: 'center',
  },
});
