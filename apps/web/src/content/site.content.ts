/**
 * Site content — edit copy, images, links, and stats here.
 * Components read from this file; no hardcoded strings in UI code.
 */

import cfcLogo from "~/assets/images/cfc-logo.png";
import g12PhilippinesLogo from "~/assets/images/g12philippines_logo.png";

export type SiteNavLink = {
  href: string;
  label: string;
  children?: readonly SiteNavLink[];
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
  slug: string;
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
    serviceTimes?: string;
  };
  social?: SiteSocialLink[];
  copyright: string;
};

export type SiteActivityIcon =
  | "camp"
  | "retreat"
  | "calendar"
  | "fellowship"
  | "service";

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

export type SiteBulletinPost = {
  id: string;
  title: string;
  body: string;
  dateLabel: string;
  tag?: string;
  pinned?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageObjectPosition?: string;
  variant?: "image" | "brand";
  palette?: "brand" | "sunset" | "gold" | "mint" | "violet";
  align?: "left" | "center" | "right";
};

export type SiteBoardMinistry = {
  slug: string;
  title: string;
  tagline: string;
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition?: string;
  posts: SiteBulletinPost[];
};

export type SiteBoardContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    background: { src: string; alt: string };
  };
  ministries: SiteBoardMinistry[];
};

