import { PriceBreakdown } from '../types';

/**
 * Formats integer paise into INR currency display
 * e.g. 450000 paise -> "₹4,500"
 */
export function formatPaise(paise: number, showDecimals: boolean = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Converts Indian Rupees to integer paise
 * e.g. 4500.50 -> 450050
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Calculates deterministic pricing breakdown in integer paise
 *
 * GST Rules (Indian Hospitality):
 * - Per night tariff <= ₹7,500 (750,000 paise) -> 12% GST
 * - Per night tariff > ₹7,500 (750,000 paise)  -> 18% GST
 *
 * Resort Service Charge:
 * - 5% of subtotal
 */
export function calculatePricing({
  basePricePerNightPaise,
  numNights,
  numAdults = 2,
  baseOccupancy = 2,
  extraGuestFeePaise = 150000,
  couponDiscountPaise = 0,
}: {
  basePricePerNightPaise: number;
  numNights: number;
  numAdults?: number;
  baseOccupancy?: number;
  extraGuestFeePaise?: number;
  couponDiscountPaise?: number;
}): PriceBreakdown {
  const safeNights = Math.max(1, numNights);
  const subtotalPaise = basePricePerNightPaise * safeNights;

  // Extra guest charge per night
  const extraGuests = Math.max(0, numAdults - baseOccupancy);
  const totalExtraGuestFeePaise = extraGuests * extraGuestFeePaise * safeNights;

  // 5% resort service charge
  const taxableSubtotal = subtotalPaise + totalExtraGuestFeePaise;
  const resortFeePaise = Math.round(taxableSubtotal * 0.05);

  // Effective tax rate based on room tier
  const effectiveTaxPercent = basePricePerNightPaise > 750000 ? 18 : 12;
  const taxableAmount = taxableSubtotal + resortFeePaise;
  const taxPaise = Math.round((taxableAmount * effectiveTaxPercent) / 100);

  const discountPaise = Math.min(taxableAmount, couponDiscountPaise);
  const totalAmountPaise = Math.max(0, taxableAmount + taxPaise - discountPaise);

  return {
    numNights: safeNights,
    basePricePerNightPaise,
    subtotalPaise,
    extraGuestFeePaise: totalExtraGuestFeePaise,
    resortFeePaise,
    taxPaise,
    effectiveTaxPercent,
    discountPaise,
    totalAmountPaise,
  };
}
