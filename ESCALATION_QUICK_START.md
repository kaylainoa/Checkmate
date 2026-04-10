# Escalation Email Implementation Checklist

## ✅ What's Been Done

- [x] Created escalation email template (`escalationNotification.mjml`)
- [x] Added "escalation" notification type to system
- [x] Added escalation-specific fields to NotificationContent
- [x] Updated email provider to handle escalation messages
- [x] Enhanced email subjects for escalation alerts
- [x] Created comprehensive documentation

## 🚀 Quick Start - For Developers

### Step 1: Import the Types

```typescript
import type { NotificationMessage } from "@/types/notificationMessage.js";
```

### Step 2: Create an Escalation Message

```typescript
const escalationAlert: NotificationMessage = {
  type: "escalation",              // Use "escalation" type
  severity: "critical",             // Should be critical
  monitor: {
    id: "mon_prod_api",
    name: "Production API",
    url: "https://api.prod.com",
    type: "http",
    status: "DOWN"
  },
  content: {
    title: "🚨 Critical Escalation: API Server Down",
    summary: "Production API has been unreachable for extended period.",
    escalationReason: "Exceeded 120-minute downtime threshold",
    escalationDuration: "2 hours 45 minutes",
    escalationContactInfo: "ops-team@company.com | Slack: #incident-response",
    thresholdBreachCount: 60,       // Number of failed checks
    incident: {
      id: "inc_12345",
      url: "https://checkmate.com/incidents/inc_12345",
      createdAt: new Date(),
      duration: "2h 45m"
    },
    dashboardUrl: "https://checkmate.com/dashboard",
    details: [
      "All HTTP endpoints returning 502",
      "Database connection healthy",
      "Restart attempted - failed",
      "Escalating to senior ops team"
    ],
    timestamp: new Date()
  },
  clientHost: "api.prod.com",
  metadata: {
    teamId: "ops_team",
    notificationReason: "escalation_threshold_exceeded"
  }
};
```

### Step 3: Send via Notification Service

```typescript
// Using the email provider directly
const emailProvider = new EmailProvider(emailService, logger);
const success = await emailProvider.sendMessage(notification, escalationAlert);

// OR using notification service (if available)
await notificationService.send(escalationAlert);
```

### Step 4: Configure in Your Monitoring Logic

Typically in your incident/alert service:

```typescript
// When a monitor has been down for 120+ minutes
if (downtime > 120) {
  await sendEscalationAlert({
    monitor,
    reason: `Exceeded ${escalationThreshold} minutes downtime`,
    duration: formatDuration(downtime),
    failureCount: consecutiveFailures,
    incidentId
  });
}
```

## 📋 Escalation Fields Reference

### Required Fields

```typescript
{
  type: "escalation",          // REQUIRED - Must be "escalation"
  monitor: {
    name: string,              // REQUIRED - Monitor name
    url: string,               // REQUIRED - Monitor URL
    status: string             // REQUIRED - Current status
  },
  content: {
    title: string,             // REQUIRED - Email heading
    summary: string            // REQUIRED - Main message
  }
}
```

### Escalation-Specific Fields (Optional but Recommended)

```typescript
{
  content: {
    escalationReason: string,          // Why escalation triggered
    escalationDuration: string,        // How long problem exists (e.g., "2h 45m")
    escalationContactInfo: string,     // Contact for escalation team
    thresholdBreachCount: number,      // Consecutive failures
    dashboardUrl: string               // Link to dashboard
  }
}
```

## 🎨 Email Template Overview

### What It Looks Like

```
┌─────────────────────────────────────┐
│  ⚠️ ESCALATION ALERT - IMMEDIATE    │
│     ACTION REQUIRED ⚠️              │
└─────────────────────────────────────┘
│                                     │
│  🚨 CRITICAL ESCALATION: Monitor X │
│  ─────────────────────────────────  │
│                                     │
│  This is an escalation because:     │
│  [escalation reason]                │
│                                     │
├─ 📋 Incident Details ─────────────┤
│  Monitor: Production API            │
│  URL: https://api.example.com       │
│  Status: DOWN                       │
│  Duration: 2 hours 45 minutes       │
│  Failed Checks: 60 consecutive      │
│                                     │
├─ 🚨 ACTION REQUIRED ───────────────┤
│  This escalation indicates a        │
│  critical issue requiring           │
│  immediate attention.               │
│                                     │
│  Escalation Contact:                │
│  ops-team@company.com               │
│                                     │
│  [View Incident] [Go to Dashboard]  │
└─────────────────────────────────────┘
```

