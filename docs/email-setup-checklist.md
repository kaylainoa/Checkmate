# Quick Checklist: Email Notifications Setup

## ✅ Prerequisites
- [ ] Have access to your email account (Gmail, Outlook, etc.)
- [ ] Know your email address
- [ ] For Gmail: Have 2-Factor Authentication enabled
- [ ] For Gmail: Generated an App Password

---

## ✅ Configuration Steps

### Step 1: Get Your Credentials
**For Gmail with 2FA:**
1. Go to https://myaccount.google.com/apppasswords
2. Choose "Mail" and your device
3. Generate the password
4. Copy the 16-character password (you'll need this)

**For Other Providers:**
- Contact your email provider for SMTP settings
- Verify username and password are correct

### Step 2: Add to Checkmate
1. Open Checkmate Dashboard
2. Go to **Settings** (top menu)
3. Scroll to **Email Configuration** section
4. Fill in these fields:

| Field | Gmail Example | Other Providers |
|-------|---------------|-----------------|
| **Email Host** | `smtp.gmail.com` | `mail.example.com` |
| **Email Port** | `587` or `465` | Check with provider |
| **Email Address** | `your-email@gmail.com` | Your email address |
| **Email User** | (optional, same as above) | Usually not needed |
| **Email Password** | **Your 16-char App Password** | Your email password |
| **Use SSL/TLS** | ✅ Yes | Usually yes |
| **Require TLS** | ✅ Yes | Check with provider |

### Step 3: Save Configuration
- Click **Save Settings**
- You should see: "App settings updated successfully"

### Step 4: Test It Works
1. In Email Configuration, click **Send Test Email**
2. Check your inbox for the test email
3. If received: ✅ **Configuration is correct!**
4. If not received: ❌ Check error message (see troubleshooting below)

---

## ❌ Troubleshooting

### "Invalid login: Username and Password not accepted"
**For Gmail:**
- Are you using an **App Password** (not your regular password)?
- Have you enabled **2-Factor Authentication**?
- Is the 16-character password correct (no extra spaces)?

**For Other Providers:**
- Double-check username and password
- Verify they're exactly correct (copy/paste if possible)

### "Connection timeout" or "Cannot connect to host"
- Verify Host is correct (e.g., `smtp.gmail.com`)
- Verify Port is correct (usually 587 or 465)
- Check your firewall isn't blocking SMTP

### "TLS required but not available"
- Enable **Use SSL/TLS**
- Enable **Require TLS**
- Try changing port to 587

### Still not working?
1. Check the server logs: `tail -f server/app.log | grep -i email`
2. Read the full guide: `docs/email-notifications-troubleshooting.md`
3. Regenerate your App Password (for Gmail)

---

## ✅ After Configuration Works

### Create Email Notifications
1. Go to **Notifications** (in sidebar)
2. Click **+ Create Notification**
3. Fill in:
   - **Notification Name**: e.g., "Alert to my email"
   - **Type**: Select "email"
   - **Email Address**: Where alerts should be sent
4. Click **Create**

### Assign to Monitors
1. Go to **Monitors** (in sidebar)
2. Select a monitor
3. Scroll to **Notifications** section
4. Add the email notification you created
5. Save

### Test a Real Notification
1. Open monitor details
2. Click **Test Notification** button
3. Should receive email within seconds

---

## 📝 Notes

- 🔒 **Gmail**: Always use App Passwords, never "Less secure app access"
- 🔒 Keep your password safe and secure
- 🔑 For Gmail, the App Password is different from your regular password
- ✉️ Test emails go to your user account email by default
- 📧 Monitor notifications go to the email address specified in the notification settings

---

## 🆘 Need Help?

1. **Server Logs**: `tail -100 server/app.log` to see what went wrong
2. **Full Guide**: Read `docs/email-notifications-troubleshooting.md`
3. **Check Credentials**: Verify they work in your email client first
4. **For Gmail**: Visit https://support.google.com/mail/?p=BadCredentials

---

**Last Updated**: April 10, 2026
