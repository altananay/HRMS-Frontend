import { AudienceSection } from '@/components/home/AudienceSection';
import { CtaBand } from '@/components/home/CtaBand';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { Hero } from '@/components/home/Hero';

/**
 * The landing page. Every section is a server component — nothing here needs state except the hero's
 * search field, which is the one client island.
 *
 * P5 inserts two data-backed sections between the hero and `AudienceSection`: the latest openings and
 * the skill cloud built from live advertisement data. They are not stubbed here, because a stub with
 * invented job listings is indistinguishable from the real thing and leads nowhere when clicked.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <AudienceSection />
      <FeaturesSection />
      <CtaBand />
    </>
  );
}
