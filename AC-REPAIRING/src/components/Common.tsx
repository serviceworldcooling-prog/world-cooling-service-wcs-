import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  TextInput, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../constants/theme';

// Screen Container
interface ContainerProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  scroll?: boolean;
  loading?: boolean;
  noHeader?: boolean;
  backgroundColor?: string;
}

export const ScreenContainer: React.FC<ContainerProps> = ({
  children,
  title,
  onBack,
  headerRight,
  scroll = false,
  loading = false,
  noHeader = false,
  backgroundColor = COLORS.background
}) => {
  const content = loading ? (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.secondary} />
    </View>
  ) : (
    children
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} backgroundColor={COLORS.primary} />
      
      {!noHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {title && (
              <Text style={[styles.headerTitle, { marginLeft: onBack ? SPACING.sm : 0 }]} numberOfLines={1}>
                {title}
              </Text>
            )}
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}

      {scroll ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flexContent}>
          {content}
        </View>
      )}
    </SafeAreaView>
  );
};

// Custom Button
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: any;
  textStyle?: any;
}

export const AppButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  let buttonStyle: any = styles.btnPrimary;
  let txtStyle: any = styles.btnTextPrimary;

  if (variant === 'secondary') {
    buttonStyle = styles.btnSecondary;
    txtStyle = styles.btnTextSecondary;
  } else if (variant === 'outline') {
    buttonStyle = styles.btnOutline;
    txtStyle = styles.btnTextOutline;
  } else if (variant === 'danger') {
    buttonStyle = styles.btnDanger;
    txtStyle = styles.btnTextDanger;
  }

  if (disabled) {
    buttonStyle = [buttonStyle, styles.btnDisabled];
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, buttonStyle, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? COLORS.primary : '#fff'} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <MaterialIcons 
              name={icon as any} 
              size={18} 
              color={variant === 'outline' ? COLORS.primary : variant === 'secondary' ? COLORS.primary : '#fff'} 
              style={{ marginRight: SPACING.xs }} 
            />
          )}
          <Text style={[styles.btnText, txtStyle, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Custom Input
interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  icon?: string;
  error?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: any;
}

export const AppInput: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  error,
  rightIcon,
  onRightIconPress,
  style,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        {icon && (
          <MaterialIcons 
            name={icon as any} 
            size={20} 
            color={COLORS.textSecondary} 
            style={{ marginRight: SPACING.sm }} 
          />
        )}
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={{ padding: SPACING.xs }}>
            <MaterialIcons 
              name={rightIcon as any} 
              size={20} 
              color={COLORS.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: SPACING.xs,
    borderRadius: ROUNDED.full,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  flexContent: {
    flex: 1,
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Buttons
  button: {
    height: 48,
    borderRadius: ROUNDED.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnSecondary: {
    backgroundColor: COLORS.secondary,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnDanger: {
    backgroundColor: COLORS.danger,
  },
  btnDisabled: {
    backgroundColor: COLORS.border,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: '#ffffff',
  },
  btnTextSecondary: {
    color: '#ffffff',
  },
  btnTextOutline: {
    color: COLORS.primary,
  },
  btnTextDanger: {
    color: '#ffffff',
  },

  // Inputs
  inputContainer: {
    marginVertical: SPACING.xs,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: ROUNDED.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    height: '100%',
  },
  inputErrorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});
