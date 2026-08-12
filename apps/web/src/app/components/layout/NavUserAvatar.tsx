import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

function initialsFrom(name?: string | null, email?: string | null) {
  const fromName = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  if (fromName) return fromName;
  const local = (email ?? "").trim().split("@")[0] ?? "";
  return (local.slice(0, 2) || "?").toUpperCase();
}

type NavUserAvatarProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  href?: string;
  /** Light avatar chrome for transparent hero nav */
  light?: boolean;
  class?: string;
  onClick?: () => void;
};

/** Placeholder avatar linking to Admin (/dashboard). */
export function NavUserAvatar(props: NavUserAvatarProps) {
  const initials = () => initialsFrom(props.name, props.email);
  const href = () => props.href ?? "/dashboard";

  return (
    <A
      href={href()}
      class={cn(
        "ml-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:ml-2",
        props.light
          ? "focus-visible:ring-white focus-visible:ring-offset-primary"
          : "focus-visible:ring-accent-500 focus-visible:ring-offset-surface",
        props.class,
      )}
      aria-label="Open admin"
      title={props.email ?? "Admin"}
      onClick={props.onClick}
    >
      <Avatar
        class={cn(
          "size-9 border",
          props.light ? "border-white/40" : "border-border",
        )}
      >
        <Show when={props.image}>
          {(src) => <AvatarImage src={src()} alt="" />}
        </Show>
        <AvatarFallback
          class={cn(
            props.light
              ? "bg-white/20 text-white"
              : "bg-accent-50 text-accent-700",
          )}
        >
          {initials()}
        </AvatarFallback>
      </Avatar>
    </A>
  );
}
