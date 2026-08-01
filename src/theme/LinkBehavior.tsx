'use client';

import { forwardRef } from 'react';
import Link, { type LinkProps } from 'next/link';

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
