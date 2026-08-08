import React from 'react';
import {
  StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, Alert, Image
} from 'react-native';
import * as Icons from 'lucide-react-native';

const DEFAULT_SIGNATURE_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="280" height="90" viewBox="0 0 280 90"><path d="M 12 55 Q 35 15 60 45 T 105 25 T 150 55 T 195 35 T 240 55 C 250 60 260 40 270 45" stroke="%231E3A8A" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="12" y="80" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="%231E3A8A">Suresh Kumar (Authorized Signatory)</text></svg>`;

const DEFAULT_STAMP_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="64" fill="none" stroke="%23047857" stroke-width="5" stroke-dasharray="5,2"/><circle cx="70" cy="70" r="54" fill="none" stroke="%23047857" stroke-width="2.5"/><path id="stampTextPath" d="M 22,70 A 48,48 0 1,1 118,70 A 48,48 0 1,1 22,70" fill="none"/><text fill="%23047857" font-size="9.5" font-weight="bold" letter-spacing="1.2"><textPath href="%23stampTextPath">AC SERVICE WORLD • OFFICIAL QUALITY SEAL •</textPath></text><polygon points="70,40 77,55 93,55 80,64 85,80 70,70 55,80 60,64 47,55 63,55" fill="%23047857"/><text x="70" y="98" text-anchor="middle" fill="%23047857" font-size="9" font-weight="900">100% VERIFIED</text></svg>`;

