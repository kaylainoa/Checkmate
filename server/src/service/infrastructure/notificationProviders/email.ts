const SERVICE_NAME = "EmailProvider";
import type { Notification } from "@/types/index.js";
import { INotificationProvider } from "@/service/index.js";
import { buildTestEmail } from "@/service/infrastructure/notificationProviders/utils.js";
import type { NotificationMessage } from "@/types/notificationMessage.js";
import type { ILogger } from "@/utils/logger.js";
import { IEmailService } from "@/service/infrastructure/emailService.js";
export class EmailProvider implements INotificationProvider {
	private emailService: IEmailService;
	private logger: ILogger;

	constructor(emailService: IEmailService, logger: ILogger) {
		this.emailService = emailService;
		this.logger = logger;
	}

	async sendTestAlert(notification: Partial<Notification>): Promise<boolean> {
		const subject = "Test notification";
		const html = await buildTestEmail(this.emailService);

		if (!notification.address) {
			this.logger.warn({
				message: "Missing address - cannot send test email",
				service: SERVICE_NAME,
				method: "sendTestAlert",
			});
			return false;
		}

		if (!html) {
			this.logger.warn({
				message: "Failed to build test email content",
				service: SERVICE_NAME,
				method: "sendTestAlert",
			});
			return false;
		}

		const messageId = await this.emailService.sendEmail(notification.address, subject, html);
		if (!messageId) {
			this.logger.error({
				message: "Email test alert failed - check email configuration (credentials, host, port)",
				service: SERVICE_NAME,
				method: "sendTestAlert",
			});
			return false;
		}
		return true;
	}

	async sendMessage(notification: Notification, message: NotificationMessage): Promise<boolean> {
		if (!notification.address) {
			this.logger.warn({
				message: "Missing email address for notification",
				service: SERVICE_NAME,
				method: "sendMessage",
			});
			return false;
		}

		const subject = this.buildSubject(message);
		const html = await this.buildEmailFromMessage(message);

		if (!html) {
			this.logger.warn({
				message: "Failed to build email content",
				service: SERVICE_NAME,
				method: "sendMessage",
			});
			return false;
		}

		const messageId = await this.emailService.sendEmail(notification.address, subject, html);
		if (!messageId) {
			this.logger.error({
				message: "Email notification failed - check email configuration (credentials, host, port)",
				service: SERVICE_NAME,
				method: "sendMessage",
				details: {
					monitorName: message.monitor.name,
					recipient: notification.address,
				},
			});
			return false;
		}
		return true;
	}

	private buildSubject(message: NotificationMessage): string {
		switch (message.type) {
			case "monitor_down":
				return `Monitor ${message.monitor.name} is down`;
			case "monitor_up":
				return `Monitor ${message.monitor.name} is back up`;
			case "threshold_breach":
				return `Monitor ${message.monitor.name} threshold exceeded`;
			case "threshold_resolved":
				return `Monitor ${message.monitor.name} thresholds resolved`;
			case "escalation":
				return `🚨 ESCALATION: ${message.monitor.name} - Immediate Action Required`;
			default:
				return `Alert: ${message.monitor.name}`;
		}
	}

	private async buildEmailFromMessage(message: NotificationMessage): Promise<string | undefined> {
		// Use escalation template for escalation messages
		if (message.type === "escalation") {
			return this.buildEscalationEmail(message);
		}

		// Use standard template for other message types
		const context = {
			title: message.content.title,
			summary: message.content.summary,
			monitorName: message.monitor.name,
			monitorUrl: message.monitor.url,
			monitorType: message.monitor.type,
			monitorStatus: message.monitor.status,
			headerColor: this.getColorForSeverity(message.severity),
			thresholds: message.content.thresholds,
			details: message.content.details,
			incidentUrl: message.content.incident?.url,
		};

		this.logger.info({
			message: "[DEBUG] Building email from message",
			service: SERVICE_NAME,
			method: "buildEmailFromMessage",
			details: { context },
		});

		const html = await this.emailService.buildEmail("unifiedNotificationTemplate", context);

		return html;
	}

	private async buildEscalationEmail(message: NotificationMessage): Promise<string | undefined> {
		const context = {
			title: message.content.title,
			summary: message.content.summary,
			escalationReason: message.content.escalationReason || "Monitor has exceeded escalation thresholds",
			escalationDuration: message.content.escalationDuration,
			thresholdBreachCount: message.content.thresholdBreachCount,
			monitorName: message.monitor.name,
			monitorUrl: message.monitor.url,
			monitorType: message.monitor.type,
			monitorStatus: message.monitor.status,
			thresholds: message.content.thresholds,
			details: message.content.details,
			incidentUrl: message.content.incident?.url,
			dashboardUrl: message.content.dashboardUrl || "/dashboard",
			escalationContactInfo: message.content.escalationContactInfo,
		};

		this.logger.info({
			message: "[DEBUG] Building escalation email",
			service: SERVICE_NAME,
			method: "buildEscalationEmail",
			details: { 
				monitorName: message.monitor.name,
				escalationReason: message.content.escalationReason,
			},
		});

		const html = await this.emailService.buildEmail("escalationNotificationTemplate", context);

		return html;
	}

	private getColorForSeverity(severity: string): string {
		const colorMap: Record<string, string> = {
			critical: "red",
			warning: "#f59e0b",
			info: "#3b82f6",
			success: "green",
		};
		return colorMap[severity] ?? "#3b82f6";
	}
}
