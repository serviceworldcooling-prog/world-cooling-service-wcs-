import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';
import { ScreenContainer, AppButton } from '../../components/Common';

export const TechnicianProfileScreen = ({ route, navigation }: any) => {
  const technician = route?.params?.technician || {
    name: 'Rahul Sharma',
    role: 'Senior HVAC Specialist',
    rating: 4.8,
    reviewsCount: 142,
    experience: '8 Years',
    jobsCompleted: 1250,
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    skills: ['Split AC Repair', 'Gas Leakage Patching', 'Ducted AC Setup', 'Jet Servicing'],
    bio: 'Certified HVAC master technician specializing in eco-friendly refrigerants and energy-efficient duct designs. Known for timely arrivals and neat services.',
    status: 'Available Today',
  };

  return (
    <ScreenContainer title="Technician Profile" onBack={() => navigation.goBack()} scroll>
      {/* Header Info Card */}
      <View style={styles.profileHeaderCard}>
        <Image source={{ uri: technician.avatar }} style={styles.avatar} />
        <View style={styles.infoCol}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.statusText}>{technician.status}</Text>
          </View>
          <Text style={styles.name}>{technician.name}</Text>
          <Text style={styles.role}>{technician.role}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={18} color={COLORS.warning} />
            <Text style={styles.rating}>{technician.rating}</Text>
            <Text style={styles.reviews}>({technician.reviewsCount} reviews)</Text>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{technician.experience}</Text>
          <Text style={styles.statLabel}>Experience</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{technician.jobsCompleted}+</Text>
          <Text style={styles.statLabel}>Jobs Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>99%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>

      {/* Bio section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{technician.bio}</Text>
      </View>

      {/* Skills / Specialities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specialities</Text>
        <View style={styles.skillsContainer}>
          {technician.skills.map((skill: string, index: number) => (
            <View key={index} style={styles.skillBadge}>
              <MaterialIcons name="verified" size={14} color={COLORS.secondary} style={{ marginRight: 4 }} />
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Button */}
      <AppButton
        title={`Request Service from ${technician.name.split(' ')[0]}`}
        onPress={() => {
          navigation.navigate('BookService', { technician });
        }}
        variant="secondary"
        icon="calendar-today"
        style={styles.bookBtn}
      />
      <AppButton
        title="View All Reviews"
        onPress={() => {
          navigation.navigate('TechnicianReviews', { technicianId: 'tech-1' });
        }}
        variant="outline"
        icon="rate-review"
        style={styles.reviewBtn}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  profileHeaderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: ROUNDED.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.divider,
  },
  infoCol: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDED.xs,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  role: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 3,
  },
  reviews: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  statsRow: {
    backgroundColor: COLORS.primary,
    borderRadius: ROUNDED.lg,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: ROUNDED.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: ROUNDED.full,
    margin: 4,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  bookBtn: {
    marginTop: SPACING.sm,
  },
  reviewBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
});
