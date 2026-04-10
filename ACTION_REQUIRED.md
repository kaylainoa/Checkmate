# 🔧 IMMEDIATE ACTION REQUIRED

## Your Problem

Your email settings are showing as **COMPLETELY EMPTY** (all null).

Gmail can't authenticate with empty credentials → Error.

## The Fix (2 Minutes)

### Do This Now:

1. **Open Checkmate** (in browser)
2. **Settings** → scroll down
3. **Email Configuration** section
4. **Fill in these 4 fields:**
   ```
   Email Host: smtp.gmail.com
   Email Port: 587
   Email Address: your-email@gmail.com
   Email Password: your-app-password
   ```
5. **CLICK: Save Settings** ← Click this!
6. **WAIT**: See "Settings updated successfully"
7. **CLICK: Send Test Email**
8. **CHECK**: Your inbox

That's it! Email will work.

---

## Why It's Empty

You either:
- ✗ Didn't click Save Settings
- ✗ Page refreshed before saving
- ✗ Settings were cleared

**Doesn't matter why** - just re-enter them and click Save this time.

---

## App Password Reminder

If you need a new one:
→ https://myaccount.google.com/apppasswords

---

## Verification (Optional)

After saving, run:
```bash
curl http://localhost:52345/api/settings | jq '.data.settings | {host, port, address}'
```

Should show your settings, not nulls.

---

**Go save your settings now!** 🚀

[Full guide here](./EMPTY_CONFIG_FIX.md)
