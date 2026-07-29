import { JSX } from "solid-js";

type IconProps = {
  class?: string;
};

function iconClass(props: IconProps) {
  return props.class ?? "h-12 w-12";
}

export function CampIcon(props: IconProps) {
  return (
    <svg class={iconClass(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M4 20 12 4l8 16H4Z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8 16h8" stroke-linecap="round" />
    </svg>
  );
}

export function RetreatIcon(props: IconProps) {
  return (
    <svg class={iconClass(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M4 18 12 6l8 12H4Z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 14h6" stroke-linecap="round" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg class={iconClass(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" stroke-linecap="round" />
    </svg>
  );
}

export function FellowshipIcon(props: IconProps) {
  return (
    <svg class={iconClass(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M4 19c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5M13.5 19c0-1.8 1.5-3.2 3.5-3.2" stroke-linecap="round" />
    </svg>
  );
}

export function ServiceIcon(props: IconProps) {
  return (
    <svg class={iconClass(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M12 21s-6-4.5-6-10a6 6 0 1 1 12 0c0 5.5-6 10-6 10Z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 11v4" stroke-linecap="round" />
    </svg>
  );
}

export type ActivityIconId = "camp" | "retreat" | "calendar" | "fellowship" | "service";

export function ActivityIcon(props: { id: ActivityIconId; class?: string }) {
  const icons: Record<ActivityIconId, (p: IconProps) => JSX.Element> = {
    camp: CampIcon,
    retreat: RetreatIcon,
    calendar: CalendarIcon,
    fellowship: FellowshipIcon,
    service: ServiceIcon,
  };

  const Icon = icons[props.id];
  return <Icon class={props.class} />;
}

function ArrowRightIcon(props: IconProps) {
  return (
    <svg class={props.class ?? "h-4 w-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export { ArrowRightIcon };
