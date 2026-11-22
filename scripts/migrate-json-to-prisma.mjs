import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Data Migration: JSON -> Prisma Postgres Database...\n');

  const jsonPath = path.join(process.cwd(), 'data', 'lodge_database.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Data file not found at ${jsonPath}`);
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  // 1. Property
  if (data.property) {
    console.log(`📦 Migrating Property: ${data.property.name}`);
    await prisma.property.upsert({
      where: { id: data.property.id },
      update: {
        name: data.property.name,
        tagline: data.property.tagline,
        slug: data.property.slug,
        description: data.property.description,
        address: data.property.address,
        city: data.property.city,
        state: data.property.state,
        country: data.property.country,
        postalCode: data.property.postalCode,
        phone: data.property.phone,
        email: data.property.email,
        checkInTime: data.property.checkInTime,
        checkOutTime: data.property.checkOutTime,
        currency: data.property.currency || 'INR',
        taxRatePercent: data.property.taxRatePercent || 12.0,
        resortFeePercent: data.property.resortFeePercent || 0.0,
        cancellationPolicy: data.property.cancellationPolicy,
        amenities: data.property.amenities || []
      },
      create: {
        id: data.property.id,
        name: data.property.name,
        tagline: data.property.tagline,
        slug: data.property.slug,
        description: data.property.description,
        address: data.property.address,
        city: data.property.city,
        state: data.property.state,
        country: data.property.country,
        postalCode: data.property.postalCode,
        phone: data.property.phone,
        email: data.property.email,
        checkInTime: data.property.checkInTime,
        checkOutTime: data.property.checkOutTime,
        currency: data.property.currency || 'INR',
        taxRatePercent: data.property.taxRatePercent || 12.0,
        resortFeePercent: data.property.resortFeePercent || 0.0,
        cancellationPolicy: data.property.cancellationPolicy,
        amenities: data.property.amenities || []
      }
    });
    console.log('   ✅ Property migrated successfully.');
  }

  // 2. Room Types
  if (Array.isArray(data.roomTypes)) {
    console.log(`\n📦 Migrating ${data.roomTypes.length} Room Types...`);
    for (const rt of data.roomTypes) {
      await prisma.roomType.upsert({
        where: { id: rt.id },
        update: {
          propertyId: rt.propertyId,
          name: rt.name,
          slug: rt.slug,
          shortDescription: rt.shortDescription,
          fullDescription: rt.fullDescription,
          baseOccupancy: rt.baseOccupancy,
          maxOccupancy: rt.maxOccupancy,
          bedConfig: rt.bedConfig,
          roomSizeSqFt: rt.roomSizeSqFt,
          viewType: rt.viewType,
          basePricePaise: rt.basePricePaise,
          extraGuestFeePaise: rt.extraGuestFeePaise,
          amenities: rt.amenities || [],
          features: rt.features || [],
          images: rt.images || [],
          isActive: rt.isActive ?? true
        },
        create: {
          id: rt.id,
          propertyId: rt.propertyId,
          name: rt.name,
          slug: rt.slug,
          shortDescription: rt.shortDescription,
          fullDescription: rt.fullDescription,
          baseOccupancy: rt.baseOccupancy,
          maxOccupancy: rt.maxOccupancy,
          bedConfig: rt.bedConfig,
          roomSizeSqFt: rt.roomSizeSqFt,
          viewType: rt.viewType,
          basePricePaise: rt.basePricePaise,
          extraGuestFeePaise: rt.extraGuestFeePaise,
          amenities: rt.amenities || [],
          features: rt.features || [],
          images: rt.images || [],
          isActive: rt.isActive ?? true
        }
      });
    }
    console.log('   ✅ All Room Types migrated successfully.');
  }

  // 3. Physical Rooms
  if (Array.isArray(data.rooms)) {
    console.log(`\n📦 Migrating ${data.rooms.length} Physical Units...`);
    for (const rm of data.rooms) {
      await prisma.room.upsert({
        where: { id: rm.id },
        update: {
          roomTypeId: rm.roomTypeId,
          roomNumber: rm.roomNumber,
          floor: rm.floor,
          housekeepingStatus: rm.housekeepingStatus,
          isOperational: rm.isOperational ?? true,
          notes: rm.notes || null
        },
        create: {
          id: rm.id,
          roomTypeId: rm.roomTypeId,
          roomNumber: rm.roomNumber,
          floor: rm.floor,
          housekeepingStatus: rm.housekeepingStatus,
          isOperational: rm.isOperational ?? true,
          notes: rm.notes || null
        }
      });
    }
    console.log('   ✅ All 18 Physical Units migrated successfully.');
  }

  // 4. Staff Users
  if (Array.isArray(data.staffUsers)) {
    console.log(`\n📦 Migrating ${data.staffUsers.length} Staff Users...`);
    for (const u of data.staffUsers) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email,
          fullName: u.fullName,
          passwordHash: u.passwordHash,
          role: u.role,
          isActive: u.isActive ?? true
        },
        create: {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          passwordHash: u.passwordHash,
          role: u.role,
          isActive: u.isActive ?? true
        }
      });
    }
    console.log('   ✅ Staff Users migrated successfully.');
  }

  // 5. Customers & Documents
  if (Array.isArray(data.customers)) {
    console.log(`\n📦 Migrating ${data.customers.length} Customers...`);
    for (const c of data.customers) {
      await prisma.customer.upsert({
        where: { id: c.id },
        update: {
          fullName: c.fullName,
          dateOfBirth: c.dateOfBirth || null,
          gender: c.gender || null,
          phone: c.phone,
          altPhone: c.altPhone || c.alternatePhone || null,
          email: c.email,
          addressLine1: c.addressLine1 || c.address || null,
          city: c.city || null,
          state: c.state || null,
          country: c.country || null,
          postalCode: c.postalCode || null,
          totalVisits: c.totalVisits || 0,
          totalSpentPaise: BigInt(c.totalSpentPaise || c.totalSpendPaise || 0),
          vipStatus: c.vipStatus ?? false,
          notes: c.notes || null,
          isMerged: c.isMerged ?? false,
          mergedIntoCustomerId: c.mergedIntoCustomerId || null
        },
        create: {
          id: c.id,
          fullName: c.fullName,
          dateOfBirth: c.dateOfBirth || null,
          gender: c.gender || null,
          phone: c.phone,
          altPhone: c.altPhone || c.alternatePhone || null,
          email: c.email,
          addressLine1: c.addressLine1 || c.address || null,
          city: c.city || null,
          state: c.state || null,
          country: c.country || null,
          postalCode: c.postalCode || null,
          totalVisits: c.totalVisits || 0,
          totalSpentPaise: BigInt(c.totalSpentPaise || c.totalSpendPaise || 0),
          vipStatus: c.vipStatus ?? false,
          notes: c.notes || null,
          isMerged: c.isMerged ?? false,
          mergedIntoCustomerId: c.mergedIntoCustomerId || null
        }
      });

      if (Array.isArray(c.documents)) {
        for (const doc of c.documents) {
          await prisma.customerIdentityDocument.upsert({
            where: { id: doc.id },
            update: {
              customerId: c.id,
              documentType: doc.documentType,
              documentNumberMasked: doc.documentNumberMasked || doc.maskedNumber || 'XXXX',
              documentNumberEncrypted: doc.documentNumberEncrypted || null,
              issuingCountry: doc.issuingCountry || 'India',
              expiryDate: doc.expiryDate || null,
              filePath: doc.filePath || null,
              fileMimeType: doc.fileMimeType || null,
              fileSizeBytes: doc.fileSizeBytes || doc.fileSize || null,
              originalFileName: doc.originalFileName || null,
              verificationStatus: doc.verificationStatus || 'pending',
              verifiedByStaffId: doc.verifiedByStaffId || null,
              verifiedByStaffName: doc.verifiedByStaffName || null,
              verifiedAt: doc.verifiedAt || doc.uploadedAt || null
            },
            create: {
              id: doc.id,
              customerId: c.id,
              documentType: doc.documentType,
              documentNumberMasked: doc.documentNumberMasked || doc.maskedNumber || 'XXXX',
              documentNumberEncrypted: doc.documentNumberEncrypted || null,
              issuingCountry: doc.issuingCountry || 'India',
              expiryDate: doc.expiryDate || null,
              filePath: doc.filePath || null,
              fileMimeType: doc.fileMimeType || null,
              fileSizeBytes: doc.fileSizeBytes || doc.fileSize || null,
              originalFileName: doc.originalFileName || null,
              verificationStatus: doc.verificationStatus || 'pending',
              verifiedByStaffId: doc.verifiedByStaffId || null,
              verifiedByStaffName: doc.verifiedByStaffName || null,
              verifiedAt: doc.verifiedAt || doc.uploadedAt || null
            }
          });
        }
      }
    }
    console.log('   ✅ Customers and Identity Documents migrated successfully.');
  }

  // 6. Guests
  if (Array.isArray(data.guests)) {
    console.log(`\n📦 Migrating ${data.guests.length} Guests...`);
    for (const g of data.guests) {
      await prisma.guest.upsert({
        where: { id: g.id },
        update: {
          fullName: g.fullName,
          email: g.email,
          phone: g.phone,
          idProofType: g.idProofType || null,
          idProofNumber: g.idProofNumber || null,
          specialRequests: g.specialRequests || null,
          city: g.city || null,
          state: g.state || null
        },
        create: {
          id: g.id,
          fullName: g.fullName,
          email: g.email,
          phone: g.phone,
          idProofType: g.idProofType || null,
          idProofNumber: g.idProofNumber || null,
          specialRequests: g.specialRequests || null,
          city: g.city || null,
          state: g.state || null
        }
      });
    }
    console.log('   ✅ Guests migrated successfully.');
  }

  // 7. Bookings
  if (Array.isArray(data.bookings)) {
    console.log(`\n📦 Migrating ${data.bookings.length} Bookings...`);
    for (const b of data.bookings) {
      // Ensure guest exists
      if (b.guest) {
        await prisma.guest.upsert({
          where: { id: b.guest.id },
          update: {
            fullName: b.guest.fullName,
            email: b.guest.email,
            phone: b.guest.phone
          },
          create: {
            id: b.guest.id,
            fullName: b.guest.fullName,
            email: b.guest.email,
            phone: b.guest.phone
          }
        });
      }

      await prisma.booking.upsert({
        where: { id: b.id },
        update: {
          bookingReference: b.bookingReference,
          guestId: b.guestId,
          customerId: b.customerId || null,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          numNights: b.numNights,
          numAdults: b.numAdults,
          numChildren: b.numChildren || 0,
          numRooms: b.numRooms || 1,
          roomTypeId: b.roomTypeId,
          assignedRoomId: b.assignedRoomId || null,
          assignedRoomNumber: b.assignedRoomNumber || null,
          status: b.status,
          paymentStatus: b.paymentStatus || null,
          subtotalPaise: b.subtotalPaise,
          extraGuestFeePaise: b.extraGuestFeePaise || 0,
          resortFeePaise: b.resortFeePaise || 0,
          taxPaise: b.taxPaise || 0,
          discountPaise: b.discountPaise || 0,
          totalAmountPaise: b.totalAmountPaise,
          paidAmountPaise: b.paidAmountPaise || 0,
          remainingBalancePaise: b.remainingBalancePaise || b.balanceDuePaise || 0,
          source: b.source || 'online',
          couponCode: b.couponCode || null,
          couponDiscountPaise: b.couponDiscountPaise || null,
          additionalGuests: b.additionalGuests || [],
          holdExpiresAt: b.holdExpiresAt || null,
          specialRequests: b.specialRequests || null,
          cancellationReason: b.cancellationReason || null,
          cancelledAt: b.cancelledAt || null,
          checkedInAt: b.checkedInAt || null,
          checkedOutAt: b.checkedOutAt || null,
          createdByStaffId: b.createdByStaffId || null,
          createdByStaffName: b.createdByStaffName || null,
          checkedInByStaffName: b.checkedInByStaffName || null,
          checkedOutByStaffName: b.checkedOutByStaffName || null
        },
        create: {
          id: b.id,
          bookingReference: b.bookingReference,
          guestId: b.guestId,
          customerId: b.customerId || null,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          numNights: b.numNights,
          numAdults: b.numAdults,
          numChildren: b.numChildren || 0,
          numRooms: b.numRooms || 1,
          roomTypeId: b.roomTypeId,
          assignedRoomId: b.assignedRoomId || null,
          assignedRoomNumber: b.assignedRoomNumber || null,
          status: b.status,
          paymentStatus: b.paymentStatus || null,
          subtotalPaise: b.subtotalPaise,
          extraGuestFeePaise: b.extraGuestFeePaise || 0,
          resortFeePaise: b.resortFeePaise || 0,
          taxPaise: b.taxPaise || 0,
          discountPaise: b.discountPaise || 0,
          totalAmountPaise: b.totalAmountPaise,
          paidAmountPaise: b.paidAmountPaise || 0,
          remainingBalancePaise: b.remainingBalancePaise || b.balanceDuePaise || 0,
          source: b.source || 'online',
          couponCode: b.couponCode || null,
          couponDiscountPaise: b.couponDiscountPaise || null,
          additionalGuests: b.additionalGuests || [],
          holdExpiresAt: b.holdExpiresAt || null,
          specialRequests: b.specialRequests || null,
          cancellationReason: b.cancellationReason || null,
          cancelledAt: b.cancelledAt || null,
          checkedInAt: b.checkedInAt || null,
          checkedOutAt: b.checkedOutAt || null,
          createdByStaffId: b.createdByStaffId || null,
          createdByStaffName: b.createdByStaffName || null,
          checkedInByStaffName: b.checkedInByStaffName || null,
          checkedOutByStaffName: b.checkedOutByStaffName || null
        }
      });
    }
    console.log('   ✅ All Bookings migrated successfully.');
  }

  // 8. Payments
  if (Array.isArray(data.payments)) {
    console.log(`\n📦 Migrating ${data.payments.length} Payments...`);
    for (const p of data.payments) {
      await prisma.payment.upsert({
        where: { id: p.id },
        update: {
          bookingId: p.bookingId,
          bookingReference: p.bookingReference || null,
          receiptNumber: p.receiptNumber || null,
          amountPaise: p.amountPaise,
          currency: p.currency || 'INR',
          paymentMethod: p.paymentMethod,
          status: p.status,
          razorpayOrderId: p.razorpayOrderId || null,
          razorpayPaymentId: p.razorpayPaymentId || null,
          razorpaySignature: p.razorpaySignature || null,
          transactionReference: p.transactionReference,
          failureReason: p.failureReason || null,
          gatewayResponse: p.gatewayResponse || {},
          cashierId: p.cashierId || null,
          cashierName: p.cashierName || null,
          notes: p.notes || null,
          capturedAt: p.capturedAt || null
        },
        create: {
          id: p.id,
          bookingId: p.bookingId,
          bookingReference: p.bookingReference || null,
          receiptNumber: p.receiptNumber || null,
          amountPaise: p.amountPaise,
          currency: p.currency || 'INR',
          paymentMethod: p.paymentMethod,
          status: p.status,
          razorpayOrderId: p.razorpayOrderId || null,
          razorpayPaymentId: p.razorpayPaymentId || null,
          razorpaySignature: p.razorpaySignature || null,
          transactionReference: p.transactionReference,
          failureReason: p.failureReason || null,
          gatewayResponse: p.gatewayResponse || {},
          cashierId: p.cashierId || null,
          cashierName: p.cashierName || null,
          notes: p.notes || null,
          capturedAt: p.capturedAt || null
        }
      });
    }
    console.log('   ✅ Payments migrated successfully.');
  }

  // 9. Cash Transactions
  if (Array.isArray(data.cashTransactions)) {
    console.log(`\n📦 Migrating ${data.cashTransactions.length} Cash Transactions...`);
    for (const ct of data.cashTransactions) {
      await prisma.cashTransaction.upsert({
        where: { id: ct.id },
        update: {
          receiptNumber: ct.receiptNumber,
          bookingId: ct.bookingId || null,
          bookingReference: ct.bookingReference || null,
          transactionType: ct.transactionType,
          amountPaise: ct.amountPaise,
          cashierId: ct.cashierId,
          cashierName: ct.cashierName,
          notes: ct.notes || null,
          authorizedByManagerId: ct.authorizedByManagerId || null,
          authorizedByManagerName: ct.authorizedByManagerName || null
        },
        create: {
          id: ct.id,
          receiptNumber: ct.receiptNumber,
          bookingId: ct.bookingId || null,
          bookingReference: ct.bookingReference || null,
          transactionType: ct.transactionType,
          amountPaise: ct.amountPaise,
          cashierId: ct.cashierId,
          cashierName: ct.cashierName,
          notes: ct.notes || null,
          authorizedByManagerId: ct.authorizedByManagerId || null,
          authorizedByManagerName: ct.authorizedByManagerName || null
        }
      });
    }
    console.log('   ✅ Cash Transactions migrated successfully.');
  }

  // 10. Cash Shift Reconciliations
  if (Array.isArray(data.cashShifts)) {
    console.log(`\n📦 Migrating ${data.cashShifts.length} Cash Shift Reconciliations...`);
    for (const cs of data.cashShifts) {
      await prisma.cashShiftReconciliation.upsert({
        where: { id: cs.id },
        update: {
          shiftDate: cs.shiftDate,
          openedByStaffId: cs.openedByStaffId,
          openedByStaffName: cs.openedByStaffName,
          openedAt: cs.openedAt,
          openingFloatPaise: cs.openingFloatPaise,
          closedByStaffId: cs.closedByStaffId || null,
          closedByStaffName: cs.closedByStaffName || null,
          closedAt: cs.closedAt || null,
          expectedClosingCashPaise: cs.expectedClosingCashPaise || null,
          actualClosingCashPaise: cs.actualClosingCashPaise || null,
          discrepancyPaise: cs.discrepancyPaise || null,
          notes: cs.notes || null,
          status: cs.status || 'open'
        },
        create: {
          id: cs.id,
          shiftDate: cs.shiftDate,
          openedByStaffId: cs.openedByStaffId,
          openedByStaffName: cs.openedByStaffName,
          openedAt: cs.openedAt,
          openingFloatPaise: cs.openingFloatPaise,
          closedByStaffId: cs.closedByStaffId || null,
          closedByStaffName: cs.closedByStaffName || null,
          closedAt: cs.closedAt || null,
          expectedClosingCashPaise: cs.expectedClosingCashPaise || null,
          actualClosingCashPaise: cs.actualClosingCashPaise || null,
          discrepancyPaise: cs.discrepancyPaise || null,
          notes: cs.notes || null,
          status: cs.status || 'open'
        }
      });
    }
    console.log('   ✅ Cash Shifts migrated successfully.');
  }

  // 11. Coupons & Redemptions
  if (Array.isArray(data.coupons)) {
    console.log(`\n📦 Migrating ${data.coupons.length} Coupons...`);
    for (const c of data.coupons) {
      await prisma.coupon.upsert({
        where: { id: c.id },
        update: {
          code: c.code,
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue,
          maxDiscountPaise: c.maxDiscountPaise || c.maxDiscountAmountPaise || null,
          minBookingValuePaise: c.minBookingValuePaise || c.minBookingAmountPaise || 0,
          startDate: c.startDate,
          expiryDate: c.expiryDate,
          maxTotalRedemptions: c.maxTotalRedemptions || c.maxRedemptions || 100,
          currentRedemptionsCount: c.currentRedemptionsCount || c.redemptionCount || 0,
          maxRedemptionsPerCustomer: c.maxRedemptionsPerCustomer || 1,
          eligibleRoomTypeIds: c.eligibleRoomTypeIds || [],
          customerEligibility: c.customerEligibility || 'all',
          specificCustomerIds: c.specificCustomerIds || [],
          eligibleCustomerEmail: c.eligibleCustomerEmail || null,
          eligibleCustomerPhone: c.eligibleCustomerPhone || null,
          minStayNights: c.minStayNights || null,
          isActive: c.isActive ?? true,
          adminNotes: c.adminNotes || null,
          campaignId: c.campaignId || null
        },
        create: {
          id: c.id,
          code: c.code,
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue,
          maxDiscountPaise: c.maxDiscountPaise || c.maxDiscountAmountPaise || null,
          minBookingValuePaise: c.minBookingValuePaise || c.minBookingAmountPaise || 0,
          startDate: c.startDate,
          expiryDate: c.expiryDate,
          maxTotalRedemptions: c.maxTotalRedemptions || c.maxRedemptions || 100,
          currentRedemptionsCount: c.currentRedemptionsCount || c.redemptionCount || 0,
          maxRedemptionsPerCustomer: c.maxRedemptionsPerCustomer || 1,
          eligibleRoomTypeIds: c.eligibleRoomTypeIds || [],
          customerEligibility: c.customerEligibility || 'all',
          specificCustomerIds: c.specificCustomerIds || [],
          eligibleCustomerEmail: c.eligibleCustomerEmail || null,
          eligibleCustomerPhone: c.eligibleCustomerPhone || null,
          minStayNights: c.minStayNights || null,
          isActive: c.isActive ?? true,
          adminNotes: c.adminNotes || null,
          campaignId: c.campaignId || null
        }
      });
    }
    console.log('   ✅ Coupons migrated successfully.');
  }

  // 12. Post Checkout Campaign
  if (Array.isArray(data.postCheckoutCampaigns)) {
    console.log(`\n📦 Migrating ${data.postCheckoutCampaigns.length} Post-Checkout Campaigns...`);
    for (const pcc of data.postCheckoutCampaigns) {
      await prisma.postCheckoutCampaign.upsert({
        where: { id: pcc.id },
        update: {
          name: pcc.name,
          isEnabled: pcc.isEnabled ?? true,
          discountType: pcc.discountType || 'percentage',
          discountValue: pcc.discountValue,
          maxDiscountPaise: pcc.maxDiscountPaise || null,
          minBookingValuePaise: pcc.minBookingValuePaise || 0,
          validityDays: pcc.validityDays || 60,
          emailSubject: pcc.emailSubject,
          promotionalMessage: pcc.promotionalMessage,
          generateUniqueCodePerCustomer: pcc.generateUniqueCodePerCustomer ?? true,
          allowRepeatedIssuanceAfterFutureStays: pcc.allowRepeatedIssuanceAfterFutureStays ?? false,
          cooldownDaysBetweenIssuance: pcc.cooldownDaysBetweenIssuance || 30
        },
        create: {
          id: pcc.id,
          name: pcc.name,
          isEnabled: pcc.isEnabled ?? true,
          discountType: pcc.discountType || 'percentage',
          discountValue: pcc.discountValue,
          maxDiscountPaise: pcc.maxDiscountPaise || null,
          minBookingValuePaise: pcc.minBookingValuePaise || 0,
          validityDays: pcc.validityDays || 60,
          emailSubject: pcc.emailSubject,
          promotionalMessage: pcc.promotionalMessage,
          generateUniqueCodePerCustomer: pcc.generateUniqueCodePerCustomer ?? true,
          allowRepeatedIssuanceAfterFutureStays: pcc.allowRepeatedIssuanceAfterFutureStays ?? false,
          cooldownDaysBetweenIssuance: pcc.cooldownDaysBetweenIssuance || 30
        }
      });
    }
    console.log('   ✅ Post Checkout Campaigns migrated successfully.');
  }

  console.log('\n🎉 ALL JSON DATA SUCCESSFULLY IMPORTED INTO PRISMA POSTGRES!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
