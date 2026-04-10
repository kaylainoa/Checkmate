# Escalation Integration Examples

This document shows practical code examples for integrating escalation notifications into your monitoring logic.

## Table of Contents
1. [Basic Integration](#basic-integration)
2. [Incident Service Integration](#incident-service-integration)
3. [Alert Service Integration](#alert-service-integration)
4. [Monitoring Service Integration](#monitoring-service-integration)
5. [With Database Storage](#with-database-storage)
6. [Advanced Patterns](#advanced-patterns)

---

## Basic Integration

### Simple Escalation Trigger

```typescript
// File: server/src/service/monitorService.ts

import type { NotificationMessage } from "@/types/notificationMessage.js";
import { notificationService } from "@/service/notificationService.js";

const ESCALATION_THRESHOLD_MINUTES = 120; // 2 hours

async function checkForEscalation(monitorId: string, downtime: number) {
  if (downtime >= ESCALATION_THRESHOLD_MINUTES) {
    const monitor = await getMonitor(monitorId);
    
    const escalationMessage: NotificationMessage = {
      type: "escalation",
      severity: "critical",
      monitor: {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        type: monitor.type,
        status: "DOWN"
      },
      content: {
        title: `🚨 CRITICAL ESCALATION: ${monitor.name}`,
        summary: `Monitor has been down for ${downtime} minutes.`,
        escalationReason: `Exceeded ${ESCALATION_THRESHOLD_MINUTES} minute downtime threshold`,
        escalationDuration: formatMinutes(downtime),
        escalationContactInfo: monitor.escalationEmail || "ops-team@company.com",
        timestamp: new Date()
      },
      clientHost: monitor.url,
      metadata: {
        teamId: monitor.teamId,
        notificationReason: "downtime_threshold_exceeded"
      }
    };

    await notificationService.send(escalationMessage);
  }
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
```

---

## Incident Service Integration

### Escalate Based on Incident Age

```typescript
// File: server/src/service/incidentService.ts

import type { Incident } from "@/types/incident.js";
import type { NotificationMessage } from "@/types/notificationMessage.js";

export class IncidentService {
  private escalationThresholdMs = 2 * 60 * 60 * 1000; // 2 hours

  async checkAndEscalateIncidents() {
    const activeIncidents = await this.getActiveIncidents();
    
    for (const incident of activeIncidents) {
      const age = Date.now() - incident.createdAt.getTime();
      
      if (age > this.escalationThresholdMs && !incident.escalated) {
        await this.escalateIncident(incident);
      }
    }
  }

  private async escalateIncident(incident: Incident): Promise<void> {
    const escalationMessage: NotificationMessage = {
      type: "escalation",
      severity: "critical",
      monitor: {
        id: incident.monitorId,
        name: incident.monitorName,
        url: incident.monitorUrl,
        type: incident.monitorType,
        status: "DOWN"
      },
      content: {
        title: `🚨 ESCALATION: ${incident.monitorName} - ${this.getDuration(incident.createdAt)}`,
        summary: incident.description,
        escalationReason: `Incident unresolved for ${this.getDuration(incident.createdAt)}. Escalating to on-call team.`,
        escalationDuration: this.getDuration(incident.createdAt),
        thresholdBreachCount: incident.failureCount,
        incident: {
          id: incident.id,
          url: `https://checkmate.example.com/incidents/${incident.id}`,
          createdAt: incident.createdAt,
          duration: this.getDuration(incident.createdAt)
        },
        dashboardUrl: "https://checkmate.example.com/dashboard",
        escalationContactInfo: await this.getEscalationContact(incident.teamId),
        timestamp: new Date()
      },
      clientHost: incident.monitorUrl,
      metadata: {
        teamId: incident.teamId,
        notificationReason: "incident_escalation_threshold"
      }
    };

    await this.notificationService.send(escalationMessage);
    
    // Mark as escalated
    await this.markIncidentEscalated(incident.id);
  }

  private getDuration(startTime: Date): string {
    const ms = Date.now() - startTime.getTime();
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  }

  private async getEscalationContact(teamId: string): Promise<string> {
    const team = await this.getTeam(teamId);
    return team.escalationEmail || "default-escalation@company.com";
  }
}
```

---

## Alert Service Integration

### Escalate Based on Alert State Duration

```typescript
// File: server/src/service/alertService.ts

import type { Alert } from "@/types/alert.js";
import type { NotificationMessage } from "@/types/notificationMessage.js";

export class AlertService {
  private escalationDurationMs = 2 * 60 * 60 * 1000; // 2 hours

  async processAlerts() {
    const criticalAlerts = await this.getCriticalAlerts();
    
    for (const alert of criticalAlerts) {
      await this.evaluateForEscalation(alert);
    }
  }

  private async evaluateForEscalation(alert: Alert): Promise<void> {
    const timeInCriticalState = Date.now() - alert.stateChangedAt.getTime();
    
    // Check if alert has been critical for too long
    if (timeInCriticalState > this.escalationDurationMs && !alert.escalated) {
      await this.escalateAlert(alert);
    }
  }

  private async escalateAlert(alert: Alert): Promise<void> {
    const consecutiveFailures = await this.getConsecutiveFailureCount(alert.monitorId);
    
    const escalationMessage: NotificationMessage = {
      type: "escalation",
      severity: "critical",
      monitor: {
        id: alert.monitorId,
        name: alert.monitorName,
        url: alert.monitorUrl,
        type: alert.monitorType,
        status: alert.status
      },
      content: {
        title: `🚨 ALERT ESCALATION: ${alert.monitorName}`,
        summary: `Critical alert has been active for ${this.formatMs(Date.now() - alert.stateChangedAt.getTime())}. Requires immediate investigation.`,
        escalationReason: `Alert in critical state for ${this.formatMs(Date.now() - alert.stateChangedAt.getTime())} without resolution`,
        escalationDuration: this.formatMs(Date.now() - alert.stateChangedAt.getTime()),
        thresholdBreachCount: consecutiveFailures,
        details: [
          `Alert Level: ${alert.severity}`,
          `Last State Change: ${alert.stateChangedAt.toISOString()}`,
          `Consecutive Failures: ${consecutiveFailures}`,
          `Alert ID: ${alert.id}`
        ],
        timestamp: new Date()
      },
      clientHost: alert.monitorUrl,
      metadata: {
        teamId: alert.teamId,
        notificationReason: "alert_critical_duration_exceeded"
      }
    };

    await this.notificationService.send(escalationMessage);
    await this.markAlertEscalated(alert.id);
  }

  private formatMs(ms: number): string {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  }
}
```

---

## Monitoring Service Integration

### Escalate on Consecutive Failures

```typescript
// File: server/src/service/monitoringService.ts

import type { Monitor } from "@/types/monitor.js";
import type { NotificationMessage } from "@/types/notificationMessage.js";

export class MonitoringService {
  private consecutiveFailureThreshold = 24; // 24 consecutive failures

  async handleCheckFailure(monitorId: string, failureCount: number): Promise<void> {
    const monitor = await this.getMonitor(monitorId);
    
    if (failureCount >= this.consecutiveFailureThreshold) {
      await this.escalateMonitor(monitor, failureCount);
    }
  }

  private async escalateMonitor(monitor: Monitor, failureCount: number): Promise<void> {
    const downtime = this.calculateDowntime(failureCount);
    
    // Get threshold information
    const thresholds = await this.getMonitorThresholds(monitor.id);
    
    const escalationMessage: NotificationMessage = {
      type: "escalation",
      severity: "critical",
      monitor: {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        type: monitor.type,
        status: "DOWN"
      },
      content: {
        title: `🚨 ESCALATION: ${monitor.name} - Multiple Consecutive Failures`,
        summary: `Monitor has failed ${failureCount} consecutive times over the past ${downtime.formatted}.`,
        escalationReason: `Reached escalation threshold: ${failureCount} consecutive check failures`,
        escalationDuration: downtime.formatted,
        thresholdBreachCount: failureCount,
        thresholds: thresholds.map(t => ({
          metric: t.type,
          currentValue: monitor.lastValue,
          threshold: t.threshold,
          unit: t.unit,
          formattedValue: `${monitor.lastValue}${t.unit}`
        })),
        details: [
          `Consecutive Failures: ${failureCount}/${this.consecutiveFailureThreshold}`,
          `Last Check: ${new Date().toISOString()}`,
          `Monitor Type: ${monitor.type}`,
          `Check Interval: ${monitor.checkInterval}s`
        ],
        dashboardUrl: "https://checkmate.example.com/dashboard",
        escalationContactInfo: monitor.escalationEmail,
        timestamp: new Date()
      },
      clientHost: monitor.url,
      metadata: {
        teamId: monitor.teamId,
        notificationReason: "consecutive_failures_threshold_exceeded"
      }
    };

    await this.notificationService.send(escalationMessage);
  }

  private calculateDowntime(failureCount: number): { minutes: number; formatted: string } {
    // Assuming 5-minute check interval
    const minutes = failureCount * 5;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return {
      minutes,
      formatted: `${hours}h ${mins}m`
    };
  }
}
```

---

## With Database Storage

### Store Escalation History

```typescript
// File: server/src/repositories/escalationRepository.ts

import type { EscalationRecord } from "@/types/escalation.js";

export class EscalationRepository {
  async recordEscalation(data: {
    monitorId: string;
    reason: string;
    severity: string;
    recipients: string[];
  }): Promise<EscalationRecord> {
    return await this.db.collection("escalations").insertOne({
      monitorId: data.monitorId,
      reason: data.reason,
      severity: data.severity,
      recipients: data.recipients,
      sentAt: new Date(),
      status: "sent",
      attempts: 1
    });
  }

  async hasBeenEscalatedRecently(monitorId: string, withinMinutes = 60): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - withinMinutes * 60 * 1000);
    const recent = await this.db.collection("escalations").findOne({
      monitorId,
      sentAt: { $gte: cutoffTime }
    });
    return !!recent;
  }

  async getEscalationHistory(monitorId: string): Promise<EscalationRecord[]> {
    return await this.db
      .collection("escalations")
      .find({ monitorId })
      .sort({ sentAt: -1 })
      .limit(10)
      .toArray();
  }
}
```

### Service Using Escalation History

```typescript
// File: server/src/service/incidentService.ts

