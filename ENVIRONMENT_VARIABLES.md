# Environment Variables Configuration Guide

**Aarunodya Residency Bhakt Niwas PMS**

---

## 1. Overview

The system requires specific environment variables for transactional emails, Razorpay online booking, and cryptographic staff authentication. These variables should be placed in `.env.local` for local development or configured in your hosting platform (Vercel, AWS, Railway, Netlify).

---

## 2. Environment Variables Reference

| Variable Name | Required | Default / Format | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` / `production` | Node environment runtime flag. |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Canonical URL of the application. |
| `ADMIN_SESSION_SECRET` | Yes | 64-char Hex String | Secret key for signing staff HMAC-SHA256 session cookies. |
| `RESEND_API_KEY` | Yes | `re_...` | Resend API key for transactional email dispatches. |
| `EMAIL_FROM` | Yes | `Aarunodya Residency <onboarding@resend.dev>` | From header for outgoing emails. |
| `EMAIL_DOMAIN` | Optional | `devtushar.uk` | Verified sending domain. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | `rzp_test_...` | Razorpay public key ID for client checkout. |
| `RAZORPAY_KEY_ID` | Yes | `rzp_test_...` | Razorpay server-side key ID for order generation. |
| `RAZORPAY_KEY_SECRET` | Yes | Secret Key String | Razorpay secret key for HMAC signature verification. |
| `DATABASE_URL` | Optional | PostgreSQL connection string | Relational database connection string when using SQL mode. |

---

## 3. Sample `.env.local` File Template

```bash
# Application Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Staff Session Cryptographic Secret (Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ADMIN_SESSION_SECRET=your_high_entropy_64_character_hex_secret_here

# Resend Transactional Email Credentials
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=Aarunodya Residency <onboarding@resend.dev>
EMAIL_DOMAIN=devtushar.uk

# Razorpay Test Mode Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
```

---

## 4. Security Notes
- Never commit active production API secrets or private keys to public Git repositories.
- In production, set `ADMIN_SESSION_SECRET` to a high-entropy 256-bit hexadecimal string.
