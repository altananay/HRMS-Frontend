import { PanelSkeleton } from '@/components/panel/PanelSkeleton';

/**
 * Shown while an admin screen reads the API.
 *
 * ⚠ **This file may only exist in a group whose pages never call `notFound()`.** A loading boundary
 * makes Next stream the response: the shell — and with it HTTP **200** — is committed before the page
 * component runs, so a later `notFound()` renders the 404 screen under a 200 status. The company and
 * job seeker groups had exactly that regression, caught by `company.spec.ts` asserting a real 404 on
 * another employer's posting, and their `loading.tsx` was removed for it. Every admin screen is a
 * list and none of them 404; add one that can, and this file goes with it.
 */
export default function Loading() {
  return <PanelSkeleton rows={6} />;
}
