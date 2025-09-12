export function formatUsd(n) {
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return '$0';
  
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    notation: 'compact' 
  }).format(num);
}

export function formatPrice(n) {
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return '$0.00000';
  
  if (num > 0 && num < 0.01) {
    const str = num.toFixed(8);
    const match = str.match(/^0\.(0+)(\d+)/);
    if (match) {
      const zeroCount = match[1].length;
      const significantDigits = match[2].substring(0, 5);
      
      // Convert number to subscript
      const subscriptMap = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', 
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
      };
      const subscriptZeroCount = zeroCount.toString().split('').map(digit => subscriptMap[digit]).join('');
      
      return `$0.0${subscriptZeroCount}${significantDigits}`;
    }
  }
  
  // For normal numbers, show 5 decimal places
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    notation: 'standard',
    minimumFractionDigits: 5,
    maximumFractionDigits: 5 
  }).format(num);
}

export function formatLiquidity(n) {
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return '$0';
  
  if (num < 1000000) {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact', 
      maximumFractionDigits: 0 
    }).format(num);
  }
  
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    notation: 'compact', 
    maximumFractionDigits: 2 
  }).format(num);
}
