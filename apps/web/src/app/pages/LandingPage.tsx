import { G12VisionSection } from "@church/ui/g12-vision-section";
import {
  AboutBelongSection,
  EventsGiveSection,
  HomeHero,
  MinistriesIconGrid,
  StatsBand,
  TestimonialsSection,
  VisitPlan,
} from "@church/ui/home-landing";
import { siteContent } from "~/content/site.content";

export function LandingPage() {
  const { home, g12Vision, utilityBar, footer, visitInvite } = siteContent;
  const visitMail = `mailto:${footer.contact.email}?subject=${encodeURIComponent("Planning a Sunday visit")}`;

  return (
    <>
      <HomeHero
        eyebrow={home.hero.eyebrow}
        lines={home.hero.lines}
        subcopy={home.hero.subcopy}
        primaryCta={home.hero.primaryCta}
        secondaryCta={home.hero.secondaryCta}
        background={home.hero.background}
        gathering={{ when: utilityBar.serviceTimes, where: utilityBar.address }}
        values={home.hero.values}
      />
      <AboutBelongSection
        eyebrow={home.about.eyebrow}
        title={home.about.title}
        body={home.about.body}
        benefits={home.about.benefits}
        cta={home.about.cta}
        image={home.about.image}
      />
      <G12VisionSection
        headerTitle={g12Vision.headerTitle}
        logo={g12Vision.logo}
        eyebrow={g12Vision.eyebrow}
        title={g12Vision.title}
        scripture={g12Vision.scripture}
        intro={g12Vision.intro}
        steps={g12Vision.steps}
        closing={g12Vision.closing}
      />
      <MinistriesIconGrid
        eyebrow={home.ministries.eyebrow}
        title={home.ministries.title}
        items={home.ministries.items}
      />
      <EventsGiveSection
        eventsEyebrow={home.events.eyebrow}
        eventsTitle={home.events.title}
        eventsCta={home.events.cta}
        events={home.events.items}
        give={home.give}
      />
      <StatsBand items={home.stats} />
      <TestimonialsSection
        eyebrow={home.testimonials.eyebrow}
        title={home.testimonials.title}
        items={home.testimonials.items}
      />
      <VisitPlan
        title={home.ctaBanner.title}
        subtitle={home.ctaBanner.subtitle}
        when={utilityBar.serviceTimes}
        where={utilityBar.address}
        email={footer.contact.email ?? ""}
        notes={[
          "Come as you are — we will help you feel at home.",
          "Kids, youth, and young adults have a place during the morning.",
          "Cell groups meet through the week if you want a smaller family table.",
          "Street address and a live phone number are not listed yet; email us and we will help you find the gathering.",
        ]}
        cta={{ label: visitInvite.cta.label, href: visitMail }}
      />
    </>
  );
}
