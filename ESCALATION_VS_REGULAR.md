# Escalation vs Regular Notifications - Visual Comparison

## Email Subject Lines

### Regular Alert
```
Monitor Production API is down
```

### Escalation Alert
```
🚨 ESCALATION: Production API - Immediate Action Required
```

---

## Email Visual Comparison

### Regular Notification Email

```
┌─────────────────────────────────────────────────────────┐
│ Message from Checkmate Service                          │
│                                                         │
│         Monitor is Down                                 │
│         ─────────────────                               │
│                                                         │
│ Hello!                                                  │
│                                                         │
│ Your monitor has stopped responding to requests.        │
│                                                         │
│ Monitor name: Production API                           │
│ URL: https://api.example.com                           │
│ Type: http                                             │
│ Status: DOWN                                           │
│                                                         │
│ ─────────────────────────────────────────────          │
│ [View incident details]                                │
│                                                         │
│ This email was sent by Checkmate.                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Escalation Notification Email

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  ESCALATION ALERT - IMMEDIATE ACTION REQUIRED ⚠️     │  ← Red background
│                                                         │
│ Escalation from Checkmate Service                      │
│                                                         │
│   🚨 CRITICAL ESCALATION: API Server Down 🚨           │  ← Larger, red
│   ───────────────────────────────────────               │  ← Red divider
│                                                         │
│ This is an escalation notification because:            │
│ Exceeded 120-minute downtime threshold                 │  ← Escalation reason
│                                                         │
│ ┌─ 📋 Incident Details ───────────────────────────┐   │
│ │ Monitor: Production API                         │   │
│ │ URL: https://api.example.com                    │   │
│ │ Type: http                                      │   │
│ │ Current Status: DOWN (in red)                   │   │
│ │ Duration: 2 hours 45 minutes                    │   │  ← Escalation field
│ │ Failed Checks: 60 consecutive failures          │   │  ← Escalation field
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 📝 Summary                                             │
│ The production API has been unreachable for           │
│ the past 2+ hours. Multiple recovery attempts         │
│ have failed. This requires immediate attention.       │
│                                                         │
│ ⚡ Threshold Breaches                                  │
│ • Availability: 0% (threshold: 99.9%)                 │
│                                                         │
│ ┌─ 🚨 ACTION REQUIRED (Red Box) ──────────────┐      │
│ │ This escalation indicates a critical issue │      │
│ │ that requires immediate attention. Please  │      │
│ │ investigate and take corrective action as  │      │
│ │ soon as possible.                          │      │
│ │                                            │      │
│ │ Escalation Contact:                        │      │
│ │ ops-team@company.com | #incident-response │      │  ← Escalation field
│ └────────────────────────────────────────────┘      │
│                                                      │
│ [View Incident]  [Go to Dashboard]                  │  ← Two buttons
│                                                      │
│ This is an automated escalation notification from   │
│ Checkmate. Please do not reply to this email.       │
│ If you believe you received this in error, please   │
│ contact your system administrator.                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Feature Comparison Table

| Feature | Regular Alert | Escalation Alert |
|---------|---------------|------------------|
| **Subject Line** | Standard message | Includes 🚨 emoji and "Immediate Action Required" |
| **Header** | Light background, standard text | 🔴 Red background, uppercase warning |
| **Color Scheme** | Blue/gray | Red (#dc2626) for critical |
| **Title Size** | 18px | 20px, bold red |
| **Divider** | 2px gray | 3px red |
| **Reason Section** | Not included | ✅ "Reason for Escalation" |
| **Duration** | Not included | ✅ "Duration: 2h 45m" |
| **Failure Count** | Not included | ✅ "Failed Checks: 60" |
| **ACTION REQUIRED** | Not included | ✅ Red bordered section |
| **Escalation Contact** | Not included | ✅ Contact information |
| **Buttons** | 1 (View incident) | 2 (Incident + Dashboard) |
| **Call-to-Action** | Standard | Highlighted with urgent messaging |
| **Footer** | Standard email footer | Extended footer with escalation info |

---

## Escalation-Specific Fields

### Additional Context in Escalation Emails

```typescript
Regular Notification:
├─ title
├─ summary
├─ thresholds
├─ details
├─ incident URL
└─ monitor info

Escalation Notification (includes above PLUS):
├─ escalationReason              ← Why escalation triggered
├─ escalationDuration            ← How long problem exists
├─ escalationContactInfo         ← Who to contact
├─ thresholdBreachCount          ← Number of failures
└─ dashboardUrl                  ← Dashboard link
```

---

## When to Use Each Type

### Use Regular Alert When...
- Monitor experiences first-time failure
- Issue resolves itself quickly (< 5 minutes)
- Threshold breach is minor
- Alert is for informational purposes
- Issue is resolved

**Example**: "Monitor is back up"

### Use Escalation Alert When...
- Monitor is down for extended period (> 120 minutes)
- Issue persists despite recovery attempts
- Multiple consecutive failures detected
- Requires immediate human intervention
- Business impact is critical
- Incident affects production systems

**Example**: "Production API down for 2+ hours, needs immediate attention"

---

## Alert Journey: From Detection to Escalation

```
┌─────────────────────────────────────────────────────────┐
│ MONITORING TIMELINE                                     │
└─────────────────────────────────────────────────────────┘

