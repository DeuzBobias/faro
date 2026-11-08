interface FaroLogoProps {
  size?: number
  textColor?: string
  showText?: boolean
  white?: boolean
}
export default function FaroLogo({ size = 32, textColor, showText = true, white = false }: FaroLogoProps) {
  const reversed = white || textColor === 'white' || textColor === '#FFFFFF'
  return <img src={showText ? `/branding/faro-wordmark-${reversed ? 'reversed' : 'transparent'}.svg` : `/branding/faro-logo-mark${reversed ? '-light' : ''}.svg`} alt="FARO" width={showText ? size * 3.33 : size} height={size} style={{ height: size, width: showText ? size * 3.33 : size, objectFit: 'contain', flexShrink: 0 }} />
}
