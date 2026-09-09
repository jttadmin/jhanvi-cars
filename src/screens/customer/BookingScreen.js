import React, {useCallback, useEffect, useRef, useState} from 'react';
import {calculateDrivingRoute} from '../../services/api';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';

import Geolocation from '@react-native-community/geolocation';

const {PlacesModule} = NativeModules;

const BANGALORE_LOCATION = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const VEHICLE_FARES = {
  Auto: {
    baseFare: 50,
    perKm: 15,
    minimumFare: 80,
  },
  Sedan: {
    baseFare: 100,
    perKm: 18,
    minimumFare: 150,
  },
  SUV: {
    baseFare: 150,
    perKm: 22,
    minimumFare: 220,
  },
};

const BookingScreen = ({navigation}) => {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  const [pickup, setPickup] = useState('Current location');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);

  const [loadingLocation, setLoadingLocation] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState('Sedan');

  const [distanceKm, setDistanceKm] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(0);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);

  const vehicles = [
    {
      name: 'Auto',
      price: '₹80',
      description: 'Affordable',
    },
    {
      name: 'Sedan',
      price: '₹150',
      description: 'Comfortable',
    },
    {
      name: 'SUV',
      price: '₹220',
      description: 'Spacious',
    },
  ];

  /*
   * ------------------------------------------
   * LOCATION PERMISSION
   * ------------------------------------------
   */

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Jhanvi Car Location Permission',
          message: 'Jhanvi Car needs your location to set your pickup point.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.log('Location permission error:', error);
      return false;
    }
  }, []);

  /*
   * ------------------------------------------
   * GET CURRENT LOCATION
   * ------------------------------------------
   */

  const getCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);

    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      setLoadingLocation(false);

      Alert.alert(
        'Location permission required',
        'Please allow location permission to use your current location.',
      );

      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        const location = {
          latitude,
          longitude,
        };

        setCurrentLocation(location);

        setPickup(
          `Current location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
        );

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              ...location,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            800,
          );
        }

        setLoadingLocation(false);
      },
      error => {
        console.log('Location error:', error);

        setLoadingLocation(false);

        Alert.alert(
          'Location error',
          'Unable to get your current location. Please try again.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  }, [requestLocationPermission]);

  /*
   * ------------------------------------------
   * INITIAL LOCATION
   * ------------------------------------------
   */

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  /*
   * ------------------------------------------
   * FARE CALCULATION
   * ------------------------------------------
   */

  useEffect(() => {
    if (!currentLocation || !destinationLocation) {
      setDistanceKm(0);
      setDurationMinutes(0);
      setEstimatedFare(0);
      return;
    }

    let cancelled = false;

    const loadDrivingRoute = async () => {
      try {
        const route = await calculateDrivingRoute({
          origin: currentLocation,
          destination: destinationLocation,
        });

        if (cancelled) {
          return;
        }

        const distance = route.distanceKm;

        const fareDetails = VEHICLE_FARES[selectedVehicle];

        const calculatedFare =
          fareDetails.baseFare + distance * fareDetails.perKm;

        const finalFare = Math.max(calculatedFare, fareDetails.minimumFare);

        setDistanceKm(distance);
        setDurationMinutes(route.durationMinutes || 0);
        setEstimatedFare(Math.round(finalFare));
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.log('Driving route calculation error:', error);

        setDistanceKm(0);
        setDurationMinutes(0);
        setEstimatedFare(0);
        Alert.alert(
          'Route calculation error',
          error?.message || 'Unable to calculate the driving distance.',
        );
      }
    };

    loadDrivingRoute();

    return () => {
      cancelled = true;
    };
  }, [currentLocation, destinationLocation, selectedVehicle]);

  /*
   * ------------------------------------------
   * OPEN DESTINATION SEARCH
   * ------------------------------------------
   */

  const handleDestinationPress = () => {
    setSearchText('');
    setSearchResults([]);
    setSearchVisible(true);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  };

  /*
   * ------------------------------------------
   * SEARCH GOOGLE PLACES
   * ------------------------------------------
   */

  const searchGooglePlaces = async text => {
    setSearchText(text);

    if (!text || text.trim().length < 2) {
      setSearchResults([]);
      setSearchingPlaces(false);
      return;
    }

    if (!PlacesModule) {
      Alert.alert(
        'Places error',
        'Google Places native module is not available.',
      );

      return;
    }

    setSearchingPlaces(true);

    try {
      const location = currentLocation || BANGALORE_LOCATION;

      const results = await PlacesModule.searchPlaces(
        text,
        location.latitude,
        location.longitude,
      );

      setSearchResults(results || []);
    } catch (error) {
      console.log('Places search error:', error);

      setSearchResults([]);

      Alert.alert(
        'Places search error',
        error?.message || 'Unable to search Google Places.',
      );
    } finally {
      setSearchingPlaces(false);
    }
  };

  /*
   * ------------------------------------------
   * SELECT DESTINATION
   * ------------------------------------------
   */

  const handlePlaceSelect = async place => {
    if (!place?.placeId) {
      return;
    }

    setSearchingPlaces(true);

    try {
      const result = await PlacesModule.getPlaceDetails(place.placeId);

      if (!result) {
        throw new Error('No place details returned.');
      }

      const location = {
        latitude: result.latitude,
        longitude: result.longitude,
      };

      setDestination(result.address || result.name || place.description);

      setDestinationLocation(location);

      setSearchVisible(false);
      setSearchText('');
      setSearchResults([]);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          800,
        );
      }
    } catch (error) {
      console.log('Place details error:', error);

      Alert.alert(
        'Destination error',
        error?.message || 'Unable to get the selected destination.',
      );
    } finally {
      setSearchingPlaces(false);
    }
  };

  /*
   * ------------------------------------------
   * CLOSE SEARCH
   * ------------------------------------------
   */

  const closeDestinationSearch = () => {
    setSearchVisible(false);
    setSearchText('');
    setSearchResults([]);
  };

  /*
   * ------------------------------------------
   * CONTINUE
   * ------------------------------------------
   */

  const handleContinue = () => {
    if (!destinationLocation || !destination) {
      Alert.alert(
        'Destination required',
        'Please select a destination before continuing.',
      );
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        'Pickup location required',
        'Please wait for your current location before continuing.',
      );
      return;
    }

    if (distanceKm <= 0 || estimatedFare <= 0) {
      Alert.alert(
        'Fare unavailable',
        'Unable to calculate the fare. Please try again.',
      );
      return;
    }

    navigation.navigate('ConfirmBooking', {
      pickup,
      destination,
      selectedVehicle,
      distanceKm,
      durationMinutes,
      estimatedFare,
      pickupLocation: currentLocation,
      destinationLocation,
    });
  };

  /*
   * ------------------------------------------
   * MAP REGION
   * ------------------------------------------
   */

  const mapRegion = currentLocation
    ? {
        ...currentLocation,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }
    : {
        ...BANGALORE_LOCATION,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };

  /*
   * ------------------------------------------
   * RENDER
   * ------------------------------------------
   */

  return (
    <View style={styles.container}>
      {/* ---------------------------------- */}
      {/* MAP                                */}
      {/* ---------------------------------- */}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}>
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Pickup location"
            description="Your current location"
          />
        )}

        {destinationLocation && (
          <Marker
            coordinate={destinationLocation}
            title="Destination"
            description={destination}
          />
        )}
      </MapView>

      {/* ---------------------------------- */}
      {/* TOP BOOKING CARD                   */}
      {/* ---------------------------------- */}

      <View style={styles.topCard}>
        <Text style={styles.title}>Book a Ride</Text>

        {/* PICKUP */}

        <View style={styles.locationRow}>
          <View style={styles.locationDot} />

          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>PICKUP</Text>

            <Text style={styles.locationText} numberOfLines={1}>
              {pickup}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.gpsButton}
            onPress={getCurrentLocation}
            disabled={loadingLocation}>
            {loadingLocation ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.gpsButtonText}>GPS</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* DESTINATION */}

        <TouchableOpacity
          style={styles.destinationButton}
          onPress={handleDestinationPress}>
          <View style={styles.destinationDot} />

          <View style={styles.destinationTextContainer}>
            <Text style={styles.locationLabel}>DESTINATION</Text>

            <Text
              style={[
                styles.destinationText,
                !destination && styles.destinationPlaceholder,
              ]}
              numberOfLines={1}>
              {destination || 'Where are you going?'}
            </Text>
          </View>

          <Text style={styles.searchArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ---------------------------------- */}
      {/* VEHICLE CARD                       */}
      {/* ---------------------------------- */}

      <View style={styles.bottomCard}>
        <Text style={styles.sectionTitle}>Choose your vehicle</Text>

        {vehicles.map(vehicle => {
          const isSelected = selectedVehicle === vehicle.name;

          return (
            <TouchableOpacity
              key={vehicle.name}
              style={[
                styles.vehicleCard,
                isSelected && styles.vehicleCardSelected,
              ]}
              onPress={() => setSelectedVehicle(vehicle.name)}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>

                <Text style={styles.vehicleDescription}>
                  {vehicle.description}
                </Text>
              </View>

              <Text style={styles.vehiclePrice}>{vehicle.price}</Text>
            </TouchableOpacity>
          );
        })}

        {/* FARE SUMMARY */}

        <View style={styles.fareSummary}>
          <View>
            <Text style={styles.fareLabel}>ESTIMATED DISTANCE</Text>

            <Text style={styles.fareDistance}>
              {distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : '--'}
            </Text>
          </View>

          <View style={styles.fareAmountContainer}>
            <Text style={styles.fareLabel}>ESTIMATED FARE</Text>

            <Text style={styles.fareAmount}>
              {estimatedFare > 0 ? `₹${estimatedFare}` : '--'}
            </Text>
          </View>
        </View>

        {/* CONTINUE */}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* ---------------------------------- */}
      {/* GOOGLE PLACES SEARCH MODAL         */}
      {/* ---------------------------------- */}

      <Modal
        visible={searchVisible}
        animationType="slide"
        onRequestClose={closeDestinationSearch}>
        <View style={styles.searchScreen}>
          {/* HEADER */}

          <View style={styles.searchHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeDestinationSearch}>
              <Text style={styles.closeButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.searchTitle}>Choose destination</Text>
          </View>

          {/* SEARCH INPUT */}

          <View style={styles.searchInputContainer}>
            <View style={styles.searchDot} />

            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search destination"
              placeholderTextColor="#777"
              value={searchText}
              onChangeText={searchGooglePlaces}
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="search"
            />

            {searchingPlaces && <ActivityIndicator size="small" />}

            {searchText.length > 0 && !searchingPlaces && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}>
                <Text style={styles.clearText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SEARCH RESULTS */}

          {searchText.trim().length < 2 ? (
            <View style={styles.searchHintContainer}>
              <Text style={styles.searchHintTitle}>
                Search for a destination
              </Text>

              <Text style={styles.searchHintText}>
                Try searching for MG Road, Indiranagar, Bangalore Palace,
                Airport, or any other place.
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.placeId}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                searchResults.length === 0
                  ? styles.emptyResultsContainer
                  : styles.resultsContainer
              }
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handlePlaceSelect(item)}>
                  <View style={styles.resultIcon}>
                    <Text style={styles.resultIconText}>●</Text>
                  </View>

                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultPrimary} numberOfLines={1}>
                      {item.primaryText}
                    </Text>

                    <Text style={styles.resultSecondary} numberOfLines={2}>
                      {item.secondaryText || item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !searchingPlaces ? (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsTitle}>No places found</Text>

                    <Text style={styles.noResultsText}>
                      Try a different destination.
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

/*
 * ==========================================
 * STYLES
 * ==========================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  map: {
    flex: 1,
  },

  topCard: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#222',
    marginRight: 12,
  },

  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e53935',
    marginRight: 12,
  },

  locationTextContainer: {
    flex: 1,
  },

  destinationTextContainer: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#777',
    marginBottom: 3,
  },

  locationText: {
    fontSize: 14,
    color: '#111',
  },

  destinationText: {
    fontSize: 14,
    color: '#111',
  },

  destinationPlaceholder: {
    color: '#777',
  },

  destinationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },

  searchArrow: {
    fontSize: 28,
    color: '#555',
    marginLeft: 8,
  },

  gpsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },

  gpsButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },

  bottomCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },

  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 8,
  },

  vehicleCardSelected: {
    borderColor: '#111',
    borderWidth: 2,
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  vehicleDescription: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  vehiclePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  fareSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
  },

  fareLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#777',
    marginBottom: 4,
  },

  fareDistance: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  fareAmountContainer: {
    alignItems: 'flex-end',
  },

  fareAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },

  continueButton: {
    backgroundColor: '#111',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  /*
   * SEARCH SCREEN
   */

  searchScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },

  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 34,
    color: '#111',
    lineHeight: 36,
  },

  searchTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111',
    marginLeft: 8,
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 14,
    height: 54,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },

  searchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e53935',
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    paddingVertical: 0,
  },

  clearText: {
    fontSize: 26,
    color: '#777',
    paddingHorizontal: 4,
  },

  resultsContainer: {
    paddingBottom: 20,
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  resultIconText: {
    fontSize: 12,
    color: '#e53935',
  },

  resultTextContainer: {
    flex: 1,
  },

  resultPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },

  resultSecondary: {
    fontSize: 13,
    color: '#777',
  },

  searchHintContainer: {
    padding: 24,
  },

  searchHintTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },

  searchHintText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#777',
  },

  emptyResultsContainer: {
    flexGrow: 1,
  },

  noResults: {
    alignItems: 'center',
    padding: 40,
  },

  noResultsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },

  noResultsText: {
    fontSize: 14,
    color: '#777',
  },
});

export default BookingScreen;
