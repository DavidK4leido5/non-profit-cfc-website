import { JSX } from "solid-js";

type IconProps = {
  class?: string;
};

function iconClass(props: IconProps, fallback = "h-6 w-6") {
  return props.class ?? fallback;
}

export function ClockIcon(props: IconProps) {
  return (
    <svg
      class={iconClass(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export function EmailIcon(props: IconProps) {
  return (
    <svg
      class={iconClass(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg
      class={iconClass(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      aria-hidden="true"
    >
      <path
        d="M6.5 4.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.5 1.5A15 15 0 0 1 3 6a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg
      class={iconClass(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      aria-hidden="true"
    >
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg class={iconClass(props)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.015 4.388 11.015 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.088 24 18.088 24 12.073Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg class={iconClass(props)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.333-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.333-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163ZM12 0C8.741 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63a6.665 6.665 0 0 0-2.417 1.574A6.665 6.665 0 0 0 .149 4.62C-.148 5.386-.349 6.256-.409 7.534-.467 8.814-.481 9.222-.481 12.481s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a6.665 6.665 0 0 0 1.574 2.417 6.665 6.665 0 0 0 2.417 1.574c.765.297 1.636.498 2.913.558 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.06 2.148-.261 2.913-.558a6.665 6.665 0 0 0 2.417-1.574 6.665 6.665 0 0 0 1.574-2.417c.297-.765.498-1.636.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.261-2.148-.558-2.913a6.665 6.665 0 0 0-1.574-2.417A6.665 6.665 0 0 0 19.38.149C18.615-.148 17.744-.349 16.467-.409 15.187-.467 14.779-.481 12-.481Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg class={iconClass(props)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg
      class={iconClass(props)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      aria-hidden="true"
    >
      <path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

const socialIcons: Record<string, (p: IconProps) => JSX.Element> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
};

export function SocialIcon(props: { label: string; class?: string }) {
  const key = props.label.trim().toLowerCase();
  const Icon = socialIcons[key] ?? ExternalLinkIcon;
  return <Icon class={props.class} />;
}
