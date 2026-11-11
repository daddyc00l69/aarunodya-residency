# Aarunodya Residency Bhakt Niwas - Staff & Front Desk Operations Manual

Welcome to the **Aarunodya Residency Bhakt Niwas Property Management System (PMS)** operations manual. This guide provides exact instructions for front desk, operations, and housekeeping staff.

- **Property:** Aarunodya Residency Bhakt Niwas
- **Address:** 1563 Ghongade Galli, Nath Chowk, Pandharpur, Maharashtra - 413304
- **Host / Super Admin:** Yuvaraj Malave (📞 8530000820 / 9172464746 / 8801242005)
- **Check-in Time:** 12:00 PM (Inclusive)
- **Check-out Time:** 11:00 AM (Exclusive)

---

## 1. Staff Accounts & Role-Based Access Control (RBAC)

The system supports four distinct operational roles:

| Staff Member | Role | Portal Email | Default Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Yuvaraj Malave** | `super_admin` (Owner) | `yuvaraj@aarunodya.com` | `Aarunodya@2026` | Full system control, financial CSV exports, tariff rules, staff management. |
| **Nitin Shinde** | `manager` (Operations) | `manager@aarunodya.com` | `Manager@2026` | Master reservations, room allocations, cancellations, refunds, reporting. |
| **Ganesh Pawar** | `front_desk` (Lead) | `frontdesk@aarunodya.com` | `Desk@2026` | Check-in, check-out, police ID recording, walk-ins, voucher re-printing. |
| **Sunil Jadhav** | `housekeeping` (Lead) | `housekeeping@aarunodya.com` | `Clean@2026` | Floor turnover status (`Clean`, `Dirty`, `Inspecting`, `Maintenance`), notes. |

*PMS Login URL:* `/admin/login`

---

## 2. 18-Unit Inventory Across 4 Floors

Aarunodya Residency operates 18 physical units:

1. **Ground Floor (Floor 0):** Rooms `101`, `102`, `103`, `104`
   - *Target Devotees:* Senior citizens, devotees with knee pain, wheelchair/walker access. Zero stairs.
   - *Configuration:* Deluxe A/C (101, 102) and Comfort Non-A/C (103, 104).
2. **1st Floor (Floor 1):** Rooms `201`, `202`, `203`, `204`, `205`, `206`
   - *Target Devotees:* Families and couples. Lift access.
   - *Configuration:* Deluxe A/C (201-203), Comfort Non-A/C (204-205), Family 4-Bed Suite (206).
3. **2nd Floor (Floor 2):** Rooms `301`, `302`, `303`, `304`, `305`, `306`
   - *Target Devotees:* Quiet upper-level pilgrim stays with elevator service.
   - *Configuration:* Deluxe A/C (301-303), Comfort Non-A/C (304-305), Family 4-Bed Suite (306).
4. **3rd Floor (Floor 3):** Room `401` & **Hall 402**
   - *Room 401:* Deluxe A/C suite.
   - *Room 402 (Large Bhakt Niwas Hall):* Group accommodation for 15–20 devotees (Dindi groups, bhajan mandals, large extended families) with multiple attached western toilets and geysers.

---

## 3. Daily Front Desk Operations Workflow

### 3.1 Morning Briefing
1. Log in to the PMS at `/admin`.
2. Check the real-time **Operations Deck**:
   - **Today's Arrivals:** Devotees checking in from 12:00 PM.
   - **Today's Departures:** Devotees checking out by 11:00 AM.
   - **Dirty Rooms Queue:** Units needing housekeeping turnover.

### 3.2 Guest Check-in Procedure & Police Verification
1. Open **Reservations Desk** (`/admin/reservations`).
2. Search by devotee name or booking reference (`ARN-2026-XXXX`) or scan the QR code on the guest's mobile voucher.
3. Verify government photo ID (Aadhaar Card, Voter ID, Driving License).
4. Click **Folio & ID Details** to record the ID type and document number in the digital lodge register (mandatory compliance under Maharashtra police regulations).
5. Ensure the assigned unit is marked **Clean & Ready**.
6. Click **Check-In Guest**. The status transitions to `checked_in`, recording the exact timestamp.
7. Inform the devotee of temple timings (Kakad Aarti at 4:00 AM, Shej Aarti at 11:00 PM).

### 3.3 Guest Check-out Procedure
1. Locate the guest in the reservations table.
2. If the devotee requests an official GST bill for tax/company claims, click **GST Invoice >** and print directly.
3. Click **Check-Out Guest**.
4. The system automatically:
   - Sets status to `checked_out`.
   - Records check-out timestamp.
   - **Automatically flags the physical room as `Dirty`** in `/admin/rooms` so housekeeping immediately begins cleaning for the next arriving devotee!

### 3.4 Front-Desk Walk-In & Telephone Bookings
For devotees arriving in person at Nath Chowk or calling host Yuvaraj Malave:
1. Click **+ Front-Desk Walk-In** button at `/admin/reservations`.
2. Select room category, check-in, check-out dates, and number of devotees.
3. Enter devotee name, phone, email, and ID proof number.
4. Select payment method (**Paid at Counter** or **Pay on Arrival**).
5. Click **Confirm & Reserve Room**. The system creates an instant booking and allocates the physical room.

---

## 4. Housekeeping & Maintenance Management (`/admin/rooms`)

Housekeeping lead Sunil Jadhav manages room turnovers floor by floor:
- **Clean & Ready (Emerald):** Sanitized, fresh bedsheets, geyser hot water tested, clean western toilet.
- **Dirty / Needs Cleaning (Red):** Automatically triggered on guest check-out.
- **Inspecting (Blue):** Cleaning complete; supervisor inspection in progress.
- **Maintenance (Stone):** Tap repair, AC servicing, painting, or electrical maintenance.
- **Maintenance Notes Modal:** Click **Add note** next to any unit to log notes (e.g. *"Geyser serviced", "Extra mattress placed for Room 402"*).

---

## 5. Tax Invoices & Financial Reports (`/admin/reports`)

- **GST Tax Invoices:** Accessible at `/booking/invoice/[reference]` with SAC Code `996311` (Room Accommodation Services), CGST 6%, SGST 6%, and Yuvaraj Malave signature line.
- **CSV Ledger Export:** Click **Export Ledger CSV** at `/admin/reports` to download complete transactional records for the lodge accountant.
