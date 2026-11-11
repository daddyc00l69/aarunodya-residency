export type UserRole = 'super_admin' | 'manager' | 'front_desk' | 'housekeeping';

export type BookingStatus = 
  | 'hold' 
  | 'confirmed' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled' 
  | 'expired';

export type PaymentStatus = 
  | 'pending' 
  | 'captured' 
  | 'failed' 
  | 'refunded';

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
  checkInTime: string;   // e.g. "14:00"
  checkOutTime: string;  // e.g. "11:00"
  currency: string;      // "INR"
  taxRatePercent: number; // 12 or 18% based on rate
  resortFeePercent: number; // e.g. 5%
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
  basePricePaise: number;       // In integer paise: e.g. 650000 = ₹6,500
  extraGuestFeePaise: number;   // In integer paise
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

export interface Guest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idProofType?: 'passport' | 'aadhaar' | 'driving_license' | 'voter_id' | 'other';
  idProofNumber?: string;
  specialRequests?: string;
  createdAt: string;
}

export interface BookingRoomItem {
  id: string;
  bookingId: string;
  roomTypeId: string;
  roomId?: string; // Assigned physical room (can be assigned at check-in or booking)
  nightRatePaise: number;
  roomNumber?: string;
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "ARN-2026-7841"
  guestId: string;
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
  
  // Financial breakdown in integer minor units (paise)
  subtotalPaise: number;
  extraGuestFeePaise: number;
  resortFeePaise: number;
  taxPaise: number;
  discountPaise: number;
  totalAmountPaise: number;
  paidAmountPaise: number;

  holdExpiresAt?: string; // ISO 8601 timestamp for 15-minute temporary holds
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  bookingReference?: string;
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
  createdAt: string;
  capturedAt?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // In-memory / bcrypt hash
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
  entityType: 'booking' | 'room' | 'payment' | 'user' | 'pricing';
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
