import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
  Property, 
  RoomType, 
  Room, 
  Guest, 
  Booking, 
  Payment, 
  User, 
  AuditLog, 
  HousekeepingStatus,
  BookingStatus,
  Customer,
  CustomerIdentityDocument,
  BookingGuestItem,
  CashTransaction,
  CashShiftReconciliation,
  Coupon,
  CouponRedemption,
  PostCheckoutCampaign,
  EmailNotificationRecord,
  DataImportJob,
  PaymentStatus,
  PaymentMethod,
  IdDocumentType,
  VerificationStatus
} from '../types';
import { 
  INITIAL_PROPERTY, 
  INITIAL_ROOM_TYPES, 
  INITIAL_ROOMS, 
  INITIAL_GUESTS, 
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS, 
  INITIAL_PAYMENTS, 
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_CASH_SHIFTS,
  INITIAL_COUPONS,
  INITIAL_POST_CHECKOUT_CAMPAIGNS,
  INITIAL_STAFF_USERS 
} from './seed-data';
import { doIntervalsOverlap, calculateNights, isHoldExpired } from '../utils/dates';
import { calculatePricing } from '../utils/currency';
import { resendService } from '../services/resend';

interface DatabaseSchema {
  property: Property;
  roomTypes: RoomType[];
  rooms: Room[];
  guests: Guest[];
  customers: Customer[];
  bookings: Booking[];
  payments: Payment[];
  cashTransactions: CashTransaction[];
  cashShifts: CashShiftReconciliation[];
  coupons: Coupon[];
  couponRedemptions: CouponRedemption[];
  postCheckoutCampaigns: PostCheckoutCampaign[];
  emailNotifications: EmailNotificationRecord[];
  dataImportJobs: DataImportJob[];
  staffUsers: User[];
  auditLogs: AuditLog[];
}

// Serverless detection & writable storage path resolution
function isServerlessEnvironment(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NETLIFY ||
    (process.env.NODE_ENV === 'production' && !fs.existsSync(path.join(process.cwd(), '.git')))
  );
}

function getDatabaseFilePath(): { dir: string; file: string; isServerless: boolean } {
  if (isServerlessEnvironment()) {
    const tmpDir = os.tmpdir();
    return {
      dir: tmpDir,
      file: path.join(tmpDir, 'lodge_database.json'),
      isServerless: true
    };
  }

  const localDir = path.join(process.cwd(), 'data');
  return {
    dir: localDir,
    file: path.join(localDir, 'lodge_database.json'),
    isServerless: false
  };
}