import { EscalationRepository } from "@/repositories/escalationRepository.js";

export class IncidentService {
  constructor(private escalationRepo: EscalationRepository) {}

  async handleIncidentEscalation(incident: Incident): Promise<void> {
    // Check if we've already escalated recently (avoid spam)
    const recentEscalation = await this.escalationRepo.hasBeenEscalatedRecently(
      incident.monitorId,
      60 // within last 60 minutes
    );

    if (recentEscalation) {
      console.log("Escalation already sent recently, skipping");
      return;
    }

    // Send escalation
    await this.sendEscalation(incident);

    // Record it
    await this.escalationRepo.recordEscalation({
      monitorId: incident.monitorId,
      reason: "Incident unresolved for 2+ hours",
      severity: "critical",
      recipients: [incident.escalationEmail]
    });
  }
}
```

---

## Advanced Patterns

### Escalation with Retry Logic

```typescript
// File: server/src/service/escalationService.ts

import type { NotificationMessage } from "@/types/notificationMessage.js";

export class EscalationService {
  private maxRetries = 3;
  private retryDelayMs = 5000;

  async sendEscalationWithRetry(message: NotificationMessage): Promise<boolean> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.maxRetries) {
      try {
        await this.notificationService.send(message);
        return true;
      } catch (error) {
        attempts++;
        lastError = error as Error;
        
        if (attempts < this.maxRetries) {
          await this.delay(this.retryDelayMs);
        }
      }
    }

    console.error(`Escalation failed after ${this.maxRetries} attempts:`, lastError);
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Escalation with Multiple Recipients

