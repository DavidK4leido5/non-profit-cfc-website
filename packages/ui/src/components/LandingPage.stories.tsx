import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { G12VisionSection } from "./G12VisionSection";
import { Hero } from "./Hero";
import { MinistriesSection } from "./MinistriesSection";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import { UpcomingActivitiesSection } from "./UpcomingActivitiesSection";
import { VisitInviteSection } from "./VisitInviteSection";

/**
 * Full landing page composition — mirrors apps/web landing route.
 */
function LandingPagePreview() {
  const { brand, nav, hero, g12Vision, activities, ministries, visitInvite, footer } =
    mockSiteContent;

  const activityItems = () =>
    activities.items.map((item) => ({
      ...item,
      class: item.className,
    }));

  return (
    <div class="min-h-screen bg-surface-subtle">
      <Navbar
        brand={brand}
        links={nav.links}
        cta={nav.cta}
        variant="transparent"
        tone="light"
      />
      <Hero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subcopy={hero.subcopy}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
        background={hero.background}
        badge={hero.badge}
        stats={[...hero.stats]}
      />
      <G12VisionSection
        headerTitle={g12Vision.headerTitle}
        logo={g12Vision.logo}
        eyebrow={g12Vision.eyebrow}
        title={g12Vision.title}
        scripture={g12Vision.scripture}
        intro={g12Vision.intro}
        steps={[...g12Vision.steps]}
        closing={g12Vision.closing}
      />
      <UpcomingActivitiesSection
        title={activities.title}
        subtitle={activities.subtitle}
        items={activityItems()}
      />
      <MinistriesSection
        title={ministries.title}
        subtitle={ministries.subtitle}
        items={ministries.items.map((item) => ({ ...item }))}
        more={ministries.more}
      />
      <VisitInviteSection
        title={visitInvite.title}
        subtitle={visitInvite.subtitle}
        cta={visitInvite.cta}
      />
      <SiteFooter
        churchName={footer.churchName}
        logo={footer.logo}
        g12Logo={footer.g12Logo}
        contact={footer.contact}
        social={[...footer.social]}
        copyright={footer.copyright}
      />
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
