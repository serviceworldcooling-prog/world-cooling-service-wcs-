import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  TextInput as RNTextInput, 
  TextInputProps as RNTextInputProps,
  ActivityIndicator, 
  Animated, 
  Pressable 
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import * as Icons from 'lucide-react-native';

// Dynamically resolve Icon by string name
export const IconHelper = ({ name, color, size = 24 }: { name: string; color: string; size?: number }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) {
    return <Icons.HelpCircle color={color} size={size} />;
  }
  return <IconComponent color={color} size={size} />;
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ title, onPress, loading, disabled }) => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          { backgroundColor: colors.primary },
          (disabled || loading) && { opacity: 0.6 }
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({ title, onPress, loading, disabled }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonSecondary,
        { borderColor: colors.primary },
        (disabled || loading) && { opacity: 0.6 }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Text style={[styles.buttonSecondaryText, { color: colors.primary }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

export const TextInput: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...rest
}) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>}
      <RNTextInput
        placeholderTextColor={colors.textSecondary + '80'}
        {...rest}
        style={[
          styles.input,
          { 
            color: colors.text, 
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.card
          },
          style
        ]}
      />
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

export const OTPInput: React.FC<{ value: string; onChange: (text: string) => void }> = ({ value, onChange }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={styles.otpWrapper}>
      {[0, 1, 2, 3].map((idx) => {
        const val = value[idx] || '';
        return (
          <RNTextInput
            key={idx}
            maxLength={1}
            keyboardType="numeric"
            value={val}
            onChangeText={(text) => {
              const updated = value.split('');
              updated[idx] = text;
              onChange(updated.join(''));
            }}
            style={[
              styles.otpBox,
              {
                borderColor: val ? colors.primary : colors.border,
                color: colors.text,
                backgroundColor: colors.card
              }
            ]}
          />
        );
      })}
    </View>
  );
};

export const SearchBar: React.FC<{ value: string; onChangeText: (t: string) => void }> = ({ value, onChangeText }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Icons.Search size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
      <RNTextInput
        placeholder="Search for AC service, repair..."
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        style={{ flex: 1, color: colors.text, fontSize: 15 }}
      />
    </View>
  );
};

export const SkeletonLoader: React.FC<{ height?: number; style?: any }> = ({ height = 80, style }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  return (
    <View style={[styles.skeleton, { height, backgroundColor: colors.border, borderRadius: 12 }, style]} />
  );
};

export const EmptyState: React.FC<{ title: string; subtitle: string; icon: string }> = ({ title, subtitle, icon }) => {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={styles.emptyContainer}>
      <IconHelper name={icon} color={colors.textSecondary} size={48} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonSecondary: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginVertical: 8,
  },
  buttonSecondaryText: {
    fontWeight: '700',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  otpWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  otpBox: {
    width: 56,
    height: 56,
    borderWidth: 1.5,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skeleton: {
    width: '100%',
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  }
});
