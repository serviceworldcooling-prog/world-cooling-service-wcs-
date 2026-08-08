import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Modal, ActivityIndicator,
  Dimensions, StatusBar, TextInput as RNTextInput,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { TextInput } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Suggestion {
  display_name: string;
  latitude: number;
  longitude: number;
}

// ─── View-Only Map HTML (fixed pin, no confirm) ─────────────────────────────
const buildViewMapHtml = (lat: number, lng: number, label: string, address: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; touch-action:manipulation; overflow:hidden; }
    #map { width:100%; height:100%; }
    #infoCard {
      position:fixed; bottom:0; left:0; right:0;
      background:#fff; border-top-left-radius:24px; border-top-right-radius:24px;
      padding:20px 20px 36px; z-index:1000;
      box-shadow:0 -4px 24px rgba(0,0,0,0.15);
    }
    #infoCard .handle {
      width:40px; height:4px; background:#e5e5ea;
      border-radius:2px; margin:0 auto 16px;
    }
    #infoCard .lbl {
      font-size:18px; font-weight:800; color:#1a1a2e;
      font-family:sans-serif; margin-bottom:6px;
    }
    #infoCard .addr {
      font-size:13px; color:#6b7280; font-family:sans-serif; line-height:1.5;
    }
    #infoCard .coords {
      font-size:11px; color:#007AFF; font-family:sans-serif;
      font-weight:700; margin-top:8px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="infoCard">
    <div class="handle"></div>
    <div class="lbl">📍 ${label.replace(/'/g, "\\'")}</div>
    <div class="addr">${address.replace(/'/g, "\\'")}</div>
    <div class="coords">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
  </div>
  <script>
    var map = L.map('map', {
      zoomControl: true, attributionControl: false, tap: false,
    }).setView([${lat}, ${lng}], 17);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 20, minZoom: 3 }
    ).addTo(map);
    var icon = L.divIcon({
      html: '<div style="width:20px;height:20px;background:#007AFF;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
      iconSize:[20,20], iconAnchor:[10,10], className:''
    });
    L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
  </script>
</body>
</html>
`;

// ─── Full-Page Satellite Map HTML ──────────────────────────────────────────────
// Key fixes for zoom:
//   1. viewport does NOT set maximum-scale (allows pinch zoom)
//   2. touch-action: manipulation on html/body allows native pinch
//   3. Leaflet tap: false avoids interfering with native touch
const buildMapHtml = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width:100%; height:100%;
      touch-action: manipulation;
      overflow: hidden;
    }
    #map { width:100%; height:100%; }

    /* Fixed crosshair dead-center */
    .pin-wrap {
      position:fixed; top:50%; left:50%;
      transform:translate(-50%, -100%);
      pointer-events:none; z-index:1000;
    }
    .pin-dot {
      width:18px; height:18px;
      background:#007AFF; border:3px solid #fff;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      margin:0 auto;
    }
    .pin-stem {
      width:2px; height:20px;
      background:#007AFF;
      margin:0 auto;
    }
    .pin-shadow {
      width:12px; height:6px;
      background:rgba(0,0,0,0.25);
      border-radius:50%;
      margin:0 auto;
      margin-top:2px;
    }

    /* Top address bar */
    #addrBar {
      position:fixed; top:16px; left:14px; right:14px;
      background:rgba(255,255,255,0.97);
      border-radius:14px; padding:12px 16px;
      font-size:13px; color:#1a1a2e; font-family:sans-serif;
      z-index:1000; box-shadow:0 4px 20px rgba(0,0,0,0.18);
      min-height:46px; line-height:1.4;
    }
    #addrBar span { font-weight:700; display:block; margin-bottom:2px; }

    /* Bottom confirm button */
    #confirmBtn {
      position:fixed; bottom:36px; left:24px; right:24px;
      background:#007AFF; color:#fff; border:none;
      padding:16px; border-radius:16px;
      font-size:17px; font-weight:700; z-index:1000;
      cursor:pointer; font-family:sans-serif;
      box-shadow:0 6px 24px rgba(0,122,255,0.45);
      letter-spacing:0.3px;
    }
    #confirmBtn:active { opacity:0.85; }

    /* Zoom control repositioned */
    .leaflet-control-zoom {
      margin-right:12px !important;
      margin-bottom:110px !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="pin-wrap">
    <div class="pin-dot"></div>
    <div class="pin-stem"></div>
    <div class="pin-shadow"></div>
  </div>
  <div id="addrBar">
    <span>📍 Current pin location</span>
    <span id="addrText">Locating address...</span>
  </div>
  <button id="confirmBtn" onclick="confirmLocation()">✓ &nbsp;Confirm This Location</button>

  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false,
      tap: false,           // Let native handle taps — fixes zoom on Android
      bounceAtZoomLimits: false,
    }).setView([${lat}, ${lng}], 17);

    // Satellite layer
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 20, minZoom: 3 }
    ).addTo(map);

    // Blue dot = original GPS location
    L.circleMarker([${lat}, ${lng}], {
      radius: 9, color: '#fff', fillColor: '#007AFF', fillOpacity: 1, weight: 3,
      pane: 'markerPane'
    }).addTo(map).bindTooltip('Your GPS', { permanent: false });

    var addrText = document.getElementById('addrText');
    var currentLat = ${lat}, currentLng = ${lng};
    var currentAddr = '', currentFullAddr = '';
    var geocodeTimer = null;

    function reverseGeocode(lat, lng) {
      clearTimeout(geocodeTimer);
      geocodeTimer = setTimeout(function() {
        fetch(
          'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&addressdetails=1',
          { headers: { 'User-Agent': 'AC-Service-App' } }
        )
        .then(function(r){ return r.json(); })
        .then(function(d){
          if (d && d.address) {
            var a = d.address;
            // Build a clean place name (most specific → broader area)
            var placeName = a.amenity || a.building || a.shop || a.leisure
              || a.name || a.road || a.pedestrian || '';
            var area = a.neighbourhood || a.suburb || a.quarter
              || a.village || a.town || a.city_district || '';
            var city = a.city || a.county || a.state_district || a.state || '';

            var parts = [];
            if (placeName) parts.push(placeName);
            if (area && area !== placeName) parts.push(area);
            if (city && city !== area && city !== placeName) parts.push(city);

            var shortName = parts.length > 0 ? parts.join(', ') : d.display_name;
            currentAddr = shortName;
            currentFullAddr = d.display_name;
            addrText.innerText = shortName;
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'address', lat: lat, lng: lng, address: shortName, fullAddress: d.display_name
            }));
          } else {
            var coords = lat.toFixed(6) + ', ' + lng.toFixed(6);
            currentAddr = coords;
            currentFullAddr = coords;
            addrText.innerText = coords;
          }
        })
        .catch(function(){
          var coords = lat.toFixed(6) + ', ' + lng.toFixed(6);
          currentAddr = coords;
          currentFullAddr = coords;
          addrText.innerText = coords;
        });
      }, 600);
    }

    map.on('moveend', function() {
      var c = map.getCenter();
      currentLat = c.lat; currentLng = c.lng;
      addrText.innerText = 'Locating...';
      reverseGeocode(c.lat, c.lng);
    });

    function confirmLocation() {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'confirm', lat: currentLat, lng: currentLng,
        address: currentAddr || addrText.innerText,
        fullAddress: currentFullAddr || addrText.innerText
      }));
    }

    reverseGeocode(${lat}, ${lng});
  </script>
</body>
</html>
`;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SavedAddressesScreen() {
  const { themeMode, addresses, loadAddresses, addAddress, removeAddress, userLocation } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // UI modes
  const [showMapModal, setShowMapModal] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [viewAddress, setViewAddress] = useState<{ label: string; address: string; lat: number; lng: number } | null>(null);
  const [searchText, setSearchText] = useState('');

  // Custom form
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Map state
  const [mapLat, setMapLat] = useState(userLocation?.latitude ?? 20.5937);
  const [mapLng, setMapLng] = useState(userLocation?.longitude ?? 78.9629);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapLiveAddress, setMapLiveAddress] = useState('');
  const [mapConfirmed, setMapConfirmed] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [mapLabel, setMapLabel] = useState('');
  const [showMapSaveForm, setShowMapSaveForm] = useState(false);

  useEffect(() => { loadAddresses(); }, []);

  useEffect(() => {
    if (userLocation) {
      setMapLat(userLocation.latitude);
      setMapLng(userLocation.longitude);
    } else {
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        .then(pos => { setMapLat(pos.coords.latitude); setMapLng(pos.coords.longitude); })
        .catch(() => { });
    }
  }, [userLocation]);

  const filteredAddresses = addresses.filter(item =>
    item.label.toLowerCase().includes(searchText.toLowerCase()) ||
    item.address.toLowerCase().includes(searchText.toLowerCase())
  );

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6`,
        { headers: { 'User-Agent': 'AC-Service-App-Customer' } }
      );
      const data = await res.json();
      setSuggestions(data.map((item: any) => ({
        display_name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      })));
    } catch { }
  };

  const handleCustomSave = async () => {
    if (!label.trim() || !address.trim()) {
      Alert.alert('Missing Fields', 'Please enter both a label and address.'); return;
    }
    await addAddress(label.trim(), address.trim(), undefined, selectedCoords?.lat, selectedCoords?.lng);
    setLabel(''); setAddress(''); setSuggestions([]); setSelectedCoords(null); setShowCustomForm(false);
    Alert.alert('✅ Saved', 'Address added successfully.');
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'address') setMapLiveAddress(data.address);
      if (data.type === 'confirm') {
        setMapConfirmed({ lat: data.lat, lng: data.lng, address: data.address });
        setMapLiveAddress(data.address);
        setShowMapSaveForm(true);
      }
    } catch { }
  };

  const handleMapSave = async () => {
    if (!mapLabel.trim()) { Alert.alert('Missing Label', 'Enter a name for this location.'); return; }
    if (!mapConfirmed) { Alert.alert('No Location', 'Confirm a location on the map first.'); return; }
    await addAddress(
      mapLabel.trim(),
      mapConfirmed.address || `${mapConfirmed.lat.toFixed(5)}, ${mapConfirmed.lng.toFixed(5)}`,
      undefined, mapConfirmed.lat, mapConfirmed.lng
    );
    setMapLabel(''); setMapConfirmed(null); setShowMapModal(false); setShowMapSaveForm(false);
    Alert.alert('✅ Saved', 'Map location saved successfully.');
  };

  const iconForLabel = (lbl: string) => {
    const l = lbl.toLowerCase();
    if (l.includes('home')) return 'Home';
    if (l.includes('office') || l.includes('work')) return 'Briefcase';
    if (l.includes('gym')) return 'Dumbbell';
    if (l.includes('shop') || l.includes('store')) return 'ShoppingBag';
    return 'MapPin';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── VIEW-ONLY MAP MODAL ─────────────────────────────── */}
      <Modal visible={!!viewAddress} animationType="slide" statusBarTranslucent>
        <StatusBar backgroundColor="transparent" translucent />
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <WebView
            source={{ html: viewAddress ? buildViewMapHtml(viewAddress.lat, viewAddress.lng, viewAddress.label, viewAddress.address) : '' }}
            style={StyleSheet.absoluteFill}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            scrollEnabled={false}
            bounces={false}
          />
          <TouchableOpacity
            style={styles.mapCloseBtn}
            onPress={() => setViewAddress(null)}
          >
            <Icons.X size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── FULL PAGE MAP MODAL ──────────────────────────────── */}
      <Modal visible={showMapModal} animationType="slide" statusBarTranslucent>
        <StatusBar backgroundColor="transparent" translucent />
        <View style={styles.mapModalContainer}>
          {/* WebView fills entire screen */}
          {mapLoading && (
            <View style={styles.mapModalLoader}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.mapModalLoaderText}>Loading satellite map...</Text>
            </View>
          )}
          <WebView
            source={{ html: buildMapHtml(mapLat, mapLng) }}
            style={StyleSheet.absoluteFill}
            onLoadStart={() => setMapLoading(true)}
            onLoadEnd={() => setMapLoading(false)}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            geolocationEnabled
            originWhitelist={['*']}
            scrollEnabled={false}          // Prevents ScrollView fighting touch
            bounces={false}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />

          {/* Close button — top left */}
          <TouchableOpacity
            style={styles.mapCloseBtn}
            onPress={() => { setShowMapModal(false); setShowMapSaveForm(false); setMapConfirmed(null); }}
          >
            <Icons.X size={20} color="#fff" />
          </TouchableOpacity>

          {/* Save Form — slides up after confirm */}
          {showMapSaveForm && mapConfirmed && (
            <View style={styles.mapSaveSheet}>
              <View style={styles.mapSaveHandle} />
              <Text style={styles.mapSaveTitle}>Name This Location</Text>
              <Text style={styles.mapSaveAddr} numberOfLines={2}>{mapConfirmed.address}</Text>
              <TextInput
                label="Location Label"
                placeholder="e.g. Home, Office, Gym..."
                value={mapLabel}
                onChangeText={setMapLabel}
              />
              <View style={styles.mapSaveActions}>
                <TouchableOpacity
                  style={styles.mapSaveCancelBtn}
                  onPress={() => { setShowMapSaveForm(false); setMapConfirmed(null); }}
                >
                  <Text style={styles.mapSaveCancelText}>Back to Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapSaveConfirmBtn} onPress={handleMapSave}>
                  <Icons.Save size={16} color="#fff" />
                  <Text style={styles.mapSaveConfirmText}>Save Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>MY ADDRESSES</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── SEARCH ──────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icons.Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <RNTextInput
            placeholder="Search saved addresses..."
            placeholderTextColor={colors.textSecondary + '80'}
            value={searchText}
            onChangeText={setSearchText}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icons.X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── ADD OPTIONS ─────────────────────────────────────── */}
        <View style={styles.addOptionsRow}>
          {/* Custom Location */}
          <TouchableOpacity
            style={[styles.addOptionBtn, { backgroundColor: colors.card, borderColor: showCustomForm ? colors.primary : colors.border }]}
            onPress={() => setShowCustomForm(v => !v)}
          >
            <View style={[styles.addOptionIcon, { backgroundColor: colors.primary + '18' }]}>
              <Icons.PenLine size={18} color={colors.primary} />
            </View>
            <Text style={[styles.addOptionLabel, { color: colors.text }]}>Custom{'\n'}Location</Text>
          </TouchableOpacity>

          {/* Choose from Map */}
          <TouchableOpacity
            style={[styles.addOptionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { setMapLoading(true); setShowMapModal(true); }}
          >
            <View style={[styles.addOptionIcon, { backgroundColor: '#10B98118' }]}>
              <Icons.Map size={18} color="#10B981" />
            </View>
            <Text style={[styles.addOptionLabel, { color: colors.text }]}>Choose{'\n'}from Map</Text>
          </TouchableOpacity>

          {/* Live Location */}
          {userLocation && (
            <TouchableOpacity
              style={[styles.addOptionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Alert.alert(
                  '📍 Save Live Location',
                  `Save your current GPS location?\n${userLocation.addressString}`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Save', onPress: async () => {
                        const lbl = 'Live Location';
                        await addAddress(lbl, userLocation.addressString, undefined, userLocation.latitude, userLocation.longitude);
                        Alert.alert('✅ Saved', 'Live location saved!');
                      }
                    }
                  ]
                );
              }}
            >
              <View style={[styles.addOptionIcon, { backgroundColor: '#F59E0B18' }]}>
                <Icons.LocateFixed size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.addOptionLabel, { color: colors.text }]}>Live{'\n'}Location</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── CUSTOM LOCATION FORM ─────────────────────────── */}
        {showCustomForm && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.primary + '50' }]}>
            <View style={styles.formTitleRow}>
              <Icons.PenLine size={18} color={colors.primary} />
              <Text style={[styles.formTitle, { color: colors.text }]}>Custom Location</Text>
            </View>

            <TextInput
              label="Label (e.g. Home, Office, Gym)"
              placeholder="Home"
              value={label}
              onChangeText={setLabel}
            />

            <TextInput
              label="Search Address"
              placeholder="Start typing address..."
              value={address}
              onChangeText={(text) => { setAddress(text); setSelectedCoords(null); fetchSuggestions(text); }}
            />

            {suggestions.length > 0 && (
              <View style={[styles.suggestionsBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {suggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.suggestionRow, idx < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                    onPress={() => { setAddress(item.display_name); setSelectedCoords({ lat: item.latitude, lng: item.longitude }); setSuggestions([]); }}
                  >
                    <Icons.MapPin size={14} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text numberOfLines={2} style={[styles.suggestionText, { color: colors.text }]}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedCoords && (
              <View style={[styles.coordsBadge, { backgroundColor: colors.primary + '12' }]}>
                <Icons.Navigation size={12} color={colors.primary} />
                <Text style={[styles.coordsText, { color: colors.primary }]}>
                  GPS: {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
                </Text>
              </View>
            )}

            <View style={styles.formActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowCustomForm(false); setSuggestions([]); }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleCustomSave}>
                <Icons.Save size={16} color="#FFF" />
                <Text style={{ color: '#FFF', fontWeight: '700', marginLeft: 6 }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── SECTION TITLE ────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          SAVED ADDRESSES {addresses.length > 0 ? `(${addresses.length})` : ''}
        </Text>

        {/* ── ADDRESS LIST ──────────────────────────────────── */}
        {filteredAddresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icons.MapPin size={42} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchText ? 'No matching addresses found.' : 'No saved addresses yet.\nUse the options above to add one.'}
            </Text>
          </View>
        ) : (
          filteredAddresses.map((item) => {
            const hasCoords = item.lat !== undefined && item.lng !== undefined;
            const IconComp = (Icons as any)[iconForLabel(item.label)] ?? Icons.MapPin;
            return (
              <TouchableOpacity
                key={item._id}
                activeOpacity={hasCoords ? 0.75 : 1}
                onPress={() => {
                  if (hasCoords) setViewAddress({ label: item.label, address: item.address, lat: item.lat!, lng: item.lng! });
                }}
                style={[styles.addrCard, { backgroundColor: colors.card, borderColor: hasCoords ? colors.primary + '40' : colors.border }]}
              >
                <View style={[styles.addrIconBox, { backgroundColor: colors.primary + '15' }]}>
                  <IconComp size={20} color={colors.primary} />
                </View>
                <View style={styles.addrContent}>
                  <Text style={[styles.addrLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.addrText, { color: colors.textSecondary }]} numberOfLines={2}>{item.address}</Text>
                  {item.lat !== undefined && item.lng !== undefined && (
                    <View style={styles.gpsBadge}>
                      <Icons.Navigation size={10} color={colors.primary} />
                      <Text style={[styles.gpsText, { color: colors.primary }]}>
                        {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                      </Text>
                    </View>
                  )}
                </View>
                {hasCoords && (
                  <View style={[styles.mapPeekBtn, { backgroundColor: colors.primary + '15' }]}>
                    <Icons.MapPin size={14} color={colors.primary} />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.deleteBtn, { borderColor: '#EF444430' }]}
                  onPress={() => Alert.alert('Remove Address', `Remove "${item.label}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeAddress(item._id) }
                  ])}
                >
                  <Icons.Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Map Modal ─────────────────────────────────────────────
  mapModalContainer: { flex: 1, backgroundColor: '#000' },
  mapModalLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1a1a2e', zIndex: 20,
  },
  mapModalLoaderText: { color: '#007AFF', marginTop: 12, fontSize: 15, fontWeight: '700' },
  mapCloseBtn: {
    position: 'absolute', top: 52, left: 16, zIndex: 100,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  mapSaveSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20,
    elevation: 20,
  },
  mapSaveHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e5ea',
    alignSelf: 'center', marginBottom: 20,
  },
  mapSaveTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a2e', marginBottom: 6 },
  mapSaveAddr: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 16 },
  mapSaveActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  mapSaveCancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  mapSaveCancelText: { fontWeight: '700', color: '#6b7280', fontSize: 15 },
  mapSaveConfirmBtn: {
    flex: 2, backgroundColor: '#007AFF', borderRadius: 14,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  mapSaveConfirmText: { fontWeight: '700', color: '#fff', fontSize: 15 },

  // ── Page ───────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 8, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: { 
    fontSize: 14, 
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 48,
  },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8, height: '100%' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 20 },

  // ── Add options ────────────────────────────────────────────
  addOptionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  addOptionBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 8,
  },
  addOptionIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  addOptionLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center', lineHeight: 16 },

  // ── Custom form ────────────────────────────────────────────
  formCard: { borderWidth: 1.5, borderRadius: 12, padding: 16, marginBottom: 20 },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  formTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10,
  },

  suggestionsBox: { borderWidth: 1.5, borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  suggestionText: { fontSize: 12, flex: 1 },
  coordsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 8,
  },
  coordsText: { fontSize: 10, fontWeight: '800' },

  // ── Section & address list ─────────────────────────────────
  sectionTitle: {
    fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 14, marginTop: 4,
  },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 14 },
  emptyText: { fontSize: 12, textAlign: 'center', lineHeight: 18, fontWeight: '600' },

  addrCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 12, gap: 12,
  },
  addrIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addrContent: { flex: 1 },
  addrLabel: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  addrText: { fontSize: 12, marginTop: 3, lineHeight: 17, fontWeight: '600' },
  gpsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  gpsText: { fontSize: 9, fontWeight: '800' },
  mapPeekBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginRight: 4,
  },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 8, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
});