```typescript
// File: server/src/service/notificationService.ts

export interface EscalationRecipients {
  primary: string[];      // Initial escalation
  secondary: string[];    // If primary fails or timeout
  critical: string[];     // SMS/Phone for critical
}

export async function sendEscalationToMultipleRecipients(
  message: NotificationMessage,
  recipients: EscalationRecipients
): Promise<void> {
  // Send to primary recipients
  const primaryResults = await Promise.all(
    recipients.primary.map(email => sendEscalationEmail(message, email))
  );

  // If any primary failed, send to secondary
  if (primaryResults.some(r => !r)) {
    await Promise.all(
      recipients.secondary.map(email => sendEscalationEmail(message, email))
    );
  }

  // For critical systems, also send SMS
  if (message.severity === "critical") {
    await Promise.all(
      recipients.critical.map(phone => sendEscalationSMS(message, phone))
    );
  }
}
```

### Dynamic Escalation Based on Business Rules

```typescript
// File: server/src/service/businessRuleEscalation.ts

export class BusinessRuleEscalationService {
  async evaluateEscalation(context: {
    monitor: Monitor;
    incident: Incident;
    affectedTeams: string[];
    estimatedImpact: "low" | "medium" | "high" | "critical";
  }): Promise<boolean> {
    // Rule 1: Critical systems always escalate
    if (context.monitor.isCritical && context.incident.duration > 10 * 60 * 1000) {
      return true;
    }

    // Rule 2: High impact escalates faster
    if (context.estimatedImpact === "critical" && context.incident.duration > 5 * 60 * 1000) {
      return true;
    }

    // Rule 3: Multiple affected teams = escalate
    if (context.affectedTeams.length > 2 && context.incident.duration > 30 * 60 * 1000) {
      return true;
    }

    // Rule 4: Production always escalates
    if (context.monitor.environment === "production" && context.incident.duration > 120 * 60 * 1000) {
      return true;
    }

    return false;
  }
}
```

