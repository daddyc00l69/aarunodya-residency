import { 
  Property, 
  RoomType, 
  Room, 
  User, 
  Booking, 
  Payment, 
  Guest,
  Customer,
  Coupon,
  CouponRedemption,
  PostCheckoutCampaign,
  CashTransaction,
  CashShiftReconciliation,
  EmailNotificationRecord,
  DataImportJob
} from '../types';

export const INITIAL_PROPERTY: Property = {
  id: 'prop-aarunodya-01',
  name: 'Aarunodya Residency Bhakt Niwas',
  tagline: 'Deluxe A/C & Non A/C Rooms • Near Vitthal-Rukmini Mandir',
  slug: 'aarunodya-residency-bhakt-niwas',
  description: 'Conveniently situated at Nath Chowk, Pandharpur, Aarunodya Residency Bhakt Niwas offers clean, modern, and spiritual hospitality for pilgrims and families visiting the holy shrine of Lord Vitthal & Rukmini Mata. Featuring Deluxe A/C rooms, Non-A/C rooms, and a spacious 3rd-floor group hall.',
  address: '1563 Ghongade Galli, Nath Chowk',
  city: 'Pandharpur',
  state: 'Maharashtra',
  country: 'India',
  postalCode: '413304',
  phone: '+91 85300 00820 / +91 91724 64746 / +91 88012 42005',
  email: 'contact@aarunodya.com',
  checkInTime: '12:00',
  checkOutTime: '11:00',
  currency: 'INR',
  taxRatePercent: 12.0,
  resortFeePercent: 0.0,
  cancellationPolicy: 'Complimentary cancellation up to 24 hours prior to check-in time.',
  amenities: [
    'Walking Distance to Shri Vitthal-Rukmini Mandir',
    '24/7 Hot Water (Geyser & Solar)',
    'Split Air Conditioning & High-Speed Fans',
    'Elevator / Lift to All Floors',
    'Free High-Speed Wi-Fi',
    'Safe Vehicle Parking Nearby',
    'Pure RO Drinking Water on All Floors',
    'CCTV Security & 24/7 Reception Desk'
  ]
};

