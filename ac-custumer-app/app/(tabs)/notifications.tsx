import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, ScrollView
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { IconHelper } from '../../components/CustomUI';
import { getNotifications, markAllRead, markOneRead, deleteNotification, Notification } from '../../api/notificationApi';
import { useFocusEffect } from 'expo-router';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function NotificationsScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fullscreen Modal & PDF States
  const [selectedItem, setSelectedItem] = useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const bgStyle = themeMode === 'dark' ? { backgroundColor: '#0B0F19' } : { backgroundColor: '#FAF9F6' };

  const fetchNotifications = async () => {
    try {
      const { notifications: data } = await getNotifications();
      setNotifications(data);
    } catch { /* silent */ }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkOne = async (id: string) => {
    await markOneRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete notification');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'Calendar';
      case 'offer': return 'Tag';
      case 'payment': return 'CreditCard';
      default: return 'Bell';
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Helper parsers
  const extractOtp = (message: string) => {
    const match = message.match(/OTP:\s*(\d{4})/i);
    return match ? match[1] : '';
  };

  const extractWarrantyPeriod = (message: string) => {
    const match = message.match(/Warranty Card of\s*([^!.]+)/i);
    return match ? match[1].trim() : '';
  };

  const extractBillAmounts = (message: string) => {
    const totalMatch = message.match(/Total Amount:\s*₹(\d+)/i);
    const baseMatch = message.match(/Base:\s*₹(\d+)/i);
    const extraMatch = message.match(/Extra Material:\s*₹(\d+)/i);
    const takenMatch = message.match(/Extra Labor\/Other:\s*₹(\d+)/i);
    
    return {
      total: totalMatch ? totalMatch[1] : '0',
      base: baseMatch ? baseMatch[1] : '0',
      extra: extraMatch ? extraMatch[1] : '0',
      taken: takenMatch ? takenMatch[1] : '0'
    };
  };

  const openFullscreenModal = (item: Notification) => {
    if (!item.isRead) {
      handleMarkOne(item._id);
    }
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Professional Light Theme PDF Generation template (1:1 Admin Design Match)
  const generatePdfHtml = () => {
    if (!selectedItem) return '';
    const amounts = extractBillAmounts(selectedItem.message);
    const period = extractWarrantyPeriod(selectedItem.message) || '6 Months Guarantee';
    const jobId = selectedItem.refId || 'BK-9021';
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; padding: 20px; background-color: #F8FAFC; }
          .certificate-card {
            background-color: #FFFFFF;
            border: 4px solid #CBD5E1;
            border-radius: 24px;
            padding: 32px;
            position: relative;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          }
          .ribbon { height: 6px; background: linear-gradient(to right, #0F766E, #059669, #D97706); border-radius: 999px; margin-bottom: 24px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #E2E8F0; padding-bottom: 20px; }
          .logo-title { font-size: 22px; font-weight: 900; color: #0F172A; letter-spacing: 1px; margin: 0; }
          .logo-sub { font-size: 11px; font-weight: 700; color: #0F766E; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }
          .badge { background-color: #ECFDF5; border: 1px solid #6EE7B7; color: #065F46; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; display: inline-block; }
          .ref-text { font-size: 11px; color: #64748B; margin-top: 4px; font-family: monospace; }
          
          .cert-intro { text-align: center; margin: 24px 0; }
          .cert-tag { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; }
          .cert-main-title { font-size: 22px; font-weight: 900; color: #0F172A; margin: 4px 0 8px 0; }
          .cert-desc { font-size: 12px; color: #475569; max-width: 550px; margin: 0 auto; line-height: 1.5; }

          .grid { display: flex; gap: 16px; margin-bottom: 20px; }
          .card-box { flex: 1; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px; }
          .box-label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 4px; }
          .box-val-bold { font-size: 14px; font-weight: 800; color: #0F172A; margin: 0; }
          .box-val-teal { font-size: 14px; font-weight: 800; color: #0F766E; margin: 0; }
          .box-sub { font-size: 11px; color: #64748B; margin-top: 2px; }

          .spec-box { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px; margin-bottom: 20px; }
          .spec-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 12px; border-bottom: 1px solid #E2E8F0; }
          .spec-row:last-child { border-bottom: none; }
          .spec-label { color: #64748B; font-weight: 600; }
          .spec-val { color: #0F172A; font-weight: 800; }
          .pill-amber { background-color: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: 800; }
          .pill-emerald { background-color: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 2px 8px; border-radius: 4px; font-weight: 800; }

          .footer-sigs { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 16px; margin-top: 20px; background-color: #FFFDF5; padding: 12px 16px; border-radius: 12px; border: 1px solid #FEF3C7; }
          .sig-label { font-size: 10px; font-weight: 800; color: #B45309; text-transform: uppercase; }
          .sig-val { font-size: 12px; font-weight: 800; color: #0F172A; font-style: italic; margin-top: 2px; }
          .stamp-val { font-size: 12px; font-weight: 800; color: #065F46; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="certificate-card">
          <div class="ribbon"></div>
          
          <div class="header">
            <div>
              <div class="logo-title">AC SERVICE WORLD</div>
              <div class="logo-sub">Official Service Guarantee Certificate</div>
            </div>
            <div style="text-align: right;">
              <div class="badge">✓ VERIFIED GUARANTEE</div>
              <div class="ref-text">Ref: WAR-2026-${jobId}</div>
            </div>
          </div>

          <div class="cert-intro">
            <div class="cert-tag">Certificate of Warranty</div>
            <div class="cert-main-title">100% Genuine AC Protection Guarantee</div>
            <div class="cert-desc">This official certificate verifies that the AC unit specified below has been inspected, serviced, and certified by an authorized technician and carries full active coverage.</div>
          </div>

          <div class="grid">
            <div class="card-box">
              <div class="box-label">Customer / Owner</div>
              <div class="box-val-bold">Valued WCS Customer</div>
              <div class="box-sub">Verified Customer Premises</div>
            </div>
            <div class="card-box">
              <div class="box-label">Issuing Serviceman</div>
              <div class="box-val-teal">Suresh Kumar (Tech ID #402)</div>
              <div class="box-sub">Job Reference ID: #${jobId}</div>
            </div>
          </div>

          <div class="spec-box">
            <div class="spec-row">
              <span class="spec-label">Model No / Brand:</span>
              <span class="spec-val">Daikin 1.5 Ton 5-Star Inverter AC</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">AC No (Unit Serial):</span>
              <span class="pill-amber">DK-IN-902184</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Reason of Warranty:</span>
              <span class="pill-emerald">PCB Chipset Replacement & Gas Pressure Guarantee</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Coverage Period:</span>
              <span class="spec-val" style="color: #059669;">${dateStr} ➞ Active (${period})</span>
            </div>
          </div>

          <div class="footer-sigs">
            <div>
              <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='90' viewBox='0 0 280 90'><path d='M 12 55 Q 35 15 60 45 T 105 25 T 150 55 T 195 35 T 240 55 C 250 60 260 40 270 45' stroke='%231E3A8A' stroke-width='4.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/><text x='12' y='80' font-family='Arial, sans-serif' font-size='13' font-weight='bold' fill='%231E3A8A'>Suresh Kumar (Authorized Signatory)</text></svg>" style="height: 60px; max-width: 180px; object-fit: contain; margin: 4px 0;" />
              <div class="sig-val">Suresh Kumar (Authorized Field Specialist)</div>
            </div>
            <div style="text-align: right;">
              <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><circle cx='70' cy='70' r='64' fill='none' stroke='%23047857' stroke-width='5' stroke-dasharray='5,2'/><circle cx='70' cy='70' r='54' fill='none' stroke='%23047857' stroke-width='2.5'/><path id='stampTextPath' d='M 22,70 A 48,48 0 1,1 118,70 A 48,48 0 1,1 22,70' fill='none'/><text fill='%23047857' font-size='9.5' font-weight='bold' letter-spacing='1.2'><textPath href='%23stampTextPath'>AC SERVICE WORLD • OFFICIAL QUALITY SEAL •</textPath></text><polygon points='70,40 77,55 93,55 80,64 85,80 70,70 55,80 60,64 47,55 63,55' fill='%23047857'/><text x='70' y='98' text-anchor='middle' fill='%23047857' font-size='9' font-weight='900'>100% VERIFIED</text></svg>" style="height: 65px; width: 65px; object-fit: contain; margin: 4px 0; display: block; margin-left: auto;" />
              <div class="stamp-val">AC SERVICE WORLD QUALITY SEAL</div>
            </div>
          </div>

        </div>
      </body>
      </html>
    `;
  };

  const generateAndDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const html = generatePdfHtml();
      const { uri } = await Print.printToFileAsync({ html });
      setPdfLoading(false);
      
      // Let customer download/save it
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save WCS Warranty & Invoice PDF',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('PDF Saved', `Guarantee PDF saved successfully to temporary storage:\n${uri}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not generate PDF card.');
    } finally {
      setPdfLoading(false);
    }
  };

  const sharePdf = async () => {
    await generateAndDownloadPdf();
  };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <View style={[
        styles.header, 
        { 
          borderBottomColor: colors.primary + '30', 
          backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF',
          paddingTop: Math.max(12, insets.top),
        }
      ]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>NOTIFICATIONS</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 11, letterSpacing: 0.5 }}>MARK ALL READ</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40, fontWeight: '600', fontSize: 13 }}>
              No notifications yet.
            </Text>
          }
          renderItem={({ item }) => {
            const isWarrantyMsg = item.title.toLowerCase().includes('warranty') || item.message.toLowerCase().includes('warranty') || item.title.toLowerCase().includes('invoice') || item.title.toLowerCase().includes('completed');
            const isOtpMsg = item.title.toLowerCase().includes('otp') || item.message.toLowerCase().includes('otp');
            
            return (
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.primary + '20' },
                  !item.isRead && { borderLeftColor: colors.primary, borderLeftWidth: 4 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => !item.isRead && handleMarkOne(item._id)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                  >
                    <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
                      <IconHelper name={getIcon(item.type)} color={colors.primary} size={20} />
                    </View>
                    <View style={styles.details}>
                      <View style={styles.row}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(item.createdAt)}</Text>
                      </View>
                      <Text style={[styles.msg, { color: colors.textSecondary }]}>{item.message}</Text>
                    </View>
                  </TouchableOpacity>

                  {(isWarrantyMsg || isOtpMsg) && (
                    <View style={styles.actionBtnRow}>
                      <TouchableOpacity
                        style={[styles.viewBtn, { backgroundColor: colors.primary }]}
                        onPress={() => openFullscreenModal(item)}
                      >
                        <Icons.Eye size={12} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.viewBtnText}>VIEW {isWarrantyMsg ? 'GUARANTEE' : 'OTP'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity
                  onPress={() => handleDelete(item._id)}
                  style={{ padding: 8, marginLeft: 8, alignSelf: 'flex-start' }}
                >
                  <Icons.Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* ── PROFESSIONAL FULLSCREEN VIEW MODAL ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, bgStyle]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: themeMode === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <Icons.X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {selectedItem?.title.toLowerCase().includes('otp') || selectedItem?.message.toLowerCase().includes('otp') ? 'SECURE COMPLETION OTP' : 'GUARANTEE / INVOICE'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {selectedItem && (
              selectedItem.title.toLowerCase().includes('otp') || selectedItem.message.toLowerCase().includes('otp') ? (
                // OTP Professional Screen
                <View style={[styles.otpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.otpShield}>
                    <Icons.ShieldAlert size={48} color="#EAB308" />
                  </View>
                  <Text style={[styles.otpCardTitle, { color: colors.text }]}>Service Completion PIN</Text>
                  <Text style={[styles.otpCardSub, { color: colors.textSecondary }]}>
                    Please read or show this OTP code to your technician to confirm the work has been completed to your satisfaction.
                  </Text>
                  
                  <View style={styles.otpBox}>
                    <Text style={styles.otpDigits}>
                      {extractOtp(selectedItem.message) || '----'}
                    </Text>
                  </View>
                  
                  <View style={[styles.otpWarningBox, { marginBottom: 20 }]}>
                    <Icons.Info size={14} color="#854D0E" />
                    <Text style={styles.otpWarningText}>
                      Do not share this OTP unless you are satisfied with the cooling repair services done.
                    </Text>
                  </View>

                  {/* Added Download Guarantee Card button */}
                  <TouchableOpacity 
                    style={[styles.pdfBtn, { backgroundColor: colors.primary, width: '100%' }]}
                    onPress={generateAndDownloadPdf}
                    disabled={pdfLoading}
                  >
                    {pdfLoading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Icons.FileDown size={18} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.pdfBtnText}>Download Guarantee Card (PDF)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                // Guarantee Card Professional Certificate Layout
                <View style={[styles.certificateContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.certificateRibbon}>
                    <Icons.ShieldCheck size={40} color="#EAB308" />
                  </View>
                  
                  <Text style={[styles.certificateHeader, { color: colors.text }]}>OFFICIAL SERVICE GUARANTEE</Text>
                  <Text style={styles.certificateSub}>WORLD COOLING SERVICE (WCS)</Text>
                  <View style={[styles.certificateDivider, { backgroundColor: colors.border }]} />
                  
                  <View style={styles.certRow}>
                    <Text style={[styles.certLabel, { color: colors.textSecondary }]}>JOB ID:</Text>
                    <Text style={[styles.certValue, { color: colors.text }]}>#{selectedItem.refId || 'BKG-3982'}</Text>
                  </View>

                  <View style={styles.certRow}>
                    <Text style={[styles.certLabel, { color: colors.textSecondary }]}>ISSUED TO:</Text>
                    <Text style={[styles.certValue, { color: colors.text }]}>WCS Customer</Text>
                  </View>

                  <View style={styles.certRow}>
                    <Text style={[styles.certLabel, { color: colors.textSecondary }]}>GUARANTEE PERIOD:</Text>
                    <Text style={[styles.certValue, { color: '#EAB308', fontWeight: '900' }]}>
                      {extractWarrantyPeriod(selectedItem.message) || '3 Months Active'}
                    </Text>
                  </View>

                  {/* Bill Summary details parsed inside the modal */}
                  <View style={[styles.certificateDivider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.certDetailsTitle, { color: colors.text, marginBottom: 8 }]}>Billing Invoice Breakup</Text>
                  {(() => {
                    const amounts = extractBillAmounts(selectedItem.message);
                    return (
                      <View style={{ gap: 6, width: '100%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>AC Base Charges:</Text>
                          <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>₹{parseFloat(amounts.base).toLocaleString()}</Text>
                        </View>
                        {parseFloat(amounts.extra) > 0 && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Extra Materials:</Text>
                            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>₹{parseFloat(amounts.extra).toLocaleString()}</Text>
                          </View>
                        )}
                        {parseFloat(amounts.taken) > 0 && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Extra Amount Taken:</Text>
                            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>₹{parseFloat(amounts.taken).toLocaleString()}</Text>
                          </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: colors.border, paddingTop: 6, marginTop: 4 }}>
                          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>Total Invoiced Bill:</Text>
                          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '900' }}>₹{parseFloat(amounts.total).toLocaleString()}</Text>
                        </View>
                      </View>
                    );
                  })()}

                  <View style={[styles.certificateDivider, { backgroundColor: colors.border }]} />

                  <View style={styles.certificateDetailsBox}>
                    <Text style={[styles.certDetailsTitle, { color: colors.text }]}>Guarantee Coverage Details</Text>
                    <Text style={[styles.certDetailsText, { color: colors.textSecondary }]}>
                      This official certificate ensures free re-service, gas leak refixing, and replacement of any defective electrical boards or capacitors replaced during this checkout cycle.
                    </Text>
                  </View>

                  <View style={styles.certificateFooter}>
                    <Icons.Award size={18} color="#EAB308" />
                    <Text style={styles.certFooterText}>Verified Cooling Quality Assured</Text>
                  </View>

                  {/* PDF Action Buttons */}
                  <View style={{ marginTop: 24, gap: 12, width: '100%' }}>
                    <TouchableOpacity 
                      style={[styles.pdfBtn, { backgroundColor: colors.primary }]}
                      onPress={generateAndDownloadPdf}
                      disabled={pdfLoading}
                    >
                      {pdfLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          <Icons.FileDown size={18} color="#FFF" style={{ marginRight: 8 }} />
                          <Text style={styles.pdfBtnText}>Download Professional PDF</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.shareBtn, { borderColor: colors.primary }]}
                      onPress={sharePdf}
                      disabled={pdfLoading}
                    >
                      <Icons.Share2 size={18} color={colors.primary} style={{ marginRight: 8 }} />
                      <Text style={[styles.shareBtnText, { color: colors.primary }]}>Share Invoice & Guarantee</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingBottom: 16,
    borderBottomWidth: 1.5,
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  list: { paddingHorizontal: 24, paddingVertical: 20 },
  card: { 
    flexDirection: 'row', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    marginBottom: 12, 
    alignItems: 'center' 
  },
  iconWrapper: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 14 
  },
  details: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '800', flex: 1, marginRight: 8 },
  time: { fontSize: 10, fontWeight: '700' },
  msg: { fontSize: 12, marginTop: 4, lineHeight: 16, fontWeight: '500' },
  
  // Custom button styling inside card list
  actionBtnRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },

  // Modal styling
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalScroll: {
    padding: 24,
    alignItems: 'center',
  },

  // OTP card layout
  otpCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  otpShield: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF08A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  otpCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  otpCardSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  otpBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginBottom: 20,
  },
  otpDigits: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#1E3A8A',
  },
  otpWarningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF9C3',
    borderColor: '#FEF08A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  otpWarningText: {
    flex: 1,
    fontSize: 11,
    color: '#854D0E',
    fontWeight: '700',
    lineHeight: 16,
  },

  // Certificate Layout
  certificateContainer: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  certificateRibbon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  certificateHeader: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  certificateSub: {
    fontSize: 11,
    color: '#EAB308',
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 1,
  },
  certificateDivider: {
    width: '100%',
    height: 1,
    marginVertical: 16,
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 4,
  },
  certLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  certValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  certificateDetailsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  certDetailsTitle: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  certDetailsText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  certificateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  certFooterText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '900',
  },

  // PDF Buttons
  pdfBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  pdfBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  shareBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
