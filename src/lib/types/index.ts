export type UserRole = 
  | 'super_admin' 
  | 'manager' 
  | 'front_desk' 
  | 'accounts' 
  | 'housekeeping';

export type BookingStatus = 
  | 'hold' 
  | 'confirmed' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled' 
  | 'expired';

export type PaymentStatus = 
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'
  | 'pending' 
  | 'captured' 
  | 'failed';

export type PaymentMethod = 
  | 'razorpay' 
  | 'cash' 
  | 'card_pos' 
  | 'upi';

export type HousekeepingStatus = 
  | 'clean' 
  | 'dirty' 
  | 'inspecting' 
  | 'maintenance';

export interface Property {
  id: string;
  name: string;
  tagline: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  checkInTime: string;   // e.g. "12:00"
  checkOutTime: string;  // e.g. "11:00"
  currency: string;      // "INR"
  taxRatePercent: number; // 12.0
  resortFeePercent: number; // 0.0
  cancellationPolicy: string;
  amenities: string[];
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  baseOccupancy: number;
  maxOccupancy: number;
  bedConfig: string;
  roomSizeSqFt: number;
  viewType: string;
  basePricePaise: number;       // In integer paise: e.g. 180000 = ₹1,800
  extraGuestFeePaise: number;   // In integer paise: e.g. 30000 = ₹300
  amenities: string[];
  features: string[];
  images: {
    url: string;
    alt: string;
    isPrimary?: boolean;
  }[];
  isActive: boolean;
}

export interface Room {
  id: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  housekeepingStatus: HousekeepingStatus;
  isOperational: boolean;
  notes?: string;
}

// --- Customer & Identity Documents ---
export type IdDocumentType = 'aadhaar' | 'passport' | 'driving_license' | 'voter_id' | 'other';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface CustomerIdentityDocument {
  id: string;
  customerId: string;
  documentType: IdDocumentType;
  documentNumberMasked: string; // e.g. "XXXX-XXXX-8921"
  maskedNumber?: string; // alias for documentNumberMasked
  documentNumberEncrypted?: string;
  issuingCountry: string;
  expiryDate?: string; // YYYY-MM-DD
  filePath?: string; // private disk path under data/secure_documents/
  fileMimeType?: string; // image/jpeg, image/png, application/pdf
  fileSizeBytes?: number;
  fileSize?: number; // alias for fileSizeBytes
  originalFileName?: string;
  verificationStatus: VerificationStatus;
  verifiedByStaffId?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  uploadedAt?: string; // alias for verifiedAt or createdAt
  createdAt: string;
}

export interface Customer {
  id: string; // e.g. "CUST-1001"
  fullName: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone: string;
  altPhone?: string;
  alternatePhone?: string; // alias for altPhone
  email: string;
  addressLine1?: string;
  address?: string; // alias for addressLine1
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  documents: CustomerIdentityDocument[];
  totalVisits: number;
  totalSpentPaise: number;
  totalSpendPaise?: number; // alias for totalSpentPaise
  vipStatus?: boolean;
  notes?: string;
  isMerged?: boolean;
  mergedIntoCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

// Backwards compatibility alias for Guest
export interface Guest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idProofType?: IdDocumentType;
  idProofNumber?: string;
  specialRequests?: string;
  city?: string;
  state?: string;
  createdAt: string;
}

export interface BookingGuestItem {
  id: string;
  bookingId: string;
  fullName: string;
  age?: number;
  gender?: string;
  idProofType?: IdDocumentType;
  idProofNumberMasked?: string;
  phone?: string;
}

export interface BookingRoomItem {
  id: string;
  bookingId: string;
  roomTypeId: string;
  roomId?: string;
  nightRatePaise: number;
  roomNumber?: string;
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "ARN-2026-7841"
  guestId: string;
  customerId?: string; // Links to Customer profile
  guest?: Guest;
  checkInDate: string;  // YYYY-MM-DD (inclusive)
  checkOutDate: string; // YYYY-MM-DD (exclusive)
  numNights: number;
  numAdults: number;
  numChildren: number;
  numRooms: number;
  roomTypeId: string;
  roomType?: RoomType;
  assignedRoomId?: string;
  assignedRoomNumber?: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  
  // Financial breakdown in integer minor units (paise)
  subtotalPaise: number;
  extraGuestFeePaise: number;
  resortFeePaise: number;
  taxPaise: number;
  discountPaise: number;
  totalAmountPaise: number;
  totalPricePaise?: number; // alias for totalAmountPaise
  paidAmountPaise: number;
  remainingBalancePaise?: number; // totalAmountPaise - paidAmountPaise
  balanceDuePaise?: number; // alias for remaining balance due
  source?: 'online' | 'walkin';

  // Coupon application
  couponCode?: string;
  couponDiscountPaise?: number;

  // Additional guests on this booking
  additionalGuests?: BookingGuestItem[];

  holdExpiresAt?: string; // ISO 8601 timestamp for temporary holds
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  
  // Staff tracking
  createdByStaffId?: string;
  createdByStaffName?: string;
  checkedInByStaffName?: string;
  checkedOutByStaffName?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  bookingReference?: string;
  receiptNumber?: string; // e.g. "RCP-2026-7841"
  amountPaise: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionReference: string;
  failureReason?: string;
  gatewayResponse?: Record<string, unknown>;
  cashierId?: string;
  cashierName?: string;
  notes?: string;
  createdAt: string;
  capturedAt?: string;
}

