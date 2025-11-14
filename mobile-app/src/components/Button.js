import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows } from '../theme';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style,
  textStyle 
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [colors.leafLight, colors.forest];
      case 'secondary':
        return [colors.sage, colors.moss];
      case 'warning':
        return [colors.warning, colors.danger];
      default:
        return [colors.leafLight, colors.forest];
    }
  };

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.outlineButton,
          disabled && styles.disabled,
          style
        ]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.forest} />
        ) : (
          <Text style={[styles.outlineText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.buttonWrapper, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradient: {
    paddingVertical: 20,
    paddingHorizontal: 36,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 36,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  outlineButton: {
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.sage,
  },
  text: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineText: {
    color: colors.forest,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
});
