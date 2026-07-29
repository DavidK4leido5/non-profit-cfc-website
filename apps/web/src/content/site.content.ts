/**
 * Site content — edit copy, images, links, and stats here.
 * Components read from this file; no hardcoded strings in UI code.
 */

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

export const siteContent = {
  brand: {
    name: "Christian Fellowship Church",
    href: "/",
    logo: {
      /** Swap anytime — place file in apps/web/public/images/ */
      src: "/images/logo.svg",
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
    preview: {
      /**
       * Swap for a local file: place image in apps/web/public/images/
       * and set imageSrc to "/images/your-file.jpg"
       */
      imageSrc:
        "https://images.unsplash.com/photo-1438232999611-9952fccfc820?w=1200&q=80",
      imageAlt: "Congregation worshipping together in a bright sanctuary",
      badge: "Sundays 10 AM",
      stats: [
        { value: "1985", label: "Serving our city" },
        { value: "3", label: "Weekly services" },
        { value: "120+", label: "Volunteers" },
        { value: "Open", label: "All are welcome" },
      ] satisfies SitePreviewStat[],
    },
  },

  trust: {
    title: "Our community at a glance",
    items: [
      { value: "2,400+", label: "Members & friends" },
      { value: "40+", label: "Small groups" },
      { value: "12", label: "Outreach ministries" },
      { value: "1", label: "Mission: love God & neighbor" },
    ] satisfies SitePreviewStat[],
  },

  /** Static assets — favicon path for future use */
  images: {
    favicon: "/favicon.ico",
  },
} as const;

export type SiteContent = typeof siteContent;
