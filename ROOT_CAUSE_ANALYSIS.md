# Email Notifications - Root Cause Analysis & Fix

## Error in Logs
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

## Root Cause
**The stored Gmail credentials in your database are INCORRECT or EXPIRED.**

This is NOT a bug in the code. The code is working correctly - it's attempting to use the credentials you saved, but those credentials are being rejected by Gmail's SMTP server.

---

## Why This Happens

### With Gmail
Gmail rejects login attempts when:
1. ❌ Using your **regular Gmail password** instead of an **App Password**
2. ❌ The **App Password has expired or been regenerated**
3. ❌ **2-Factor Authentication is not enabled** (required for App Passwords)
4. ❌ The credentials have **extra spaces** or **typos**
5. ❌ Your account has been **locked for security reasons**

### With Other Email Providers
1. ❌ Username/password incorrect
2. ❌ Account disabled or locked
3. ❌ Credentials expired

---

## How to Diagnose

### Option 1: Check Diagnostic Endpoint
```bash
# Get email configuration diagnostics (shows what's stored)
curl http://localhost:3000/api/settings/diagnostics/email
```

This will show you:
- Which email fields are configured
- What values are stored (password length, host, port, etc.)
- Whether config is complete

### Option 2: Check Server Logs
```bash
tail -50 server/app.log | grep -i "email\|transporter\|verification"
```

Look for error messages mentioning:
- "Invalid login" → Credentials are wrong
- "Cannot connect to host" → Host/port incorrect
- "Connection timeout" → Firewall or network issue

---

## The Fix: Reset Gmail Credentials

### Step 1: Generate a NEW App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. **Important**: You MUST have 2-Factor Authentication enabled first
3. Select **Mail** and your device type
4. Click **Generate**
5. Google displays a 16-character password (with spaces)
6. **Copy the entire password** (including spaces, or without - doesn't matter)

### Step 2: Verify Current Configuration
```bash
# Check what's currently stored
curl http://localhost:3000/api/settings/diagnostics/email
```

This helps confirm:
- Which fields are already set
- Whether password is stored
- Whether all required fields are present

### Step 3: Update Settings in Checkmate UI
1. Open Checkmate dashboard
2. Go to **Settings** → **Email Configuration**
3. **If password field says "set"**: Click **Reset** to clear it
4. Re-enter ONLY the fields that need updating:
   - **Email Host**: `smtp.gmail.com`
   - **Email Port**: `587` or `465`
   - **Email Address**: Your Gmail address
   - **Email Password**: Paste your NEW 16-character App Password
5. Click **Save Settings**

### Step 4: Send Test Email
1. Still in Settings → Email Configuration
2. Click **Send Test Email**
3. If successful ✅ → Configuration is now correct
4. If failed ❌ → Check error message and retry

---

## Troubleshooting the Fix

### "Still getting 'Invalid login' error"
- [ ] Did you generate a NEW App Password? (old ones might be invalid)
- [ ] Is the 16-character password entered exactly as shown (no extra spaces)?
- [ ] Is 2-Factor Authentication enabled on your Gmail account?
- [ ] Did you wait a few seconds after generating the password?

### "Connection timeout"
- [ ] Host is correct: `smtp.gmail.com` ✓
- [ ] Port is correct: `587` or `465` ✓
- [ ] Firewall isn't blocking SMTP connections

### "TLS certificate verification failed"
- [ ] Enable **Use SSL/TLS** ✓
- [ ] For port 587: Enable **Require TLS** ✓
- [ ] If still failing: Enable **Ignore TLS** (less secure, only if needed)

---

## Alternative: Diagnose via Direct Testing

### Using Node REPL to Test Credentials
```javascript
// In server directory
node
> import nodemailer from 'nodemailer';
> const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'YOUR_EMAIL@gmail.com',
      pass: 'YOUR_16_CHAR_PASSWORD'
    }
  });
> await transporter.verify();
// If true → credentials work ✓
// If error → credentials don't work ✗
```

---

## Verify Fix is Working

### After updating credentials:

1. **Test Email**: Send test email (should succeed)
2. **Test Notification**: Create email notification and test it
3. **Real Monitor Alert**: Trigger a monitor status change to receive real notification

---

## Security Notes

- 🔒 **Never** use "Less secure app access" in production
- 🔒 Always use **App Passwords** for Gmail
- 🔒 Enable **2-Factor Authentication** on your email account
- 🔒 Credentials are stored in plain text - keep database secure
- 🔒 Consider encrypting credentials in future versions

---

## Why Code Changes Don't Help Without Valid Credentials

The improvements made to the codebase help with:
- ✅ Better error messages
- ✅ Faster diagnosis
- ✅ Configuration validation
- ✅ Logging details

But they CANNOT:
- ❌ Fix invalid credentials
- ❌ Work around Gmail 2FA requirement
- ❌ Make expired passwords work

**You must provide valid credentials for email notifications to work.**

---

## Next Steps

1. **Generate a NEW App Password** from Gmail
2. **Update Settings** in Checkmate with the new password
3. **Send Test Email** to verify
4. **Monitor notifications** should now work!

If you still have issues, provide the output of:
```bash
curl http://localhost:3000/api/settings/diagnostics/email
```

And the latest error lines from:
```bash
tail -20 server/app.log | grep -i "email"
```
