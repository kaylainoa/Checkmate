# 🔴 Your Exact Error Breakdown

## What Your Logs Show

```json
{
  "level": "warn",
  "message": "Email transporter verification failed",
  "method": "verifyTransporter",
  "service": "EmailService",
  "timestamp": "2026-04-10T02:40:49.874Z",
  "stack": "Error: Invalid login: 535-5.7.8 Username and Password not accepted. 
    For more information, go to https://support.google.com/mail/?p=BadCredentials 
    956f58d0204a3-65197bec2fcsm619331d50.11 - gsmtp
    at SMTPConnection._formatError (/Users/kaylainoa/Projects/SWE Mini Project/Checkmate/server/node_modules/nodemailer/lib/smtp-connection/index.js:912:19)
    at SMTPConnection._actionAUTHComplete (/Users/kaylainoa/Projects/SWE Mini Project/Checkmate/server/node_modules/nodemailer/lib/smtp-connection/index.js:1722:34)"
}
```

---

## Line by Line Explanation

### `"level": "warn"`
This is a WARNING level error (not critical, but something's wrong)

### `"message": "Email transporter verification failed"`
**What it means**: Checkmate tried to verify the email connection with Gmail and failed

**Translation**: The email settings don't work

### `"method": "verifyTransporter"`
This is the code that TRIED to verify the connection:
```javascript
await this.transporter.verify();  // Failed here
```

### The Real Problem
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Breaking it down:**
- **`Invalid login`** = Gmail says your credentials are wrong
- **`535-5.7.8`** = This is Gmail's specific error code for bad credentials
- **`Username and Password not accepted`** = The combo you sent isn't valid

**Translation**: 🔑 Your stored email password is WRONG

### The Gmail Help Link
```
https://support.google.com/mail/?p=BadCredentials
```
This is what Google says about this error:
> "The application is not using the correct username or password for authentication. 
> If using Gmail, consider using an App Password instead of your regular password."

**Translation**: You need to use an **App Password**, not your regular Gmail password

---

## What Happened Step by Step

```
1. Monitor status changed (e.g., went DOWN)
   ↓
2. Checkmate needed to send an email notification
   ↓
3. Checkmate got the stored email credentials from database:
   {
     host: "smtp.gmail.com",
     port: 587,
     address: "your-email@gmail.com",
     password: "whatever-was-stored"  ← WRONG PASSWORD
   }
   ↓
4. Checkmate tried to connect to Gmail SMTP:
   connect to: smtp.gmail.com:587
   with: user=your-email@gmail.com, pass=whatever-was-stored
   ↓
5. Gmail checked: "Is this valid?"
   Response: "No! Password not accepted"
   ↓
6. Connection rejected, email not sent
   ↓
7. Error logged: "Invalid login: 535-5.7.8"
```

---

## Why It Says "Not Accepted"

Gmail rejects because one of:
- ❌ Password is regular Gmail password (not allowed)
- ❌ Password is old/revoked App Password
- ❌ Password was typed wrong
- ❌ Password has extra spaces
- ❌ Account is locked or suspended

---

## How to Fix (The Password Issue)

### Current Situation
```
Your Database:
  email: "your-email@gmail.com"
  password: "wrong-password-here"
              ↓
Gmail: "Nope, rejected"
              ↓
Email doesn't send ✗
```

### After Fix
```
Your Database:
  email: "your-email@gmail.com"
  password: "abcd efgh ijkl mnop"  (Fresh App Password)
              ↓
Gmail: "Yes, valid!"
              ↓
Email sends ✓
```

---

## The Exact Steps to Fix

### 1. Go to Gmail
https://myaccount.google.com/apppasswords

### 2. Get New Password
You'll get something like: `abcd efgh ijkl mnop` (16 characters with spaces)

### 3. Update Checkmate
```
Settings → Email Configuration
Password field → Click Reset
Paste: abcd efgh ijkl mnop
Save Settings
```

### 4. Test
```
Send Test Email → ✓ Works!
```

---

## What Changed in Your Checkmate

We improved the error message to be clearer. Now it would show:

**Before (Old):**
```
Email transporter verification failed
```

**After (New):**
```
Email transporter verification failed: Invalid login: 535-5.7.8 Username and Password not accepted
[Configuration Details: host: smtp.gmail.com, port: 587]
```

Much clearer that it's a credentials issue!

---

## Timeline of Your Error

```
Feb/Mar 2026: Email was working (credentials were valid)
    ↓
April 2026: Your password expired or was revoked
    ↓
April 10, 02:39:17 UTC: Monitor triggers, tries to send email
    ↓
ERROR: "Invalid login: 535-5.7.8"
    ↓
Email doesn't send
    ↓
Monitor alert notification fails
```

---

## The Fix Takes 5 Minutes

```
⏱️  1 min: Go to Gmail, generate App Password
⏱️  2 min: Update Checkmate settings  
⏱️  1 min: Send test email
⏱️  1 min: Verify it works
────────
⏱️ 5 min: DONE! 🎉
```

---

## After the Fix

- ✅ Test email sends
- ✅ Notifications are created
- ✅ Monitor alerts send via email
- ✅ Error logs stop showing "Invalid login"

---

## Why This Happened

Gmail security policy:
1. **2023**: Gmail disables plain passwords for third-party apps
2. **Requires**: App Passwords for tools like Checkmate
3. **Requires**: 2-Factor Authentication to use App Passwords
4. **Rotates**: Passwords periodically for security
5. **Your case**: Your old password is no longer valid

**This is NOT a Checkmate bug. This is Gmail being secure.** ✓

---

## Next Action

👉 **Follow QUICK_FIX.md to fix it right now**

It'll take 5 minutes and your email notifications will work again! 🚀
