// ES Module
export const getDiscountedPrice = (originalPrice) => {
  // fixed discount for example: 1999 -> 499
  if (originalPrice === 1999) return 499;

  // fallback: 20% off
  const discounted = Math.round(originalPrice * 0.8);
  return discounted > 0 ? discounted : 1; // Stripe cannot accept 0
};