export function formatPrice(amount) {
  // Handle null, undefined, or non-numeric values
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00';

  // Ensure the amount is a valid number and format it
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPriceWithSymbol(amount) {
  // Handle null, undefined, or non-numeric values
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';

  // Ensure the amount is a valid number and format it with currency symbol
  return Number(amount).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}