
export interface Signature {
  id: string;
  name: string;
  content: string;
  active: boolean;
  createdAt: Date;
}

export enum RotationFrequency {
  EVERY_EMAIL = "every_email",
  DAILY = "daily",
  WEEKLY = "weekly",
}

export interface AppSettings {
  rotationEnabled: boolean;
  rotationFrequency: RotationFrequency;
  zapierWebhookUrl: string;
  connected: boolean;
}
