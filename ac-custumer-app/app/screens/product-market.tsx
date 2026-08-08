import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton, TextInput } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { getProducts as fetchProducts, createProduct as saveProduct, deleteProduct as deleteProductApi, updateProduct as updateProductApi, ProductItem } from '../../api/productApi';
import apiClient from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

// Comprehensive Country codes list with flag emojis
const COUNTRY_CODES = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+30', name: 'Greece', flag: '🇬🇷' },
  { code: '+98', name: 'Iran', flag: '🇮🇷' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶' },
  { code: '+972', name: 'Israel', flag: '🇮🇱' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: '+43', name: 'Austria', flag: '🇦🇹' },
];

interface Product {
  id: string;
  _id?: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  video?: string;
  sellerPhone: string;
  sellerEmail: string;
  createdAt: string;
  brand?: string;
  acType?: string;
  capacity?: string;
  starRating?: string;
  usageDuration?: string;
}

// Initial Mock Market Products
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Samsung 1.5 Ton Split AC',
    price: 18500,
    description: 'Selling 1 year old Samsung 5-star inverter split AC. Perfect working condition, silent compressor. Moving to another city.',
    images: [
      'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=500',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500'
    ],
    sellerPhone: '+91 9876543210',
    sellerEmail: 'seller1@example.com',
    createdAt: '2 days ago'
  },
  {
    id: '2',
    title: 'Voltas Window AC 1 Ton',
    price: 9500,
    description: 'Well maintained Voltas Window AC. Ideal for small rooms. Energy efficient copper condenser.',
    images: [
      'https://images.unsplash.com/photo-1590247813693-5541f1c609fd?w=500'
    ],
    sellerPhone: '+91 8765432109',
    sellerEmail: 'seller2@example.com',
    createdAt: '5 days ago'
  }
];