interface WarrantyCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export const WarrantyCertificateModal: React.FC<WarrantyCertificateProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!booking) return null;

  const warrantyNo = `WAR-2026-${(booking.bookingId || booking._id || '9041').slice(-4).toUpperCase()}`;
  const certToken = `CERT-AC-2026-${(booking.bookingId || booking._id || '9041').slice(-4).toUpperCase()}`;
  
  const createdDate = booking.completedAt || booking.createdAt || Date.now();
  const startDateStr = new Date(createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  
  // Calculate End Date based on period (default 3 Months)
  const endDateObj = new Date(createdDate);
  const periodMonths = booking.warrantyPeriod?.includes('6') ? 6 : (booking.warrantyPeriod?.includes('12') || booking.warrantyPeriod?.includes('1 Year') ? 12 : 3);
  endDateObj.setMonth(endDateObj.getMonth() + periodMonths);
  const endDateStr = endDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const modelNo = booking.modelNo || booking.acBrandModel || booking.serviceType || 'Daikin 1.5 Ton 5-Star Inverter AC';
  const acNo = booking.acNo || booking.serialNo || `DK-IN-${(booking._id || '774012').slice(-6).toUpperCase()}`;
  const warrantyReason = booking.warrantyReason || booking.warrantyDetails || 'PCB Chipset Replacement & R-32 Gas Pressure Seal Guarantee';
  const workDone = booking.workDone || booking.serviceProvided || booking.serviceType || 'Chemical Foam Jet Cleaning & Anti-Leak Seal Treatment';

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Modal Close Header */}
          <View style={styles.topNav}>
            <View style={styles.navTitleRow}>
              <Icons.ShieldCheck size={20} color="#0F766E" />
              <Text style={styles.navTitle}>Digital Warranty Certificate</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icons.X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            
            {/* ════════════════════════════════════════════════════════════
                OFFICIAL LUXURY WARRANTY CERTIFICATE CARD (Matching Admin UI)
            ════════════════════════════════════════════════════════════ */}
            <View style={styles.certCard}>
              
              {/* Gold Corner Ornaments */}
              <View style={[styles.cornerOrnament, { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 }]} />
              <View style={[styles.cornerOrnament, { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 }]} />
              <View style={[styles.cornerOrnament, { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
              <View style={[styles.cornerOrnament, { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 }]} />

              {/* Top Ribbon Gradient Line */}
              <View style={styles.topRibbon} />

              {/* Header */}
              <View style={styles.certHeader}>
                <View style={styles.brandRow}>
                  <View style={styles.brandLogo}>
                    <Icons.Zap size={22} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.brandTitle}>AC SERVICE WORLD</Text>
                    <Text style={styles.brandSub}>Official Service Guarantee Certificate</Text>
                  </View>
                </View>

                <View style={styles.verifiedBadge}>
                  <Icons.CheckCircle2 size={12} color="#047857" />
                  <Text style={styles.verifiedBadgeText}>VERIFIED GUARANTEE</Text>
                </View>
              </View>

              <Text style={styles.refText}>Ref No: <Text style={styles.refBold}>{warrantyNo}</Text></Text>

              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.certSubtitle}>CERTIFICATE OF WARRANTY</Text>
                <Text style={styles.certMainTitle}>100% Genuine Protection</Text>
                <Text style={styles.certDesc}>
                  This official certificate verifies that the AC unit specified below has been inspected, serviced, and certified by an authorized technician and carries full active coverage.
                </Text>
              </View>

              {/* Customer & Technician Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>CUSTOMER / OWNER</Text>
                  <Text style={styles.infoVal}>{booking.customerName || (booking.customerId as any)?.name || 'Verified Customer'}</Text>
                  <Text style={styles.infoSub}>{booking.customerPhone || (booking.customerId as any)?.phone || '+91 98765 43210'}</Text>
                  <Text style={styles.infoSubSmall} numberOfLines={2}>{booking.address || 'Verified Customer Premises'}</Text>
                </View>

                <View style={[styles.infoCol, { borderLeftWidth: 1, borderLeftColor: '#E2E8F0', paddingLeft: 12 }]}>
                  <Text style={styles.infoLabel}>ISSUING SERVICEMAN</Text>
                  <Text style={[styles.infoVal, { color: '#0F766E' }]}>{booking.technicianName || (booking.technicianId as any)?.name || 'Suresh Kumar (AC Specialist)'}</Text>
                  <Text style={styles.infoSub}>Job ID: #{booking.bookingId || 'BK-9021'}</Text>
                  <Text style={styles.infoSubSmall}>Certified Field AC Master Specialist</Text>
                </View>
              </View>

              {/* Specifications Box */}
              <View style={styles.specsBox}>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Model No / Brand:</Text>
                  <Text style={styles.specValBold}>{modelNo}</Text>
                </View>

                <View style={styles.specDivider} />

                <View style={styles.specRow}>
                  <Text style={styles.specKey}>AC No (Unit Serial):</Text>
                  <View style={styles.acNoBadge}>
                    <Text style={styles.acNoText}>{acNo}</Text>
                  </View>
                </View>

                <View style={styles.specDivider} />

                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Reason of Warranty:</Text>
                  <View style={styles.reasonBadge}>
                    <Text style={styles.reasonText} numberOfLines={2}>{warrantyReason}</Text>
                  </View>
                </View>

                <View style={styles.specDivider} />

                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Service Performed:</Text>
                  <Text style={styles.specVal} numberOfLines={2}>{workDone}</Text>
                </View>
              </View>

              {/* Coverage Validity Dates */}
              <View style={styles.footerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.validityLabel}>COVERAGE VALIDITY PERIOD</Text>
                  <Text style={styles.validityDates}>
                    {startDateStr} &nbsp;➞&nbsp; <Text style={{ color: '#047857', fontWeight: '900' }}>{endDateStr}</Text>
                  </Text>
                </View>

                <View style={styles.certTokenBadge}>
                  <Icons.ShieldCheck size={14} color="#0F766E" />
                  <Text style={styles.certTokenText}>{certToken}</Text>
                </View>
              </View>

              {/* Signature & Seal Authorization Box */}
              <View style={styles.signatureBox}>
                <View style={styles.sigCol}>
                  <Image
                    source={{ uri: booking.signatureImg || booking.digitalSignatureImg || DEFAULT_SIGNATURE_IMG }}
                    style={{ height: 48, width: 140, resizeMode: 'contain', marginVertical: 4 }}
                  />
                  <Text style={styles.sigTitle}>{booking.digitalSignature || 'Auth. Service Director (Suresh Kumar)'}</Text>
                </View>

                <View style={styles.stampCol}>
                  <Image
                    source={{ uri: booking.stampImg || booking.digitalStampImg || DEFAULT_STAMP_IMG }}
                    style={{ height: 56, width: 56, resizeMode: 'contain', marginVertical: 4 }}
                  />
                  <View style={styles.stampBadge}>
                    <Icons.CheckCircle2 size={10} color="#047857" />
                    <Text style={styles.stampText}>OFFICIALLY SEALED</Text>
                  </View>
                </View>
              </View>

            </View>

            {/* Bottom Support Callout */}
            <TouchableOpacity
              style={styles.claimSupportBtn}
              onPress={() => Alert.alert('Warranty Claim Support', `For warranty claims regarding Ref #${warrantyNo}, contact customer care or email support@acserviceworld.com.`)}
            >
              <Icons.ShieldAlert size={16} color="#0F766E" />
              <Text style={styles.claimSupportText}>Need Assistance with Warranty Claim?</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  navTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 16,
  },

  // ── CERTIFICATE CARD (EXACT MATCH TO ADMIN PANEL) ──
  certCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cornerOrnament: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#D97706',
  },
  topRibbon: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0F766E',
    marginBottom: 14,
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0F766E',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
  },
  refText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 10,
  },
  refBold: {
    fontWeight: '800',
    color: '#0F172A',
  },

  titleSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  certSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  certMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  certDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 8,
  },

  infoGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginVertical: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  infoSubSmall: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  specsBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  specKey: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  specValBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
  },
  specVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
    textAlign: 'right',
  },
  specDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  acNoBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  acNoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  reasonBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: '60%',
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    textAlign: 'right',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  validityLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  validityDates: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  certTokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  certTokenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },

  signatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FEF3C720',
    padding: 10,
    borderRadius: 12,
  },
  sigCol: {},
  sigLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  sigName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  sigTitle: {
    fontSize: 9,
    color: '#64748B',
  },
  stampCol: {
    alignItems: 'flex-end',
  },
  stampLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 2,
  },
  stampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stampText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
  },

  claimSupportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E6F4F1',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  claimSupportText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
});
