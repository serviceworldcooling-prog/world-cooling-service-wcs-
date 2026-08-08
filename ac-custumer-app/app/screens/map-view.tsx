import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';
import * as Location from 'expo-location';

export default function MapViewScreen() {
  const { themeMode, userLocation, setUserLocation } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  // Default to a fallback location (e.g. Miami or Noida/Delhi) if userLocation is null
  const initialLat = userLocation?.latitude ?? 28.6139;
  const initialLng = userLocation?.longitude ?? 77.2090;

  const [currentCoords, setCurrentCoords] = useState({ latitude: initialLat, longitude: initialLng });
  const [address, setAddress] = useState(userLocation?.addressString ?? 'Fetching address...');
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Function to resolve geocode from coordinates
  const resolveAddress = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const [geocode] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const addressString = `${geocode.name || geocode.street || ''}, ${geocode.city || ''}, ${geocode.region || ''}`.replace(/^,\s*|,\s*$/g, '') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addressString);
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setLoadingAddress(false);
    }
  };

  // Handle messages from Leaflet map webview
  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.latitude && data.longitude) {
        const newCoords = { latitude: data.latitude, longitude: data.longitude };
        setCurrentCoords(newCoords);
        resolveAddress(data.latitude, data.longitude);
      }
    } catch (err) {
      console.error('Error parsing map message:', err);
    }
  };

  const handleSave = () => {
    setUserLocation({
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
      addressString: address,
    });
    Alert.alert("Location Saved", "Your selected location has been updated successfully.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  // Leaflet satellite map HTML template
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        /* Style the leaflet zoom controls */
        .leaflet-bar { border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var lat = ${initialLat};
        var lng = ${initialLng};

        var map = L.map('map', { zoomControl: false }).setView([lat, lng], 16);
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Add Esri Satellite/World Imagery layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri'
        }).addTo(map);

        var marker = L.marker([lat, lng], { draggable: true }).addTo(map);

        function sendLocation(newLat, newLng) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: newLat, longitude: newLng }));
        }

        marker.on('dragend', function(event) {
          var position = marker.getLatLng();
          sendLocation(position.lat, position.lng);
        });

        map.on('click', function(event) {
          marker.setLatLng(event.latlng);
          sendLocation(event.latlng.lat, event.latlng.lng);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Satellite Map</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          onMessage={handleMapMessage}
          style={styles.webview}
        />
      </View>

      <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.addrHeader}>
          <Icons.MapPin size={18} color={colors.primary} />
          <Text style={[styles.addrLabel, { color: colors.textSecondary }]}> Selected Address</Text>
        </View>
        
        {loadingAddress ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
        ) : (
          <Text style={[styles.addressText, { color: colors.text }]}>{address}</Text>
        )}

        <Text style={[styles.coordsText, { color: colors.primary }]}>
          GPS: {currentCoords.latitude.toFixed(6)}, {currentCoords.longitude.toFixed(6)}
        </Text>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  detailsCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  addrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addrLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  coordsText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 20,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
