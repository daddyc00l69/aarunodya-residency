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
  BookingStatus
} from '../types';
import { 
  INITIAL_PROPERTY, 
  INITIAL_ROOM_TYPES, 
  INITIAL_ROOMS, 
  INITIAL_GUESTS, 
  INITIAL_BOOKINGS, 
  INITIAL_PAYMENTS, 
  INITIAL_STAFF_USERS 
} from './seed-data';
import { doIntervalsOverlap, calculateNights, isHoldExpired } from '../utils/dates';
import { calculatePricing } from '../utils/currency';

interface DatabaseSchema {
  property: Property;
  roomTypes: RoomType[];
  rooms: Room[];
  guests: Guest[];
  bookings: Booking[];
  payments: Payment[];
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
            bookings: INITIAL_BOOKINGS,
            payments: INITIAL_PAYMENTS,
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
    } catch {
      // In-memory fallback if file system write is constrained
      this.inMemoryDb = {
        property: INITIAL_PROPERTY,
        roomTypes: INITIAL_ROOMTypesFallback(),
        rooms: INITIAL_ROOMS,
        guests: INITIAL_GUESTS,
        bookings: INITIAL_BOOKINGS,
        payments: INITIAL_PAYMENTS,
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
      discountPaise: pricing.discountPaise,
      totalAmountPaise: pricing.totalAmountPaise,
      paidAmountPaise: 0,
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
    todaysArrivals: number;
    todaysDepartures: number;
    totalRevenuePaise: number;
    activeBookingsCount: number;
    dirtyRoomsCount: number;
  }> {
    const db = this.ensureInitialized();
    const today = new Date().toISOString().split('T')[0];

    const operationalRooms = db.rooms.filter(r => r.isOperational);
    const totalRooms = operationalRooms.length;

    // Occupied rooms currently checked-in
    const checkedInBookings = db.bookings.filter(b => b.status === 'checked_in');
    const occupiedRooms = checkedInBookings.length;
    const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Today's arrivals: confirmed bookings checking in today
    const todaysArrivals = db.bookings.filter(b => 
      b.checkInDate === today && ['confirmed', 'hold'].includes(b.status)
    ).length;

    // Today's departures: checked-in bookings checking out today
    const todaysDepartures = db.bookings.filter(b => 
      b.checkOutDate === today && b.status === 'checked_in'
    ).length;

    // Total revenue from captured payments
    const totalRevenuePaise = db.payments
      .filter(p => p.status === 'captured')
      .reduce((sum, p) => sum + p.amountPaise, 0);

    const activeBookingsCount = db.bookings.filter(b => 
      ['confirmed', 'checked_in'].includes(b.status)
    ).length;

    const dirtyRoomsCount = db.rooms.filter(r => r.housekeepingStatus === 'dirty').length;

    return {
      occupancyPercent,
      totalRooms,
      occupiedRooms,
      todaysArrivals,
      todaysDepartures,
      totalRevenuePaise,
      activeBookingsCount,
      dirtyRoomsCount
    };
  }
}

function INITIAL_ROOMTypesFallback(): RoomType[] {
  return INITIAL_ROOM_TYPES;
}

// Singleton repository export
export const repository = new LodgeRepository();
