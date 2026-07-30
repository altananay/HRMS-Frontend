import { z } from 'zod';

import type { CreateContactRequest } from '@/contracts/requests';

import { MAX, email, requiredText, type Translate } from './rules';

/** Mirrors `CreateContactCommandValidator`. Anonymous — the public contact form posts this. */
export function contactSchema(t: Translate) {
  return z.object({
    firstName: requiredText(t, { min: 2, max: MAX.name }),
    lastName: requiredText(t, { min: 2, max: MAX.name }),
    email: email(t),
    subject: requiredText(t, { min: 5, max: MAX.subject }),
    // The 20-character floor is the backend's, and it is the rule most likely to surprise someone
    // typing "hello" — worth catching before the round trip.
    message: requiredText(t, { min: 20, max: MAX.message }),
  });
}

export type ContactValues = z.output<ReturnType<typeof contactSchema>>;
export type ContactInput = z.input<ReturnType<typeof contactSchema>>;

export function toCreateContactRequest(values: ContactValues): CreateContactRequest {
  return values;
}
