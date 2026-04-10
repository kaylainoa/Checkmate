# Escalation System Architecture & Diagrams

## System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    CHECKMATE ESCALATION SYSTEM                     │
└────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────┐
                          │  Monitor Check  │
                          │    Fails        │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼────────┐    │    ┌───────▼─────────┐
            │ First Attempt  │    │    │ Regular Alert   │
            │ Log Error      │    │    │ (< 2 hours)     │
            └────────────────┘    │    └─────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  Check Duration            │
                    │  (is 2+ hours down?)       │
                    └──┬────────────────┬────────┘
                       │                │
                    YES│             NO │
                       │                │
            ┌──────────▼──────────┐    │
            │  ESCALATION TIME!   │    │
            └──────────┬──────────┘    │
                       │               │
                ┌──────▼────────────┐  │
                │ Create:            │  │
                │ NotificationMsg    │  │
                │ type: escalation   │  │
                │ severity: critical │  │
                └──────┬────────────┘  │
                       │               │
                ┌──────▼────────────┐  │
                │ NotificationSvc   │  │
                │ .send(message)    │  │
                └──────┬────────────┘  │
                       │               │
                ┌──────▼────────────┐  │
                │ EmailProvider     │  │
                │ .sendMessage()    │  │
                └──────┬────────────┘  │
                       │               │
                ┌──────▼────────────────────────┐
                │ Detect type = "escalation"    │
                │ YES → Route to escalation     │
                │ template                      │
                └──────┬──────────────────────┘ │
                       │                        │
            ┌──────────▼─────────────────┐      │
            │  buildEscalationEmail()    │      │
            └──────────┬─────────────────┘      │
                       │                        │
        ┌──────────────▼──────────────────┐     │
        │ Load:                            │     │
        │ escalationNotification.mjml      │     │
        └──────────┬──────────────────────┘     │
                   │                            │
        ┌──────────▼──────────────────────┐     │
        │ Render with context:            │     │
        │ - title                         │     │
        │ - summary                       │     │
        │ - escalationReason              │     │
        │ - escalationDuration            │     │
        │ - escalationContactInfo         │     │
        │ - thresholdBreachCount          │     │
        │ - incident info                 │     │
        │ - dashboard URL                 │     │
        └──────────┬──────────────────────┘     │
                   │                            │
        ┌──────────▼──────────────────────┐     │
        │ Convert MJML → HTML             │     │
        └──────────┬──────────────────────┘     │
                   │                            │
        ┌──────────▼──────────────────────┐     │
        │ Send via SMTP                   │     │
        │ Subject: 🚨 ESCALATION: ...    │     │
        └──────────┬──────────────────────┘     │
                   │                            │
        ┌──────────▼──────────────────────┐     │
        │ 📧 Escalation Team Email        │     │
        │ ✅ Sent Successfully            │     │
        └─────────────────────────────────┘     │
                                                 │
            Continue Regular Monitoring ────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│           Monitor Data & State                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   Monitoring Service       │
        │ - Check Status             │
        │ - Track Duration           │
        │ - Count Failures           │
        └────────────┬───────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────┐          ┌──────────┐
    │ < 2hrs  │          │ > 2hrs   │
    │ DOWN    │          │ DOWN     │
    └────┬────┘          └────┬─────┘
         │                    │
         ▼                    ▼
    ┌─────────────┐    ┌────────────────┐
    │ Regular     │    │ Escalation!    │
    │ Alert       │    │ Create Message │
    └─────────────┘    └────────┬───────┘
                                 │
                    ┌────────────▼────────────┐
                    │ NotificationMessage     │
                    │ ├─ type: escalation    │
                    │ ├─ severity: critical  │
                    │ ├─ monitor: {..}      │
                    │ └─ content: {          │
                    │     ├─ title          │
                    │     ├─ summary        │
                    │     ├─ reason         │
                    │     ├─ duration       │
                    │     ├─ contact        │
                    │     └─ breach_count   │
                    │   }                    │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ NotificationService    │
                    │ - Route message        │
                    │ - Select provider      │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ EmailProvider          │
                    │ - Check type           │
                    │ - Load template        │
                    │ - Build HTML           │
                    │ - Send email           │
                    └────────────┬───────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
    ┌─────────┐          ┌──────────┐          ┌────────────┐
    │ Template │         │ Context  │         │ SMTP       │
    │ MJML     │         │ Variables│         │ Transport  │
    └────┬────┘         └──────────┘         └──────┬─────┘
         │                                          │
         └──────────────────────┬───────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │ HTML Email Body       │
                    │ - Red header          │
                    │ - Incident details    │
                    │ - Action required     │
                    │ - CTA buttons         │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ Send to Recipients    │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ 📬 Inbox              │
                    │ Ops Team Notified! ✅ │
                    └───────────────────────┘