export const INITIAL_ROOM_TYPES: RoomType[] = [
  {
    id: 'rt-deluxe-ac',
    propertyId: 'prop-aarunodya-01',
    name: 'Deluxe A/C Room',
    slug: 'deluxe-ac-room',
    shortDescription: 'Modern air-conditioned room with king/queen bed, private western bathroom, and 24/7 hot water.',
    fullDescription: 'Perfect for pilgrims and couples seeking a restful, cool stay after Darshan. Features high-efficiency split AC, premium spring mattress, LED TV with devotional channels, private attached bathroom with instant geyser, and daily housekeeping.',
    baseOccupancy: 2,
    maxOccupancy: 3,
    bedConfig: '1 King Bed + Extra Mattress on request',
    roomSizeSqFt: 220,
    viewType: 'City & Mandir Pathway View',
    basePricePaise: 180000, // ₹1,800
    extraGuestFeePaise: 30000, // ₹300
    amenities: [
      'Split Air Conditioner',
      '24-Hour Hot Water Geyser',
      'LED TV with Satellite Channels',
      'Attached Western Toilet',
      'Clean Linens & Sanitized Towels',
      'Free High-Speed Wi-Fi'
    ],
    features: ['220 sq. ft.', 'Split AC', 'King Bed', 'Attached Geyser'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        alt: 'Deluxe AC Room at Aarunodya Residency',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        alt: 'Deluxe AC Room Bedding'
      }
    ],
    isActive: true
  },
  {
    id: 'rt-comfort-non-ac',
    propertyId: 'prop-aarunodya-01',
    name: 'Comfort Non-A/C Room',
    slug: 'comfort-non-ac-room',
    shortDescription: 'Well-ventilated comfortable room with ceiling fan, clean attached bathroom, and 24/7 hot water.',
    fullDescription: 'Affordable, clean, and peaceful accommodation designed for devotees. Equipped with a high-speed ceiling fan, comfortable double bed, clean cotton linens, attached bathroom with hot water, and quiet ventilation.',
    baseOccupancy: 2,
    maxOccupancy: 3,
    bedConfig: '1 Queen Bed',
    roomSizeSqFt: 190,
    viewType: 'Quiet Courtyard View',
    basePricePaise: 120000, // ₹1,200
    extraGuestFeePaise: 25000, // ₹250
    amenities: [
      'High-Speed Ceiling Fan',
      '24-Hour Hot Water Supply',
      'Attached Bathroom',
      'Clean Linens & Pillows',
      'Power Backup for Lights & Fans',
      'Free Wi-Fi'
    ],
    features: ['190 sq. ft.', 'Natural Ventilation', 'Clean Linens', 'Affordable'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        alt: 'Comfort Non-AC Room Bedroom',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        alt: 'Comfort Room Interior'
      }
    ],
    isActive: true
  },
  {
    id: 'rt-family-ac-suite',
    propertyId: 'prop-aarunodya-01',
    name: 'Family 4-Bed A/C Suite',
    slug: 'family-4-bed-ac-suite',
    shortDescription: 'Spacious family suite with 2 double beds, powerful split AC, and large attached bathroom.',
    fullDescription: 'Designed specially for families traveling together for Pandharpur Wari and Darshan. Offers two large double beds, spacious wardrobe, split AC, seating area, and a large attached bathroom with 24/7 hot water.',
    baseOccupancy: 4,
    maxOccupancy: 6,
    bedConfig: '2 Large Double Beds',
    roomSizeSqFt: 360,
    viewType: 'Nath Chowk Street View',
    basePricePaise: 280000, // ₹2,800
    extraGuestFeePaise: 30000, // ₹300
    amenities: [
      'Split Air Conditioner',
      'Two Full-Size Double Beds',
      'Spacious Wardrobe & Seating',
      'Instant Hot Water Geyser',
      'Smart TV & Free Wi-Fi',
      'Daily Mineral Water'
    ],
    features: ['360 sq. ft.', '2 Double Beds', 'Family Room', 'Split AC'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        alt: 'Family Suite with Two Large Beds',
        isPrimary: true
      }
    ],
    isActive: true
  },
  {
    id: 'rt-bhakt-niwas-hall-402',
    propertyId: 'prop-aarunodya-01',
    name: '3rd Floor Bhakt Niwas Hall (Room 402)',
    slug: 'bhakt-niwas-hall-room-402',
    shortDescription: 'Spacious 3rd-floor private hall (Room 402) for bhajan mandals, dindi groups, and large pilgrim families.',
    fullDescription: 'A dedicated, massive 3rd-floor hall (Room 402) accommodating up to 15-20 devotees with comfortable floor bedding/mattresses, multiple clean washrooms, ceiling fans, storage lockers, and open terrace access with temple town panoramic views.',
    baseOccupancy: 10,
    maxOccupancy: 20,
    bedConfig: 'Group Hall with 10-15 Mattresses & Bedding',
    roomSizeSqFt: 850,
    viewType: '3rd Floor Panoramic Pandharpur Town View',
    basePricePaise: 550000, // ₹5,500
    extraGuestFeePaise: 20000, // ₹200
    amenities: [
      'Entire 3rd Floor Private Hall',
      'Multiple Attached Washrooms & Baths',
      '24/7 Hot Water Facility',
      'Multiple High-Speed Ceiling Fans',
      'Separate Luggage & Shoe Racks',
      'Direct Terrace Access',
      'RO Drinking Water Station'
    ],
    features: ['850 sq. ft.', 'Private 3rd Floor Hall', 'Up to 20 Devotees', 'Multiple Baths'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        alt: 'Spacious Group Hall at Aarunodya Residency',
        isPrimary: true
      }
    ],
    isActive: true
  }
];

