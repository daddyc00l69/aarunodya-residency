# Front Desk Reception Cash Booking & Drawer Guide

**Aarunodya Residency Bhakt Niwas — Reception Operations Manual**

---

## 1. Overview

The Reception Cash Booking module empowers front-desk staff to handle walk-in devotees arriving in Pandharpur directly at the lodge counter, manage room allocation across the 18 physical units, collect cash advances or settlements, and maintain total drawer accountability without relying on external payment gateways.

---

## 2. Navigating to the Walk-in Desk

1. Log in to the Admin PMS dashboard with staff credentials.
2. In the navigation sidebar, under **Front Desk & Cashier**, select:
   - **Reception Walk-in** (`/admin/reception/walkin`)

---

## 3. Step-by-Step Walk-in Reservation Process

### Step 1: Guest Identification
- **Returning Devotees:** Enter the guest's mobile number, legal name, or customer ID in the live search bar. Selecting an existing profile automatically links past stay history, city, and verified documents.
- **New Walk-ins:** Enter:
  - Full Legal Name
  - 10-digit Mobile Number (mandatory for SMS/e-receipt tracking)
  - Origin City and State (e.g., Solapur, Pune, Kolhapur)
  - Government ID Type & Number (Aadhaar, Voter ID, Passport, DL)
- **Additional Staying Guests:** Click **+ Add Guest** to record accompanying family members (name, age, gender) for police register compliance.

### Step 2: Room Selection & Physical Key Allocation
1. Select **Check-in Date** and **Check-out Date**.
2. Select the room category (Deluxe AC, Comfort Non-AC, Family 4-Bed Suite, or 3rd Floor Bhakt Niwas Hall 402).
3. The system scans the calendar and renders only the currently **vacant physical rooms**.
4. Click on the designated physical room button (e.g. `Room 101`, `Room 203`, `Room 402`) to lock the unit. Double-booking is strictly prohibited by server-side interval validation.

### Step 3: Tariff, Coupons & Cash Collection
1. Review the pricing breakdown (gross nights, extra devotee charges, GST exemption or 12% calculation).
2. If the devotee has a promotional or returning voucher (e.g., `VITTHAL10`, `RETURN-XXXX`), enter it in the coupon box and click **Apply**.
3. Choose the Cash Payment Mode:
   - **Full Cash:** Entire bill collected immediately; payment status is set to `paid`.
   - **Partial Cash:** Enter the advance collected (e.g., ₹1,000); the system computes the exact remaining balance due and sets status to `partially_paid`.
   - **Pay Later:** 0 collected now; full balance due upon checkout; status set to `unpaid`.
4. Enter any shift notes or currency breakdown (e.g. "Received two ₹500 notes").
5. Click **Confirm Walk-in & Issue Receipt**.

### Step 4: Official Receipt Generation
Upon successful booking:
- A verified booking reference is issued (e.g. `ARN-WALK-1076`).
- An official cash receipt voucher is stamped in the ledger (e.g. `RCP-ARN-1179`).
- Staff can click **Print Official Receipt** to open the branded printable invoice.

---

## 4. Cash Register & Daily Drawer Management

Access: **Cash Register & Shifts** (`/admin/reception/cash-register`)

### 4.1 Drawer Summary Cards
- **Drawer Net Cash:** Current physical currency that must exist in the counter drawer:
  $$\text{Net Cash} = \text{Opening Float} + \text{Total Cash Inflow} - \text{Total Cash Refunds}$$
- **Collections:** Total cash receipts issued during the target date.
- **Cash Refunds:** Total authorized refunds disbursed.
- **Shift Status:** Indicates whether the active cashier shift is Open or Closed.

### 4.2 Recording Additional Payments
When a guest staying in room 101 comes to the counter to settle their remaining balance:
1. Click **Collect Payment**.
2. Enter the booking reference (e.g. `ARN-WALK-1076`).
3. Enter the cash amount collected.
4. Click **Record Payment & Issue Receipt**.
5. The remaining balance decreases dynamically, and a new `RCP-ARN-XXXX` receipt is generated.

### 4.3 Authorizing Cash Refunds
If a pilgrim must depart early due to changes in temple darshan slots:
1. Click **Issue Refund**.
2. Enter the booking reference, refund amount (in ₹), authorized reason, and manager PIN.
3. Click **Authorize Cash Refund**.
4. A stamped refund voucher (`REF-ARN-XXXX`) is logged, and the booking status updates to `partially_refunded` or `refunded`.

### 4.4 Opening & Closing Shifts
- **Opening:** Start each morning with the counter float (e.g., ₹2,000 in small change).
- **Closing:** At shift handoff, physically count all currency in the drawer, enter the actual count, add handover notes, and click **Close Shift & Seal Ledger**.
