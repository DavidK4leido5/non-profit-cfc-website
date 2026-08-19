import { JSX } from "solid-js";

type IconProps = { class?: string };

function Base(props: IconProps & { children: JSX.Element }) {
  return (
    <svg
      class={props.class ?? "h-6 w-6"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {props.children}
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M19.5 12.6 12 20l-7.5-7.4a4.5 4.5 0 1 1 7.5-5.1 4.5 4.5 0 1 1 7.5 5.1Z" />
    </Base>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </Base>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m9 6 6 6-6 6" />
    </Base>
  );
}

export function QuoteIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8 17H4.5A2.5 2.5 0 0 1 2 14.5V12c0-3 2-5 5-6v3c-1.5.5-2 1.5-2 3h3V17Zm12 0h-3.5A2.5 2.5 0 0 1 14 14.5V12c0-3 2-5 5-6v3c-1.5.5-2 1.5-2 3h3V17Z" />
    </Base>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Base>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </Base>
  );
}

export function HandsIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M11 12v7a2 2 0 0 0 4 0v-5" />
      <path d="M15 14v4a2 2 0 0 0 4 0v-6" />
      <path d="M7 11v8a2 2 0 0 0 4 0v-7" />
      <path d="M7 11 4.5 8.5a2 2 0 0 1 3-2.5L11 9" />
    </Base>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Base>
  );
}

export function ChurchIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3 4 8v13h16V8Z" />
      <path d="M12 3v5M9 21v-6h6v6" />
    </Base>
  );
}
