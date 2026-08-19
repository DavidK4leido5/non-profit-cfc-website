import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import { G12VisionSection } from "./G12VisionSection";
import {
  AboutBelongSection,
  EventsGiveSection,
  HomeHero,
  MinistriesIconGrid,
  StatsBand,
  TestimonialsSection,
  VisitPlan,
} from "./HomeLanding";

function LandingPagePreview() {
  return (
    <div class="min-h-screen bg-[var(--color-bg-light)]">
      <Navbar
        brand={{ name: "Christian Fellowship Church", href: "/", mark: "Christian Fellowship Church" }}
        links={[
          { href: "/", label: "Home", active: true },
          { href: "#about", label: "About" },
          { href: "#g12-vision", label: "Vision" },
          { href: "#ministries", label: "Ministries" },
          { href: "#events", label: "Events" },
          { href: "/board", label: "Board" },
        ]}
        visitCta={{ href: "#visit", label: "Plan Your Visit" }}
        utility={{
          address: "Negros Occidental, Philippines",
          serviceTimes: "Sundays 10:00 AM",
        }}
      />
      <HomeHero
        eyebrow="Welcome Home"
        lines={["Love God.", "Love People.", "Make a Difference."]}
        subcopy="A warm, welcoming church family."
        primaryCta={{ label: "Plan Your Visit", href: "#visit" }}
        secondaryCta={{ label: "Our G12 vision", href: "#g12-vision" }}
        background={{
          src: "https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=1600&q=80",
          alt: "Stock photograph of a church at sunset",
        }}
        gathering={{ when: "Sundays 10:00 AM", where: "Negros Occidental" }}
        values={[
          { title: "Worship", icon: "worship" },
          { title: "Grow", icon: "grow" },
          { title: "Serve", icon: "serve" },
        ]}
      />
      <AboutBelongSection
        eyebrow="About Us"
        title="A Place to Belong"
        body="Come as you are. Leave known, loved, and sent."
        benefits={["Sunday worship", "Cell groups", "Kids ministry", "Discipleship path", "City outreach"]}
        cta={{ label: "Our G12 vision", href: "#g12-vision" }}
        image={{
          src: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80",
          alt: "Stock photograph of sunlight in a sanctuary",
        }}
      />
      <G12VisionSection
        headerTitle="Who we are"
        logo={{ src: "/images/logo.svg", alt: "G12 Philippines" }}
        eyebrow="G12 Vision"
        title="How we live the vision"
        scripture={{
          reference: "Matthew 28:19",
          text: "Go therefore and make disciples of all nations.",
        }}
        intro="The G12 Vision is a God-given strategy for fulfilling the Great Commission."
        closing="At Christian Fellowship Church, we live this together."
        steps={[
          { title: "Win", description: "Reach people with the Gospel." },
          { title: "Consolidate", description: "Care for new believers." },
          { title: "Disciple", description: "Teach the foundations of following Jesus." },
          { title: "Send", description: "Equip multipliers." },
        ]}
      />
      <MinistriesIconGrid
        eyebrow="Our Ministries"
        title="Ministries for Every Season of Life"
        items={[
          { title: "Kids", description: "Faith that starts young.", href: "/board", icon: "kids" },
          { title: "Youth", description: "Students following Jesus.", href: "/board", icon: "youth" },
          { title: "Outreach", description: "Love in action.", href: "/board", icon: "outreach" },
        ]}
      />
      <EventsGiveSection
        eventsEyebrow="Upcoming Events"
        eventsTitle="What's coming"
        eventsCta={{ label: "Open the ministry board", href: "/board" }}
        events={[
          {
            month: "SAT",
            day: "1st",
            title: "Men's Breakfast Fellowship",
            when: "First Saturday each month",
            description: "Coffee, a meal, and prayer.",
            href: "/board",
          },
        ]}
        give={{
          eyebrow: "Give",
          title: "Your Generosity Changes Lives",
          body: "Partner with us in worship, discipleship, and care.",
          cta: { label: "Ask about giving", href: "mailto:hello@church.org" },
          image: {
            src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80",
            alt: "Stock photograph of hands",
          },
        }}
      />
      <StatsBand items={[{ value: "1,200+", label: "People" }, { value: "40+", label: "Groups" }]} />
      <TestimonialsSection
        eyebrow="What People Are Saying"
        title="Real People. Real Stories."
        items={[
          {
            quote: "We found a family here.",
            name: "Maria",
            location: "Bacolod",
            avatar: {
              src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
              alt: "Stock portrait",
            },
          },
        ]}
      />
      <VisitPlan
        title="We'd love to see you this weekend!"
        subtitle="Email us — we'll help you find the gathering."
        when="Sundays 10:00 AM"
        where="Negros Occidental, Philippines"
        email="hello@church.org"
        notes={["Come as you are.", "Kids are welcome."]}
        cta={{ label: "Plan your visit", href: "mailto:hello@church.org" }}
      />
      <SiteFooter
        churchName="Christian Fellowship Church"
        tagline="Love God. Love people."
        logo={{ src: "/images/logo.svg", alt: "Logo" }}
        g12Logo={{ src: "/images/logo.svg", alt: "G12 Philippines" }}
        contact={{ address: "Negros Occidental, Philippines", email: "hello@church.org", serviceTimes: "Sundays 10:00 AM" }}
        copyright="© 2026 Christian Fellowship Church"
        legalLinks={[]}
      />
    </div>
  );
}

const meta = {
  title: "Pages/Landing Page",
  component: LandingPagePreview,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LandingPagePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