export const siteContent = {
  brand: {
    name: "Christian Fellowship Church",
    mark: "Christian Fellowship\nChurch",
    href: "/",
    logo: {
      /** Place file in apps/web/src/assets/images/ (Vite bundles it reliably in dev) */
      src: cfcLogo,
      alt: "Christian Fellowship Church logo",
    },
  },

  auth: {
    tagline: "A place to belong, believe, and become",
    sideImage: {
      src: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600&q=80",
      alt: "Sunlight through church windows",
    },
  },

  nav: {
    links: [
      { href: "/", label: "Home" },
      { href: "#about", label: "About Us" },
      { href: "#g12-vision", label: "Vision" },
      { href: "#ministries", label: "Ministries" },
      { href: "#events", label: "Events" },
      { href: "#give", label: "Give" },
      { href: "#contact", label: "Contact Us" },
    ],
    signIn: {
      label: "Sign in",
      href: "/auth/login",
    } satisfies SiteCta,
    visit: {
      label: "Plan Your Visit",
      href: "#visit",
    } satisfies SiteCta,
  },

  utilityBar: {
    address: "Negros Occidental, Philippines",
    phone: "+63 912 345 6789",
    serviceTimes: "Sundays 10:00 AM",
  },

  home: {
    hero: {
      eyebrow: "Welcome Home",
      lines: ["Love God.", "Love People.", "Make a Difference."] as const,
      subcopy:
        "Join us for worship, community, and growth. Everyone is welcome — come as you are and discover faith lived out together.",
      primaryCta: { label: "Plan Your Visit", href: "#visit" },
      secondaryCta: { label: "Our G12 vision", href: "#g12-vision" },
      background: {
        src: "https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=1920&q=80",
        alt: "Stock photograph of a church building at golden hour — not our campus",
      },
      values: [
        { title: "Worship", icon: "worship" as const },
        { title: "Grow", icon: "grow" as const },
        { title: "Serve", icon: "serve" as const },
      ],
    },
    about: {
      eyebrow: "About Us",
      title: "A Place to Belong",
      body: "Christian Fellowship Church is a family following the G12 vision — winning people to Christ, consolidating new believers, discipling leaders, and sending multipliers into the city.",
      benefits: [
        "Warm Sunday worship for every generation",
        "Cell groups that feel like family",
        "Kids, youth, and young adult ministries",
        "Clear next steps to grow as a disciple",
        "Serving our neighbors across Negros Occidental",
      ],
      cta: { label: "Learn More About Us", href: "#g12-vision" },
      image: {
        src: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1400&q=80",
        alt: "Stock photograph of sunlight through church windows — not a photo of this congregation",
      },
    },
    ministries: {
      eyebrow: "Our Ministries",
      title: "Ministries for Every Season of Life",
      items: [
        {
          title: "Kids",
          description: "Safe, joyful spaces where children meet Jesus.",
          href: "/board",
          icon: "kids" as const,
        },
        {
          title: "Youth",
          description: "Students growing in faith, friendship, and purpose.",
          href: "/board",
          icon: "youth" as const,
        },
        {
          title: "Young Adults",
          description: "Community for the next generation of leaders.",
          href: "/board",
          icon: "adults" as const,
        },
        {
          title: "Men",
          description: "Brotherhood through prayer, breakfasts, and serving.",
          href: "/board",
          icon: "men" as const,
        },
        {
          title: "Women",
          description: "Encouragement, study, and sisterhood in Christ.",
          href: "/board",
          icon: "women" as const,
        },
        {
          title: "Outreach",
          description: "Loving our city with practical compassion.",
          href: "/board",
          icon: "outreach" as const,
        },
      ],
    },
    events: {
      eyebrow: "Upcoming Events",
      title: "What's coming",
      cta: { label: "Open the ministry board", href: "/board" },
      items: [
        {
          month: "SAT",
          day: "1st",
          title: "Men's Breakfast Fellowship",
          when: "First Saturday each month",
          description:
            "Monthly gathering over coffee and a shared meal — honest conversation, encouragement, and prayer.",
          href: "/board",
        },
      ],
    },
    give: {
      eyebrow: "Give",
      title: "Your Generosity Changes Lives",
      body: "Tithes and offerings fuel worship, discipleship, and care for our neighbors. Thank you for partnering with us.",
      cta: {
        label: "Ask about giving",
        href: "mailto:hello@christianfellowshipchurch.org?subject=Giving",
      },
      image: {
        src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1400&q=80",
        alt: "Stock photograph of hands joined in warm light — not a photo from this church",
      },
    },
    stats: [
      { value: "1,200+", label: "People in our family" },
      { value: "40+", label: "Cell groups" },
      { value: "12", label: "Active ministries" },
      { value: "1985", label: "Serving our city since" },
    ],
    testimonials: {
      eyebrow: "What People Are Saying",
      title: "Real People. Real Stories.",
      items: [
        {
          quote: "This church felt like home from the first Sunday. People remembered our names.",
          name: "Maria Santos",
          location: "Bacolod",
          avatar: {
            src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
            alt: "Stock portrait — not a photograph of Maria Santos",
          },
        },
        {
          quote: "Our kids love Sunday mornings, and we have grown as a family in the Word.",
          name: "James Cruz",
          location: "Talisay",
          avatar: {
            src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
            alt: "Stock portrait — not a photograph of James Cruz",
          },
        },
        {
          quote: "Cell group is where I learned that discipleship is a lifestyle, not a class.",
          name: "Alyssa Reyes",
          location: "Silay",
          avatar: {
            src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
            alt: "Stock portrait — not a photograph of Alyssa Reyes",
          },
        },
      ],
    },
    ctaBanner: {
      title: "We'd love to meet you!",
      subtitle: "Come this Sunday — we'll save you a seat and help you feel at home.",
      cta: { label: "Plan Your Visit", href: "#visit" },
    },
  },

  hero: {
    headline: "A place to belong, believe, and become",
    subcopy:
      "Join us for worship, community, and growth. Everyone is welcome — come as you are and discover faith lived out together.",
    primaryCta: {
      label: "Plan your visit",
      href: "#visit",
    } satisfies SiteCta,
    /**
     * Full-screen hero background — save your photo as apps/web/public/images/hero-bg.jpg
     * (1920×1080 or wider recommended), then set src to "/images/hero-bg.jpg".
     */
    background: {
      /** https://unsplash.com/photos/man-praying-OptEsFuZwoQ — mirrored so subject sits right */
      src: "https://images.unsplash.com/photo-1543525238-54e3d131f7ca?w=1920&q=80",
      alt: "Man praying with hands clasped",
      mirror: true,
    },
    featureStrip: {
      quote: {
        text: "We want to be a family where people can connect and benefit from friendships in Christ.",
        portrait: {
          src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
          alt: "Church member holding a Bible",
        },
      },
      media: {
        src: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80",
        alt: "Friends studying Scripture together",
        href: "#stream",
        label: "Watch a message",
      },
      service: {
        title: "Sunday Worship Service",
        detail: "Every Sunday · 10:00–11:30 AM",
        cta: {
          label: "Learn more",
          href: "#visit",
        },
      },
    },
  },

  invitationMarquee: {
    label: "Sunday invitation",
    phrases: [
      "See you on Sunday",
      "You're invited",
      "We can't wait to meet you",
    ],
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
      text: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
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
        slug: "youth",
        imageSrc:
          "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
        imageAlt: "Children smiling together at a community event",
        title: "Youth & Children",
        description:
          "Safe, fun, and faith-filled programs that help kids and students know Jesus and build lasting friendships.",
        primaryCta: { label: "View bulletin", href: "/board#youth" },
        secondaryCta: { label: "Volunteer with us", href: "/board#youth" },
        imageObjectPosition: "33% 35%",
      },
      {
        slug: "worship",
        imageSrc:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",
        imageAlt: "Congregation worshipping together in a bright sanctuary",
        title: "Worship & Music",
        description:
          "Join us each Sunday for heartfelt worship and biblical teaching that draws us closer to God and one another.",
        primaryCta: { label: "View bulletin", href: "/board#worship" },
        secondaryCta: { label: "View service times", href: "/board#worship" },
        imageObjectPosition: "50% 30%",
      },
      {
        slug: "outreach",
        imageSrc:
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80",
        imageAlt: "Volunteers serving food in the community",
        title: "Community Outreach",
        description:
          "Serving our neighbors through food drives, care visits, and local partnerships that meet real needs with love.",
        primaryCta: { label: "View bulletin", href: "/board#outreach" },
        secondaryCta: { label: "See upcoming events", href: "/board#outreach" },
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

  board: {
    hero: {
      eyebrow: "What's new at CFC",
      title: "See what's on the board.",
      subtitle:
        "Big updates from each ministry — camps, serve days, rehearsals, and volunteer calls. Tap a board below or scroll to yours.",
      background: {
        src: "https://www.northfieldumc.org/sites/northfieldumc.org/files/2026-01/children_youth_family_ministries_collage.jpg",
        alt: "Photo collage of children, youth, and family ministry activities",
      },
    },
    ministries: [
      {
        slug: "youth",
        title: "Youth & Children",
        tagline: "Programs, camps, and family updates for kids and students.",
        imageSrc:
          "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&q=80",
        imageAlt: "Children smiling together at a community event",
        imageObjectPosition: "50% 40%",
        posts: [
          {
            id: "youth-camp",
            title: "Summer camp registration is open!",
            body: "Register your student by April 15 for early-bird pricing. Scholarships available — contact the youth office.",
            dateLabel: "Mar 12",
            tag: "Event",
            pinned: true,
            imageSrc:
              "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80",
            imageAlt: "Youth group laughing together outdoors",
            imageObjectPosition: "50% 40%",
            palette: "mint",
            align: "left",
          },
          {
            id: "youth-sunday",
            title: "Youth Sunday this week",
            body: "Middle school 9:00 AM · High school 11:00 AM in the East Hall. Parent pickup at the main lobby.",
            dateLabel: "Mar 8",
            tag: "Schedule",
            variant: "brand",
            palette: "gold",
            align: "center",
          },
          {
            id: "youth-vbs",
            title: "VBS volunteers needed",
            body: "Friendly faces for crafts, games, and snack time. One-hour shifts or full mornings — all welcome.",
            dateLabel: "Mar 5",
            tag: "Volunteer",
            imageSrc:
              "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1920&q=80",
            imageAlt: "Teacher smiling with children in a classroom",
            imageObjectPosition: "45% 40%",
            palette: "violet",
            align: "right",
          },
        ],
      },
      {
        slug: "worship",
        title: "Worship & Music",
        tagline:
          "Rehearsals, set lists, and serving opportunities on the worship team.",
        imageSrc:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1920&q=80",
        imageAlt: "Congregation smiling and worshipping together",
        imageObjectPosition: "50% 30%",
        posts: [
          {
            id: "worship-team",
            title: "Worship team auditions — sign up!",
            body: "Singers and musicians — bring one song that showcases your gift. Fifteen-minute slots after Sunday service.",
            dateLabel: "Mar 10",
            tag: "Opportunity",
            pinned: true,
            imageSrc:
              "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1920&q=80",
            imageAlt: "People smiling and raising hands during worship",
            imageObjectPosition: "55% 40%",
            palette: "sunset",
            align: "center",
          },
          {
            id: "worship-easter",
            title: "Easter rehearsal — Saturday 4 PM",
            body: "Full-team rehearsal. Arrive 15 minutes early for sound check. Music packets at the welcome desk.",
            dateLabel: "Mar 7",
            tag: "Rehearsal",
            variant: "brand",
            palette: "violet",
            align: "right",
          },
          {
            id: "worship-tech",
            title: "Tech team training night",
            body: "Slides, lights, and live stream basics — no experience required. Pizza at 6:30 PM in the media booth.",
            dateLabel: "Mar 3",
            tag: "Training",
            imageSrc:
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
            imageAlt: "Smiling volunteers collaborating together",
            imageObjectPosition: "50% 45%",
            palette: "brand",
            align: "left",
          },
        ],
      },
      {
        slug: "outreach",
        title: "Community Outreach",
        tagline:
          "Local serve days, care visits, and ways to love our neighbors.",
        imageSrc:
          "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1920&q=80",
        imageAlt: "Smiling graduates celebrating together outdoors",
        imageObjectPosition: "50% 35%",
        posts: [
          {
            id: "outreach-food",
            title: "Food drive — this Saturday",
            body: "Drop off non-perishables 8 AM–12 PM at the main entrance. Most needed: rice, canned goods, and hygiene kits.",
            dateLabel: "Mar 14",
            tag: "Serve day",
            pinned: true,
            imageSrc:
              "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1920&q=80",
            imageAlt: "Church family smiling together in fellowship",
            imageObjectPosition: "50% 40%",
            palette: "sunset",
            align: "right",
          },
          {
            id: "outreach-visits",
            title: "Care visit team sign-up",
            body: "Pair with a homebound member for a monthly visit or phone call. Training on the first Tuesday of each month.",
            dateLabel: "Mar 9",
            tag: "Volunteer",
            variant: "brand",
            palette: "mint",
            align: "left",
          },
          {
            id: "outreach-picnic",
            title: "Community picnic — May 18",
            body: "Help us welcome neighbors! Setup crews, grill masters, and greeters needed. Reply by March 20.",
            dateLabel: "Mar 6",
            tag: "Event",
            imageSrc:
              "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80",
            imageAlt: "Friends smiling and laughing together outdoors",
            imageObjectPosition: "50% 40%",
            palette: "gold",
            align: "center",
          },
        ],
      },
    ],
  } satisfies SiteBoardContent,

  visitInvite: {
    title: "We'd love to see you this weekend!",
    subtitle:
      "Let us know you're coming — we'll save you a seat and help you feel at home.",
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
      serviceTimes: "Sundays 10:00 AM",
    },
    social: [],
    copyright: "© 2026 Christian Fellowship Church",
  } satisfies SiteFooterContent,

  /** Static assets — favicon path for future use */
  images: {
    favicon: "/favicon.ico",
  },
} as const;

export type SiteContent = typeof siteContent;
