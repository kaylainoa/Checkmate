# The Email Error Explained

## What You're Seeing in Logs

```json
{
  "level": "warn",
  "message": "Email transporter verification failed",
  "method": "verifyTransporter",
  "service": "EmailService",
  "stack": "Error: Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to https://support.google.com/mail/?p=BadCredentials 956f58d0204a3-65197bec2fcsm619331d50.11 - gsmtp"
}
```

---

## What This Means

### The Error Code
**`Invalid login: 535-5.7.8`** = Gmail saying: "Your login credentials are wrong"

### The Full Error
```
"Username and Password not accepted"
```

This means Gmail tried to connect with your credentials and rejected them.

---

## Why This Happens

### ❌ Wrong Password Type
You saved your **regular Gmail password**, but Gmail doesn't allow that for third-party apps.

**Solution**: Use an **App Password** instead

### ❌ Expired App Password
You saved an **old App Password** that Gmail revoked.

**Solution**: Generate a **NEW App Password**

### ❌ Wrong Email Address
The email address in settings doesn't match your Gmail account.

**Solution**: Verify the email address is correct

### ❌ 2FA Not Enabled
App Passwords require **2-Factor Authentication**.

**Solution**: Enable 2FA on your Gmail account

---

## The Gmail Authentication Flow

```
┌─────────────────┐
│  Checkmate      │
│  Sends:         │
│  - Username     │
│  - App Password │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Gmail SMTP     │
│  Checks:        │
│  - Valid combo? │
│  - Still active?│
└────────┬────────┘
         │
         ├─ ✅ YES → Email sends ✓
         │
         └─ ❌ NO  → "Invalid login" error
                    (This is you ↑)
```

---

## How to Fix It

### Step 1: Generate Valid Credentials
```
Gmail Account
  ↓
2-Factor Authentication (MUST be enabled)
  ↓
Generate App Password
  ↓
Get 16-character password
```

### Step 2: Save in Checkmate
```
Checkmate Settings
  ↓
Email Configuration
  ↓
Paste App Password
  ↓
Save
```

### Step 3: Verify
```
Checkmate Settings
  ↓
Send Test Email
  ↓
Check inbox ✓ or error message ✗
```

---

## Common Questions

### Q: Why can't I use my regular Gmail password?
**A**: For security. Gmail blocks third-party apps from using regular passwords. App Passwords are specifically for apps.

### Q: Where do I get an App Password?
**A**: https://myaccount.google.com/apppasswords

### Q: Do I need 2-Factor Authentication?
**A**: YES. It's required to generate App Passwords. Enable it here: https://myaccount.google.com/security

### Q: What if I keep getting the same error after updating?
**A**: 
1. Generate a FRESH App Password (old ones might be revoked)
2. Click Reset on the password field in Checkmate
3. Paste the new password
4. Save Settings
5. Try test email again

### Q: Can I use Outlook/another email provider?
**A**: Yes! The error would be the same but the fix would use that provider's settings.

---

## What Each Error Code Means

| Error | Meaning | Fix |
|-------|---------|-----|
| `Invalid login: 535-5.7.8` | Credentials wrong | Use App Password |
| `Connection timeout` | Can't reach server | Check host/port |
| `TLS required` | Security requirement | Enable TLS |
| `Certificate verification failed` | SSL cert issue | Check TLS settings |

---

## Visual: The Problem

```
Current State:
┌─────────────┐        ┌─────────────┐
│  Checkmate  │        │  Gmail SMTP │
│  Stored:    │───X───→│             │
│  Username ✓ │        │  Checking:  │
│  Password ✗ │        │  Valid? NO! │
└─────────────┘        └─────────────┘
  (Wrong pwd)           "Reject login"
```

```
After Fix:
┌─────────────┐        ┌─────────────┐
│  Checkmate  │        │  Gmail SMTP │
│  Stored:    │───✓───→│             │
│  Username ✓ │        │  Checking:  │
│  Password ✓ │        │  Valid? YES!│
└─────────────┘        └─────────────┘
  (Correct pwd)        "Accept, connect"
       │                     │
       └─────────────────────┘
              ✓ Email sends
```

---

## The 30-Second Explanation

**The Problem**: Your saved email password is wrong for Gmail.

**Why**: Gmail requires a special "App Password" for third-party apps, not your regular password.

**The Fix**: 
1. Generate a new App Password from Gmail
2. Update Checkmate with that password  
3. Test to verify it works

**Time**: 5 minutes ⏱️

---

## Error Log Locations

### In Checkmate
```
- Check Settings → Email Configuration for errors
- Send Test Email to see error message
- Look for red error text
```

### In Server Console
```bash
tail -f server/app.log | grep -i "email\|transporter\|authentication"
```

### On Your Computer
```bash
# macOS/Linux
grep "Email\|Invalid login" server/app.log

# Windows (PowerShell)
Select-String -Path server/app.log -Pattern "Email|Invalid login"
```

---

## Next Action

→ **Follow QUICK_FIX.md to fix it in 5 minutes**

OR

→ **Follow ROOT_CAUSE_ANALYSIS.md for detailed explanation**