export const INITIAL_ROOMS: Room[] = [
  // GROUND FLOOR (101, 102, 103, 104)
  { id: 'room-101', roomTypeId: 'rt-deluxe-ac', roomNumber: '101', floor: 0, housekeepingStatus: 'clean', isOperational: true, notes: 'Ground floor Deluxe AC' },
  { id: 'room-102', roomTypeId: 'rt-deluxe-ac', roomNumber: '102', floor: 0, housekeepingStatus: 'clean', isOperational: true, notes: 'Ground floor Deluxe AC' },
  { id: 'room-103', roomTypeId: 'rt-comfort-non-ac', roomNumber: '103', floor: 0, housekeepingStatus: 'clean', isOperational: true, notes: 'Ground floor Non-AC' },
  { id: 'room-104', roomTypeId: 'rt-comfort-non-ac', roomNumber: '104', floor: 0, housekeepingStatus: 'clean', isOperational: true, notes: 'Ground floor Non-AC' },

  // 1ST FLOOR (201, 202, 203, 204, 205, 206)
  { id: 'room-201', roomTypeId: 'rt-deluxe-ac', roomNumber: '201', floor: 1, housekeepingStatus: 'clean', isOperational: true, notes: '1st floor Deluxe AC' },
  { id: 'room-202', roomTypeId: 'rt-deluxe-ac', roomNumber: '202', floor: 1, housekeepingStatus: 'clean', isOperational: true, notes: '1st floor Deluxe AC' },
  { id: 'room-203', roomTypeId: 'rt-deluxe-ac', roomNumber: '203', floor: 1, housekeepingStatus: 'clean', isOperational: true, notes: '1st floor Deluxe AC' },
  { id: 'room-204', roomTypeId: 'rt-comfort-non-ac', roomNumber: '204', floor: 1, housekeepingStatus: 'clean', isOperational: true, notes: '1st floor Non-AC' },
  { id: 'room-205', roomTypeId: 'rt-comfort-non-ac', roomNumber: '205', floor: 1, housekeepingStatus: 'clean', isOperational: true, notes: '1st floor Non-AC' },
  { id: 'room-206', roomTypeId: 'rt-family-ac-suite', roomNumber: '206', floor: 1, housekeepingStatus: 'clean', isOperational: true, notes: '1st floor Family 4-Bed AC Suite' },

  // 2ND FLOOR (301, 302, 303, 304, 305, 306)
  { id: 'room-301', roomTypeId: 'rt-deluxe-ac', roomNumber: '301', floor: 2, housekeepingStatus: 'clean', isOperational: true, notes: '2nd floor Deluxe AC' },
  { id: 'room-302', roomTypeId: 'rt-deluxe-ac', roomNumber: '302', floor: 2, housekeepingStatus: 'clean', isOperational: true, notes: '2nd floor Deluxe AC' },
  { id: 'room-303', roomTypeId: 'rt-deluxe-ac', roomNumber: '303', floor: 2, housekeepingStatus: 'clean', isOperational: true, notes: '2nd floor Deluxe AC' },
  { id: 'room-304', roomTypeId: 'rt-comfort-non-ac', roomNumber: '304', floor: 2, housekeepingStatus: 'clean', isOperational: true, notes: '2nd floor Non-AC' },
  { id: 'room-305', roomTypeId: 'rt-comfort-non-ac', roomNumber: '305', floor: 2, housekeepingStatus: 'clean', isOperational: true, notes: '2nd floor Non-AC' },
  { id: 'room-306', roomTypeId: 'rt-family-ac-suite', roomNumber: '306', floor: 2, housekeepingStatus: 'clean', isOperational: true, notes: '2nd floor Family 4-Bed AC Suite' },

  // 3RD FLOOR (401 room, 402 hall)
  { id: 'room-401', roomTypeId: 'rt-deluxe-ac', roomNumber: '401', floor: 3, housekeepingStatus: 'clean', isOperational: true, notes: '3rd floor Deluxe Room' },
  { id: 'room-402', roomTypeId: 'rt-bhakt-niwas-hall-402', roomNumber: '402 (Hall)', floor: 3, housekeepingStatus: 'clean', isOperational: true, notes: '3rd floor 1 Large Hall for Groups & Bhajan Mandals' }
];