T+0 min    Monitor Check Fails
             │
             └─→ [SEND REGULAR ALERT]
                 ├─ Type: monitor_down
                 ├─ Severity: warning/info
                 └─ Subject: "Monitor X is down"

T+5 min    Still Down - Alert Check (Retry Attempt 1)
             │
             └─→ [SEND UPDATE]
                 └─ Subject: "Monitor X still down"

T+30 min   Still Down - Alert Check (Retry Attempts 2-6)
             │
             └─→ [CONTINUE MONITORING]
                 └─ Check every 5 minutes

T+120 min  THRESHOLD EXCEEDED! 2 Hours Downtime
             │
             └─→ [SEND ESCALATION ALERT] ⚠️
                 ├─ Type: escalation
                 ├─ Severity: critical
                 ├─ Subject: "🚨 ESCALATION: Monitor X - Immediate Action"
                 ├─ Template: escalationNotificationTemplate
                 ├─ Fields: reason, duration, contact, breach count
                 └─ Recipients: Escalation team

T+121 min+ Status: ESCALATED
             │
             └─→ REQUIRES IMMEDIATE ACTION
                 ├─ On-call engineers notified
                 ├─ Dashboard opened by team
                 ├─ Investigation begins
                 └─ Root cause analysis starts
```

---

## Code Examples: Creating Each Type

### Regular Alert Example

```typescript
const regularAlert: NotificationMessage = {
  type: "monitor_down",
  severity: "warning",
  monitor: {
    id: "mon_123",
    name: "Production API",
    url: "https://api.example.com",
    type: "http",
    status: "DOWN"
  },
  content: {
    title: "Alert: Production API is down",
    summary: "Your Production API monitor has detected that the service is not responding.",
    incident: {
      id: "inc_1",
      url: "https://checkmate.com/incidents/inc_1",
      createdAt: new Date()
    },
    timestamp: new Date()
  },
  clientHost: "api.example.com",
  metadata: {
    teamId: "ops",
    notificationReason: "monitor_down_detected"
  }
};
```

### Escalation Alert Example

```typescript
const escalationAlert: NotificationMessage = {
  type: "escalation",
  severity: "critical",
  monitor: {
    id: "mon_123",
    name: "Production API",
    url: "https://api.example.com",
    type: "http",
    status: "DOWN"
  },
  content: {
    title: "🚨 CRITICAL ESCALATION: Production API Down",
    summary: "Production API has been unreachable for over 2 hours despite multiple recovery attempts.",
    // Escalation-specific fields
    escalationReason: "Monitor exceeded 120-minute downtime threshold with 60+ consecutive failures",
    escalationDuration: "2 hours 15 minutes",
    escalationContactInfo: "ops-team@company.com | Slack: #incident-response | Phone: +1-555-0123",
    thresholdBreachCount: 60,
    dashboardUrl: "https://checkmate.com/dashboard",
    incident: {
      id: "inc_1",
      url: "https://checkmate.com/incidents/inc_1",
      createdAt: new Date(),
      duration: "2h 15m"
    },
    timestamp: new Date()
  },
  clientHost: "api.example.com",
  metadata: {
    teamId: "ops",
    notificationReason: "escalation_threshold_exceeded"
  }
};
```

---

## Email Client Rendering

### How Different Email Clients Display Escalation

#### Gmail
```
✅ Full HTML support
✅ Red background renders correctly
✅ Button styling preserved
✅ Dividers visible
✅ All fonts render properly
```

#### Outlook
```
✅ Good support for critical styling
⚠️ May simplify button styling
✅ Colors and dividers render
✅ Mobile view optimized
```

#### Apple Mail
```
✅ Full MJML/HTML support
✅ Red styling prominent
✅ Button styling good
✅ Professional appearance
```

#### Mobile (iOS/Android)
```
✅ Responsive design adapts
✅ Stack layout for small screens
✅ Buttons accessible
✅ Red warning clearly visible
```

---

## Configuration Example

### In Your Monitoring Service

```typescript
// Configuration
const ESCALATION_THRESHOLDS = {
  DURATION_MINUTES: 120,      // 2 hours
  CONSECUTIVE_FAILURES: 24,    // 24 failed checks (@ 5 min intervals)
  SEVERITY_LEVEL: "critical"
};

// Usage
if (monitor.downtime > ESCALATION_THRESHOLDS.DURATION_MINUTES) {
  await sendEscalationAlert({
    monitor,
    reason: `Exceeded ${ESCALATION_THRESHOLDS.DURATION_MINUTES}min threshold`,
    duration: formatDuration(monitor.downtime),
    failureCount: monitor.consecutiveFailures
  });
}
```

---

## Summary

- **Regular Alerts**: For immediate, short-term issues
- **Escalation Alerts**: For persistent, critical issues requiring urgent action
- **Template System**: Both use MJML templates with appropriate styling
- **Type Safety**: Full TypeScript support for both types
- **Smart Routing**: Email provider automatically selects correct template
- **Flexible**: Easy to add more notification types as needed

---

**Visual Difference**: Escalation emails are immediately recognizable as URGENT with red styling and clear ACTION REQUIRED sections, while regular alerts use standard styling for routine monitoring updates.
