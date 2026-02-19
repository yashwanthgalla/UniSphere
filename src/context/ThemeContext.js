import React, { createContext, useContext, useState, useMemo } from 'react';
import { COLORS } from '../theme';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const colors = useMemo(
    () => ({
      bg: isDark ? COLORS.darkBg : COLORS.offWhite,
      card: isDark ? COLORS.darkCard : COLORS.white,
      text: isDark ? COLORS.white : COLORS.black,
      textSecondary: isDark ? COLORS.gray400 : COLORS.gray600,
      textMuted: isDark ? COLORS.gray500 : COLORS.gray400,
      border: isDark ? COLORS.darkBorder : COLORS.black,
      accent: COLORS.accent,
      accentAlt: COLORS.accentAlt,
      accentYellow: COLORS.accentYellow,
      accentGreen: COLORS.accentGreen,
      danger: COLORS.danger,
      inputBg: isDark ? COLORS.gray900 : COLORS.gray100,
      tabBar: isDark ? COLORS.darkCard : COLORS.white,
      skeleton: isDark ? COLORS.gray800 : COLORS.gray200,
    }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
