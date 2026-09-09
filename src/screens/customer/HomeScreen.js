import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const HomeScreen = ({navigation}) => {
  const handleBookRide = () => {
    navigation.navigate('Booking');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>

      {/* Header */}

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Good afternoon
          </Text>

          <Text style={styles.userName}>
            Welcome to Jhanvi Cars
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('CustomerProfile')}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Location */}

      <View style={styles.locationCard}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />

          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>
              Pickup location
            </Text>

            <Text style={styles.locationValue}>
              Current location
            </Text>
          </View>
        </View>

        <View style={styles.locationLine} />

        <View style={styles.locationRow}>
          <View style={styles.destinationDot} />

          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>
              Where are you going?
            </Text>

            <Text style={styles.locationPlaceholder}>
              Enter destination
            </Text>
          </View>
        </View>
      </View>

      {/* Book Button */}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBookRide}
        activeOpacity={0.8}>
        <Text style={styles.bookButtonText}>
          Book a cab
        </Text>
      </TouchableOpacity>

      {/* Quick Actions */}

      <Text style={styles.sectionTitle}>
        Quick actions
      </Text>

      <View style={styles.quickActions}>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={handleBookRide}>
          <Text style={styles.quickIcon}>🚕</Text>

          <Text style={styles.quickTitle}>
            Book a ride
          </Text>

          <Text style={styles.quickSubtitle}>
            Get a cab now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate('Bookings')}>
          <Text style={styles.quickIcon}>📋</Text>

          <Text style={styles.quickTitle}>
            My bookings
          </Text>

          <Text style={styles.quickSubtitle}>
            View ride history
          </Text>
        </TouchableOpacity>

      </View>

      {/* Recent Booking */}

      <Text style={styles.sectionTitle}>
        Recent activity
      </Text>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>
          🚗
        </Text>

        <Text style={styles.emptyTitle}>
          No recent rides
        </Text>

        <Text style={styles.emptyText}>
          Your completed rides will appear here.
        </Text>
      </View>

      {/* Footer */}

      <Text style={styles.footer}>
        Safe rides. Simple booking.
      </Text>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  greeting: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 4,
  },

  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  profileIcon: {
    fontSize: 22,
  },

  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    elevation: 2,
    marginBottom: 16,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#111111',
    marginRight: 14,
  },

  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#777777',
    marginRight: 14,
  },

  locationTextContainer: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 3,
  },

  locationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },

  locationPlaceholder: {
    fontSize: 16,
    color: '#999999',
  },

  locationLine: {
    height: 24,
    width: 1,
    backgroundColor: '#DDDDDD',
    marginLeft: 5,
    marginVertical: 4,
  },

  bookButton: {
    height: 54,
    backgroundColor: '#111111',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 14,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },

  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    elevation: 2,
  },

  quickIcon: {
    fontSize: 28,
    marginBottom: 12,
  },

  quickTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 5,
  },

  quickSubtitle: {
    fontSize: 12,
    color: '#888888',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    elevation: 1,
  },

  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 32,
  },
});

export default HomeScreen;