// --- Reception Cash Transactions & Drawer Reconciliation ---
export type CashTransactionType = 'payment' | 'refund' | 'deposit' | 'withdrawal';

export interface CashTransaction {
  id: string; // e.g. "CTX-2026-XXXX"
  receiptNumber: string; // e.g. "RCP-2026-XXXX"
  bookingId?: string;
  bookingReference?: string;
  transactionType: CashTransactionType;
  amountPaise: number;
  cashierId: string;
  cashierName: string;
  notes?: string;
  authorizedByManagerId?: string;
  authorizedByManagerName?: string;
  createdAt: string;
}

export interface CashShiftReconciliation {
  id: string;
  shiftDate: string; // YYYY-MM-DD
  openedByStaffId: string;
  openedByStaffName: string;
  openedAt: string;
  openingFloatPaise: number; // initial drawer cash
  closedByStaffId?: string;
  closedByStaffName?: string;
  closedAt?: string;
  expectedClosingCashPaise?: number;
  actualClosingCashPaise?: number;
  discrepancyPaise?: number;
  notes?: string;
  status: 'open' | 'closed';
}

// --- Coupons & Marketing Engine ---
export type DiscountType = 'fixed' | 'percentage';
export type CustomerEligibility = 'all' | 'first_time' | 'returning' | 'specific_customers';

export interface Coupon {
  id: string;
  code: string; // uppercase, unique, e.g. "VITTHAL10"
  description: string;
  discountType: DiscountType;
  discountValue: number; // paise if fixed (e.g. 20000 = ₹200), or percentage (e.g. 10 = 10%)
  maxDiscountPaise?: number; // max discount cap in paise for percentage discounts
  maxDiscountAmountPaise?: number; // alias for maxDiscountPaise
  minBookingValuePaise: number; // min total booking subtotal in paise
  minBookingAmountPaise?: number; // alias for minBookingValuePaise
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  maxTotalRedemptions: number; // e.g. 100
  maxRedemptions?: number; // alias for maxTotalRedemptions
  currentRedemptionsCount: number;
  redemptionCount?: number; // alias for currentRedemptionsCount
  maxRedemptionsPerCustomer: number; // e.g. 1
  eligibleRoomTypeIds: string[]; // empty array = all room types
  customerEligibility: CustomerEligibility;
  eligibleCustomerType?: string; // alias for customerEligibility
  specificCustomerIds?: string[];
  eligibleCustomerEmail?: string;
  eligibleCustomerPhone?: string;
  minStayNights?: number; // e.g. minimum 2 nights
  isActive: boolean;
  adminNotes?: string;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  couponCode: string;
  bookingId: string;
  bookingReference: string;
  customerId?: string;
  customerEmail: string;
  customerPhone?: string;
  discountAppliedPaise: number;
  bookingTotalBeforeDiscountPaise: number;
  status: 'reserved' | 'consumed' | 'released';
  reservedAt: string;
  consumedAt?: string;
  releasedAt?: string;
}

// --- Post-Checkout Campaign & Email Outbox ---
export interface PostCheckoutCampaign {
  id: string;
  name: string;
  isEnabled: boolean;
  discountType: DiscountType;
  discountValue: number; // e.g. 15 for 15% or 30000 for ₹300
  maxDiscountPaise?: number;
  maxDiscountAmountPaise?: number; // alias
  minBookingValuePaise: number;
  minBookingAmountPaise?: number; // alias
  validityDays: number; // e.g. 90 days
  emailSubject: string;
  promotionalMessage: string;
  emailBodyIntro?: string; // alias
  generateUniqueCodePerCustomer: boolean;
  allowRepeatedIssuanceAfterFutureStays: boolean;
  cooldownDaysBetweenIssuance: number; // e.g. 30 days
  createdAt: string;
  updatedAt: string;
}

export interface EmailNotificationRecord {
  id: string;
  bookingId?: string;
  recipientEmail: string;
  recipientName: string;
  customerName?: string; // alias for recipientName
  bookingReference: string;
  campaignId?: string;
  couponCode?: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  deliveryStatus?: 'pending' | 'sent' | 'failed'; // alias for status
  failureReason?: string;
  retryCount: number;
  sentAt?: string;
  createdAt: string;
}

// --- Excel Data Import / Export Jobs ---
export interface DataImportJob {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  importedByStaffId: string;
  importedByStaffName: string;
  duplicateStrategy: 'skip' | 'update' | 'fail';
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  failedRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorDetails?: { rowNumber: number; field: string; error: string; rawData: any }[];
  createdAt: string;
  completedAt?: string;
}

// --- System Users & Audit Logs ---
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: 
    | 'booking' 
    | 'room' 
    | 'payment' 
    | 'user' 
    | 'pricing' 
    | 'coupon' 
    | 'customer' 
    | 'document' 
    | 'cash_shift' 
    | 'import_export';
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PriceBreakdown {
  numNights: number;
  basePricePerNightPaise: number;
  subtotalPaise: number;
  extraGuestFeePaise: number;
  resortFeePaise: number;
  taxPaise: number;
  effectiveTaxPercent: number;
  discountPaise: number;
  totalAmountPaise: number;
}
