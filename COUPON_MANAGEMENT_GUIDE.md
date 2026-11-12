# Coupon & Promotions Management Guide

**Aarunodya Residency Bhakt Niwas — Revenue & Marketing Manual**

---

## 1. Overview

The Coupon Management system allows lodge administrators and managers to configure promotional discounts, seasonal pilgrimage offers (e.g. Ashadhi Ekadashi, Kartiki Ekadashi, Diwali, Chaitra Vari), and targeted rewards for loyal devotees.

---

## 2. Accessing Coupon Management

In the Admin PMS navigation sidebar:
- Under **Guests & Marketing**, click **Coupon Management** (`/admin/coupons`).

---

## 3. Creating a New Promotion Coupon

Click the **+ Create New Coupon** button to launch the configuration drawer.

### Available Parameters:
1. **Coupon Code:** Unique alphanumeric code in uppercase (e.g., `VITTHAL10`, `DARSHAN200`, `EKADASHI25`).
2. **Discount Type:**
   - **Percentage (%):** Deducts a percentage from the base stay subtotal.
   - **Fixed Amount (₹):** Deducts a flat rupee amount from the bill.
3. **Discount Value:** The percentage number (e.g., `10` for 10%) or rupee value (e.g., `200` for ₹200).
4. **Max Discount Cap (₹):** Optional maximum ceiling for percentage discounts (e.g. 25% off capped at ₹500 maximum discount).
5. **Minimum Spend (₹):** The minimum room subtotal required before the coupon can be activated (e.g. ₹1,500).
6. **Validity Dates:** Start Date and Expiry Date restricting redemption periods.
7. **Redemption Limits:**
   - **Total Redemption Cap:** Maximum total times this code can be redeemed across all guests (e.g., first 100 bookings).
   - **Per Customer Cap:** Maximum times an individual devotee phone number can redeem the code (default: 1).
8. **Devotee Eligibility:**
   - `All Devotees`: Open to public.
   - `First-time Only`: Strictly limited to new guests with zero previous bookings.
   - `Returning Devotees`: Reserved for repeat devotees with at least 1 completed stay.

Click **Create & Publish Coupon** to activate the promotion immediately.

---

## 4. Server-Side Financial Safety & Validation Rules

Client-side calculations are **never** trusted by the system:
1. When a devotee or receptionist clicks **Apply**, the client submits a request to `POST /api/coupons/validate`.
2. The server verifies:
   - Does the coupon code exist and is it active?
   - Is today within `[startDate, expiryDate]`?
   - Is the subtotal $\ge \text{minBookingValuePaise}$?
   - Has the total redemption limit been exhausted?
   - Has this customer exceeded their personal redemption quota?
3. The server computes the discount in minor integer paise:
   $$\text{Discount} = \min(\text{Calculated Discount}, \text{Max Discount Cap})$$
4. The discounted subtotal is locked into the booking hold.

---

## 5. Coupon Performance Analytics

The Coupon Dashboard provides real-time business metrics:
- **Active Campaigns:** Number of live promotions currently accepting bookings.
- **Total Redemptions:** Exact count of reservations successfully confirmed with coupons.
- **Discounts Distributed:** Ledger sum of all rupee savings provided to pilgrims.
- **Per-Coupon Progress Bar:** Visual progress tracking how many coupons remain out of the total cap (e.g. 24 / 100 used).
- **Status Toggle:** Instantly pause or resume any campaign with a single click.

