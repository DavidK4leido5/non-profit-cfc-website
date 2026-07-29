/**
 * Site content — edit copy, images, links, and stats here.
 * Components read from this file; no hardcoded strings in UI code.
 */

import cfcLogo from "~/assets/images/cfc-logo.png";
import g12PhilippinesLogo from "~/assets/images/g12philippines_logo.png";

export type SiteNavLink = {
  href: string;
  label: string;
};

export type SiteCta = {
  label: string;
  href: string;
};

export type SitePreviewStat = {
  value: string;
  label: string;
};

export type SiteMinistry = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  primaryCta: SiteCta;
  secondaryCta?: SiteCta;
  imageObjectPosition?: string;
};

export type SiteMinistriesMore = {
  eyebrow: string;
  title: string;
  description: string;
  cta: SiteCta;
  image: {
    src: string;
    alt: string;
    imageObjectPosition?: string;
  };
};

export type SiteVisitInvite = {
  title: string;
  subtitle: string;
  cta: SiteCta;
};

export type SiteSocialLink = {
  label: string;
  href: string;
};

export type SiteFooterContent = {
  churchName: string;
  logo: { src: string; alt: string };
  g12Logo?: { src: string; alt: string };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social?: SiteSocialLink[];
  copyright: string;
};

export type SiteActivityIcon = "camp" | "retreat" | "calendar" | "fellowship" | "service";

/** Upcoming activity tile — grid placement via className (admin-editable later). */
export type SiteActivity = {
  name: string;
  description: string;
  dateLabel: string;
  href: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  icon: SiteActivityIcon;
  className: string;
};

