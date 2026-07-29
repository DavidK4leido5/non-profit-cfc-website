import { A, useLocation } from "@solidjs/router";
import { ParentProps } from "solid-js";
import { Navbar } from "@church/ui/navbar";
import { siteContent } from "~/content/site.content";
import { session } from "~/app/stores/session";

export function Layout(props: ParentProps) {
  const location = useLocation();
  const isHome = () => location.pathname === "/";

  const navLinks = () =>
    siteContent.nav.links.map((link) => ({
      ...link,
      active: location.pathname === link.href,
    }));

  return (
    <div class="min-h-screen bg-surface-subtle text-ink">
      <Navbar
        brand={siteContent.brand}
        links={navLinks()}
        cta={siteContent.nav.signIn}
        userEmail={session.user?.email ?? null}
        variant={isHome() ? "transparent" : "solid"}
        Link={(linkProps) => (
          <A href={linkProps.href} class={linkProps.class} onClick={linkProps.onClick}>
            {linkProps.children}
          </A>
        )}
      />
      <main
        classList={{
          "mx-auto max-w-5xl px-4 py-8": !isHome(),
        }}
      >
        {props.children}
      </main>
    </div>
  );
}
