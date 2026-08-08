import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity,
  Image, ActivityIndicator, Linking, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { getTrackingInfo, TrackingInfo } from '../../api/trackingApi';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(25);

  useEffect(() => {
    if (!id) return;

    const fetchTracking = () => {
      getTrackingInfo(id)
        .then(data => {
          setTracking(data);
          if (data.estimatedArrivalMinutes) setEta(data.estimatedArrivalMinutes);
        })
        .catch(() => {});
    };

    fetchTracking();
    setLoading(false);

    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subTextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const isLive = Boolean(
    tracking?.isLiveLocation &&
    tracking?.technicianLocation?.lat &&
    tracking?.technicianLocation?.lng &&
    tracking?.technicianName &&
    tracking.technicianName !== 'Assigning...' &&
    tracking.technicianName !== 'Pending'
  );

  // Coordinates
  const customerLat = tracking?.customerLocation?.lat || 28.6139;
  const customerLng = tracking?.customerLocation?.lng || 77.2090;
  const techLat = tracking?.technicianLocation?.lat || (customerLat + 0.006);
  const techLng = tracking?.technicianLocation?.lng || (customerLng + 0.006);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{y}/{x}{r}.png';

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: ${isDark ? '#0f172a' : '#f8fafc'}; }
        .leaflet-bar { border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; }
        .pulse-marker {
          width: 18px;
          height: 18px;
          background: #0F766E;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(15, 118, 110, 0.8);
        }
        .pulse-customer {
          width: 18px;
          height: 18px;
          background: #EF4444;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var cLat = ${customerLat};
        var cLng = ${customerLng};
        var tLat = ${techLat};
        var tLng = ${techLng};

        var map = L.map('map', { zoomControl: false }).setView([(cLat + tLat)/2, (cLng + tLng)/2], 14);
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Esri High-Resolution World Satellite Imagery
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri'
        }).addTo(map);

        // Hybrid Street Labels overlay
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{y}/{x}{r}.png', {
          maxZoom: 19
        }).addTo(map);

        var custDivIcon = L.divIcon({ className: 'pulse-customer', iconSize: [18, 18], iconAnchor: [9, 9] });
        var techDivIcon = L.divIcon({ className: 'pulse-marker', iconSize: [18, 18], iconAnchor: [9, 9] });

        L.marker([cLat, cLng], { icon: custDivIcon }).addTo(map).bindPopup('<b>Customer Destination</b>');
        L.marker([tLat, tLng], { icon: techDivIcon }).addTo(map).bindPopup('<b>Technician Live Location</b>');

        var polyline = L.polyline([[cLat, cLng], [tLat, tLng]], {
          color: '#0F766E',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 10'
        }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [60, 60] });
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Top Header Bar ── */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor, paddingTop: Math.max(10, insets.top) }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} activeOpacity={0.7} style={[styles.backBtn, { borderColor }]}>
            <Icons.ArrowLeft size={18} color={textColor} />
          </TouchableOpacity>
          <View style={[styles.headerDividerVertical, { backgroundColor: borderColor }]} />
          <View style={styles.headerTitleSelector}>
            <Text style={[styles.brandHeader, { color: colors.primary }]}>WCS TRACKER</Text>
            <Text numberOfLines={1} style={[styles.locationText, { color: textColor }]}>
              Live Field Telemetry
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.menuButton, { borderColor }]}
          onPress={() => router.push('/screens/notifications')}
          activeOpacity={0.7}
        >
          <Icons.Bell size={18} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* ── Map Container / Awaiting Dispatch ── */}
      <View style={[styles.mapContainer, { backgroundColor: isDark ? '#020617' : '#F1F5F9' }]}>
        {!isLive ? (
          <View style={styles.awaitingLocationWrap}>
            <View style={styles.awaitingIconBg}>
              <Icons.Navigation size={36} color={colors.primary} />
            </View>
            <Text style={[styles.awaitingLocationText, { color: textColor }]}>
              Live Location Sharing Inactive
            </Text>
            <Text style={[styles.awaitingLocationSub, { color: subTextColor }]}>
              Serviceman has not shared live location yet. Satellite map will display automatically once serviceman clicks "Next Task (Share Location)".
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, position: 'relative' }}>
            <WebView
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={{ flex: 1 }}
            />

            {/* Overlaid Floating ETA Chip */}
            <View style={[styles.etaBox, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.etaIconRow}>
                <Icons.Clock size={14} color={colors.primary} />
                <Text style={[styles.etaLabel, { color: subTextColor }]}>ESTIMATED ARRIVAL</Text>
              </View>
              <Text style={[styles.etaVal, { color: textColor }]}>
                {eta <= 1 ? 'Arriving Now' : `${eta} Mins`}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Bottom Sheet Details Card ── */}
      <View style={[styles.detailBox, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
        <View style={styles.grabBar} />

        {/* Live Status Pill */}
        <View style={[
          styles.statusPill,
          {
            backgroundColor: !isLive ? (isDark ? '#332E1E' : '#FEF3C7') : (eta <= 1 ? (isDark ? '#064E3B' : '#D1FAE5') : (isDark ? '#0F2D37' : '#E0F2FE')),
            borderColor: !isLive ? '#F59E0B' : (eta <= 1 ? '#10B981' : colors.primary)
          }
        ]}>
          <View style={[
            styles.pulseDot,
            { backgroundColor: !isLive ? '#F59E0B' : (eta <= 1 ? '#10B981' : colors.primary) }
          ]} />
          <Text style={[
            styles.statusText,
            { color: !isLive ? '#D97706' : (eta <= 1 ? '#059669' : colors.primary) }
          ]}>
            {!isLive
              ? 'Scheduling Pending — Service technician will be assigned shortly'
              : eta <= 1
                ? 'Technician has arrived at your address'
                : 'Technician is en route to your service location'}
          </Text>
        </View>

        {/* Technician Info Row */}
        <View style={styles.techRow}>
          {!isLive ? (
            <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <Icons.UserSearch size={24} color={colors.primary} />
            </View>
          ) : (
            <Image
              source={{ uri: tracking?.techAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150' }}
              style={styles.avatar}
            />
          )}

          <View style={styles.techInfo}>
            <Text style={[styles.techName, { color: textColor }]}>
              {!isLive ? 'Assigning Technician…' : tracking?.technicianName}
            </Text>
            <Text style={[styles.special, { color: subTextColor }]}>
              {!isLive ? 'Standby for assignment' : 'Master AC Specialist'}
            </Text>
          </View>

          {isLive && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => {
                  const phone = tracking?.technicianPhone || '9999999999';
                  Linking.openURL(`tel:${phone}`);
                }}
              >
                <Icons.Phone size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
                activeOpacity={0.8}
                onPress={() => {
                  const phone = tracking?.technicianPhone || '9999999999';
                  const cleanPhone = phone.replace(/[^0-9]/g, '');
                  const message = encodeURIComponent(`Hello ${tracking?.technicianName}, I am tracking your live location for my AC Service booking.`);
                  Linking.openURL(`https://wa.me/${cleanPhone.startsWith('91') || cleanPhone.length === 10 ? '91' + cleanPhone.slice(-10) : cleanPhone}?text=${message}`);
                }}
              >
                <Icons.MessageSquare size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDividerVertical: {
    width: 1,
    height: 24,
  },
  headerTitleSelector: {
    justifyContent: 'center',
  },
  brandHeader: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '800',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  awaitingLocationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  awaitingIconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#0F766E15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  awaitingLocationText: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  awaitingLocationSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  etaBox: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  etaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  etaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  etaVal: {
    fontSize: 16,
    fontWeight: '900',
  },

  detailBox: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  grabBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },

  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 15,
    fontWeight: '800',
  },
  special: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
