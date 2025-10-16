// Formatting utilities

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function formatNumber(num: number | undefined | null, decimals = 2): string {
  if (num == null || isNaN(num)) {
    return '0';
  }
  
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}

export function formatCurrency(amount: number | undefined | null, currency = 'USD', decimals = 2): string {
  if (amount == null || isNaN(amount)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(0);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatTokenAmount(amount: bigint | undefined | null, decimals = 18, displayDecimals = 4): string {
  if (amount == null) {
    return '0.' + '0'.repeat(displayDecimals);
  }
  
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  const displayFractional = fractionalString.slice(0, displayDecimals);
  
  return `${wholePart}.${displayFractional}`;
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return 'Unknown time';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(d);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
