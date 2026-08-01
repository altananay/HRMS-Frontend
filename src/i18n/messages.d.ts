import type messages from './messages/tr.json';
import type { formats } from './formats';
import type { AppLocale } from './config';

declare module 'next-intl' {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
