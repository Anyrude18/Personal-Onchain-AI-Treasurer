const tokenColors = {
  HBAR: { bg: '#00c896/15', text: '#00c896', bgClass: 'bg-[#00c896]/15', textClass: 'text-[#00c896]' },
  USDC: { bg: '#2775CA/15', text: '#2775CA', bgClass: 'bg-[#2775CA]/15', textClass: 'text-[#2775CA]' },
  ETH: { bg: '#627EEA/15', text: '#627EEA', bgClass: 'bg-[#627EEA]/15', textClass: 'text-[#627EEA]' },
  BTC: { bg: '#F7931A/15', text: '#F7931A', bgClass: 'bg-[#F7931A]/15', textClass: 'text-[#F7931A]' },
  DEFAULT: { bgClass: 'bg-[#7c6ff7]/15', textClass: 'text-[#7c6ff7]' },
};

const sizeMap = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

/**
 * @param {{ symbol: string, size?: 'sm'|'md'|'lg' }} props
 */
export default function TokenIcon({ symbol, size = 'md' }) {
  const primaryToken = symbol ? symbol.split('/')[0] : 'DEFAULT';
  const colors = tokenColors[primaryToken] || tokenColors.DEFAULT;
  const initials = primaryToken.slice(0, 2).toUpperCase();

  return (
    <div
      className={`${sizeMap[size]} rounded-full ${colors.bgClass} ${colors.textClass} flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