export default function ProductMarketScreen() {
  const { themeMode, user } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load real products from DB on mount
  useEffect(() => {
    fetchProducts()
      .then(list => {
        const mapped = list.map((p: ProductItem) => ({
          id: p._id,
          _id: p._id,
          title: p.title,
          price: p.price,
          description: p.description,
          images: p.images,
          video: p.video,
          sellerPhone: p.sellerPhone,
          sellerEmail: p.sellerEmail,
          createdAt: new Date(p.createdAt).toLocaleDateString(),
          brand: p.brand,
          acType: p.acType,
          capacity: p.capacity,
          starRating: p.starRating,
          usageDuration: p.usageDuration,
        }));
        setProducts(mapped);
      })
      .catch(() => {
        console.log('Failed to load products from DB, will use local state.');
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  // Sell form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [acType, setAcType] = useState('Split AC');
  const [capacity, setCapacity] = useState('1.5 Ton');
  const [starRating, setStarRating] = useState('3 Star');
  const [usageDuration, setUsageDuration] = useState('');

  // Country code selector state
  const [selectedCC, setSelectedCC] = useState({ code: '+91', name: 'India', flag: '🇮🇳' });
  const [ccSearch, setCcSearch] = useState('');
  const [ccDropdownOpen, setCcDropdownOpen] = useState(false);

  // Media states
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Preview modals
  const [previewVideoModal, setPreviewVideoModal] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [listingFilter, setListingFilter] = useState<'all' | 'mine'>('all');

  // Pick Video
  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Media library access is needed to select videos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedVideo(result.assets[0].uri);
    }
  };

  // Pick Images
  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Media library access is needed to select images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const uris = result.assets.map(a => a.uri);
      setSelectedImages(prev => [...prev, ...uris]);
    }
  };

  const uploadMediaToCloudinary = async (fileUri: string, resourceType: 'image' | 'video') => {
    // 1. Fetch Cloudinary signature from backend
    const sigResponse = await apiClient.get('/auth/cloudinary-signature');
    const { signature, timestamp, apiKey, cloudName, uploadPreset } = sigResponse.data;

    // 2. Build FormData for signed upload
    const data = new FormData();
    data.append('file', {
      uri: fileUri,
      type: resourceType === 'video' ? 'video/mp4' : 'image/jpeg',
      name: resourceType === 'video' ? 'video.mp4' : 'photo.jpg',
    } as any);
    data.append('api_key', apiKey);
    data.append('timestamp', String(timestamp));
    data.append('signature', signature);
    data.append('upload_preset', uploadPreset);

    // 3. Post to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const resData = await response.json();
    if (resData.secure_url) {
      return resData.secure_url;
    } else {
      throw new Error(resData.error?.message || 'Cloudinary upload failed');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to permanently delete this product listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProductApi(productId);
              setProducts(prev => prev.filter(p => p.id !== productId && p._id !== productId));
              setSelectedProduct(null);
              Alert.alert("Success", "Product listing deleted successfully.");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete product listing.");
            }
          }
        }
      ]
    );
  };
  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id || product._id || null);
    setTitle(product.title);
    setPrice(String(product.price));
    setDesc(product.description);

    let rawPhone = product.sellerPhone;
    if (rawPhone.startsWith('+')) {
      const parts = rawPhone.split(' ');
      if (parts.length > 1) {
        const code = parts[0];
        const number = parts.slice(1).join(' ');
        const matchedCC = COUNTRY_CODES.find(cc => cc.code === code);
        if (matchedCC) setSelectedCC(matchedCC);
        rawPhone = number;
      }
    }
    setPhone(rawPhone);
    setSelectedVideo(product.video || null);
    setSelectedImages(product.images);
    setBrand(product.brand || '');
    setAcType(product.acType || 'Split AC');
    setCapacity(product.capacity || '1.5 Ton');
    setStarRating(product.starRating || '3 Star');
    setUsageDuration(product.usageDuration || '');
    setSelectedProduct(null);
    setActiveTab('sell');
  };

  const handleSellSubmit = async () => {
    if (!title || !price || !desc || !phone) {
      Alert.alert("Error", "Please fill in all details.");
      return;
    }
    if (!selectedVideo) {
      Alert.alert("Video Required", "Please record or choose exactly 1 video demonstrating the product condition.");
      return;
    }
    if (selectedImages.length < 4) {
      Alert.alert("Images Required", "Please select at least 4 images showing the product details.");
      return;
    }

    const fullPhoneNumber = `${selectedCC.code} ${phone}`;
    const emailAddress = user?.email || 'customer@example.com';

    const isCloudUri = (uri: string) => uri.startsWith('http://') || uri.startsWith('https://');

    setUploading(true);
    try {
      // 1. Upload Video (only if not already uploaded to Cloudinary)
      let cloudVideoUrl = selectedVideo;
      if (selectedVideo && !isCloudUri(selectedVideo)) {
        cloudVideoUrl = await uploadMediaToCloudinary(selectedVideo, 'video');
      }

      // 2. Upload Images (only if not already uploaded to Cloudinary)
      const cloudImageUrls: string[] = [];
      for (const imgUri of selectedImages) {
        if (isCloudUri(imgUri)) {
          cloudImageUrls.push(imgUri);
        } else {
          const cloudImgUrl = await uploadMediaToCloudinary(imgUri, 'image');
          cloudImageUrls.push(cloudImgUrl);
        }
      }

      if (editingProductId) {
        // 3a. Update via API
        const updatedProduct = await updateProductApi(editingProductId, {
          title,
          price: Number(price),
          description: desc,
          images: cloudImageUrls,
          video: cloudVideoUrl || undefined,
          sellerPhone: fullPhoneNumber,
          brand,
          acType,
          capacity,
          starRating,
          usageDuration,
        });

        // 4a. Update state
        setProducts(prev => prev.map(p => (p.id === editingProductId || p._id === editingProductId) ? {
          ...p,
          title: updatedProduct?.title || title,
          price: updatedProduct?.price || Number(price),
          description: updatedProduct?.description || desc,
          images: updatedProduct?.images || cloudImageUrls,
          video: updatedProduct?.video || cloudVideoUrl || undefined,
          sellerPhone: updatedProduct?.sellerPhone || fullPhoneNumber,
          brand: updatedProduct?.brand || brand,
          acType: updatedProduct?.acType || acType,
          capacity: updatedProduct?.capacity || capacity,
          starRating: updatedProduct?.starRating || starRating,
          usageDuration: updatedProduct?.usageDuration || usageDuration,
        } : p));

        Alert.alert("Success", "Your product listing has been updated!");
      } else {
        // 3b. Save new via API
        const savedProduct = await saveProduct({
          title,
          price: Number(price),
          description: desc,
          images: cloudImageUrls,
          video: cloudVideoUrl || undefined,
          sellerPhone: fullPhoneNumber,
          sellerEmail: emailAddress,
          brand,
          acType,
          capacity,
          starRating,
          usageDuration,
        });

        // 4b. Add to state
        const newProduct: Product = {
          id: savedProduct?._id || String(Date.now()),
          _id: savedProduct?._id,
          title: savedProduct?.title || title,
          price: savedProduct?.price || Number(price),
          description: savedProduct?.description || desc,
          images: savedProduct?.images || cloudImageUrls,
          video: savedProduct?.video || cloudVideoUrl || undefined,
          sellerPhone: savedProduct?.sellerPhone || fullPhoneNumber,
          sellerEmail: savedProduct?.sellerEmail || emailAddress,
          createdAt: 'Just now',
          brand: savedProduct?.brand || brand,
          acType: savedProduct?.acType || acType,
          capacity: savedProduct?.capacity || capacity,
          starRating: savedProduct?.starRating || starRating,
          usageDuration: savedProduct?.usageDuration || usageDuration,
        };
        setProducts(prev => [newProduct, ...prev]);
        Alert.alert("Success", "Your product has been listed for sale on the marketplace!");
      }

      // Reset state
      setTitle('');
      setPrice('');
      setDesc('');
      setPhone('');
      setSelectedVideo(null);
      setSelectedImages([]);
      setBrand('');
      setAcType('Split AC');
      setCapacity('1.5 Ton');
      setStarRating('3 Star');
      setUsageDuration('');
      setEditingProductId(null);
      setActiveTab('buy');
    } catch (e: any) {
      console.warn("Cloudinary upload failed, persisting updates directly to DB:", e);
      try {
        if (editingProductId) {
          const updatedProduct = await updateProductApi(editingProductId, {
            title,
            price: Number(price),
            description: desc,
            images: selectedImages.length > 0 ? selectedImages : ['https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=500'],
            video: selectedVideo || undefined,
            sellerPhone: fullPhoneNumber,
            brand,
            acType,
            capacity,
            starRating,
            usageDuration,
          });

          setProducts(prev => prev.map(p => (p.id === editingProductId || p._id === editingProductId) ? {
            ...p,
            title: updatedProduct?.title || title,
            price: updatedProduct?.price || Number(price),
            description: updatedProduct?.description || desc,
            images: updatedProduct?.images || (selectedImages.length > 0 ? selectedImages : ['https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=500']),
            video: updatedProduct?.video || selectedVideo || undefined,
            sellerPhone: updatedProduct?.sellerPhone || fullPhoneNumber,
            brand: updatedProduct?.brand || brand,
            acType: updatedProduct?.acType || acType,
            capacity: updatedProduct?.capacity || capacity,
            starRating: updatedProduct?.starRating || starRating,
            usageDuration: updatedProduct?.usageDuration || usageDuration,
          } : p));

          Alert.alert("Success", "Product listing updated successfully! (Media saved locally)");
        } else {
          const savedProduct = await saveProduct({
            title,
            price: Number(price),
            description: desc,
            images: selectedImages.length > 0 ? selectedImages : ['https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=500'],
            video: selectedVideo || undefined,
            sellerPhone: fullPhoneNumber,
            sellerEmail: emailAddress,
            brand,
            acType,
            capacity,
            starRating,
            usageDuration,
          });

          const newProduct: Product = {
            id: savedProduct?._id || String(Date.now()),
            _id: savedProduct?._id,
            title: savedProduct?.title || title,
            price: savedProduct?.price || Number(price),
            description: savedProduct?.description || desc,
            images: savedProduct?.images || (selectedImages.length > 0 ? selectedImages : ['https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=500']),
            video: savedProduct?.video || selectedVideo || undefined,
            sellerPhone: savedProduct?.sellerPhone || fullPhoneNumber,
            sellerEmail: savedProduct?.sellerEmail || emailAddress,
            createdAt: 'Just now',
            brand: savedProduct?.brand || brand,
            acType: savedProduct?.acType || acType,
            capacity: savedProduct?.capacity || capacity,
            starRating: savedProduct?.starRating || starRating,
            usageDuration: savedProduct?.usageDuration || usageDuration,
          };

          setProducts(prev => [newProduct, ...prev]);
          Alert.alert("Success", "Product listed successfully! (Media saved locally)");
        }

        // Reset state
        setTitle('');
        setPrice('');
        setDesc('');
        setPhone('');
        setSelectedVideo(null);
        setSelectedImages([]);
        setBrand('');
        setAcType('Split AC');
        setCapacity('1.5 Ton');
        setStarRating('3 Star');
        setUsageDuration('');
        setEditingProductId(null);
        setActiveTab('buy');
      } catch (dbErr: any) {
        Alert.alert("Error", dbErr.message || "Failed to update product.");
      }
    } finally {
      setUploading(false);
    }
  };

  const filteredCountryCodes = COUNTRY_CODES.filter(cc =>
    cc.code.includes(ccSearch) ||
    cc.name.toLowerCase().includes(ccSearch.toLowerCase()) ||
    cc.flag.includes(ccSearch)
  );

  const filteredProducts = products.filter(item => {
    if (listingFilter === 'mine' && item.sellerEmail !== user?.email) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const titleMatches = item.title?.toLowerCase().includes(query);
      const descMatches = item.description?.toLowerCase().includes(query);
      return titleMatches || descMatches;
    }
    return true;
  });

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      {/* Classical Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top), borderBottomColor: colors.primary + '30', backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Icons.ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>PRODUCT MARKET</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'buy' && { backgroundColor: colors.primary }]}
          onPress={() => {
            setActiveTab('buy');
            setSelectedProduct(null);
          }}
        >
          <Text style={[styles.tabText, { color: activeTab === 'buy' ? '#FFF' : colors.text }]}>Buy Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sell' && { backgroundColor: colors.primary }]}
          onPress={() => {
            setActiveTab('sell');
            setSelectedProduct(null);
          }}
        >
          <Text style={[styles.tabText, { color: activeTab === 'sell' ? '#FFF' : colors.text }]}>Sell Product</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'buy' && !selectedProduct && (
          <View style={styles.filterSection}>
            {/* Search Input */}
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icons.Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <RNTextInput
                placeholder="Search products by title or description..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInputField, { color: colors.text }]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icons.X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills */}
            <View style={styles.pillsContainer}>
              <TouchableOpacity
                style={[styles.pillBtn, listingFilter === 'all' ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setListingFilter('all')}
              >
                <Text style={[styles.pillText, { color: listingFilter === 'all' ? '#FFF' : colors.text }]}>All Listings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pillBtn, listingFilter === 'mine' ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setListingFilter('mine')}
              >
                <Text style={[styles.pillText, { color: listingFilter === 'mine' ? '#FFF' : colors.text }]}>My Listings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'buy' && !selectedProduct && (
          loadingProducts ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : filteredProducts.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Icons.ShoppingBag size={48} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 12, fontWeight: '700' }}>
                No listings match your search or filter.
              </Text>
            </View>
          ) : (
            <View style={styles.buyGrid}>
              {filteredProducts.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setSelectedProduct(item)}
                >
                  <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                  <View style={styles.productMeta}>
                    <Text numberOfLines={1} style={[styles.productTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>₹{item.price}</Text>
                    
                    {item.starRating ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginVertical: 4 }}>
                        {[...Array(5)].map((_, i) => {
                          const starNum = parseInt(item.starRating || '') || 0;
                          return (
                            <Icons.Star
                              key={i}
                              size={10}
                              color={i < starNum ? '#F59E0B' : '#E2E8F0'}
                              fill={i < starNum ? '#F59E0B' : 'transparent'}
                            />
                          );
                        })}
                        <Text style={{ fontSize: 9, marginLeft: 2, fontWeight: '700', color: colors.textSecondary }}>
                          {item.starRating}
                        </Text>
                      </View>
                    ) : null}

                    <Text numberOfLines={2} style={[styles.productCardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                    <Text numberOfLines={1} style={[styles.productCardPhone, { color: colors.primary }]}>📞 {item.sellerPhone}</Text>
                    <Text style={[styles.productDate, { color: colors.textSecondary }]}>{item.createdAt}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )
        )}

        {/* Selected Product Detail */}
        {activeTab === 'buy' && selectedProduct && (
          <View style={styles.detailContainer}>
            <TouchableOpacity style={styles.backToGridBtn} onPress={() => setSelectedProduct(null)}>
              <Icons.ChevronLeft size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Back to Grid</Text>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRoll}>
              {selectedProduct.images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.rollImg} />
              ))}
            </ScrollView>

            <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedProduct.title}</Text>
            <Text style={[styles.detailPrice, { color: colors.primary }]}>₹{selectedProduct.price}</Text>
            <Text style={[styles.detailDesc, { color: colors.textSecondary }]}>{selectedProduct.description}</Text>

            {/* AC Specifications Grid */}
            {((selectedProduct.brand && selectedProduct.brand.trim().length > 0) ||
              (selectedProduct.acType && selectedProduct.acType.trim().length > 0) ||
              (selectedProduct.capacity && selectedProduct.capacity.trim().length > 0) ||
              (selectedProduct.starRating && selectedProduct.starRating.trim().length > 0) ||
              (selectedProduct.usageDuration && selectedProduct.usageDuration.trim().length > 0)) && (
                <View style={[styles.specsCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                  <Text style={[styles.specsHeader, { color: colors.text }]}>AC Specifications</Text>

                  <View style={styles.specsGrid}>
                    {selectedProduct.brand ? (
                      <View style={styles.specsItem}>
                        <Text style={[styles.specsLabel, { color: colors.textSecondary }]}>Brand</Text>
                        <Text style={[styles.specsValue, { color: colors.text }]}>{selectedProduct.brand}</Text>
                      </View>
                    ) : null}
                    {selectedProduct.acType ? (
                      <View style={styles.specsItem}>
                        <Text style={[styles.specsLabel, { color: colors.textSecondary }]}>Type</Text>
                        <Text style={[styles.specsValue, { color: colors.text }]}>{selectedProduct.acType}</Text>
                      </View>
                    ) : null}
                    {selectedProduct.capacity ? (
                      <View style={styles.specsItem}>
                        <Text style={[styles.specsLabel, { color: colors.textSecondary }]}>Capacity</Text>
                        <Text style={[styles.specsValue, { color: colors.text }]}>{selectedProduct.capacity}</Text>
                      </View>
                    ) : null}
                    {selectedProduct.starRating ? (
                      <View style={styles.specsItem}>
                        <Text style={[styles.specsLabel, { color: colors.textSecondary }]}>Rating</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }}>
                          {[...Array(5)].map((_, i) => {
                            const starNum = parseInt(selectedProduct.starRating || '') || 0;
                            return (
                              <Icons.Star
                                key={i}
                                size={12}
                                color={i < starNum ? '#F59E0B' : '#E2E8F0'}
                                fill={i < starNum ? '#F59E0B' : 'transparent'}
                              />
                            );
                          })}
                          <Text style={{ fontSize: 11, marginLeft: 4, fontWeight: '700', color: colors.textSecondary }}>
                            ({selectedProduct.starRating})
                          </Text>
                        </View>
                      </View>
                    ) : null}
                    {selectedProduct.usageDuration ? (
                      <View style={styles.specsItem}>
                        <Text style={[styles.specsLabel, { color: colors.textSecondary }]}>Age / Usage</Text>
                        <Text style={[styles.specsValue, { color: colors.text }]}>{selectedProduct.usageDuration}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}

            {selectedProduct.video && (
              <TouchableOpacity
                style={[styles.videoBox, { backgroundColor: colors.border }]}
                onPress={() => {
                  setSelectedVideo(selectedProduct.video || null);
                  setPreviewVideoModal(true);
                }}
              >
                <Icons.Play size={32} color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>Play Condition Video</Text>
              </TouchableOpacity>
            )}

            <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sellerHeader, { color: colors.text }]}>Seller Information</Text>
              <Text style={[styles.sellerInfo, { color: colors.textSecondary }]}>📞 Phone: {selectedProduct.sellerPhone}</Text>
              <Text style={[styles.sellerInfo, { color: colors.textSecondary }]}>✉️ Email: {selectedProduct.sellerEmail}</Text>

              {selectedProduct.sellerEmail === user?.email ? (
                <View style={styles.ownerActionsRow}>
                  <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleEditProduct(selectedProduct)}
                  >
                    <Icons.Edit3 size={16} color="#FFF" />
                    <Text style={styles.editBtnText}>Edit Listing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: '#EF4444' }]}
                    onPress={() => handleDeleteProduct(selectedProduct.id || selectedProduct._id || '')}
                  >
                    <Icons.Trash2 size={16} color="#FFF" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    if (selectedProduct.sellerPhone) {
                      Linking.openURL(`tel:${selectedProduct.sellerPhone}`);
                    } else {
                      Alert.alert("Error", "Seller phone number not found.");
                    }
                  }}
                >
                  <Icons.Phone size={16} color="#FFF" />
                  <Text style={styles.callBtnText}>Call Seller</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {activeTab === 'sell' && (
          <View style={styles.sellForm}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              {editingProductId ? "EDIT YOUR AC LISTING" : "LIST YOUR AC FOR SALE"}
            </Text>

            <TextInput label="Product Title" placeholder="e.g. Panasonic Inverter AC 1.5 Ton" value={title} onChangeText={setTitle} />
            <TextInput label="Price (₹)" placeholder="e.g. 15000" value={price} onChangeText={setPrice} keyboardType="numeric" />

            {/* Brand */}
            <TextInput label="Brand Name" placeholder="e.g. Daikin, Samsung, Voltas" value={brand} onChangeText={setBrand} />

            {/* AC Type Selector */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>AC Type</Text>
            <View style={styles.selectorGroup}>
              {['Split AC', 'Window AC', 'Portable AC'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.selectorPill, acType === type ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={() => setAcType(type)}
                >
                  <Text style={[styles.selectorPillText, { color: acType === type ? '#FFF' : colors.text }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Capacity Selector */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Capacity (Tonnage)</Text>
            <View style={styles.selectorGroup}>
              {['0.75 Ton', '1.0 Ton', '1.5 Ton', '2.0 Ton', '2.5 Ton', '3.0 Ton', '4.0 Ton', '5.0 Ton'].map(cap => (
                <TouchableOpacity
                  key={cap}
                  style={[styles.selectorPill, capacity === cap ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={() => setCapacity(cap)}
                >
                  <Text style={[styles.selectorPillText, { color: capacity === cap ? '#FFF' : colors.text }]}>{cap}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Star Rating Selector */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Energy Star Rating</Text>
            <View style={styles.selectorGroup}>
              {['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'].map(star => (
                <TouchableOpacity
                  key={star}
                  style={[styles.selectorPill, starRating === star ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={() => setStarRating(star)}
                >
                  <Text style={[styles.selectorPillText, { color: starRating === star ? '#FFF' : colors.text }]}>{star}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Usage Duration age */}
            <TextInput label="Usage Duration (How old is it?)" placeholder="e.g. 1 year, 2 years, 6 months" value={usageDuration} onChangeText={setUsageDuration} />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Product Description</Text>
            <RNTextInput
              placeholder="Tell buyers about usage history, condition, flaws..."
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={4}
              style={[styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            />

            {/* Mobile Number with Country Code Dropdown (Flag + Code) */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Seller Mobile Number</Text>
            <View style={styles.phoneInputContainer}>
              <TouchableOpacity
                style={[styles.countryCodePicker, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setCcDropdownOpen(true)}
              >
                <Text style={{ fontSize: 16, marginRight: 4 }}>{selectedCC.flag}</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{selectedCC.code}</Text>
                <Icons.ChevronDown size={12} color={colors.textSecondary} style={{ marginLeft: 2 }} />
              </TouchableOpacity>

              <RNTextInput
                placeholder="e.g. 98765 43210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={[styles.phoneTextInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              />
            </View>

            {/* Autofilled view-only email address */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Seller Email Address</Text>
            <RNTextInput
              value={user?.email || 'customer@example.com'}
              editable={false}
              style={[styles.disabledInput, { backgroundColor: colors.border, borderColor: colors.border, color: colors.textSecondary }]}
            />

            {/* Media Upload Area */}
            <Text style={[styles.mediaHeader, { color: colors.text }]}>Media Uploads (Required)</Text>

            <View style={styles.mediaRow}>
              {/* Video picker */}
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={[styles.mediaPickerBtn, { borderColor: colors.border }]} onPress={handlePickVideo}>
                  <Icons.Video size={24} color={selectedVideo ? '#10B981' : colors.primary} />
                  <Text style={[styles.mediaPickerText, { color: colors.textSecondary }]}>
                    {selectedVideo ? "1 Video Selected" : "Attach Video (1)"}
                  </Text>
                </TouchableOpacity>
                {selectedVideo && (
                  <TouchableOpacity style={styles.previewBtn} onPress={() => setPreviewVideoModal(true)}>
                    <Icons.Eye size={12} color={colors.primary} />
                    <Text style={[styles.previewBtnText, { color: colors.primary }]}>Preview Video</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Images picker */}
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={[styles.mediaPickerBtn, { borderColor: colors.border }]} onPress={handlePickImages}>
                  <Icons.Image size={24} color={selectedImages.length >= 4 ? '#10B981' : colors.primary} />
                  <Text style={[styles.mediaPickerText, { color: colors.textSecondary }]}>
                    {selectedImages.length > 0 ? `${selectedImages.length} Images Selected` : "Attach Images (Min 4)"}
                  </Text>
                </TouchableOpacity>
                {selectedImages.length > 0 && (
                  <Text style={[styles.imageCountText, { color: colors.textSecondary }]}>
                    {selectedImages.length} images added
                  </Text>
                )}
              </View>
            </View>

            {/* Images previews */}
            {selectedImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewsRow}>
                {selectedImages.map((uri, idx) => (
                  <TouchableOpacity key={idx} onPress={() => setPreviewImageUri(uri)} style={styles.thumbnailContainer}>
                    <Image source={{ uri }} style={styles.previewThumbnail} />
                    <View style={styles.thumbnailBadge}>
                      <Icons.Eye size={10} color="#FFF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {uploading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <View style={{ gap: 10 }}>
                <PrimaryButton
                  title={editingProductId ? "Update Product Listing" : "Post Product for Sale"}
                  onPress={handleSellSubmit}
                />
                {editingProductId && (
                  <TouchableOpacity
                    style={[styles.cancelEditBtn, { borderColor: colors.border }]}
                    onPress={() => {
                      setTitle('');
                      setPrice('');
                      setDesc('');
                      setPhone('');
                      setSelectedVideo(null);
                      setSelectedImages([]);
                      setEditingProductId(null);
                      setActiveTab('buy');
                    }}
                  >
                    <Text style={[styles.cancelEditBtnText, { color: colors.text }]}>Cancel Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Country Code Modal with Search */}
      <Modal visible={ccDropdownOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setCcDropdownOpen(false)}>
                <Icons.X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBarContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Icons.Search size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <RNTextInput
                placeholder="Search country name, code, or flag..."
                placeholderTextColor={colors.textSecondary}
                value={ccSearch}
                onChangeText={setCcSearch}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>

            <FlatList
              data={filteredCountryCodes}
              keyExtractor={item => `${item.code}-${item.name}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.ccListItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedCC(item);
                    setCcDropdownOpen(false);
                    setCcSearch('');
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>{item.flag}</Text>
                  <Text style={[styles.ccCodeText, { color: colors.primary }]}>{item.code}</Text>
                  <Text style={[styles.ccNameText, { color: colors.text }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={previewImageUri !== null} transparent animationType="fade">
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setPreviewImageUri(null)}>
            <Icons.X size={24} color="#FFF" />
          </TouchableOpacity>
          {previewImageUri && (
            <Image source={{ uri: previewImageUri }} style={styles.largePreviewImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* Video Preview Modal */}
      <Modal visible={previewVideoModal} transparent animationType="fade">
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setPreviewVideoModal(false)}>
            <Icons.X size={24} color="#FFF" />
          </TouchableOpacity>
          {selectedVideo && (
            <Video
              source={{ uri: selectedVideo }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              useNativeControls
              style={{ width: '90%', height: '70%', borderRadius: 16 }}
            />
          )}
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 3,
    marginTop: 20,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Buy Grid
  buyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: cardWidth,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productMeta: {
    padding: 12,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  productDate: {
    fontSize: 10,
    marginTop: 2,
  },
  productCardDesc: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
  productCardPhone: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchInputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Detail View
  detailContainer: {
    width: '100%',
  },
  backToGridBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageRoll: {
    gap: 10,
    marginBottom: 16,
  },
  rollImg: {
    width: 260,
    height: 180,
    borderRadius: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  detailPrice: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  detailDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  videoBox: {
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  sellerCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  sellerHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  sellerInfo: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    height: 44,
    marginTop: 12,
  },
  callBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    height: 44,
  },
  deleteBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  ownerActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    height: 44,
  },
  editBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  cancelEditBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelEditBtnText: {
    fontWeight: '800',
    fontSize: 14,
  },

  // Sell Form
  sellForm: {
    width: '100%',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  disabledInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    height: 48,
    marginBottom: 12,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  countryCodePicker: {
    width: 100,
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  phoneTextInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },

  mediaHeader: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 10,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  mediaPickerBtn: {
    height: 80,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  mediaPickerText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  previewBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  imageCountText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  previewsRow: {
    marginBottom: 16,
  },
  thumbnailContainer: {
    marginRight: 8,
    position: 'relative',
  },
  previewThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 3,
  },

  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  ccListItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  ccCodeText: {
    fontSize: 14,
    fontWeight: '800',
    width: 60,
  },
  ccNameText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Image Full Preview
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePreviewBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
  },
  largePreviewImage: {
    width: '100%',
    height: '80%',
  },
  videoPlayerPlaceholder: {
    width: '80%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  selectorGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  selectorPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  specsCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  specsHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specsItem: {
    width: '45%',
    marginBottom: 4,
  },
  specsLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  specsValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  }
});
