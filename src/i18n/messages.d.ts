import type messages from './messages/tr.json';
import type { AppLocale } from './config';

/**
 * Makes message keys type-checked: `t('nav.jobs')` compiles, `t('nav.job')` does not.
 *
 * This matters more here than it looks. A missing key does not throw in next-intl — `useTranslations`
 * renders the key path itself, so a typo ships as `nav.job` printed on the page and nobody notices
 * until a user reports it. The augmentation turns that into a build error.
 *
 * `tr.json` is the reference bundle because it is the default locale. `messages.test.ts` asserts
 * `en.json` has exactly the same key set, which is the other half of the guarantee: this file makes
 * the keys real, that test makes them complete.
 *
 * Declaration merging requires `interface` — the no-`interface` rule is about our own request and
 * response types, not about augmenting a dependency.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
