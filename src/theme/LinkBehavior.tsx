'use client';

import { forwardRef } from 'react';
import Link, { type LinkProps } from 'next/link';

/**
 * Teaches every MUI button and link to navigate with the Next router.
 *
 * Registered once in the theme's `defaultProps` — `MuiButtonBase.LinkComponent` and
 * `MuiLink.component` — which is what makes `<Button href="/jobs">` work from a **server** component.
 * The documented `component={Link}` form cannot: a component reference is a function, and a server
 * component may not pass a function to a client component. Here the reference never crosses the
 * boundary, because the theme is only ever consumed inside `ThemeRegistry`.
 *
 * `href` is typed as `LinkProps['href']`, so a typo in a route object still fails to compile.
 */
type LinkBehaviorProps = Omit<LinkProps, 'href'> & {
  href: LinkProps['href'];
  className?: string;
  children?: React.ReactNode;
};

export const LinkBehavior = forwardRef<HTMLAnchorElement, LinkBehaviorProps>(
  function LinkBehavior({ href, ...other }, ref) {
    return <Link ref={ref} href={href} {...other} />;
  },
);