---

## Testing Examples

### Unit Test for Escalation

```typescript
// File: server/test/escalationService.test.ts

import { describe, it, expect, beforeEach } from "@jest/globals";
import { IncidentService } from "@/service/incidentService";

describe("IncidentService - Escalation", () => {
  let service: IncidentService;

  beforeEach(() => {
    service = new IncidentService();
  });

  it("should escalate incident after 2 hours", async () => {
    const incident = createTestIncident({
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    });

    const shouldEscalate = await service.shouldEscalate(incident);

    expect(shouldEscalate).toBe(true);
  });

  it("should not escalate incident before 2 hours", async () => {
    const incident = createTestIncident({
      createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    });

    const shouldEscalate = await service.shouldEscalate(incident);

    expect(shouldEscalate).toBe(false);
  });

  it("should send escalation with all required fields", async () => {
    const incident = createTestIncident();
    const mockNotificationService = mockService();

    await service.escalateIncident(incident);

    const sent = mockNotificationService.send.mock.calls[0][0];
    
    expect(sent.type).toBe("escalation");
    expect(sent.severity).toBe("critical");
    expect(sent.content.escalationReason).toBeDefined();
    expect(sent.content.escalationDuration).toBeDefined();
  });
});
```

---

## Summary

These examples show how to integrate escalation notifications at different levels:

1. **Simple**: Just check duration and send
2. **Service-based**: Integrate with incident/alert services
3. **Database-aware**: Track escalation history to avoid spam
4. **Advanced**: Dynamic rules, retries, multiple recipients

Choose the pattern that fits your architecture best!
