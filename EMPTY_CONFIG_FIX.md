# ⚠️ CRITICAL: Email Configuration is EMPTY

## What We Found

Your email settings in the database show:
```json
{
  "host": null,
  "port": null,
  "address": null,
  "user": null,
  "secure": null
}
```

**Translation**: No email settings are saved at all!

---

## Why Gmail is Rejecting

When all fields are `null`:
- Email service tries to connect with empty username/password
- Gmail rejects: "Invalid login"
- But it's not the password - the PASSWORD IS EMPTY/NULL

---

## How to Fix This

### Step 1: Verify You're Entering Settings Correctly

In Checkmate Settings → Email Configuration:

✅ **Must fill EXACTLY these fields:**
1. Email Host: `smtp.gmail.com`
2. Email Port: `587` (or `465`)
3. Email Address: `your-email@gmail.com`
4. Email Password: Your 16-char App Password

### Step 2: Make Sure You Click SAVE

- After entering all fields
- Click the **SAVE SETTINGS** button
- Wait for confirmation message
- You should see "App settings updated successfully"

### Step 3: Verify It Was Saved

```bash
# Check if settings are now saved
curl http://localhost:52345/api/settings | jq '.data.settings | {host: .systemEmailHost, port: .systemEmailPort, address: .systemEmailAddress}'
```

Should show:
```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "address": "your-email@gmail.com"
}
```

### Step 4: Test Again

- Go to Email Configuration
- Click "Send Test Email"
- Should work now ✓

---

## Common Mistakes

❌ **Entering settings but forgetting to click SAVE**
→ Go back to Settings → Fill fields again → Click SAVE

❌ **Closing the page before saving**
→ Go back to Settings → Enter all 4 fields → Click SAVE

❌ **Only saving one field**
→ Make sure ALL 4 required fields are filled before saving:
  - Host
  - Port
  - Address
  - Password

❌ **Port showing as blank**
→ Select: 587 (not blank)

❌ **Checking "secure" when using port 587**
→ For port 587: Secure should be UNCHECKED
→ For port 465: Secure should be CHECKED

---

## Step-by-Step to Fix

1. **Open Checkmate** in browser
2. **Go to Settings**
3. **Scroll to "Email Configuration"**
4. **Fill in exactly:**
   - Email Host: `smtp.gmail.com`
   - Email Port: `587` ← Important!
   - Email Address: `your-email@gmail.com`
   - Email Password: Paste App Password
   - Use SSL/TLS: Check if port 465, Uncheck if port 587
5. **Click SAVE SETTINGS button** ← Very Important!
6. **Wait** for "Settings updated successfully"
7. **Click "Send Test Email"**
8. **Check inbox** for test email

---

## The Password Issue

You said you used an App Password, but it's showing as `null` in database.

**This means:**
- The password field in the form was empty when you hit save
- OR the save button wasn't clicked
- OR the page refreshed before saving

**Solution:**
1. Go back to Settings
2. Generate a FRESH App Password from Gmail
3. Copy it (ctrl+C on the generated password)
4. Paste it into the Password field (ctrl+V)
5. Click SAVE SETTINGS
6. Wait for confirmation

---

## Why Passwords Appear as Null

In our diagnostics, we intentionally don't show the actual password (for security).

But if ALL fields are null, it means:
1. Settings were never saved
2. OR were cleared somehow
3. OR database was reset

---

## Database Reset?

Did you:
- [ ] Restart the server recently?
- [ ] Clear MongoDB data?
- [ ] Reset the database?
- [ ] Reinstall dependencies?

If yes, settings might have been cleared and you need to re-enter them.

---

## Next Actions (In Order)

1. **DON'T restart anything**
2. **Open Checkmate in browser**
3. **Go to Settings**
4. **Enter ALL 4 email fields** (Host, Port, Address, Password)
5. **Click SAVE SETTINGS**
6. **Wait for success message**
7. **Send Test Email**
8. **Check inbox**

---

## If It Still Shows Null

The save button might not be working:
1. Check browser console for errors (F12)
2. Check server logs for save errors
3. Try a different browser
4. Try clearing browser cache

---

## Verify Before Testing

Run this to check if settings actually saved:
```bash
curl http://localhost:52345/api/settings | jq '.data'
```

You should see your email settings, NOT nulls.

---

## Bottom Line

Your email config is completely empty. Enter it again, make sure to click SAVE, and it will work.

**Time**: 2 minutes
**Difficulty**: Very easy
**Result**: Working emails ✓

Go save your settings now! 🚀