```

## Template Selection Flow

```
┌──────────────────────────────┐
│ NotificationMessage Received │
└──────────────┬───────────────┘
               │
     ┌─────────▼──────────┐
     │ Check message.type │
     └──┬──┬──┬──┬────────┘
        │  │  │  │
   ┌────┘  │  │  └────────────────┐
   │       │  │                   │
   │       │  └─┐                 │
   │       │    │                 │
   ▼       ▼    ▼                 ▼
monitor  threshold  monitor  escalation
_down    _breach    _up      ◄── NEW!
   │       │         │         │
   │       │         │         ▼
   │       │         │    ┌──────────────┐
   │       │         │    │ Template:    │
   │       │         │    │ escalation   │
   │       │         │    │ Notification │
   │       │         │    └──┬───────────┘
   │       │         │       │
   │       │         │       ▼
   │       │         │    ┌──────────────┐
   │       │         │    │ Context:     │
   │       │         │    │ - reason     │
   │       │         │    │ - duration   │
   │       │         │    │ - contact    │
   │       │         │    │ - breach_cnt │
   │       │         │    └──┬───────────┘
   │       │         │       │
   └───┬───┴────┬────┴───────┴──────┐
       │        │                   │
       ▼        ▼                   ▼
   unified  unified            escalation
   notif    notif              notif
   template template           template
       │        │                   │
       └────┬───┴───────────────┬───┘
            │                   │
            ▼                   ▼
        Render HTML        Render HTML
        [Standard]         [Red Alert]
            │                   │
            └─────────┬─────────┘
                      │
                      ▼
                  Send Email
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                    System Components                        │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ NotificationMessage Type (notificationMessage.ts)      │
├────────────────────────────────────────────────────────┤
│ interface NotificationMessage {                        │
│   type: "escalation" ◄── NEW TYPE                     │
│   severity: "critical"                                │
│   monitor: MonitorInfo                                │
│   content: NotificationContent {                      │
│     escalationReason?: string       ◄── NEW FIELDS    │
│     escalationDuration?: string     ◄── NEW FIELDS    │
│     escalationContactInfo?: string  ◄── NEW FIELDS    │
│     thresholdBreachCount?: number   ◄── NEW FIELDS    │
│     dashboardUrl?: string           ◄── NEW FIELDS    │
│   }                                                    │
│ }                                                      │
└────────────────────────────────────────────────────────┘
                         ▲
                         │ uses
                         │
┌────────────────────────────────────────────────────────┐
│ EmailProvider (email.ts)                               │
├────────────────────────────────────────────────────────┤
│ sendMessage(notification, message) {                  │
│   if (message.type === "escalation") {                │
│     return buildEscalationEmail(message)    ◄── NEW   │
│   }                                                    │
│   return buildEmailFromMessage(message)               │
│ }                                                      │
│                                                        │
│ buildEscalationEmail(message) {     ◄── NEW METHOD   │
│   // Extract all fields                              │
│   // Load escalationNotification.mjml                │
│   // Render with context                            │
│   // Return HTML                                     │
│ }                                                      │
└────────────────────────────────────────────────────────┘
                         ▲
                         │ uses
                         │