class LodgeRepository {
  private inMemoryDb: DatabaseSchema | null = null;
  private isWriting: boolean = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): DatabaseSchema {
    if (this.inMemoryDb) {
      this.sweepExpiredHolds();
      return this.inMemoryDb;
    }

    const { dir, file, isServerless } = getDatabaseFilePath();

    try {
      if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(/*turbopackIgnore: true*/ file)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ file, 'utf-8');
        this.inMemoryDb = JSON.parse(raw) as DatabaseSchema;
      } else {
        // In serverless, if /tmp is fresh, copy from bundled seed data
        const bundledFile = path.join(process.cwd(), 'data', 'lodge_database.json');
        if (isServerless && fs.existsSync(bundledFile)) {
          try {
            const bundledRaw = fs.readFileSync(bundledFile, 'utf-8');
            this.inMemoryDb = JSON.parse(bundledRaw) as DatabaseSchema;
          } catch {
            this.inMemoryDb = null;
          }
        }

        if (!this.inMemoryDb) {
          // Seed default database
          this.inMemoryDb = {
            property: INITIAL_PROPERTY,
            roomTypes: INITIAL_ROOM_TYPES,
            rooms: INITIAL_ROOMS,
            guests: INITIAL_GUESTS,
            customers: INITIAL_CUSTOMERS,
            bookings: INITIAL_BOOKINGS,
            payments: INITIAL_PAYMENTS,
            cashTransactions: INITIAL_CASH_TRANSACTIONS,
            cashShifts: INITIAL_CASH_SHIFTS,
            coupons: INITIAL_COUPONS,
            couponRedemptions: [],
            postCheckoutCampaigns: INITIAL_POST_CHECKOUT_CAMPAIGNS,
            emailNotifications: [],
            dataImportJobs: [],
            staffUsers: INITIAL_STAFF_USERS,
            auditLogs: []
          };
        }

        try {
          fs.writeFileSync(file, JSON.stringify(this.inMemoryDb, null, 2), 'utf-8');
        } catch (writeErr) {
          console.warn('Initial storage write notice:', writeErr);
        }
      }

      // Safe non-destructive schema migrations for existing JSON on disk
      if (this.inMemoryDb) {
        if (!this.inMemoryDb.customers) this.inMemoryDb.customers = INITIAL_CUSTOMERS;
        if (!this.inMemoryDb.cashTransactions) this.inMemoryDb.cashTransactions = INITIAL_CASH_TRANSACTIONS;
        if (!this.inMemoryDb.cashShifts) this.inMemoryDb.cashShifts = INITIAL_CASH_SHIFTS;
        if (!this.inMemoryDb.coupons) this.inMemoryDb.coupons = INITIAL_COUPONS;
        if (!this.inMemoryDb.couponRedemptions) this.inMemoryDb.couponRedemptions = [];
        if (!this.inMemoryDb.postCheckoutCampaigns) this.inMemoryDb.postCheckoutCampaigns = INITIAL_POST_CHECKOUT_CAMPAIGNS;
        if (!this.inMemoryDb.emailNotifications) this.inMemoryDb.emailNotifications = [];
        if (!this.inMemoryDb.dataImportJobs) this.inMemoryDb.dataImportJobs = [];
      }
    } catch {
      // In-memory fallback if file system write is constrained
      this.inMemoryDb = {
        property: INITIAL_PROPERTY,
        roomTypes: INITIAL_ROOMTypesFallback(),
        rooms: INITIAL_ROOMS,
        guests: INITIAL_GUESTS,
        customers: INITIAL_CUSTOMERS,
        bookings: INITIAL_BOOKINGS,
        payments: INITIAL_PAYMENTS,
        cashTransactions: INITIAL_CASH_TRANSACTIONS,
        cashShifts: INITIAL_CASH_SHIFTS,
        coupons: INITIAL_COUPONS,
        couponRedemptions: [],
        postCheckoutCampaigns: INITIAL_POST_CHECKOUT_CAMPAIGNS,
        emailNotifications: [],
        dataImportJobs: [],
        staffUsers: INITIAL_STAFF_USERS,
        auditLogs: []
      };
    }

    this.sweepExpiredHolds();
    return this.inMemoryDb;
  }

  private async persist(): Promise<void> {
    if (!this.inMemoryDb) return;
    try {
      const { dir, file } = getDatabaseFilePath();
      if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(/*turbopackIgnore: true*/ file, JSON.stringify(this.inMemoryDb, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Repository file persist warning:', err);
    }
  }

  /**
   * Sweeps and marks expired 15-minute checkout holds as 'expired'
   */
  private sweepExpiredHolds(): void {
    if (!this.inMemoryDb) return;
    let modified = false;
    for (const b of this.inMemoryDb.bookings) {
      if (b.status === 'hold' && isHoldExpired(b.holdExpiresAt)) {
        b.status = 'expired';
        modified = true;
      }
    }
    if (modified) {
      this.persist();
    }
  }

  // --- PROPERTY ---
  async getProperty(): Promise<Property> {
    const db = this.ensureInitialized();
    return db.property;
  }

  async updateProperty(updates: Partial<Property>): Promise<Property> {
    const db = this.ensureInitialized();
    db.property = { ...db.property, ...updates };
    await this.persist();
    return db.property;
  }

  // --- ROOM TYPES ---
  async getRoomTypes(): Promise<RoomType[]> {
    const db = this.ensureInitialized();
    return db.roomTypes.filter(rt => rt.isActive);
  }

  async getAllRoomTypes(): Promise<RoomType[]> {
    const db = this.ensureInitialized();
    return db.roomTypes;
  }

  async getRoomTypeBySlug(slug: string): Promise<RoomType | null> {
    const db = this.ensureInitialized();
    return db.roomTypes.find(rt => rt.slug === slug) || null;
  }

  async getRoomTypeById(id: string): Promise<RoomType | null> {
    const db = this.ensureInitialized();
    return db.roomTypes.find(rt => rt.id === id) || null;
  }

  async upsertRoomType(roomType: RoomType): Promise<RoomType> {
    const db = this.ensureInitialized();
    const idx = db.roomTypes.findIndex(rt => rt.id === roomType.id);
    if (idx >= 0) {
      db.roomTypes[idx] = roomType;
    } else {
      db.roomTypes.push(roomType);
    }
    await this.persist();
    return roomType;
  }

  // --- PHYSICAL ROOMS ---
  async getRooms(): Promise<(Room & { roomTypeName?: string })[]> {
    const db = this.ensureInitialized();
    return db.rooms.map(r => {
      const rt = db.roomTypes.find(t => t.id === r.roomTypeId);
      return {
        ...r,
        roomTypeName: rt?.name || 'Standard'
      };
    });
  }

  async getRoomsByRoomType(roomTypeId: string): Promise<Room[]> {
    const db = this.ensureInitialized();
    return db.rooms.filter(r => r.roomTypeId === roomTypeId && r.isOperational);
  }

  async updateRoomHousekeeping(roomId: string, status: HousekeepingStatus, notes?: string): Promise<Room | null> {
    const db = this.ensureInitialized();
    const room = db.rooms.find(r => r.id === roomId);
    if (!room) return null;
    room.housekeepingStatus = status;
    if (notes !== undefined) {
      room.notes = notes;
    }
    await this.persist();
    return room;
  }

  // --- AVAILABILITY ENGINE ---
  /**
   * Evaluates exact availability for each room type over the date range [checkIn, checkOut).
   * Check-in is inclusive, check-out is exclusive.
   * Excludes expired holds, cancelled bookings, and expired bookings.
   */
  async checkAvailability(
    checkIn: string,
    checkOut: string,
    numAdults: number = 2
  ): Promise<{
    roomType: RoomType;
    availableRoomsCount: number;
    totalRoomsCount: number;
    isAvailable: boolean;
    pricing: ReturnType<typeof calculatePricing>;
  }[]> {
    const db = this.ensureInitialized();
    this.sweepExpiredHolds();

    const nights = calculateNights(checkIn, checkOut);
    const activeBookings = db.bookings.filter(b => 
      ['hold', 'confirmed', 'checked_in'].includes(b.status) &&
      (b.status !== 'hold' || !isHoldExpired(b.holdExpiresAt))
    );

    const results = [];

    for (const rt of db.roomTypes.filter(t => t.isActive)) {
      // Find all physical operational rooms for this room type
      const physicalRooms = db.rooms.filter(r => r.roomTypeId === rt.id && r.isOperational);
      const totalRoomsCount = physicalRooms.length;

      // Filter bookings that belong to this room type and overlap the requested dates
      const overlappingBookings = activeBookings.filter(b => 
        b.roomTypeId === rt.id &&
        doIntervalsOverlap(b.checkInDate, b.checkOutDate, checkIn, checkOut)
      );

      // Bookings that have already been assigned to specific physical rooms
      const occupiedAssignedRoomIds = new Set(
        overlappingBookings
          .map(b => b.assignedRoomId)
          .filter((id): id is string => Boolean(id))
      );

      // Unassigned bookings reserve a slot from the remaining pool
      const unassignedCount = overlappingBookings.filter(b => !b.assignedRoomId).length;

      // Available physical rooms = operational rooms not assigned minus unassigned reservations
      const availableRoomsCount = Math.max(
        0,
        totalRoomsCount - occupiedAssignedRoomIds.size - unassignedCount
      );

      const pricing = calculatePricing({
        basePricePerNightPaise: rt.basePricePaise,
        numNights: nights,
        numAdults,
        baseOccupancy: rt.baseOccupancy,
        extraGuestFeePaise: rt.extraGuestFeePaise
      });

      results.push({
        roomType: rt,
        availableRoomsCount,
        totalRoomsCount,
        isAvailable: availableRoomsCount > 0,
        pricing
      });
    }

    return results;
  }

  // --- BOOKING ENGINE ---
  /**
   * Atomically acquires a 15-minute checkout hold on a room type
   */
  async createBookingHold(params: {
    roomTypeId: string;
    checkInDate: string;
    checkOutDate: string;
    numAdults: number;
    numChildren: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string;
    couponCode?: string;
  }): Promise<{ booking: Booking; reference: string }> {
    const db = this.ensureInitialized();
    this.sweepExpiredHolds();

    const rt = db.roomTypes.find(t => t.id === params.roomTypeId);
    if (!rt) {
      throw new Error('Room type not found');
    }

    // Double-check availability inside the transaction
    const avail = await this.checkAvailability(params.checkInDate, params.checkOutDate, params.numAdults);
    const rtAvail = avail.find(a => a.roomType.id === params.roomTypeId);

    if (!rtAvail || rtAvail.availableRoomsCount <= 0) {
      throw new Error('No rooms currently available for the selected dates');
    }

    // Create or find guest
    let guest = db.guests.find(g => g.email.toLowerCase() === params.guestEmail.toLowerCase());
    if (!guest) {
      guest = {
        id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fullName: params.guestName,
        email: params.guestEmail,
        phone: params.guestPhone,
        specialRequests: params.specialRequests,
        createdAt: new Date().toISOString()
      };
      db.guests.push(guest);
    } else {
      guest.fullName = params.guestName;
      guest.phone = params.guestPhone;
    }

    const nights = calculateNights(params.checkInDate, params.checkOutDate);
    const pricing = calculatePricing({
      basePricePerNightPaise: rt.basePricePaise,
      numNights: nights,
      numAdults: params.numAdults,
      baseOccupancy: rt.baseOccupancy,
      extraGuestFeePaise: rt.extraGuestFeePaise
    });

    let discountPaise = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (params.couponCode && params.couponCode.trim()) {
      const couponValidation = await this.validateCoupon({
        code: params.couponCode.trim(),
        roomTypeId: params.roomTypeId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        numNights: nights,
        subtotalPaise: pricing.subtotalPaise,
        customerEmail: params.guestEmail
      });

      if (couponValidation.isValid) {
        discountPaise = couponValidation.discountPaise;
        appliedCouponCode = couponValidation.coupon?.code;
      }
    }

    const finalTotalPaise = Math.max(0, pricing.totalAmountPaise - discountPaise);

    // Generate unique booking reference: e.g. ARN-2026-7841
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `ARN-2026-${randSuffix}`;

    // 15-minute temporary hold timestamp
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const booking: Booking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookingReference,
      guestId: guest.id,
      guest,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      numNights: nights,
      numAdults: params.numAdults,
      numChildren: params.numChildren,
      numRooms: 1,
      roomTypeId: rt.id,
      roomType: rt,
      status: 'hold',
      subtotalPaise: pricing.subtotalPaise,
      extraGuestFeePaise: pricing.extraGuestFeePaise,
      resortFeePaise: pricing.resortFeePaise,
      taxPaise: pricing.taxPaise,
      discountPaise,
      totalAmountPaise: finalTotalPaise,
      paidAmountPaise: 0,
      couponCode: appliedCouponCode,
      couponDiscountPaise: discountPaise,
      holdExpiresAt,
      specialRequests: params.specialRequests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.bookings.push(booking);
    await this.persist();

    return { booking, reference: bookingReference };
  }

  /**
   * Confirms a booking upon successful server-side payment verification
   */
  async confirmBookingPayment(params: {
    bookingReference: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paymentMethod?: Payment['paymentMethod'];
    gatewayResponse?: Record<string, unknown>;
    fallbackBooking?: Booking;
    fallbackGuest?: Guest;
  }): Promise<Booking> {
    const db = this.ensureInitialized();
    let booking = db.bookings.find(
      b => b.bookingReference.toUpperCase() === params.bookingReference.toUpperCase()
    );

    // If serverless container isolation caused hold to not be in this container's memory,
    // seamlessly restore from cryptographically verified fallback booking
    if (!booking && params.fallbackBooking) {
      booking = params.fallbackBooking;
      db.bookings.push(booking);
      if (params.fallbackGuest && !db.guests.some(g => g.id === params.fallbackGuest!.id)) {
        db.guests.push(params.fallbackGuest);
      }
    }

    if (!booking) {
      throw new Error(`Booking reference ${params.bookingReference} not found`);
    }

    if (booking.status === 'confirmed' || booking.status === 'checked_in') {
      // Idempotent return if already confirmed
      return booking;
    }

    if (booking.status === 'hold' && isHoldExpired(booking.holdExpiresAt)) {
      throw new Error('This checkout hold has expired. Please restart the reservation.');
    }

    // Auto-assign available physical room if unassigned
    const candidateRooms = db.rooms.filter(r => r.roomTypeId === booking.roomTypeId && r.isOperational);
    const overlappingAssignedIds = new Set(
      db.bookings
        .filter(b => 
          b.id !== booking.id &&
          ['confirmed', 'checked_in'].includes(b.status) &&
          doIntervalsOverlap(b.checkInDate, b.checkOutDate, booking.checkInDate, booking.checkOutDate) &&
          b.assignedRoomId
        )
        .map(b => b.assignedRoomId as string)
    );

    const freeRoom = candidateRooms.find(r => !overlappingAssignedIds.has(r.id));
    if (freeRoom) {
      booking.assignedRoomId = freeRoom.id;
      booking.assignedRoomNumber = freeRoom.roomNumber;
    }

    booking.status = 'confirmed';
    booking.paidAmountPaise = booking.totalAmountPaise;
    booking.holdExpiresAt = undefined;
    booking.updatedAt = new Date().toISOString();

    // Create payment entry
    const payment: Payment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      amountPaise: booking.totalAmountPaise,
      currency: 'INR',
      paymentMethod: params.paymentMethod || 'razorpay',
      status: 'captured',
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature,
      transactionReference: `TXN-${booking.bookingReference}-${Date.now().toString().slice(-4)}`,
      gatewayResponse: params.gatewayResponse,
      createdAt: new Date().toISOString(),
      capturedAt: new Date().toISOString()
    };

    db.payments.push(payment);

    // Consume coupon redemption if coupon was applied
    if (booking.couponCode) {
      await this.consumeCoupon(
        booking.couponCode,
        booking.bookingReference,
        booking.guest?.email || 'guest@aarunodya.com',
        booking.discountPaise || 0,
        booking.subtotalPaise,
        booking.customerId
      );
    }

    await this.persist();

    return booking;
  }

  /**
   * Syncs / restores a booking record into the database across serverless lambdas
   */
  async syncBookingRecord(data: {
    booking: Booking;
    guest?: Guest;
    payments?: Payment[];
    roomType?: RoomType;
  }): Promise<Booking> {
    const db = this.ensureInitialized();
    const ref = data.booking.bookingReference.toUpperCase();
    const existingIndex = db.bookings.findIndex(b => b.bookingReference.toUpperCase() === ref);

    if (existingIndex >= 0) {
      db.bookings[existingIndex] = {
        ...db.bookings[existingIndex],
        ...data.booking,
        updatedAt: new Date().toISOString()
      };
    } else {
      db.bookings.push(data.booking);
    }

    if (data.guest) {
      const gIndex = db.guests.findIndex(
        g => g.id === data.guest!.id || g.email.toLowerCase() === data.guest!.email.toLowerCase()
      );
      if (gIndex >= 0) {
        db.guests[gIndex] = { ...db.guests[gIndex], ...data.guest };
      } else {
        db.guests.push(data.guest);
      }
    }

    if (data.payments && data.payments.length > 0) {
      for (const p of data.payments) {
        const pIndex = db.payments.findIndex(
          item => item.id === p.id || item.transactionReference === p.transactionReference
        );
        if (pIndex >= 0) {
          db.payments[pIndex] = { ...db.payments[pIndex], ...p };
        } else {
          db.payments.push(p);
        }
      }
    }

    await this.persist();
    return data.booking;
  }

  // --- BOOKING RETRIEVAL & LOOKUP ---
  async getBookingByReference(reference: string, guestEmail?: string): Promise<{
    booking: Booking;
    roomType?: RoomType;
    guest?: Guest;
    payments: Payment[];
  } | null> {
    const db = this.ensureInitialized();
    const booking = db.bookings.find(b => b.bookingReference.toUpperCase() === reference.toUpperCase());
    if (!booking) return null;

    const guest = db.guests.find(g => g.id === booking.guestId);
    if (guestEmail && guest && guest.email.toLowerCase() !== guestEmail.toLowerCase()) {
      return null; // Guest verification mismatch
    }

    const roomType = db.roomTypes.find(rt => rt.id === booking.roomTypeId);
    const payments = db.payments.filter(p => p.bookingId === booking.id);

    return {
      booking: {
        ...booking,
        guest,
        roomType
      },
      roomType,
      guest,
      payments
    };
  }

  async getAllBookings(): Promise<Booking[]> {
    const db = this.ensureInitialized();
    return db.bookings.map(b => ({
      ...b,
      guest: db.guests.find(g => g.id === b.guestId),
      roomType: db.roomTypes.find(rt => rt.id === b.roomTypeId)
    }));
  }

  async updateBookingStatus(
    bookingId: string, 
    status: BookingStatus, 
    extra?: { cancellationReason?: string; assignedRoomId?: string }
  ): Promise<Booking | null> {
    const db = this.ensureInitialized();
    const b = db.bookings.find(item => item.id === bookingId);
    if (!b) return null;

    b.status = status;
    b.updatedAt = new Date().toISOString();

    if (status === 'checked_in') {
      b.checkedInAt = new Date().toISOString();
      if (extra?.assignedRoomId) {
        b.assignedRoomId = extra.assignedRoomId;
        const r = db.rooms.find(rm => rm.id === extra.assignedRoomId);
        if (r) b.assignedRoomNumber = r.roomNumber;
      }
    } else if (status === 'checked_out') {
      b.checkedOutAt = new Date().toISOString();
      // Set room housekeeping to dirty
      if (b.assignedRoomId) {
        const r = db.rooms.find(rm => rm.id === b.assignedRoomId);
        if (r) r.housekeepingStatus = 'dirty';
      }
    } else if (status === 'cancelled') {
      b.cancelledAt = new Date().toISOString();
      b.cancellationReason = extra?.cancellationReason || 'Cancelled by guest / staff';
    }

    await this.persist();
    return b;
  }

  async updateGuest(guestId: string, updates: Partial<Guest>): Promise<Guest | null> {
    const db = this.ensureInitialized();
    const guest = db.guests.find(g => g.id === guestId);
    if (!guest) return null;
    Object.assign(guest, updates);
    await this.persist();
    return guest;
  }

  // --- STAFF & RBAC ---
  async authenticateStaff(email: string, passwordPlain: string): Promise<User | null> {
    const db = this.ensureInitialized();
    const user = db.staffUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
    if (!user) return null;
    if (user.passwordHash !== passwordPlain) return null;
    return user;
  }

  async getStaffUsers(): Promise<User[]> {
    const db = this.ensureInitialized();
    return db.staffUsers;
  }

  // --- DASHBOARD ANALYTICS ---
  async getDashboardKpis(): Promise<{
    occupancyPercent: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    todaysArrivals: number;
    todaysDepartures: number;
    totalRevenuePaise: number;
    todayCollectionPaise: number;
    monthlyRevenuePaise: number;
    pendingBalancePaise: number;
    totalBookingsCount: number;
    walkinBookingsCount: number;
    onlineBookingsCount: number;
    cashBookingsCount: number;
    couponRedemptionsCount: number;
    activeBookingsCount: number;
    cleanRoomsCount: number;
    dirtyRoomsCount: number;
    inspectingRoomsCount: number;
  }> {
    const db = this.ensureInitialized();
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    const operationalRooms = db.rooms.filter(r => r.isOperational);
    const totalRooms = operationalRooms.length;

    // Occupied rooms currently checked-in
    const checkedInBookings = db.bookings.filter(b => b.status === 'checked_in');
    const occupiedRooms = checkedInBookings.length;
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);
    const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Today's arrivals: confirmed bookings checking in today
    const todaysArrivals = db.bookings.filter(b => 
      b.checkInDate === today && ['confirmed', 'hold'].includes(b.status)
    ).length;

    // Today's departures: checked-in bookings checking out today
    const todaysDepartures = db.bookings.filter(b => 
      b.checkOutDate === today && b.status === 'checked_in'
    ).length;

    // Total revenue from captured payments and cash transactions
    const onlineRevenuePaise = db.payments
      .filter(p => p.status === 'captured')
      .reduce((sum, p) => sum + p.amountPaise, 0);

    const cashRevenuePaise = (db.cashTransactions || [])
      .filter(tx => tx.transactionType === 'payment')
      .reduce((sum, tx) => sum + tx.amountPaise, 0);

    const totalRevenuePaise = onlineRevenuePaise + cashRevenuePaise;

    // Today's collections (both cash inflow and online settlements today)
    const todayCashCollectionPaise = (db.cashTransactions || [])
      .filter(tx => tx.transactionType === 'payment' && tx.createdAt.startsWith(today))
      .reduce((sum, tx) => sum + tx.amountPaise, 0);

    const todayOnlineCollectionPaise = db.payments
      .filter(p => p.status === 'captured' && p.createdAt.startsWith(today))
      .reduce((sum, p) => sum + p.amountPaise, 0);

    const todayCollectionPaise = todayCashCollectionPaise + todayOnlineCollectionPaise;

    // Monthly revenue
    const monthlyRevenuePaise = 
      db.payments
        .filter(p => p.status === 'captured' && p.createdAt.startsWith(currentMonth))
        .reduce((sum, p) => sum + p.amountPaise, 0) +
      (db.cashTransactions || [])
        .filter(tx => tx.transactionType === 'payment' && tx.createdAt.startsWith(currentMonth))
        .reduce((sum, tx) => sum + tx.amountPaise, 0);

    // Pending balances across active stays
    const pendingBalancePaise = db.bookings
      .filter(b => ['confirmed', 'checked_in'].includes(b.status))
      .reduce((sum, b) => {
        const balance = b.balanceDuePaise ?? b.remainingBalancePaise ?? Math.max(0, b.totalAmountPaise - (b.paidAmountPaise || 0));
        return sum + balance;
      }, 0);

    // Booking channel counts
    const totalBookingsCount = db.bookings.length;
    const walkinBookingsCount = db.bookings.filter(b => 
      b.source === 'walkin' || b.bookingReference.startsWith('ARN-WALK')
    ).length;
    const onlineBookingsCount = Math.max(0, totalBookingsCount - walkinBookingsCount);
    const cashBookingsCount = db.bookings.filter(b => 
      (b as any).cashPaidPaise > 0 || (b as any).paymentMethod === 'cash' || b.source === 'walkin' || b.bookingReference.startsWith('ARN-WALK')
    ).length;

    const couponRedemptionsCount = (db.couponRedemptions || []).length;
    const activeBookingsCount = db.bookings.filter(b => 
      ['confirmed', 'checked_in'].includes(b.status)
    ).length;

    const cleanRoomsCount = db.rooms.filter(r => r.housekeepingStatus === 'clean').length;
    const dirtyRoomsCount = db.rooms.filter(r => r.housekeepingStatus === 'dirty').length;
    const inspectingRoomsCount = db.rooms.filter(r => r.housekeepingStatus === 'inspecting').length;

    return {
      occupancyPercent,
      totalRooms,
      occupiedRooms,
      availableRooms,
      todaysArrivals,
      todaysDepartures,
      totalRevenuePaise,
      todayCollectionPaise,
      monthlyRevenuePaise,
      pendingBalancePaise,
      totalBookingsCount,
      walkinBookingsCount,
      onlineBookingsCount,
      cashBookingsCount,
      couponRedemptionsCount,
      activeBookingsCount,
      cleanRoomsCount,
      dirtyRoomsCount,
      inspectingRoomsCount
    };
  }

  // =========================================================================
  // --- AUDIT LOGGING ---
  // =========================================================================
  async logAudit(entry: {
    userId?: string;
    userEmail?: string;
    action: string;
    entityType: AuditLog['entityType'];
    entityId: string;
    details: string;
    ipAddress?: string;
  }): Promise<void> {
    const db = this.ensureInitialized();
    db.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...entry,
      createdAt: new Date().toISOString()
    });
    if (db.auditLogs.length > 2000) {
      db.auditLogs = db.auditLogs.slice(0, 2000);
    }
    await this.persist();
  }

  async getAuditLogs(entityType?: AuditLog['entityType'], entityId?: string): Promise<AuditLog[]> {
    const db = this.ensureInitialized();
    let logs = db.auditLogs;
    if (entityType) {
      logs = logs.filter(l => l.entityType === entityType);
    }
    if (entityId) {
      logs = logs.filter(l => l.entityId === entityId);
    }
    return logs.slice(0, 200);
  }

  // =========================================================================
  // --- FEATURE 1: RECEPTION CASH BOOKING & CASH TRANSACTIONS ---
  // =========================================================================
  async searchExistingCustomers(query: string): Promise<Customer[]> {
    const db = this.ensureInitialized();
    const q = query.trim().toLowerCase();
    if (!q) return db.customers.filter(c => !c.isMerged).slice(0, 10);
    return db.customers.filter(c =>
      !c.isMerged && (
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      )
    ).slice(0, 20);
  }

  async createReceptionBooking(params: {
    roomTypeId: string;
    assignedRoomId?: string;
    checkInDate: string;
    checkOutDate: string;
    numAdults: number;
    numChildren: number;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    guestAddress?: string;
    guestCity?: string;
    guestState?: string;
    guestIdProofType?: IdDocumentType;
    guestIdProofNumber?: string;
    additionalGuests?: BookingGuestItem[];
    couponCode?: string;
    cashAmountPaidPaise: number;
    paymentMethod?: PaymentMethod;
    autoCheckIn?: boolean;
    specialRequests?: string;
    staffId: string;
    staffName: string;
  }): Promise<{
    booking: Booking;
    payment?: Payment;
    cashTransaction?: CashTransaction;
    receiptNumber?: string;
  }> {
    const db = this.ensureInitialized();
    this.sweepExpiredHolds();

    if (params.checkInDate >= params.checkOutDate) {
      throw new Error('Check-out date must be strictly after check-in date.');
    }

    const rt = db.roomTypes.find(t => t.id === params.roomTypeId);
    if (!rt) throw new Error('Selected room type category was not found.');

    // Availability validation
    const avail = await this.checkAvailability(params.checkInDate, params.checkOutDate, params.numAdults);
    const rtAvail = avail.find(a => a.roomType.id === params.roomTypeId);
    if (!rtAvail || rtAvail.availableRoomsCount <= 0) {
      throw new Error('No rooms available in this category for the requested dates.');
    }

    // Determine physical room assignment
    let allocatedRoom: Room | undefined;
    const candidateRooms = db.rooms.filter(r => r.roomTypeId === params.roomTypeId && r.isOperational);
    
    // Check which rooms are occupied over interval
    const activeBookings = db.bookings.filter(b =>
      ['confirmed', 'checked_in'].includes(b.status) &&
      doIntervalsOverlap(b.checkInDate, b.checkOutDate, params.checkInDate, params.checkOutDate)
    );
    const occupiedRoomIds = new Set(activeBookings.map(b => b.assignedRoomId).filter(Boolean));

    if (params.assignedRoomId) {
      allocatedRoom = candidateRooms.find(r => r.id === params.assignedRoomId || r.roomNumber === params.assignedRoomId);
      if (!allocatedRoom) {
        throw new Error('Selected physical room is not recognized or not operational.');
      }
      if (occupiedRoomIds.has(allocatedRoom.id)) {
        throw new Error(`Room ${allocatedRoom.roomNumber} is already occupied during these dates.`);
      }
    } else {
      allocatedRoom = candidateRooms.find(r => !occupiedRoomIds.has(r.id));
      if (!allocatedRoom) {
        throw new Error('Could not automatically assign an operational room.');
      }
    }

    const nights = calculateNights(params.checkInDate, params.checkOutDate);
    const pricing = calculatePricing({
      basePricePerNightPaise: rt.basePricePaise,
      numNights: nights,
      numAdults: params.numAdults,
      baseOccupancy: rt.baseOccupancy,
      extraGuestFeePaise: rt.extraGuestFeePaise
    });

    let discountPaise = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (params.couponCode && params.couponCode.trim()) {
      const couponValidation = await this.validateCoupon({
        code: params.couponCode.trim(),
        roomTypeId: params.roomTypeId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        numNights: nights,
        subtotalPaise: pricing.subtotalPaise,
        customerEmail: params.guestEmail
      });

      if (!couponValidation.isValid) {
        throw new Error(`Coupon rejected: ${couponValidation.reason}`);
      }

      discountPaise = couponValidation.discountPaise;
      appliedCouponCode = couponValidation.coupon?.code;
    }

    const totalAmountPaise = Math.max(0, pricing.totalAmountPaise - discountPaise);
    const paidPaise = Math.max(0, Math.min(params.cashAmountPaidPaise, totalAmountPaise));
    const remainingBalancePaise = Math.max(0, totalAmountPaise - paidPaise);

    let paymentStatus: PaymentStatus = 'unpaid';
    if (paidPaise >= totalAmountPaise && totalAmountPaise > 0) {
      paymentStatus = 'paid';
    } else if (paidPaise > 0) {
      paymentStatus = 'partially_paid';
    }

    // Link or create customer profile
    let customer = db.customers.find(c => 
      c.phone.replace(/\D/g, '') === params.guestPhone.replace(/\D/g, '') ||
      (params.guestEmail && c.email.toLowerCase() === params.guestEmail.toLowerCase())
    );

    if (!customer) {
      customer = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: params.guestName,
        phone: params.guestPhone,
        email: params.guestEmail || `${params.guestPhone.replace(/\D/g, '')}@guest.aarunodya.com`,
        addressLine1: params.guestAddress,
        city: params.guestCity || 'Pandharpur',
        state: params.guestState || 'Maharashtra',
        country: 'India',
        documents: [],
        totalVisits: 1,
        totalSpentPaise: totalAmountPaise,
        notes: params.specialRequests,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.customers.push(customer);
    } else {
      customer.totalVisits += 1;
      customer.totalSpentPaise += totalAmountPaise;
      customer.fullName = params.guestName;
      if (params.guestCity) customer.city = params.guestCity;
      customer.updatedAt = new Date().toISOString();
    }

    // Add document to customer if supplied
    if (params.guestIdProofNumber && params.guestIdProofType) {
      const masked = params.guestIdProofNumber.length > 4 
        ? `XXXX-XXXX-${params.guestIdProofNumber.slice(-4)}` 
        : params.guestIdProofNumber;
      
      const docExists = customer.documents.some(d => d.documentNumberMasked === masked);
      if (!docExists) {
        customer.documents.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          customerId: customer.id,
          documentType: params.guestIdProofType,
          documentNumberMasked: masked,
          issuingCountry: 'India',
          verificationStatus: 'verified',
          verifiedByStaffId: params.staffId,
          verifiedByStaffName: params.staffName,
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
    }

    const bookingReference = `ARN-WALK-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const receiptNumber = paidPaise > 0 ? `RCP-ARN-${Date.now().toString().slice(-4)}` : undefined;

    const guestObj: Guest = {
      id: `guest-${Date.now()}`,
      fullName: params.guestName,
      email: customer.email,
      phone: params.guestPhone,
      idProofType: params.guestIdProofType,
      idProofNumber: params.guestIdProofNumber,
      specialRequests: params.specialRequests,
      city: params.guestCity,
      state: params.guestState,
      createdAt: new Date().toISOString()
    };
    db.guests.push(guestObj);

    const booking: Booking = {
      id: bookingId,
      bookingReference,
      guestId: guestObj.id,
      customerId: customer.id,
      guest: guestObj,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      numNights: nights,
      numAdults: params.numAdults,
      numChildren: params.numChildren,
      numRooms: 1,
      roomTypeId: rt.id,
      roomType: rt,
      assignedRoomId: allocatedRoom.id,
      assignedRoomNumber: allocatedRoom.roomNumber,
      status: params.autoCheckIn ? 'checked_in' : 'confirmed',
      paymentStatus,
      subtotalPaise: pricing.subtotalPaise,
      extraGuestFeePaise: pricing.extraGuestFeePaise,
      resortFeePaise: 0,
      taxPaise: pricing.taxPaise,
      discountPaise,
      totalAmountPaise,
      paidAmountPaise: paidPaise,
      remainingBalancePaise,
      couponCode: appliedCouponCode,
      couponDiscountPaise: discountPaise,
      additionalGuests: params.additionalGuests || [],
      specialRequests: params.specialRequests ? `[Reception Walk-in]: ${params.specialRequests}` : '[Reception Walk-in]',
      createdByStaffId: params.staffId,
      createdByStaffName: params.staffName,
      checkedInAt: params.autoCheckIn ? new Date().toISOString() : undefined,
      checkedInByStaffName: params.autoCheckIn ? params.staffName : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.bookings.push(booking);

    let paymentRecord: Payment | undefined = undefined;
    let cashTxRecord: CashTransaction | undefined = undefined;

    if (paidPaise > 0 && receiptNumber) {
      paymentRecord = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        receiptNumber,
        amountPaise: paidPaise,
        currency: 'INR',
        paymentMethod: params.paymentMethod || 'cash',
        status: 'captured',
        transactionReference: `TXN-${receiptNumber}`,
        cashierId: params.staffId,
        cashierName: params.staffName,
        notes: `Walk-in initial collection (${params.paymentMethod || 'cash'})`,
        createdAt: new Date().toISOString(),
        capturedAt: new Date().toISOString()
      };
      db.payments.push(paymentRecord);

      if ((params.paymentMethod || 'cash') === 'cash') {
        cashTxRecord = {
          id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          receiptNumber,
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          transactionType: 'payment',
          amountPaise: paidPaise,
          cashierId: params.staffId,
          cashierName: params.staffName,
          notes: `Reception cash booking payment for ${booking.bookingReference}`,
          createdAt: new Date().toISOString()
        };
        db.cashTransactions.push(cashTxRecord);
      }
    }

    if (appliedCouponCode) {
      await this.consumeCoupon(appliedCouponCode, bookingReference, customer.email, discountPaise, pricing.totalAmountPaise, customer.id);
    }

    await this.logAudit({
      userId: params.staffId,
      userEmail: params.staffName,
      action: 'create_reception_booking',
      entityType: 'booking',
      entityId: booking.id,
      details: `Created walk-in reservation ${bookingReference} for ${params.guestName} in Room ${allocatedRoom.roomNumber}. Paid ₹${paidPaise / 100}, Balance ₹${remainingBalancePaise / 100}.`
    });

    await this.persist();

    return {
      booking,
      payment: paymentRecord,
      cashTransaction: cashTxRecord,
      receiptNumber
    };
  }

  async recordAdditionalPayment(params: {
    bookingReference: string;
    amountPaise: number;
    paymentMethod: PaymentMethod;
    cashierId: string;
    cashierName: string;
    notes?: string;
  }): Promise<{
    booking: Booking;
    payment: Payment;
    cashTransaction?: CashTransaction;
    receiptNumber: string;
  }> {
    const db = this.ensureInitialized();
    const booking = db.bookings.find(b => b.bookingReference.toUpperCase() === params.bookingReference.toUpperCase());
    if (!booking) throw new Error(`Booking ${params.bookingReference} was not found.`);

    if (params.amountPaise <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const currentBalance = booking.remainingBalancePaise !== undefined 
      ? booking.remainingBalancePaise 
      : Math.max(0, booking.totalAmountPaise - booking.paidAmountPaise);

    if (params.amountPaise > currentBalance) {
      throw new Error(`Amount ₹${params.amountPaise / 100} exceeds the remaining balance ₹${currentBalance / 100}.`);
    }

    booking.paidAmountPaise += params.amountPaise;
    booking.remainingBalancePaise = Math.max(0, booking.totalAmountPaise - booking.paidAmountPaise);

    if (booking.paidAmountPaise >= booking.totalAmountPaise) {
      booking.paymentStatus = 'paid';
    } else {
      booking.paymentStatus = 'partially_paid';
    }
    booking.updatedAt = new Date().toISOString();

    const receiptNumber = `RCP-ARN-${Date.now().toString().slice(-4)}`;
    const payment: Payment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      receiptNumber,
      amountPaise: params.amountPaise,
      currency: 'INR',
      paymentMethod: params.paymentMethod,
      status: 'captured',
      transactionReference: `TXN-${receiptNumber}`,
      cashierId: params.cashierId,
      cashierName: params.cashierName,
      notes: params.notes || `Counter collection (${params.paymentMethod})`,
      createdAt: new Date().toISOString(),
      capturedAt: new Date().toISOString()
    };
    db.payments.push(payment);

    let cashTx: CashTransaction | undefined = undefined;
    if (params.paymentMethod === 'cash') {
      cashTx = {
        id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        receiptNumber,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        transactionType: 'payment',
        amountPaise: params.amountPaise,
        cashierId: params.cashierId,
        cashierName: params.cashierName,
        notes: params.notes || `Cash payment collected for ${booking.bookingReference}`,
        createdAt: new Date().toISOString()
      };
      db.cashTransactions.push(cashTx);
    }

    await this.logAudit({
      userId: params.cashierId,
      userEmail: params.cashierName,
      action: 'collect_additional_payment',
      entityType: 'payment',
      entityId: payment.id,
      details: `Collected ₹${params.amountPaise / 100} (${params.paymentMethod}) for ${booking.bookingReference}. New Balance: ₹${booking.remainingBalancePaise / 100}. Receipt: ${receiptNumber}`
    });

    await this.persist();

    return { booking, payment, cashTransaction: cashTx, receiptNumber };
  }

  async recordCashRefund(params: {
    bookingReference: string;
    refundAmountPaise: number;
    authorizedByManagerId: string;
    authorizedByManagerName: string;
    cashierId: string;
    cashierName: string;
    reason: string;
  }): Promise<{
    booking: Booking;
    refundTransaction: CashTransaction;
    receiptNumber: string;
  }> {
    const db = this.ensureInitialized();
    const booking = db.bookings.find(b => b.bookingReference.toUpperCase() === params.bookingReference.toUpperCase());
    if (!booking) throw new Error(`Booking ${params.bookingReference} not found.`);

    if (params.refundAmountPaise <= 0) {
      throw new Error('Refund amount must be greater than zero.');
    }

    if (params.refundAmountPaise > booking.paidAmountPaise) {
      throw new Error(`Cannot refund ₹${params.refundAmountPaise / 100}. Total paid so far is only ₹${booking.paidAmountPaise / 100}.`);
    }

    booking.paidAmountPaise -= params.refundAmountPaise;
    booking.remainingBalancePaise = Math.max(0, booking.totalAmountPaise - booking.paidAmountPaise);

    if (booking.paidAmountPaise === 0) {
      booking.paymentStatus = 'refunded';
    } else {
      booking.paymentStatus = 'partially_refunded';
    }
    booking.updatedAt = new Date().toISOString();

    const receiptNumber = `REF-ARN-${Date.now().toString().slice(-4)}`;

    const refundPayment: Payment = {
      id: `pay-ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      receiptNumber,
      amountPaise: -params.refundAmountPaise,
      currency: 'INR',
      paymentMethod: 'cash',
      status: 'refunded',
      transactionReference: `TXN-${receiptNumber}`,
      cashierId: params.cashierId,
      cashierName: params.cashierName,
      notes: `Authorized refund: ${params.reason} (Auth by: ${params.authorizedByManagerName})`,
      createdAt: new Date().toISOString(),
      capturedAt: new Date().toISOString()
    };
    db.payments.push(refundPayment);

    const cashTx: CashTransaction = {
      id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      transactionType: 'refund',
      amountPaise: params.refundAmountPaise,
      cashierId: params.cashierId,
      cashierName: params.cashierName,
      authorizedByManagerId: params.authorizedByManagerId,
      authorizedByManagerName: params.authorizedByManagerName,
      notes: params.reason,
      createdAt: new Date().toISOString()
    };
    db.cashTransactions.push(cashTx);

    await this.logAudit({
      userId: params.cashierId,
      userEmail: params.cashierName,
      action: 'process_cash_refund',
      entityType: 'payment',
      entityId: cashTx.id,
      details: `Processed cash refund of ₹${params.refundAmountPaise / 100} for ${booking.bookingReference}. Auth by: ${params.authorizedByManagerName}. Reason: ${params.reason}`
    });

    await this.persist();

    return { booking, refundTransaction: cashTx, receiptNumber };
  }

  async getCashRegisterReport(date?: string): Promise<{
    targetDate: string;
    totalPaymentsCollectedPaise: number;
    totalRefundsIssuedPaise: number;
    netCashCollectedPaise: number;
    totalTransactionsCount: number;
    transactions: CashTransaction[];
    activeShift?: CashShiftReconciliation;
  }> {
    const db = this.ensureInitialized();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const txs = db.cashTransactions.filter(t => t.createdAt.startsWith(targetDate));
    const totalPayments = txs
      .filter(t => t.transactionType === 'payment' || t.transactionType === 'deposit')
      .reduce((sum, t) => sum + t.amountPaise, 0);

    const totalRefunds = txs
      .filter(t => t.transactionType === 'refund' || t.transactionType === 'withdrawal')
      .reduce((sum, t) => sum + t.amountPaise, 0);

    const netCash = totalPayments - totalRefunds;

    const activeShift = db.cashShifts.find(s => s.shiftDate === targetDate);

    return {
      targetDate,
      totalPaymentsCollectedPaise: totalPayments,
      totalRefundsIssuedPaise: totalRefunds,
      netCashCollectedPaise: netCash,
      totalTransactionsCount: txs.length,
      transactions: txs,
      activeShift
    };
  }

  async openCashShift(params: {
    shiftDate?: string;
    openedByStaffId: string;
    openedByStaffName: string;
    openingFloatPaise: number;
  }): Promise<CashShiftReconciliation> {
    const db = this.ensureInitialized();
    const shiftDate = params.shiftDate || new Date().toISOString().split('T')[0];

    const existing = db.cashShifts.find(s => s.shiftDate === shiftDate && s.status === 'open');
    if (existing) return existing;

    const shift: CashShiftReconciliation = {
      id: `shift-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shiftDate,
      openedByStaffId: params.openedByStaffId,
      openedByStaffName: params.openedByStaffName,
      openedAt: new Date().toISOString(),
      openingFloatPaise: params.openingFloatPaise,
      status: 'open'
    };
    db.cashShifts.push(shift);
    await this.persist();
    return shift;
  }

  async closeCashShift(params: {
    shiftId: string;
    actualClosingCashPaise: number;
    notes?: string;
    closedByStaffId: string;
    closedByStaffName: string;
  }): Promise<CashShiftReconciliation> {
    const db = this.ensureInitialized();
    const shift = db.cashShifts.find(s => s.id === params.shiftId);
    if (!shift) throw new Error('Cash shift record not found.');

    const dayReport = await this.getCashRegisterReport(shift.shiftDate);
    const expectedClosing = shift.openingFloatPaise + dayReport.netCashCollectedPaise;
    const discrepancy = params.actualClosingCashPaise - expectedClosing;

    shift.closedByStaffId = params.closedByStaffId;
    shift.closedByStaffName = params.closedByStaffName;
    shift.closedAt = new Date().toISOString();
    shift.expectedClosingCashPaise = expectedClosing;
    shift.actualClosingCashPaise = params.actualClosingCashPaise;
    shift.discrepancyPaise = discrepancy;
    shift.notes = params.notes;
    shift.status = 'closed';

    await this.logAudit({
      userId: params.closedByStaffId,
      userEmail: params.closedByStaffName,
      action: 'close_cash_shift',
      entityType: 'cash_shift',
      entityId: shift.id,
      details: `Closed cash drawer for ${shift.shiftDate}. Expected ₹${expectedClosing / 100}, Counted ₹${params.actualClosingCashPaise / 100}, Discrepancy: ₹${discrepancy / 100}`
    });

    await this.persist();
    return shift;
  }

  // =========================================================================
  // --- FEATURE 2: COUPON SYSTEM & VALIDATION ENGINE ---
  // =========================================================================
  async getCoupons(): Promise<Coupon[]> {
    const db = this.ensureInitialized();
    return db.coupons;
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const db = this.ensureInitialized();
    return db.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase()) || null;
  }

  async createCoupon(data: Omit<Coupon, 'id' | 'currentRedemptionsCount' | 'createdAt' | 'updatedAt'>): Promise<Coupon> {
    const db = this.ensureInitialized();
    const cleanCode = data.code.trim().toUpperCase();

    if (db.coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      throw new Error(`A coupon with code "${cleanCode}" already exists.`);
    }

    const coupon: Coupon = {
      id: `coup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      code: cleanCode,
      currentRedemptionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.coupons.push(coupon);
    await this.persist();
    return coupon;
  }

  async updateCoupon(couponId: string, updates: Partial<Coupon>): Promise<Coupon> {
    const db = this.ensureInitialized();
    const coupon = db.coupons.find(c => c.id === couponId);
    if (!coupon) throw new Error('Coupon not found.');

    if (updates.code) {
      const cleanCode = updates.code.trim().toUpperCase();
      if (db.coupons.some(c => c.id !== couponId && c.code.toUpperCase() === cleanCode)) {
        throw new Error(`Coupon code "${cleanCode}" is already in use.`);
      }
      updates.code = cleanCode;
    }

    Object.assign(coupon, updates, { updatedAt: new Date().toISOString() });
    await this.persist();
    return coupon;
  }

  async deleteCoupon(couponId: string): Promise<boolean> {
    const db = this.ensureInitialized();
    const idx = db.coupons.findIndex(c => c.id === couponId);
    if (idx === -1) return false;
    db.coupons.splice(idx, 1);
    await this.persist();
    return true;
  }

  async validateCoupon(params: {
    code: string;
    roomTypeId: string;
    checkInDate: string;
    checkOutDate: string;
    numNights: number;
    subtotalPaise: number;
    customerEmail?: string;
    customerId?: string;
  }): Promise<{
    isValid: boolean;
    reason?: string;
    coupon?: Coupon;
    discountPaise: number;
    finalPayablePaise: number;
  }> {
    const db = this.ensureInitialized();
    const cleanCode = params.code.trim().toUpperCase();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { isValid: false, reason: 'Coupon code not found.', discountPaise: 0, finalPayablePaise: params.subtotalPaise };
    }

    if (!coupon.isActive) {
      return { isValid: false, reason: 'This coupon is currently inactive.', discountPaise: 0, finalPayablePaise: params.subtotalPaise };
    }

    const today = new Date().toISOString().split('T')[0];
    if (today < coupon.startDate) {
      return { isValid: false, reason: `This promotion starts on ${coupon.startDate}.`, discountPaise: 0, finalPayablePaise: params.subtotalPaise };
    }
    if (today > coupon.expiryDate) {
      return { isValid: false, reason: `This coupon expired on ${coupon.expiryDate}.`, discountPaise: 0, finalPayablePaise: params.subtotalPaise };
    }

    if (params.subtotalPaise < coupon.minBookingValuePaise) {
      return {
        isValid: false,
        reason: `Minimum booking value of ₹${coupon.minBookingValuePaise / 100} required to apply this coupon.`,
        discountPaise: 0,
        finalPayablePaise: params.subtotalPaise
      };
    }

    if (coupon.minStayNights && params.numNights < coupon.minStayNights) {
      return {
        isValid: false,
        reason: `This coupon requires a minimum stay of ${coupon.minStayNights} nights.`,
        discountPaise: 0,
        finalPayablePaise: params.subtotalPaise
      };
    }

    if (coupon.eligibleRoomTypeIds && coupon.eligibleRoomTypeIds.length > 0) {
      if (!coupon.eligibleRoomTypeIds.includes(params.roomTypeId)) {
        return {
          isValid: false,
          reason: 'This coupon is not valid for the selected room type.',
          discountPaise: 0,
          finalPayablePaise: params.subtotalPaise
        };
      }
    }

    if (coupon.currentRedemptionsCount >= coupon.maxTotalRedemptions) {
      return { isValid: false, reason: 'This coupon has reached its maximum total usage limit.', discountPaise: 0, finalPayablePaise: params.subtotalPaise };
    }

    // Check customer-specific eligibility
    if (params.customerEmail) {
      const email = params.customerEmail.toLowerCase().trim();
      const pastCustomerBookings = db.bookings.filter(b => 
        (b.guest?.email.toLowerCase() === email || b.customerId === params.customerId) &&
        ['confirmed', 'checked_in', 'checked_out'].includes(b.status)
      );

      if (coupon.customerEligibility === 'first_time' && pastCustomerBookings.length > 0) {
        return { isValid: false, reason: 'This promotion is valid only for first-time guests.', discountPaise: 0, finalPayablePaise: params.subtotalPaise };
      }

      if (coupon.customerEligibility === 'returning' && pastCustomerBookings.length === 0) {
        return { isValid: false, reason: 'This loyalty coupon is exclusively for returning guests.', discountPaise: 0, finalPayablePaise: params.subtotalPaise };
      }

      // Check per-customer redemption limit
      const userRedemptions = db.couponRedemptions.filter(r =>
        r.couponCode.toUpperCase() === cleanCode &&
        (r.customerEmail.toLowerCase() === email || r.customerId === params.customerId) &&
        r.status === 'consumed'
      );

      if (userRedemptions.length >= coupon.maxRedemptionsPerCustomer) {
        return {
          isValid: false,
          reason: `You have reached the maximum allowed uses (${coupon.maxRedemptionsPerCustomer}) for this coupon.`,
          discountPaise: 0,
          finalPayablePaise: params.subtotalPaise
        };
      }
    }

    // Calculate discount in integer paise
    let discountPaise = 0;
    if (coupon.discountType === 'fixed') {
      discountPaise = Math.min(coupon.discountValue, params.subtotalPaise);
    } else {
      // Percentage calculation
      const calculated = Math.round((params.subtotalPaise * coupon.discountValue) / 100);
      discountPaise = coupon.maxDiscountPaise ? Math.min(calculated, coupon.maxDiscountPaise) : calculated;
      discountPaise = Math.min(discountPaise, params.subtotalPaise);
    }

    const finalPayablePaise = Math.max(0, params.subtotalPaise - discountPaise);

    return {
      isValid: true,
      coupon,
      discountPaise,
      finalPayablePaise
    };
  }

  async consumeCoupon(
    couponCode: string, 
    bookingReference: string, 
    customerEmail: string, 
    discountAppliedPaise: number, 
    bookingTotalBeforeDiscountPaise: number,
    customerId?: string
  ): Promise<CouponRedemption> {
    const db = this.ensureInitialized();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (coupon) {
      coupon.currentRedemptionsCount += 1;
      coupon.updatedAt = new Date().toISOString();
    }

    const redemption: CouponRedemption = {
      id: `redemp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      couponId: coupon?.id || 'unknown',
      couponCode: couponCode.trim().toUpperCase(),
      bookingId: bookingReference,
      bookingReference,
      customerId,
      customerEmail,
      discountAppliedPaise,
      bookingTotalBeforeDiscountPaise,
      status: 'consumed',
      reservedAt: new Date().toISOString(),
      consumedAt: new Date().toISOString()
    };
    db.couponRedemptions.push(redemption);
    await this.persist();
    return redemption;
  }

  async getCouponAnalytics(): Promise<{
    totalCoupons: number;
    activeCoupons: number;
    totalRedemptionsCount: number;
    totalDiscountProvidedPaise: number;
    recentRedemptions: CouponRedemption[];
  }> {
    const db = this.ensureInitialized();
    const totalCoupons = db.coupons.length;
    const activeCoupons = db.coupons.filter(c => c.isActive).length;
    const totalRedemptionsCount = db.couponRedemptions.filter(r => r.status === 'consumed').length;
    const totalDiscountProvidedPaise = db.couponRedemptions
      .filter(r => r.status === 'consumed')
      .reduce((sum, r) => sum + r.discountAppliedPaise, 0);

    return {
      totalCoupons,
      activeCoupons,
      totalRedemptionsCount,
      totalDiscountProvidedPaise,
      recentRedemptions: db.couponRedemptions.slice(-50).reverse()
    };
  }

  // =========================================================================
  // --- FEATURE 3: POST-CHECKOUT OFFERS & EMAIL OUTBOX ---
  // =========================================================================
  async getPostCheckoutCampaign(): Promise<PostCheckoutCampaign> {
    const db = this.ensureInitialized();
    if (!db.postCheckoutCampaigns || db.postCheckoutCampaigns.length === 0) {
      db.postCheckoutCampaigns = INITIAL_POST_CHECKOUT_CAMPAIGNS;
      await this.persist();
    }
    return db.postCheckoutCampaigns[0];
  }

  async updatePostCheckoutCampaign(updates: Partial<PostCheckoutCampaign>): Promise<PostCheckoutCampaign> {
    const db = this.ensureInitialized();
    if (!db.postCheckoutCampaigns || db.postCheckoutCampaigns.length === 0) {
      db.postCheckoutCampaigns = INITIAL_POST_CHECKOUT_CAMPAIGNS;
    }
    Object.assign(db.postCheckoutCampaigns[0], updates, { updatedAt: new Date().toISOString() });
    await this.persist();
    return db.postCheckoutCampaigns[0];
  }

  async checkoutBookingWithLoyaltyOffer(
    bookingId: string, 
    staffSession: { userId: string; fullName: string }
  ): Promise<{
    booking: Booking;
    couponGenerated?: Coupon;
    emailNotification?: EmailNotificationRecord;
  }> {
    const db = this.ensureInitialized();
    const booking = db.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found.');

    if (booking.status === 'checked_out') {
      // Idempotent: return if already checked out
      return { booking };
    }

    booking.status = 'checked_out';
    booking.checkedOutAt = new Date().toISOString();
    booking.checkedOutByStaffName = staffSession.fullName;
    booking.updatedAt = new Date().toISOString();

    // Mark assigned room as dirty for housekeeping
    if (booking.assignedRoomId) {
      const room = db.rooms.find(r => r.id === booking.assignedRoomId);
      if (room) {
        room.housekeepingStatus = 'dirty';
      }
    }

    let couponGenerated: Coupon | undefined = undefined;
    let emailNotification: EmailNotificationRecord | undefined = undefined;

    const campaign = await this.getPostCheckoutCampaign();

    // Check if campaign is active and customer has a valid email
    if (campaign && campaign.isEnabled && booking.guest?.email && !booking.guest.email.endsWith('@guest.aarunodya.com')) {
      // Idempotency: verify no email notification has been dispatched for this booking reference
      const alreadySent = db.emailNotifications.some(n => n.bookingReference === booking.bookingReference);

      if (!alreadySent) {
        const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = campaign.generateUniqueCodePerCustomer 
          ? `RETURN-${uniqueSuffix}` 
          : `RETURN15`;

        const expiryDate = new Date(Date.now() + campaign.validityDays * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

        // Register coupon
        couponGenerated = {
          id: `coup-checkout-${Date.now()}`,
          code,
          description: `Post-checkout thank you gift for ${booking.guest.fullName}`,
          discountType: campaign.discountType,
          discountValue: campaign.discountValue,
          maxDiscountPaise: campaign.maxDiscountPaise,
          minBookingValuePaise: campaign.minBookingValuePaise,
          startDate: new Date().toISOString().split('T')[0],
          expiryDate,
          maxTotalRedemptions: 1,
          currentRedemptionsCount: 0,
          maxRedemptionsPerCustomer: 1,
          eligibleRoomTypeIds: [],
          customerEligibility: 'returning',
          isActive: true,
          adminNotes: `Auto-generated post-checkout offer for booking ${booking.bookingReference}`,
          campaignId: campaign.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.coupons.push(couponGenerated);

        // Queue notification record
        emailNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          recipientEmail: booking.guest.email,
          recipientName: booking.guest.fullName,
          bookingReference: booking.bookingReference,
          campaignId: campaign.id,
          couponCode: code,
          subject: campaign.emailSubject,
          status: 'pending',
          retryCount: 0,
          createdAt: new Date().toISOString()
        };
        db.emailNotifications.unshift(emailNotification);

        // Dispatch email
        const discountDisplay = campaign.discountType === 'percentage' 
          ? `${campaign.discountValue}%` 
          : `₹${campaign.discountValue / 100}`;

        try {
          const sendRes = await resendService.sendPostCheckoutThankYouEmail({
            customerName: booking.guest.fullName,
            customerEmail: booking.guest.email,
            couponCode: code,
            discountDisplay,
            expiryDate,
            subject: campaign.emailSubject,
            promotionalMessage: campaign.promotionalMessage
          });

          if (sendRes.success) {
            emailNotification.status = 'sent';
            emailNotification.sentAt = new Date().toISOString();
          } else {
            emailNotification.status = 'failed';
            emailNotification.failureReason = sendRes.error || 'Resend provider error';
          }
        } catch (emailErr: unknown) {
          const msg = emailErr instanceof Error ? emailErr.message : 'Email delivery failed';
          emailNotification.status = 'failed';
          emailNotification.failureReason = msg;
        }
      }
    }

    await this.logAudit({
      userId: staffSession.userId,
      userEmail: staffSession.fullName,
      action: 'checkout_booking',
      entityType: 'booking',
      entityId: booking.id,
      details: `Checked out booking ${booking.bookingReference} for ${booking.guest?.fullName}. Housekeeping updated to dirty. Loyalty coupon: ${couponGenerated?.code || 'none'}.`
    });

    await this.persist();
    return { booking, couponGenerated, emailNotification };
  }

  async getEmailNotifications(): Promise<EmailNotificationRecord[]> {
    const db = this.ensureInitialized();
    return db.emailNotifications;
  }

  async retryEmailNotification(notificationId: string): Promise<EmailNotificationRecord> {
    const db = this.ensureInitialized();
    const notif = db.emailNotifications.find(n => n.id === notificationId);
    if (!notif) throw new Error('Notification record not found.');

    const campaign = await this.getPostCheckoutCampaign();
    const discountDisplay = campaign.discountType === 'percentage' ? `${campaign.discountValue}%` : `₹${campaign.discountValue / 100}`;
    const expiryDate = new Date(Date.now() + campaign.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    notif.retryCount += 1;

    try {
      const sendRes = await resendService.sendPostCheckoutThankYouEmail({
        customerName: notif.recipientName,
        customerEmail: notif.recipientEmail,
        couponCode: notif.couponCode || 'WELCOME10',
        discountDisplay,
        expiryDate,
        subject: notif.subject,
        promotionalMessage: campaign.promotionalMessage
      });

      if (sendRes.success) {
        notif.status = 'sent';
        notif.sentAt = new Date().toISOString();
        notif.failureReason = undefined;
      } else {
        notif.status = 'failed';
        notif.failureReason = sendRes.error || 'Retry delivery failed';
      }
    } catch (err: unknown) {
      notif.status = 'failed';
      notif.failureReason = err instanceof Error ? err.message : 'Retry failed';
    }

    await this.persist();
    return notif;
  }

  // =========================================================================
  // --- FEATURE 4: CUSTOMER DATABASE & ID DOCUMENT MANAGEMENT ---
  // =========================================================================
  async getCustomers(params?: {
    query?: string;
    verificationStatus?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<{ customers: Customer[]; total: number; page: number; totalPages: number }> {
    const db = this.ensureInitialized();
    let list = db.customers.filter(c => !c.isMerged);

    if (params?.query) {
      const q = params.query.trim().toLowerCase();
      list = list.filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q))
      );
    }

    if (params?.verificationStatus) {
      list = list.filter(c => 
        c.documents.some(d => d.verificationStatus === params.verificationStatus)
      );
    }

    if (params?.city) {
      list = list.filter(c => c.city?.toLowerCase() === params.city?.toLowerCase());
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return {
      customers: paginated,
      total,
      page,
      totalPages
    };
  }

  async getCustomerById(customerId: string): Promise<{
    customer: Customer;
    bookings: Booking[];
    payments: Payment[];
    couponsRedeemed: CouponRedemption[];
  } | null> {
    const db = this.ensureInitialized();
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) return null;

    const bookings = db.bookings.filter(b => 
      b.customerId === customerId ||
      b.guest?.phone.replace(/\D/g, '') === customer.phone.replace(/\D/g, '') ||
      b.guest?.email.toLowerCase() === customer.email.toLowerCase()
    );

    const bookingIds = new Set(bookings.map(b => b.id));
    const payments = db.payments.filter(p => bookingIds.has(p.bookingId));
    const couponsRedeemed = db.couponRedemptions.filter(r => 
      r.customerId === customerId || r.customerEmail.toLowerCase() === customer.email.toLowerCase()
    );

    return {
      customer,
      bookings,
      payments,
      couponsRedeemed
    };
  }

  async createOrUpdateCustomer(data: Partial<Customer> & { fullName: string; phone: string; email: string }): Promise<Customer> {
    const db = this.ensureInitialized();
    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    let existing = db.customers.find(c =>
      c.id === data.id ||
      c.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '') ||
      c.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date().toISOString() });
      await this.persist();
      return existing;
    }

    const customer: Customer = {
      id: data.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: data.fullName,
      phone: cleanPhone,
      email: cleanEmail,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      altPhone: data.altPhone,
      addressLine1: data.addressLine1,
      city: data.city || 'Pandharpur',
      state: data.state || 'Maharashtra',
      country: data.country || 'India',
      postalCode: data.postalCode,
      documents: data.documents || [],
      totalVisits: data.totalVisits || 0,
      totalSpentPaise: data.totalSpentPaise || 0,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.customers.push(customer);
    await this.persist();
    return customer;
  }

  async uploadCustomerIdDocument(
    customerId: string,
    docData: Omit<CustomerIdentityDocument, 'id' | 'customerId' | 'createdAt'>
  ): Promise<CustomerIdentityDocument> {
    const db = this.ensureInitialized();
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found.');

    const doc: CustomerIdentityDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      customerId,
      ...docData,
      createdAt: new Date().toISOString()
    };

    customer.documents.push(doc);
    customer.updatedAt = new Date().toISOString();

    await this.logAudit({
      action: 'upload_customer_document',
      entityType: 'document',
      entityId: doc.id,
      details: `Uploaded ${doc.documentType} document for customer ${customer.fullName} (${customer.id}). Masked number: ${doc.documentNumberMasked}`
    });

    await this.persist();
    return doc;
  }

  async verifyCustomerDocument(
    customerId: string,
    documentId: string,
    status: VerificationStatus,
    staff: { userId: string; fullName: string }
  ): Promise<CustomerIdentityDocument> {
    const db = this.ensureInitialized();
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found.');

    const doc = customer.documents.find(d => d.id === documentId);
    if (!doc) throw new Error('Document not found.');

    doc.verificationStatus = status;
    doc.verifiedByStaffId = staff.userId;
    doc.verifiedByStaffName = staff.fullName;
    doc.verifiedAt = new Date().toISOString();
    customer.updatedAt = new Date().toISOString();

    await this.logAudit({
      userId: staff.userId,
      userEmail: staff.fullName,
      action: 'verify_customer_document',
      entityType: 'document',
      entityId: doc.id,
      details: `Marked document ${doc.documentType} as ${status} for customer ${customer.fullName} (${customer.id}).`
    });

    await this.persist();
    return doc;
  }

  async mergeCustomers(
    sourceCustomerId: string,
    targetCustomerId: string,
    staff: { userId: string; fullName: string }
  ): Promise<Customer> {
    const db = this.ensureInitialized();
    if (sourceCustomerId === targetCustomerId) {
      throw new Error('Cannot merge a customer into themselves.');
    }

    const source = db.customers.find(c => c.id === sourceCustomerId);
    const target = db.customers.find(c => c.id === targetCustomerId);
    if (!source || !target) throw new Error('Source or target customer not found.');

    // Move documents from source to target
    for (const doc of source.documents) {
      doc.customerId = target.id;
      target.documents.push(doc);
    }
    source.documents = [];

    // Move all bookings to target
    for (const b of db.bookings) {
      if (b.customerId === source.id) {
        b.customerId = target.id;
      }
    }

    target.totalVisits += source.totalVisits;
    target.totalSpentPaise += source.totalSpentPaise;
    if (source.notes) {
      target.notes = target.notes ? `${target.notes}\n[Merged Notes from ${source.id}]: ${source.notes}` : source.notes;
    }

    source.isMerged = true;
    source.mergedIntoCustomerId = target.id;
    source.updatedAt = new Date().toISOString();
    target.updatedAt = new Date().toISOString();

    await this.logAudit({
      userId: staff.userId,
      userEmail: staff.fullName,
      action: 'merge_customer_profiles',
      entityType: 'customer',
      entityId: target.id,
      details: `Merged duplicate customer ${source.fullName} (${source.id}) into ${target.fullName} (${target.id}). Updated visits to ${target.totalVisits}.`
    });

    await this.persist();
    return target;
  }

  // =========================================================================
  // --- FEATURE 5: EXCEL IMPORT AND EXPORT DATASET EXTRACTION ---
  // =========================================================================
  async getExportDataset(
    type: 'customers' | 'reservations' | 'payments' | 'cash_ledger' | 'coupons',
    dateRange?: { start?: string; end?: string }
  ): Promise<Record<string, unknown>[]> {
    const db = this.ensureInitialized();
    const start = dateRange?.start;
    const end = dateRange?.end;

    if (type === 'customers') {
      return db.customers.filter(c => !c.isMerged).map(c => ({
        'Customer ID': c.id,
        'Full Legal Name': c.fullName,
        'Phone Number': c.phone,
        'Email Address': c.email,
        'Gender': c.gender || 'Not specified',
        'Date of Birth': c.dateOfBirth || '',
        'City': c.city || '',
        'State': c.state || '',
        'Total Visits': c.totalVisits,
        'Total Spent (INR)': (c.totalSpentPaise / 100).toFixed(2),
        'ID Type': c.documents[0]?.documentType || 'None',
        'ID Number (Masked)': c.documents[0]?.documentNumberMasked || 'None',
        'Verification Status': c.documents[0]?.verificationStatus || 'Unverified',
        'Registered Date': c.createdAt.split('T')[0]
      }));
    }

    if (type === 'reservations') {
      let bList = db.bookings;
      if (start) bList = bList.filter(b => b.checkInDate >= start);
      if (end) bList = bList.filter(b => b.checkOutDate <= end);

      return bList.map(b => ({
        'Booking Reference': b.bookingReference,
        'Guest Name': b.guest?.fullName || 'Guest',
        'Guest Phone': b.guest?.phone || '',
        'Room Category': b.roomType?.name || '',
        'Room Number': b.assignedRoomNumber || 'Unassigned',
        'Check-In Date': b.checkInDate,
        'Check-Out Date': b.checkOutDate,
        'Nights': b.numNights,
        'Adults': b.numAdults,
        'Booking Status': b.status,
        'Payment Status': b.paymentStatus || (b.paidAmountPaise >= b.totalAmountPaise ? 'paid' : 'partially_paid'),
        'Subtotal (INR)': (b.subtotalPaise / 100).toFixed(2),
        'GST (INR)': (b.taxPaise / 100).toFixed(2),
        'Discount (INR)': (b.discountPaise / 100).toFixed(2),
        'Total Amount (INR)': (b.totalAmountPaise / 100).toFixed(2),
        'Paid Amount (INR)': (b.paidAmountPaise / 100).toFixed(2),
        'Balance Due (INR)': ((b.remainingBalancePaise || Math.max(0, b.totalAmountPaise - b.paidAmountPaise)) / 100).toFixed(2),
        'Coupon Applied': b.couponCode || 'None',
        'Created Date': b.createdAt.split('T')[0]
      }));
    }

    if (type === 'payments') {
      let pList = db.payments;
      if (start) pList = pList.filter(p => p.createdAt >= start);
      if (end) pList = pList.filter(p => p.createdAt <= end);

      return pList.map(p => ({
        'Payment ID': p.id,
        'Booking Reference': p.bookingReference || '',
        'Receipt Number': p.receiptNumber || '',
        'Amount (INR)': (p.amountPaise / 100).toFixed(2),
        'Payment Method': p.paymentMethod,
        'Status': p.status,
        'Gateway Order ID': p.razorpayOrderId || '',
        'Gateway Payment ID': p.razorpayPaymentId || '',
        'Cashier': p.cashierName || 'Online Gateway',
        'Transaction Ref': p.transactionReference,
        'Payment Date': p.createdAt
      }));
    }

    if (type === 'cash_ledger') {
      let cList = db.cashTransactions;
      if (start) cList = cList.filter(t => t.createdAt >= start);
      if (end) cList = cList.filter(t => t.createdAt <= end);

      return cList.map(t => ({
        'Transaction ID': t.id,
        'Receipt Number': t.receiptNumber,
        'Booking Reference': t.bookingReference || '',
        'Type': t.transactionType.toUpperCase(),
        'Amount (INR)': (t.amountPaise / 100).toFixed(2),
        'Cashier': t.cashierName,
        'Manager Authorization': t.authorizedByManagerName || 'N/A',
        'Notes': t.notes || '',
        'Date Time': t.createdAt
      }));
    }

    if (type === 'coupons') {
      return db.coupons.map(c => ({
        'Coupon Code': c.code,
        'Description': c.description,
        'Discount Type': c.discountType,
        'Discount Value': c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue / 100}`,
        'Max Cap (INR)': c.maxDiscountPaise ? (c.maxDiscountPaise / 100).toFixed(2) : 'No Limit',
        'Min Booking (INR)': (c.minBookingValuePaise / 100).toFixed(2),
        'Start Date': c.startDate,
        'Expiry Date': c.expiryDate,
        'Total Redemptions': c.currentRedemptionsCount,
        'Max Limit': c.maxTotalRedemptions,
        'Status': c.isActive ? 'ACTIVE' : 'INACTIVE',
        'Target': c.customerEligibility
      }));
    }

    return [];
  }

  async importCustomersBatch(
    rawRows: Record<string, any>[],
    duplicateStrategy: 'skip' | 'update' | 'fail',
    staff: { userId: string; fullName: string }
  ): Promise<DataImportJob> {
    const db = this.ensureInitialized();
    const jobId = `import-${Date.now()}`;
    const job: DataImportJob = {
      id: jobId,
      fileName: 'guest_import.xlsx',
      fileSizeBytes: 0,
      importedByStaffId: staff.userId,
      importedByStaffName: staff.fullName,
      duplicateStrategy,
      totalRows: rawRows.length,
      successfulRows: 0,
      skippedRows: 0,
      failedRows: 0,
      status: 'processing',
      errorDetails: [],
      createdAt: new Date().toISOString()
    };

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 2; // spreadsheet 1-based indexing, accounting for header

      const fullName = (row['Full Name'] || row['Full Legal Name'] || row['Name'] || '').toString().trim();
      const rawPhone = (row['Phone'] || row['Phone Number'] || row['Mobile'] || '').toString().trim();
      const email = (row['Email'] || row['Email Address'] || '').toString().trim().toLowerCase();

      if (!fullName) {
        job.failedRows += 1;
        job.errorDetails?.push({ rowNumber: rowNum, field: 'Full Name', error: 'Missing full name', rawData: row });
        if (duplicateStrategy === 'fail') break;
        continue;
      }

      const cleanPhone = rawPhone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        job.failedRows += 1;
        job.errorDetails?.push({ rowNumber: rowNum, field: 'Phone Number', error: 'Invalid phone number (must be at least 10 digits)', rawData: row });
        if (duplicateStrategy === 'fail') break;
        continue;
      }

      const existing = db.customers.find(c =>
        c.phone.replace(/\D/g, '') === cleanPhone ||
        (email && c.email.toLowerCase() === email)
      );

      if (existing) {
        if (duplicateStrategy === 'skip') {
          job.skippedRows += 1;
          continue;
        } else if (duplicateStrategy === 'update') {
          existing.fullName = fullName;
          if (row['City']) existing.city = row['City'].toString().trim();
          if (row['State']) existing.state = row['State'].toString().trim();
          existing.updatedAt = new Date().toISOString();
          job.successfulRows += 1;
          continue;
        } else if (duplicateStrategy === 'fail') {
          job.failedRows += 1;
          job.errorDetails?.push({ rowNumber: rowNum, field: 'Phone/Email', error: `Duplicate customer found with phone ${cleanPhone} or email ${email}`, rawData: row });
          job.status = 'failed';
          break;
        }
      }

      // Insert new customer
      const newCustomer: Customer = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName,
        phone: rawPhone,
        email: email || `${cleanPhone}@guest.aarunodya.com`,
        city: row['City'] ? row['City'].toString().trim() : 'Pandharpur',
        state: row['State'] ? row['State'].toString().trim() : 'Maharashtra',
        country: 'India',
        documents: [],
        totalVisits: 0,
        totalSpentPaise: 0,
        notes: row['Notes'] ? row['Notes'].toString().trim() : 'Imported via Excel',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.customers.push(newCustomer);
      job.successfulRows += 1;
    }

    if (job.status !== 'failed') {
      job.status = 'completed';
    }
    job.completedAt = new Date().toISOString();

    db.dataImportJobs.unshift(job);
    await this.logAudit({
      userId: staff.userId,
      userEmail: staff.fullName,
      action: 'import_customers_batch',
      entityType: 'import_export',
      entityId: job.id,
      details: `Imported ${job.successfulRows} customers, skipped ${job.skippedRows}, failed ${job.failedRows}. Strategy: ${duplicateStrategy}.`
    });

    await this.persist();
    return job;
  }
}

function INITIAL_ROOMTypesFallback(): RoomType[] {
  return INITIAL_ROOM_TYPES;
}

// Singleton repository export
export const repository = new LodgeRepository();