## 🔄 Workflow: From Monitor to Escalation

```
Monitor Check Fails
       ↓
[Attempt Recovery/Retry]
       ↓
Check Threshold (120 min+?)
       ↓
  YES  → Create Escalation Message
         ↓
         Send to Notification Service
         ↓
         Email Provider Receives
         ↓
         Escalation Template Used
         ↓
         Critical Alert Sent! 🚨
       ↓
      NO → Continue Regular Monitoring
```

## 🧪 Testing Escalation

### Test 1: Manual Template Test

```bash
# Check template exists
ls server/src/templates/escalationNotification.mjml

# Should output: server/src/templates/escalationNotification.mjml
```

### Test 2: Type Checking

```bash
# Run TypeScript compiler
npm run build

# Or check types only
npx tsc --noEmit
```

### Test 3: Send Test Escalation (in Browser Console)

```javascript
// Get your JWT token first (check Application tab in DevTools)
const token = localStorage.getItem('token');

// Send test escalation
fetch('/api/v1/notifications/send-escalation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    monitorId: 'test_mon',
    monitorName: 'Test Monitor',
    email: 'your-email@example.com',
    reason: 'Testing escalation system',
    duration: '2 hours'
  }),
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### Test 3: Check Logs

```bash
# Watch server logs for escalation events
tail -f server/app.log | grep -i escalation
```

## 📁 Files Created/Modified

```
Created:
  ✅ server/src/templates/escalationNotification.mjml

Modified:
  ✅ server/src/types/notificationMessage.ts
  ✅ server/src/service/infrastructure/notificationProviders/email.ts
```

## 🎯 Integration Points

### Where to Add Escalation Logic

1. **Incident Service** (`server/src/service/incidentService.ts` or similar)
   ```typescript
   // When incident duration exceeds threshold
   if (incident.duration > ESCALATION_THRESHOLD) {
     await sendEscalationAlert(incident);
   }
   ```

2. **Monitoring Service** 
   ```typescript
   // When consecutive failures exceed threshold
   if (consecutiveFailures > FAILURE_THRESHOLD) {
     await sendEscalationAlert(monitor);
   }
   ```

3. **Alert Service**
   ```typescript
   // When alert is in critical state for too long
   if (alert.severity === 'critical' && alert.age > THRESHOLD) {
     await escalateAlert(alert);
   }
   ```

## 🔍 Troubleshooting

### Template Not Found Error
- **Check**: `server/src/templates/escalationNotification.mjml` exists
- **Fix**: Re-create if missing

### Wrong Email Being Sent
- **Check**: Notification type is `"escalation"`
- **Check**: Template variables are being passed correctly
- **Fix**: Add debug logging in `buildEscalationEmail()` method

### Escalation Never Triggered
- **Check**: Escalation logic exists in your monitoring service
- **Check**: Thresholds are configured correctly
- **Fix**: Add escalation trigger logic to your alert rules

### Email Has Missing Fields
- **Check**: All required context variables are provided
- **Required**: title, summary, monitorName, monitorUrl, monitorStatus
- **Fix**: Pass complete context object to `buildEmail()`

## 📚 Related Documentation

- [Full Escalation Email Guide](./ESCALATION_EMAIL_GUIDE.md)
- [Notification Types](./server/src/types/notificationMessage.ts)
- [Email Provider](./server/src/service/infrastructure/notificationProviders/email.ts)
- [Escalation Template](./server/src/templates/escalationNotification.mjml)

## ✨ Next Steps

1. **Add escalation settings** to application configuration
2. **Create escalation rules** for your monitors
3. **Set up escalation recipients** in notification settings
4. **Test with real monitors** to verify end-to-end workflow
5. **Monitor logs** to ensure escalations are triggering correctly
6. **Gather feedback** from ops team on escalation template

---

**Ready to use!** Start sending escalation emails to your team. 🚀