export const siteContent = {
  brand: {
    name: "Christian Fellowship Church",
    href: "/",
    logo: {
      /** Place file in apps/web/src/assets/images/ (Vite bundles it reliably in dev) */
      src: cfcLogo,
      alt: "Christian Fellowship Church logo",
    },
  },

  nav: {
    links: [
      { href: "/", label: "Home" },
      { href: "/board", label: "Board" },
      { href: "/resources", label: "Resources" },
      { href: "/admin", label: "Admin" },
    ] satisfies SiteNavLink[],
    signIn: {
      label: "Sign in",
      href: "/auth/login",
    } satisfies SiteCta,
  },

  hero: {
    eyebrow: "Welcome home",
    headline: "A place to belong, believe, and become",
    subcopy:
      "Join us for worship, community, and growth. Everyone is welcome — come as you are and discover faith lived out together.",
    primaryCta: {
      label: "Plan your visit",
      href: "#visit",
    } satisfies SiteCta,
    secondaryCta: {
      label: "Watch online",
      href: "#stream",
    } satisfies SiteCta,
    /**
     * Full-screen hero background — save your photo as apps/web/public/images/hero-bg.jpg
     * (1920×1080 or wider recommended), then set src to "/images/hero-bg.jpg".
     */
    background: {
      src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1920&q=80",
      alt: "Congregation worshipping together in a bright sanctuary",
    },
    badge: "Sundays 10 AM",
    stats: [
      { value: "1985", label: "Serving our city" },
      { value: "3", label: "Weekly services" },
      { value: "120+", label: "Volunteers" },
      { value: "Open", label: "All are welcome" },
    ] satisfies SitePreviewStat[],
  },

  g12Vision: {
    headerTitle: "Who we are",
    logo: {
      src: g12PhilippinesLogo,
      alt: "G12 Philippines logo",
    },
    eyebrow: "G12 Vision",
    title: "How we live the vision",
    scripture: {
      reference: "Matthew 28:19",
      text:
        "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
    },
    intro:
      "The G12 Vision is a God-given strategy for fulfilling the Great Commission — a clear path to win people to Christ, strengthen new believers, train disciples, and send them to reach others. Following Jesus, who called twelve to be with Him and sent them out, we believe every believer can grow into a mature disciple who multiplies faith at home, at work, and in ministry.",
    closing:
      "At Christian Fellowship Church, we live this together: every member discipled, every disciple a leader, every leader a multiplier.",
    steps: [
      {
        title: "Win",
        description:
          "Reach people with the Gospel — we preach Christ, serve our city, and invite others to know Jesus.",
      },
      {
        title: "Consolidate",
        description:
          "Care for the fruit — we stay close to new believers through welcome, follow-up, and cell group life.",
      },
      {
        title: "Disciple",
        description:
          "Teach the foundations of following Jesus — prayer, God's Word, holiness, and Christlike character.",
      },
      {
        title: "Send",
        description:
          "Equip multipliers — we prepare disciples to lead cell groups, win souls, and raise their own team of twelve.",
      },
    ],
  },

  activities: {
    title: "Upcoming activities",
    subtitle:
      "Youth camps, retreats, fellowship gatherings, and more — join us for what is ahead.",
    items: [
      {
        name: "Youth Summer Camp",
        description:
          "A week of worship, adventure, and discipleship for students — build friendships that last beyond the summer.",
        dateLabel: "Jul 14–18, 2026",
        href: "#youth-camp",
        cta: "Register interest",
        imageSrc:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
        imageAlt: "Youth group laughing together outdoors",
        icon: "camp",
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
      },
      {
        name: "Spring Retreat",
        description:
          "Step away for a weekend of rest, prayer, and renewal in the mountains with our church family.",
        dateLabel: "Apr 10–12, 2026",
        href: "#retreat",
        cta: "Learn more",
        imageSrc:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
        imageAlt: "Mountain landscape at sunrise",
        icon: "retreat",
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
      },
      {
        name: "Family Picnic Day",
        description:
          "Food, games, and fellowship for every age — bring a dish to share and meet someone new.",
        dateLabel: "May 3, 2026",
        href: "#picnic",
        cta: "See details",
        imageSrc:
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
        imageAlt: "Families and friends gathered around an outdoor table",
        icon: "fellowship",
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
      },
      {
        name: "Prayer & Fasting Week",
        description:
          "Join daily morning prayer and guided devotionals as we seek God together as a congregation.",
        dateLabel: "Mar 2–8, 2026",
        href: "#prayer-week",
        cta: "Join the schedule",
        imageSrc:
          "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&q=80",
        imageAlt: "People gathered together in prayer and worship",
        icon: "calendar",
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
      },
      {
        name: "Men's Breakfast Fellowship",
        description:
          "Monthly gathering over coffee and a shared meal — honest conversation, encouragement, and prayer.",
        dateLabel: "First Sat monthly",
        href: "#mens-breakfast",
        cta: "Save your seat",
        imageSrc:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
        imageAlt: "Coffee cups on a table at a fellowship breakfast",
        icon: "service",
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
      },
    ] satisfies SiteActivity[],
  },

  ministries: {
    title: "Get Connected",
    subtitle:
      "Explore our ministries and discover meaningful ways to serve, grow in faith, and build relationships.",
    items: [
      {
        imageSrc:
          "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
        imageAlt: "Children smiling together at a community event",
        title: "Youth & Children",
        description:
          "Safe, fun, and faith-filled programs that help kids and students know Jesus and build lasting friendships.",
        primaryCta: { label: "Learn more", href: "#youth" },
        secondaryCta: { label: "Volunteer with us", href: "#volunteer" },
        imageObjectPosition: "33% 35%",
      },
      {
        imageSrc:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",
        imageAlt: "Congregation worshipping together in a bright sanctuary",
        title: "Worship & Music",
        description:
          "Join us each Sunday for heartfelt worship and biblical teaching that draws us closer to God and one another.",
        primaryCta: { label: "Learn more", href: "#worship" },
        secondaryCta: { label: "View service times", href: "#times" },
        imageObjectPosition: "50% 30%",
      },
      {
        imageSrc:
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80",
        imageAlt: "Volunteers serving food in the community",
        title: "Community Outreach",
        description:
          "Serving our neighbors through food drives, care visits, and local partnerships that meet real needs with love.",
        primaryCta: { label: "Learn more", href: "#outreach" },
        secondaryCta: { label: "See upcoming events", href: "#events" },
        imageObjectPosition: "66% 40%",
      },
    ] satisfies SiteMinistry[],
    more: {
      eyebrow: "Wait, there's more!",
      title: "Looking for more ministries?",
      description:
        "Discover new ways to connect, serve, and grow as you live out your faith alongside others at Christian Fellowship Church.",
      cta: { label: "View all ministries", href: "/resources" },
      image: {
        src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80",
        alt: "People laughing and connecting together outdoors",
        imageObjectPosition: "72% center",
      },
    } satisfies SiteMinistriesMore,
  },

  visitInvite: {
    title: "We'd love to see you this weekend!",
    subtitle: "Let us know you're coming — we'll save you a seat and help you feel at home.",
    cta: {
      label: "Plan your visit",
      href: "#visit",
    },
  } satisfies SiteVisitInvite,

  footer: {
    churchName: "Christian Fellowship Church",
    logo: {
      src: cfcLogo,
      alt: "Christian Fellowship Church logo",
    },
    g12Logo: {
      src: g12PhilippinesLogo,
      alt: "G12 Philippines logo",
    },
    contact: {
      email: "hello@christianfellowshipchurch.org",
      phone: "+63 912 345 6789",
      address: "Negros Occidental, Philippines",
    },
    social: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "YouTube", href: "https://youtube.com" },
    ],
    copyright: "© 2026 Christian Fellowship Church",
  } satisfies SiteFooterContent,

  /** Static assets — favicon path for future use */
  images: {
    favicon: "/favicon.ico",
  },
} as const;

export type SiteContent = typeof siteContent;
