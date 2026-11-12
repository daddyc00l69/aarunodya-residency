# Excel Data Import & Export Guide

**Aarunodya Residency Bhakt Niwas — Enterprise Data Mobility Manual**

---

## 1. Overview

The Excel Import & Export Center provides real `.xlsx` spreadsheet generation and batch ingestion using SheetJS (`xlsx`). It allows accountants, auditors, and lodge management to extract financial records and import offline guest rosters with zero data corruption.

---

## 2. Accessing the Data Center

In the Admin PMS navigation sidebar:
- Under **Financials & Data**, click **Excel Import / Export** (`/admin/data/import-export`).

---

## 3. Exporting Real Excel (.xlsx) Workbooks

Unlike basic CSV dumps, exported files are formatted as true binary `.xlsx` workbooks readable by Microsoft Excel, Apple Numbers, and Google Sheets.

### Available Datasets:
1. **Devotee Customers Database (`customers`):**
   - Customer ID, Full Legal Name, Primary Mobile, Alternate Phone, Email, City, State, Address, Preferred Language, Total Visits, Lifetime Spend (₹), Registered Date.
2. **Reservations & Room Folios (`reservations`):**
   - Booking Reference, Guest Name, Contact, Check-in Date, Check-out Date, Nights, Room Category, Physical Room Number, Status, Payment Status, Subtotal, Discount, Tax, Total Tariff (₹), Amount Paid, Balance Due.
3. **All Payment Transactions (`payments`):**
   - Transaction ID, Booking Reference, Method (Online Razorpay / Cash), Amount (₹), Status, Gateway Payment ID / Cash Receipt Number, Timestamp.
4. **Front Desk Cash Register Ledger (`cash_ledger`):**
   - Transaction ID, Receipt/Refund Voucher, Booking Ref, Type (Payment vs Refund), Amount (₹), Cashier Name, Authorized Manager, Notes, Timestamp.
5. **Coupons & Devotee Redemptions (`coupons`):**
   - Coupon Code, Description, Discount Type, Discount Value, Max Cap (₹), Min Spend (₹), Start Date, Expiry Date, Total Redemptions, Active Status.

### Date Filtering:
Optionally select **From Date** and **To Date** before clicking **Download .xlsx File** to extract records for a specific financial quarter, tax month, or pilgrimage week.

---

## 4. Guided Batch Customer Import

To migrate pilgrim contacts from legacy registers, diaries, or other hotel software:

### Step 1: Download Official Template
Click **Download Sample Template (.xlsx)** to download a pre-formatted Excel workbook containing standard columns:
- `Full Name` (Mandatory, min 2 chars)
- `Mobile Phone` (Mandatory, 10-digit Indian phone)
- `Email` (Optional)
- `City` (Optional)
- `State` (Optional)
- `Notes` (Optional)

### Step 2: Choose Duplicate Conflict Strategy
Select how the system should handle records that match an existing mobile number or email:
- **Update Existing (Recommended):** Updates the address, city, and notes of existing profiles while preserving historical stays and verified documents.
- **Skip Duplicates:** Leaves existing profiles untouched and only imports newly discovered devotees.
- **Abort on Conflict:** Strictly aborts the entire import batch if any duplicate record is detected.

### Step 3: Execute Batch Ingestion
1. Choose the `.xlsx`, `.xls`, or `.csv` file.
2. Click **Execute Customer Batch Import**.
3. The system parses the workbook in memory, runs Zod schema validation row-by-row, and outputs an execution report showing:
   - Total rows processed
   - Newly created profiles
   - Updated existing profiles
   - Skipped records
   - Validation failure reasons with row numbers (e.g. `Row 4: Invalid 10-digit phone number`).

