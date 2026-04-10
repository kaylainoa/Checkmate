# QUICK FIX: Email Notifications Not Working

## TL;DR - 5 Minute Fix

### The Problem
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Translation**: Your Gmail password is wrong.

### The Solution

#### 1️⃣ Get a NEW App Password (2 minutes)
- Go to: https://myaccount.google.com/apppasswords
- Choose: **Mail** + **your device**  
- Click: **Generate**
- Copy the 16-character password

#### 2️⃣ Update Checkmate (1 minute)
- Open Checkmate
- Settings → Email Configuration
- **Click Reset** on password field (if it shows "set")
- Paste your NEW 16-char password
- **Save Settings**

#### 3️⃣ Test It (1 minute)
- **Send Test Email** button in Settings
- Check your inbox ✅
- If received → **DONE!** 🎉
- If not → Check error message

#### 4️⃣ Troubleshoot (if needed)
```bash
# Check what's stored
curl http://localhost:3000/api/settings/diagnostics/email

# Check recent errors
tail -20 server/app.log | grep -i email
```

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| "Invalid login" | Generate NEW App Password, use that instead |
| "Can't connect to host" | Check host = `smtp.gmail.com`, port = `587` or `465` |
| "TLS error" | Enable "Use SSL/TLS" + "Require TLS" |
| "Password says set but emails fail" | Click Reset, then re-enter the password |

---

## Requirements (MUST HAVE)

- ✅ Gmail account with **2-Factor Authentication** enabled
- ✅ App Password generated (from step 1 above)
- ✅ All 4 email fields filled in:
  - Host: `smtp.gmail.com`
  - Port: `587` (or `465`)
  - Address: your-email@gmail.com
  - Password: 16-char App Password

---

## After Fix Works

1. Go to **Notifications** → Create email notification
2. Go to **Monitors** → Add notification to monitors
3. Emails will now send when monitors go down/up

---

## Still Broken?

1. **Did you use an App Password?** (NOT regular Gmail password)
2. **Did you generate a FRESH one?** (old passwords don't work)
3. **Did you enable 2FA first?** (required for App Passwords)
4. **Did you click Save Settings?** (changes must be saved)
5. **Did you wait 30 seconds after saving?** (takes moment to take effect)

If still not working:
```bash
# Show what's stored
curl http://localhost:3000/api/settings/diagnostics/email

# Show errors
grep "Email" server/app.log | tail -10
```

---

## The Why

Gmail doesn't allow regular passwords for third-party apps (for security). You must use a special "App Password" generated specifically for Checkmate. That's it!

**Status**: The code is working fine. Your Gmail just needs the right password.