export const INITIAL_STAFF_USERS: User[] = [
  {
    id: 'user-yuvaraj-01',
    email: 'yuvaraj@aarunodya.com',
    fullName: 'Yuvaraj Malave (Owner & General Manager)',
    passwordHash: 'Admin@12345',
    role: 'super_admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-manager-01',
    email: 'manager@aarunodya.com',
    fullName: 'Operations Manager',
    passwordHash: 'Manager@12345',
    role: 'manager',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-desk-01',
    email: 'frontdesk@aarunodya.com',
    fullName: 'Pandharpur Front Desk Reception',
    passwordHash: 'Desk@12345',
    role: 'front_desk',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-accounts-01',
    email: 'accounts@aarunodya.com',
    fullName: 'Front-Desk Accounts Officer',
    passwordHash: 'Accounts@12345',
    role: 'accounts',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-housekeeping-01',
    email: 'clean@aarunodya.com',
    fullName: 'Housekeeping Staff',
    passwordHash: 'Clean@12345',
    role: 'housekeeping',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: 'guest-01',
    fullName: 'Santosh Kulkarni',
    email: 'santosh.kulkarni@example.com',
    phone: '+91 98220 12345',
    idProofType: 'aadhaar',
    idProofNumber: 'XXXX-XXXX-8921',
    specialRequests: 'Ground floor room preferred for senior citizens',
    createdAt: '2026-11-01T10:00:00Z'
  },
  {
    id: 'guest-02',
    fullName: 'Mahesh Patil & Dindi Mandal',
    email: 'mahesh.patil@example.com',
    phone: '+91 94230 67890',
    idProofType: 'aadhaar',
    idProofNumber: 'XXXX-XXXX-3412',
    specialRequests: '3rd Floor Hall for 12 bhajan devotees',
    createdAt: '2026-11-05T14:30:00Z'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-sample-01',
    bookingReference: 'ARN-2026-8942',
    guestId: 'guest-01',
    guest: INITIAL_GUESTS[0],
    checkInDate: '2026-11-12',
    checkOutDate: '2026-11-14',
    numNights: 2,
    numAdults: 2,
    numChildren: 0,
    numRooms: 1,
    roomTypeId: 'rt-deluxe-ac',
    roomType: INITIAL_ROOM_TYPES[0],
    assignedRoomId: 'room-101',
    assignedRoomNumber: '101',
    status: 'confirmed',
    subtotalPaise: 360000, // 2 * ₹1,800 = ₹3,600
    extraGuestFeePaise: 0,
    resortFeePaise: 0,
    taxPaise: 43200,       // 12% GST = ₹432
    discountPaise: 0,
    totalAmountPaise: 403200, // ₹4,032
    paidAmountPaise: 403200,
    specialRequests: 'Ground floor room preferred for senior citizens',
    createdAt: '2026-11-01T10:30:00Z',
    updatedAt: '2026-11-01T10:35:00Z'
  },
  {
    id: 'book-sample-02',
    bookingReference: 'ARN-2026-3190',
    guestId: 'guest-02',
    guest: INITIAL_GUESTS[1],
    checkInDate: '2026-11-11',
    checkOutDate: '2026-11-13',
    numNights: 2,
    numAdults: 12,
    numChildren: 0,
    numRooms: 1,
    roomTypeId: 'rt-bhakt-niwas-hall-402',
    roomType: INITIAL_ROOM_TYPES[3],
    assignedRoomId: 'room-402',
    assignedRoomNumber: '402 (Hall)',
    status: 'checked_in',
    subtotalPaise: 1100000, // 2 * ₹5,500 = ₹11,000
    extraGuestFeePaise: 80000, // 2 extra * ₹200 * 2 nights = ₹800
    resortFeePaise: 0,
    taxPaise: 141600, // 12% GST
    discountPaise: 0,
    totalAmountPaise: 1321600,
    paidAmountPaise: 1321600,
    checkedInAt: '2026-11-11T12:30:00Z',
    specialRequests: '3rd Floor Hall for 12 bhajan devotees',
    createdAt: '2026-11-05T14:35:00Z',
    updatedAt: '2026-11-11T12:30:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-sample-01',
    bookingId: 'book-sample-01',
    bookingReference: 'ARN-2026-8942',
    amountPaise: 403200,
    currency: 'INR',
    paymentMethod: 'razorpay',
    status: 'captured',
    razorpayOrderId: 'order_arn_8942',
    razorpayPaymentId: 'pay_rzp_arn_8942001',
    razorpaySignature: 'sig_mock_verified_8942',
    transactionReference: 'TXN-ARN-8942-01',
    createdAt: '2026-11-01T10:32:00Z',
    capturedAt: '2026-11-01T10:32:15Z'
  },
  {
    id: 'pay-sample-02',
    bookingId: 'book-sample-02',
    bookingReference: 'ARN-2026-3190',
    amountPaise: 1321600,
    currency: 'INR',
    paymentMethod: 'upi',
    status: 'captured',
    razorpayOrderId: 'order_arn_3190',
    razorpayPaymentId: 'pay_rzp_arn_3190001',
    razorpaySignature: 'sig_mock_verified_3190',
    transactionReference: 'TXN-ARN-3190-01',
    createdAt: '2026-11-05T14:36:00Z',
    capturedAt: '2026-11-05T14:36:20Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1001',
    fullName: 'Santosh Kulkarni',
    dateOfBirth: '1975-06-15',
    gender: 'male',
    phone: '+91 98220 12345',
    altPhone: '+91 98220 54321',
    email: 'santosh.kulkarni@example.com',
    addressLine1: '42 Datta Mandir Road',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '411030',
    documents: [
      {
        id: 'doc-1001-01',
        customerId: 'CUST-1001',
        documentType: 'aadhaar',
        documentNumberMasked: 'XXXX-XXXX-8921',
        issuingCountry: 'India',
        verificationStatus: 'verified',
        verifiedByStaffName: 'Yuvaraj Malave',
        verifiedAt: '2026-11-01T10:15:00Z',
        createdAt: '2026-11-01T10:00:00Z'
      }
    ],
    totalVisits: 1,
    totalSpentPaise: 403200,
    notes: 'Devotee of Shri Vitthal; prefers ground floor room for senior citizens.',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z'
  },
  {
    id: 'CUST-1002',
    fullName: 'Mahesh Patil & Dindi Mandal',
    dateOfBirth: '1982-08-20',
    gender: 'male',
    phone: '+91 94230 67890',
    email: 'mahesh.patil@example.com',
    addressLine1: 'Shivaji Chowk, Dindi Road',
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '416002',
    documents: [
      {
        id: 'doc-1002-01',
        customerId: 'CUST-1002',
        documentType: 'aadhaar',
        documentNumberMasked: 'XXXX-XXXX-3412',
        issuingCountry: 'India',
        verificationStatus: 'verified',
        verifiedByStaffName: 'Yuvaraj Malave',
        verifiedAt: '2026-11-05T14:40:00Z',
        createdAt: '2026-11-05T14:30:00Z'
      }
    ],
    totalVisits: 1,
    totalSpentPaise: 1321600,
    notes: 'Dindi group leader from Kolhapur; books 3rd floor hall for bhajan mandal.',
    createdAt: '2026-11-05T14:30:00Z',
    updatedAt: '2026-11-05T14:30:00Z'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-vitthal10',
    code: 'VITTHAL10',
    description: '10% Spiritual Pilgrim Discount on all rooms',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountPaise: 50000, // max ₹500 cap
    minBookingValuePaise: 120000, // min ₹1,200 booking
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    maxTotalRedemptions: 500,
    currentRedemptionsCount: 0,
    maxRedemptionsPerCustomer: 2,
    eligibleRoomTypeIds: [], // all rooms
    customerEligibility: 'all',
    isActive: true,
    adminNotes: 'Annual devotee welcome promotion',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'coup-darshan200',
    code: 'DARSHAN200',
    description: 'Flat ₹200 off for Deluxe A/C Rooms',
    discountType: 'fixed',
    discountValue: 20000, // ₹200
    minBookingValuePaise: 180000,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    maxTotalRedemptions: 300,
    currentRedemptionsCount: 0,
    maxRedemptionsPerCustomer: 1,
    eligibleRoomTypeIds: ['rt-deluxe-ac', 'rt-family-ac-suite'],
    customerEligibility: 'all',
    isActive: true,
    adminNotes: 'Deluxe AC promotion',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'coup-returning15',
    code: 'PANDHARPUR15',
    description: '15% Loyalty Discount for Returning Devotees',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscountPaise: 100000, // ₹1,000 cap
    minBookingValuePaise: 200000,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    maxTotalRedemptions: 200,
    currentRedemptionsCount: 0,
    maxRedemptionsPerCustomer: 3,
    eligibleRoomTypeIds: [],
    customerEligibility: 'returning',
    isActive: true,
    adminNotes: 'Encouraging repeated pilgrimages',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_POST_CHECKOUT_CAMPAIGNS: PostCheckoutCampaign[] = [
  {
    id: 'campaign-checkout-loyalty-01',
    name: 'Pilgrim Return Loyalty Invitation',
    isEnabled: true,
    discountType: 'percentage',
    discountValue: 15, // 15% discount on next stay
    maxDiscountPaise: 75000, // ₹750 max discount
    minBookingValuePaise: 120000, // ₹1,200 min booking
    validityDays: 90, // Valid for 90 days from checkout
    emailSubject: 'Thank You for Visiting Pandharpur! Here is a Special Gift 🎁',
    promotionalMessage: 'We deeply cherish your devotion and pilgrimage to Shri Vitthal-Rukmini Mandir. To welcome you and your family on your next Darshan, enjoy an exclusive 15% discount.',
    generateUniqueCodePerCustomer: true,
    allowRepeatedIssuanceAfterFutureStays: true,
    cooldownDaysBetweenIssuance: 14,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'ctx-sample-01',
    receiptNumber: 'RCP-2026-8942',
    bookingId: 'book-sample-01',
    bookingReference: 'ARN-2026-8942',
    transactionType: 'payment',
    amountPaise: 403200,
    cashierId: 'user-desk-01',
    cashierName: 'Pandharpur Front Desk Reception',
    notes: 'Online captured via gateway settled to bank',
    createdAt: '2026-11-01T10:32:00Z'
  }
];

export const INITIAL_CASH_SHIFTS: CashShiftReconciliation[] = [
  {
    id: 'shift-sample-01',
    shiftDate: '2026-11-12',
    openedByStaffId: 'user-desk-01',
    openedByStaffName: 'Pandharpur Front Desk Reception',
    openedAt: '2026-11-12T06:00:00Z',
    openingFloatPaise: 500000, // ₹5,000 opening float
    status: 'open'
  }
];
