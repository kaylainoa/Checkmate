# Escalation Email Template & Notification System Guide

## Overview

A new escalation notification system has been added to Checkmate, allowing you to send high-priority escalation emails with a distinctive design and critical messaging when monitors trigger escalation conditions.

## Features

### 🎨 New Escalation Email Template

The escalation email template (`escalationNotification.mjml`) includes:

- **Critical Header Banner**: Red alert banner with escalation notice
- **Distinct Styling**: Bold red colors (#dc2626) for visual impact
- **Escalation Details**: 
  - Reason for escalation
  - Duration information
  - Consecutive failure counts
- **Call-to-Action**: Dedicated "ACTION REQUIRED" section
- **Incident Links**: Quick access to incident details and dashboard
- **Professional Layout**: MJML-based responsive design

### 📧 Escalation Email Template Files

```
server/src/templates/escalationNotification.mjml
```

## Implementation Details

### 1. Updated Types (`notificationMessage.ts`)

**New Notification Type**:
```typescript
export type NotificationType = 
  | "monitor_down" 
  | "monitor_up" 
  | "threshold_breach" 
  | "threshold_resolved" 
  | "escalation"  // ← NEW
  | "test";
```

**Enhanced NotificationContent Interface**:
```typescript
export interface NotificationContent {
  title: string;
  summary: string;
  details?: string[];
  thresholds?: ThresholdBreach[];
  incident?: IncidentInfo;
  timestamp: Date;
  
  // NEW: Escalation-specific fields
  escalationReason?: string;        // Why escalation was triggered
  escalationDuration?: string;      // How long the issue has persisted
  escalationContactInfo?: string;   // Contact info for escalation team
  thresholdBreachCount?: number;    // Number of consecutive failures
  dashboardUrl?: string;            // Link to dashboard
}
```

### 2. Updated Email Provider (`email.ts`)

**Enhanced Subject Line**:
```typescript
case "escalation":
  return `🚨 ESCALATION: ${message.monitor.name} - Immediate Action Required`;
```

**New Methods**:

- `buildEscalationEmail(message)`: Builds escalation-specific email with all escalation fields
- Updated `buildEmailFromMessage(message)`: Routes escalation messages to dedicated template

### 3. Email Template Features

#### Context Variables Available

```javascript
{
  // Standard fields
  title: string;
  summary: string;
  monitorName: string;
  monitorUrl: string;
  monitorType: string;
  monitorStatus: string;
  details: string[];
  thresholds: ThresholdBreach[];
  incidentUrl: string;
  
  // Escalation-specific fields
  escalationReason: string;
  escalationDuration: string;
  escalationContactInfo: string;
  thresholdBreachCount: number;
  dashboardUrl: string;
}
```

#### Template Sections

1. **Critical Alert Header**
   - Red background (#fee2e2)
   - URGENT messaging
   - Visual indicators (⚠️)

2. **Incident Details Section**
   - Monitor information
   - Current status
   - Duration of incident
   - Failure count

3. **Escalation Summary**
   - Main content
   - Why escalation occurred

4. **Threshold & Details**
   - Conditional rendering of breach metrics
   - Additional context

5. **Action Required Box**
   - Red border and background
   - Escalation contact info
   - Clear call-to-action

6. **CTA Buttons**
   - "View Incident" button (red - matches severity)
   - "Go to Dashboard" button (blue - secondary action)

## Usage Examples

### Creating an Escalation Notification

```typescript
import type { NotificationMessage } from "@/types/notificationMessage.js";

const escalationMessage: NotificationMessage = {
  type: "escalation",  // KEY: Set type to "escalation"
  severity: "critical",
  monitor: {
    id: "mon_123",
    name: "Production API Server",
    url: "https://api.example.com",
    type: "http",
    status: "DOWN"
  },
  content: {
    title: "Critical Escalation: Production API Server Down",
    summary: "The production API server has been unreachable for the past 2 hours. Multiple recovery attempts have failed.",
    escalationReason: "Monitor exceeded escalation threshold: 120 minutes of continuous downtime",
    escalationDuration: "2 hours 15 minutes",
    escalationContactInfo: "On-call Team: ops-escalation@company.com",
    thresholdBreachCount: 45,
    thresholds: [
      {
        metric: "availability",
        currentValue: 0,
        threshold: 99.9,
        unit: "%",
        formattedValue: "0%"
      }
    ],
    details: [
      "Server is not responding to HTTP requests",
      "Database connectivity normal",
      "Network latency normal"
    ],
    incident: {
      id: "inc_456",
      url: "https://checkmate.example.com/incidents/inc_456",
      createdAt: new Date(),
      duration: "2h 15m"
    },
    dashboardUrl: "https://checkmate.example.com/dashboard",
    timestamp: new Date()
  },
  clientHost: "api.example.com",
  metadata: {
    teamId: "team_789",
    notificationReason: "escalation_threshold_exceeded"
  }
};

// Send via email provider
await emailProvider.sendMessage(notification, escalationMessage);
```

### Via Notification Service

```typescript
// In notification service or controller
await notificationService.sendEscalationAlert({
  monitorId: "mon_123",
  monitorName: "Production API",
  reason: "120+ minutes of continuous downtime",
  duration: "2h 15m",
  failureCount: 45,
  incidentUrl: "https://checkmate.example.com/incidents/inc_456",
  contactInfo: "ops-escalation@company.com"
});
```

## Configuration & Integration

### Where to Send Escalation Emails

Escalation emails should be configured to be sent to:

1. **Escalation Team Mailing Lists**: Configure a separate email group for escalations
2. **On-Call Rotations**: Integrate with escalation on-call rotation system
3. **Executive Notifications**: Critical escalations to management (optional)
4. **Slack/Teams Integration**: In addition to email, for real-time alerts

### Escalation vs Regular Notifications

| Aspect | Regular Alert | Escalation |
|--------|---------------|-----------|
| **Template** | `unifiedNotificationTemplate` | `escalationNotificationTemplate` |
| **Type** | monitor_down, threshold_breach, etc. | escalation |
| **Subject** | `Monitor X is down` | `🚨 ESCALATION: Monitor X - Immediate Action Required` |
| **Styling** | Standard colors | Critical red (#dc2626) |
| **Recipients** | Primary contacts | Escalation team, on-call |
| **Duration** | Short-lived | Long-standing issue |
| **Reason** | Single failure | Multiple failures/thresholds |

## Database Schema (if storing escalation preferences)

### Settings Migration (Optional)

If you want to add escalation-specific settings to the database:

```typescript
interface EscalationSettings {
  enableEscalation: boolean;
  escalationThresholdMinutes: number;  // e.g., 120 minutes
  escalationEmail: string;              // Escalation team email
  escalationContactInfo: string;        // On-call info
  escalationSeverityLevel: "critical" | "warning";
  escalationCcList?: string[];          // CC list for escalations
}
```

## Testing

### Test Escalation Email in Browser

Open browser console (F12 → Console) and paste:

```javascript
// Build and test escalation message
const escalationTest = {
  type: "escalation",
  severity: "critical",
  monitor: {
    id: "test_123",
    name: "Test Monitor",
    url: "https://example.com",
    type: "http",
    status: "DOWN"
  },
  content: {
    title: "Test Escalation Alert",
    summary: "This is a test escalation notification.",
    escalationReason: "Testing escalation notification system",
    escalationDuration: "1 hour 30 minutes",
    escalationContactInfo: "test@example.com",
    thresholdBreachCount: 15,
    timestamp: new Date(),
    incident: {
      id: "test_inc",
      url: "https://checkmate/incident/test_inc"
    }
  },
  clientHost: "example.com",
  metadata: {
    teamId: "test_team",
    notificationReason: "testing"
  }
};

// This would be called by the notification service
console.log("Escalation message ready to send:", escalationTest);
```

### Via Notification Service

```bash
# If you have a test endpoint, call:
curl -X POST http://localhost:52345/api/notifications/test-escalation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "monitorId": "mon_123",
    "reason": "Testing escalation"
  }'
```

## Files Modified/Created

### Created
- ✅ `server/src/templates/escalationNotification.mjml` - New escalation email template

### Modified
- ✅ `server/src/types/notificationMessage.ts` - Added "escalation" type and escalation fields
- ✅ `server/src/service/infrastructure/notificationProviders/email.ts` - Added escalation handling

## Next Steps

1. **Test the escalation template** by sending a test escalation notification
2. **Configure escalation recipients** in your notification settings
3. **Set up escalation rules** in your monitoring logic (when to trigger escalation)
4. **Add escalation preferences** to settings (duration thresholds, contacts, etc.)
5. **Integrate with on-call system** for automatic routing

## Troubleshooting

### Escalation Email Not Sending

1. Check email configuration (SMTP credentials)
2. Verify escalation template exists: `server/src/templates/escalationNotification.mjml`
3. Check notification type is set to `"escalation"`
4. Verify context variables are populated correctly
5. Check server logs for MJML compilation errors

### Template Not Rendering Correctly

1. Ensure all template variables are provided in context
2. Check MJML syntax in template file
3. Verify email client supports MJML (most modern clients do)
4. Fall back to HTML rendering if needed

### Escalation Never Triggered

1. Check escalation rules in monitoring logic
2. Verify threshold and duration settings
3. Review escalation conditions in alert service
4. Check logs for escalation trigger events

## API Reference

### Sending Escalation via NotificationProvider

```typescript
// Type signature
async sendMessage(
  notification: Notification, 
  message: NotificationMessage
): Promise<boolean>

// Example with escalation type
const result = await emailProvider.sendMessage(
  escalationNotification,
  escalationMessage
);
// Returns: true if successful, false if failed
```

### Context Variables in Template

All variables are optional except those marked **REQUIRED**:

- `title` - **REQUIRED** - Email title/heading
- `summary` - **REQUIRED** - Main message content
- `monitorName` - **REQUIRED** - Monitor being escalated
- `monitorUrl` - Monitor's URL
- `monitorType` - Type of monitor (http, ping, etc.)
- `monitorStatus` - Current status (DOWN, UP, WARN, etc.)
- `escalationReason` - Why escalation was triggered
- `escalationDuration` - How long issue persisted
- `escalationContactInfo` - Contact for escalation team
- `thresholdBreachCount` - Number of consecutive failures
- `thresholds` - Array of threshold breach details
- `details` - Array of additional details
- `incidentUrl` - Link to incident details
- `dashboardUrl` - Link to dashboard

## References

- Template Format: MJML (Mailjet Markup Language)
- MJML Documentation: https://mjml.io/documentation
- Notification Types: `server/src/types/notificationMessage.ts`
- Email Provider: `server/src/service/infrastructure/notificationProviders/email.ts`
- Template Location: `server/src/templates/escalationNotification.mjml`

---

**Created**: April 9, 2026
**Version**: 1.0
**Status**: Ready for use
