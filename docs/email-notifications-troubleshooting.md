# Email Notifications Troubleshooting Guide

## Common Issue: "Invalid login: Username and Password not accepted"

### Root Cause
The most common reason email notifications fail is **incorrect or expired Gmail credentials**. Gmail requires special passwords for third-party applications and has strict authentication requirements.

---

## Solution: Using Gmail with App Passwords

### Step 1: Enable 2-Factor Authentication (if not already enabled)
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", ensure **2-Step Verification** is enabled
4. If not enabled, click **2-Step Verification** and follow the setup process

### Step 2: Create an App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. If prompted to sign in again, do so
3. Select:
   - **App**: Mail
   - **Device**: Windows Computer (or your device type)
4. Click **Generate**
5. Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`)
6. **Copy this password** (you'll use it in Checkmate)

### Step 3: Configure Checkmate Email Settings
1. In Checkmate, go to **Settings** → **Email Configuration**
2. Fill in the following:
   - **Email Host**: `smtp.gmail.com`
   - **Email Port**: `587` or `465`
     - Use `587` for TLS (recommended)
     - Use `465` for SSL
   - **Email Address**: Your Gmail address (e.g., `your-email@gmail.com`)
   - **Email User** (optional): Your Gmail address (if different from Email Address)
   - **Email Password**: Paste the 16-character **App Password** from Step 2
   - **Use SSL/TLS**: ✅ Enabled
   - **Require TLS**: ✅ Enabled (for port 587)
   - **Connection Host**: `localhost` (usually default)

3. Click **Send Test Email** to verify the configuration works

---

## Configuration by Email Provider

### Gmail (with 2FA and App Password)
```
Host: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
Address: your-email@gmail.com
Password: Your 16-character App Password
Secure: ✅ Yes (if port 465)
Require TLS: ✅ Yes
```

### Gmail (without 2FA - NOT RECOMMENDED)
If you don't have 2FA enabled:
1. Enable "Less secure app access": [myaccount.google.com/lesssecureapps](https://myaccount.google.com/lesssecureapps)
2. Use your regular Gmail password
3. **Note**: This is less secure and may stop working

### Outlook/Office 365
```
Host: smtp-mail.outlook.com
Port: 587 (TLS) or 465 (SSL)
Address: your-email@outlook.com
Password: Your Outlook password
Secure: ✅ Yes (if port 465)
Require TLS: ✅ Yes
```

### Custom SMTP Server
```
Host: mail.yourcompany.com
Port: 25, 587, or 465 (check with your IT)
Address: your-email@yourcompany.com
Password: Your email password
Secure/Require TLS: Check with your mail server admin
```

---

## Troubleshooting Steps

### 1. **Check Email Configuration is Complete**
Ensure ALL of these fields are filled:
- ✅ Email Host
- ✅ Email Port
- ✅ Email Address
- ✅ Email Password

### 2. **Test the Configuration**
1. Go to **Settings** → **Email Configuration**
2. Click **Send Test Email**
3. Check for error message:
   - **Success**: Your configuration is correct
   - **Error**: See relevant section below

### 3. **Common Error Messages & Solutions**

#### "Invalid login: Username and Password not accepted"
- **For Gmail**: Ensure you're using an **App Password**, not your regular Gmail password
- **For other providers**: Verify your credentials are correct
- Try resetting your password and re-entering it

#### "Connection timeout" or "Cannot connect to host"
- Verify the **Host** and **Port** are correct
- Check your firewall/network isn't blocking outgoing SMTP connections
- Try a different port (587 or 465) if available

#### "TLS required but not available"
- Enable **Use SSL/TLS**
- Enable **Require TLS**
- Try port 587 instead of 25

#### "Certificate verification failed"
- Enable **Ignore TLS** (less secure, only if needed)
- Or provide the correct **TLS Server Name**

### 4. **Check Server Logs**
Look for error messages in the server logs:
```
grep -i "email\|notification" server/app.log
```

---

## Testing Email Notifications

After configuring email settings:

1. **Test Email**: Use the "Send Test Email" button in Settings
2. **Test Notification**: Create an email notification and use "Test Notification" button
3. **Trigger Real Notification**: Manually trigger a monitor status change to test real alerts

---

## Still Not Working?

1. **Check the server logs** for detailed error messages
2. **Verify credentials** are exactly correct (copy/paste, no extra spaces)
3. **Try a different port**: 587 (TLS) or 465 (SSL)
4. **For Gmail**: Regenerate your App Password and try again
5. **Contact your email provider** if using a custom SMTP server

---

## Security Notes

- 🔒 **Never** use "Less secure app access" for Gmail in production
- 🔒 Use **App Passwords** instead of regular passwords
- 🔒 Enable **2-Factor Authentication** for your email account
- 🔒 Keep your **Email Password** secure in Checkmate settings
