/**
 * Storybook-only defaults. App copy lives in apps/web/src/content/site.content.ts
 */
export const mockSiteContent = {
  brand: {
    name: "Grace Community",
    href: "/",
    logo: {
      src: "/images/logo.svg",
      alt: "Grace Community logo",
    },
  },
  nav: {
    links: [
      { href: "/", label: "Home", active: true },
      { href: "/board", label: "Board" },
      { href: "/resources", label: "Resources" },
      { href: "/admin", label: "Admin" },
    ],
    cta: { href: "/auth/login", label: "Sign in" },
  },
  hero: {
    eyebrow: "Welcome home",
    headline: "A place to belong, believe, and become",
    subcopy:
      "Join us for worship, community, and growth. Everyone is welcome — come as you are and discover faith lived out together.",
    primaryCta: { label: "Plan your visit", href: "#visit" },
    secondaryCta: { label: "Watch online", href: "#stream" },
    preview: {
      imageSrc:
        "https://images.unsplash.com/photo-1438232999611-9952fccfc820?w=800&q=80",
      imageAlt: "Congregation worshipping together in a bright sanctuary",
      badge: "Sundays 10 AM",
      stats: [
        { value: "1985", label: "Serving our city" },
        { value: "3", label: "Weekly services" },
        { value: "120+", label: "Volunteers" },
        { value: "Open", label: "All are welcome" },
      ],
    },
  },
  trust: {
    title: "Our community at a glance",
    items: [
      { value: "2,400+", label: "Members & friends" },
      { value: "40+", label: "Small groups" },
      { value: "12", label: "Outreach ministries" },
      { value: "1", label: "Mission: love God & neighbor" },
    ],
  },
} as const;
