import { Suspense } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { AudienceSection } from '@/components/home/AudienceSection';
import { CtaBand } from '@/components/home/CtaBand';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { Hero } from '@/components/home/Hero';
import { LatestJobs } from '@/components/home/LatestJobs';
import { SkillSphere } from '@/components/home/SkillSphere';

/**
 * The landing page. Every section is a server component — nothing here needs state except the hero's
 * search field and the skill cloud's canvas, which are the two client islands.
 *
 * The two data-backed sections are wrapped in `Suspense` so the hero streams immediately and does not
 * wait on the API. If it is slow the visitor still gets a complete-looking page; if it is down, both
 * sections render nothing rather than taking the page with them.
 */
export default function Home() {
  return (
    <>
      <Hero />

      <Suspense fallback={<SectionSkeleton />}>
        <LatestJobs />
      </Suspense>

      <AudienceSection />

      <Suspense fallback={<SectionSkeleton />}>
        <SkillSphere />
      </Suspense>

      <FeaturesSection />
      <CtaBand />
    </>
  );
}

function SectionSkeleton() {
  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <Skeleton variant="text" width={280} height={48} />
      <Skeleton variant="text" width={420} sx={{ mb: 4 }} />
      <Grid container spacing={3}>
        {[0, 1].map((index) => (
          <Grid key={index} size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={220} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