┌────────────────────────────────────────────────────────┐
│ MJML Templates                                         │
├────────────────────────────────────────────────────────┤
│ escalationNotification.mjml  ◄── NEW TEMPLATE         │
│ ├─ Red header banner                                  │
│ ├─ Critical styling                                   │
│ ├─ Escalation fields                                  │
│ └─ Action required section                           │
│                                                        │
│ unifiedNotificationTemplate (unchanged)               │
├─ Standard styling                                    │
└─ Regular notification fields                         │
└────────────────────────────────────────────────────────┘
```

## Email Generation Pipeline

```
INPUT
  │
  ├─ NotificationMessage
  │  ├─ type: "escalation"
  │  ├─ severity: "critical"
  │  └─ content: {...escalation fields...}
  │
  ▼
ROUTER
  │
  └─→ Detect type = "escalation"
      │
      ▼
  ESCALATION PATH (NEW)
      │
      └─→ buildEscalationEmail()
          │
          ├─ Extract context variables:
          │  ├─ title
          │  ├─ summary
          │  ├─ escalationReason
          │  ├─ escalationDuration
          │  ├─ escalationContactInfo
          │  ├─ thresholdBreachCount
          │  ├─ incident info
          │  └─ dashboard URL
          │
          ├─ Load template:
          │  └─ escalationNotification.mjml
          │
          ├─ Compile template with context
          │
          ├─ Render to HTML
          │
          └─▶ Return HTML
             │
             ▼
  SEND
      │
      ├─ Create email envelope
      ├─ Set subject (🚨 ESCALATION: ...)
      ├─ Set body (HTML)
      ├─ Set recipients
      │
      └─▶ Send via SMTP
         │
         ▼
  OUTPUT
      │
      └─▶ 📧 Escalation Email Sent!
```

## State Diagram: Monitor Life Cycle

```
                    ┌─────────────┐
                    │   HEALTHY   │
                    │  (Running)  │
                    └──────┬──────┘
                           │
                    Check fails
                           │
                           ▼
                    ┌─────────────┐
                    │    ERROR    │
                    │  (1-120m)   │ ◄─── Duration: 0-120 minutes
                    └──────┬──────┘      Action: Send regular alert
                           │
              ┌────────────┴────────────┐
              │                         │
          Resolves                  Persists
              │                         │
              ▼                         ▼
         ┌─────────┐          Duration > 120m
         │ HEALTHY │          ┌──────────────────┐
         └─────────┘          │  ESCALATION      │ ◄─── NEW STATE!
                              │  (120m+)         │
                              └────────┬─────────┘
                                       │
                                       ├─→ Send escalation alert
                                       ├─→ Notify ops team
                                       ├─→ Create incident
                                       │
                                  Resolves
                                       │
                                       ▼
                                   HEALTHY
```

## Message Type Distribution

```
Regular Flow (< 2 hours)
├─ monitor_down ──────→ unifiedNotificationTemplate ──→ [Notify Team]
├─ monitor_up ────────→ unifiedNotificationTemplate ──→ [Notify Team]
├─ threshold_breach ──→ unifiedNotificationTemplate ──→ [Notify Team]
└─ threshold_resolved→ unifiedNotificationTemplate ──→ [Notify Team]

Escalation Flow (> 2 hours)
└─ escalation ────────→ escalationNotificationTemplate ──→ [CRITICAL: Notify Ops]

Test Flow
└─ test ──────────────→ testEmailTemplate ────────────→ [For Testing]
```

---

## Key Numbers

```
Escalation Threshold: 120 minutes (2 hours)
Template Color Code: #dc2626 (Red)
Subject Prefix: 🚨 ESCALATION:
Email Format: MJML
Responsive: Yes (mobile optimized)
Email Clients: All major clients supported
```

---

**These diagrams show the complete escalation system flow and architecture!**
