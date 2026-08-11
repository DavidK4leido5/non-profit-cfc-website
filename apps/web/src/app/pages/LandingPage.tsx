import { Hero } from "@church/ui/hero";
import { G12VisionSection } from "@church/ui/g12-vision-section";
import { InvitationMarquee } from "@church/ui/invitation-marquee";
import { MinistriesSection } from "@church/ui/ministries-section";
import { UpcomingActivitiesSection } from "@church/ui/upcoming-activities-section";
import { VisitInviteSection } from "@church/ui/visit-invite-section";
import { siteContent } from "~/content/site.content";

export function LandingPage() {
  const { hero, invitationMarquee, g12Vision, activities, ministries, visitInvite } =
    siteContent;

  const activityItems = () =>
    activities.items.map((item) => ({
      name: item.name,
      description: item.description,
      dateLabel: item.dateLabel,
      href: item.href,
      cta: item.cta,
      imageSrc: item.imageSrc,
      imageAlt: item.imageAlt,
      icon: item.icon,
      class: item.className,
    }));

  return (
    <>
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
      <InvitationMarquee
        phrases={invitationMarquee.phrases}
        label={invitationMarquee.label}
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
        items={[...ministries.items]}
        more={ministries.more}
      />
      <VisitInviteSection
        title={visitInvite.title}
        subtitle={visitInvite.subtitle}
        cta={visitInvite.cta}
      />
    </>
  );
}
