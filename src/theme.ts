export const colors = {
  // Primary accent
  clay: { primary: '#C17F5B', light: '#F5EDE4', dark: '#7A4A2E', deep: '#3D2010' },
  // Secondary - InSync (Leisure)
  moss: { secondary: '#6B7C5E', light: '#EAF0E5', dark: '#3A4D30' },
  // Tertiary - ShareRing (Borrow)
  bark: { tertiary: '#5C3D1E', light: '#EDE5D8' },
  // Surfaces and borders
  sand: { surface: '#F2EAD8', border: '#DDD3BC', muted: '#A89070' },
  // Page background
  parchment: { background: '#FAF6EE' },
  // Card background
  cream: { card: '#FFFDF8' },
  // Emergency / alert
  rust: { alert: '#B85C38', light: '#F7EAE3' },
  // Neutral labels / Admin
  stone: { neutral: '#8C8070', light: '#F0EDE7' },
  // Text and soft colors
  ink: { text: '#2A1F14', mid: '#5A4535', soft: '#8C7060', faint: '#B8A898' },
};

export const typography = {
  display: 'PlayfairDisplay_400Regular',
  displayBold: 'PlayfairDisplay_700Bold',
  body: 'Jost_400Regular',
  bodyMedium: 'Jost_500Medium',
  bodyBold: 'Jost_700Bold',
};

// UI Rules as constants
export const ui = {
  card: {
    backgroundColor: colors.cream.card,
    borderColor: colors.sand.border,
    borderWidth: 1,
    borderRadius: 14,
  },
  page: {
    backgroundColor: colors.parchment.background,
    // Generous whitespace — padding 14–18px on all containers
    padding: 16,
  },
  button: {
    borderRadius: 10,
    // no drop shadows
  },
  label: {
    fontSize: 10, // 9-10px
    letterSpacing: 0.8, // 0.5-1px
    textTransform: 'uppercase' as const,
    color: colors.ink.faint,
  },
  divider: {
    height: 1,
    backgroundColor: colors.sand.border,
    marginVertical: 16,
  }
};
