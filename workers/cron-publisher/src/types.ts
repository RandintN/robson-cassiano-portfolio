export interface Env {
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
  YOUTUBE_REFRESH_TOKEN: string;
  GITHUB_TOKEN: string;
  GEMINI_API_KEY?: string;
  GITHUB_REPO_OWNER?: string;
  GITHUB_REPO_NAME?: string;
  CRON_SECRET?: string;
  ADMIN_SECRET?: string;
  AI?: any;
  DB?: D1Database;
  EMAIL?: {
    send: (message: any) => Promise<any>;
  };
  EMAIL_ROUTER?: {
    fetch: typeof fetch;
  };
}

export type PublishMode = 'LATEST_LIVE' | 'RANDOM_ARCHIVE' | 'AUTO';

export interface YouTubeVideoItem {
  id: string;
  title: string;
  publishedAt: string;
  isLive: boolean;
  isShort: boolean;
  typeLabel: string;
  durationSeconds: number;
}

export interface SendMailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromAddress?: string;
  headers?: Record<string, string>;
}

export interface SequenceEmailTemplate {
  step: number;
  subject: string;
  videoId: string;
  youtubeUrl: string;
  badge: string;
  title: string;
  previewText: string;
  renderHtml: (firstName: string, unsubLink: string) => string;
  renderText: (firstName: string, unsubLink: string) => string;
}

export interface Subscriber {
  id: number;
  email: string;
  name: string;
  sequence_step: number;
  last_sequence_sent_at: string | null;
  created_at: string;
}

export interface BroadcastRequest {
  subject: string;
  articleSlug?: string;
  title: string;
  previewText: string;
  articleUrl: string;
}
