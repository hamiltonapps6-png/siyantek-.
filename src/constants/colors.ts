const colors = {
  light: {
    text: '#102A35',
    tint: '#16A6A0',
    background: '#F4F7F5',
    foreground: '#102A35',
    card: '#FFFFFF',
    cardForeground: '#102A35',
    primary: '#16A6A0',
    primaryForeground: '#ffffff',
    secondary: '#E7EFEC',
    secondaryForeground: '#16404A',
    muted: '#EDF2F0',
    mutedForeground: '#668087',
    accent: '#FFF1D8',
    accentForeground: '#8A5B16',
    destructive: '#C94E4E',
    destructiveForeground: '#ffffff',
    border: '#DCE7E3',
    input: '#D2E1DC',
    navy: '#102A35',
    teal: '#16A6A0',
    tealSoft: '#DDF4EF',
    amber: '#F2B45C',
    amberSoft: '#FFF1D8',
    green: '#2B9A70',
    greenSoft: '#E2F5EB',
  },
  radius: 8,
};

export default colors;
export const useColors = () => colors.light;
