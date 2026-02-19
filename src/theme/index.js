// UniSphere Brutalist Theme
// Big bold letters, small accent text, raw aesthetic

export const COLORS = {
  // Core
  black: '#000000',
  white: '#FFFFFF',
  offWhite: '#F5F0EB',
  cream: '#FAF7F2',

  // Brutalist accents
  accent: '#FF4500',       // Bold orange-red
  accentAlt: '#1A1AFF',    // Electric blue
  accentYellow: '#FFD600', // Punch yellow
  accentGreen: '#00E676',  // Neon green
  accentPink: '#FF6B9D',   // Vibrant pink
  accentPurple: '#7C4DFF', // Deep purple

  // Post type colors
  postText: '#FF4500',
  postImage: '#1A1AFF',
  postPoll: '#7C4DFF',
  postConfession: '#FF6B9D',

  // Grays
  gray100: '#F2F2F2',
  gray200: '#E0E0E0',
  gray300: '#BDBDBD',
  gray400: '#9E9E9E',
  gray500: '#757575',
  gray600: '#616161',
  gray700: '#424242',
  gray800: '#2C2C2C',
  gray900: '#1A1A1A',

  // Semantic
  danger: '#FF1744',
  success: '#00E676',
  warning: '#FFD600',
  info: '#1A1AFF',

  // Vote colors
  upvote: '#FF4500',
  downvote: '#7C4DFF',

  // Dark mode
  darkBg: '#0A0A0A',
  darkCard: '#141414',
  darkBorder: '#2A2A2A',
};

export const FONTS = {
  // Brutalist: system bold for big headings, mono for accents
  heroSize: 42,
  titleSize: 28,
  headingSize: 22,
  subheadingSize: 18,
  bodySize: 15,
  captionSize: 12,
  tinySize: 10,

  // Weights
  black: '900',
  bold: '700',
  semiBold: '600',
  medium: '500',
  regular: '400',
  light: '300',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  brutal: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  brutalSmall: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

// Brutalist style helpers
export const BRUTAL = {
  border: {
    borderWidth: 2.5,
    borderColor: COLORS.black,
  },
  borderThick: {
    borderWidth: 4,
    borderColor: COLORS.black,
  },
  card: {
    borderWidth: 2.5,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    ...SHADOWS.brutal,
  },
  cardDark: {
    borderWidth: 2.5,
    borderColor: COLORS.white,
    backgroundColor: COLORS.darkCard,
    shadowColor: COLORS.white,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 6,
  },
};

// Post type configurations
export const POST_TYPES = {
  text: { label: 'TEXT', icon: 'create-outline', color: COLORS.postText },
  image: { label: 'IMAGE', icon: 'image-outline', color: COLORS.postImage },
  poll: { label: 'POLL', icon: 'bar-chart-outline', color: COLORS.postPoll },
  confession: { label: 'CONFESS', icon: 'eye-off-outline', color: COLORS.postConfession },
};

// Animation timings
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: { tension: 50, friction: 7 },
};
