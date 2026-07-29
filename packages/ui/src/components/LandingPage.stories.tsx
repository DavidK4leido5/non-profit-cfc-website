import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { Hero } from "./Hero";
import { HeroPreviewCard } from "./HeroPreviewCard";
import { Navbar } from "./Navbar";
import { TrustStrip } from "./TrustStrip";

/**
 * Full landing page composition — mirrors apps/web landing route.
 */
function LandingPagePreview() {
  const { brand, nav, hero, trust } = mockSiteContent;

  return (
    <div class="min-h-screen bg-surface-subtle">
      <Navbar brand={brand} links={nav.links} cta={nav.cta} variant="transparent" />
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
    </div>
  );
}

const meta = {
  title: "Pages/Landing Page",
  component: LandingPagePreview,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LandingPagePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
