import { Hero } from "@church/ui/hero";
import { HeroPreviewCard } from "@church/ui/hero-preview-card";
import { TrustStrip } from "@church/ui/trust-strip";
import { siteContent } from "~/content/site.content";

export function LandingPage() {
  const { hero, trust } = siteContent;

  return (
    <>
      <Hero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subcopy={hero.subcopy}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
        preview={
          <HeroPreviewCard
            imageSrc={hero.preview.imageSrc}
            imageAlt={hero.preview.imageAlt}
            badge={hero.preview.badge}
            stats={[...hero.preview.stats]}
          />
        }
      />
      <TrustStrip title={trust.title} items={[...trust.items]} />
    </>
  );
}
