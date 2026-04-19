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
import { useState } from "react";

export default function TokenIcon({ symbol, size = 24, className = "" }) {
  const [imageError, setImageError] = useState(false);

  // Token symbol to icon mapping
  const getTokenIcon = (sym) => {
    const icons = {
      ETH: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
      USDC: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      DAI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
      USDT: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      BTC: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    };
    return icons[sym?.toUpperCase()] || null;
  };

  const icon = getTokenIcon(symbol);

  if (imageError || !icon) {
    return (
      <div
        className={`inline-flex items-center justify-center font-bold bg-gradient-to-br from-purple-400 to-blue-400 text-white rounded-full ${className}`}
        style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.5}px` }}
      >
        {symbol?.toUpperCase().charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={icon}
      alt={symbol}
      className={`inline-block rounded-full ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={() => setImageError(true)}
    />
  );
}