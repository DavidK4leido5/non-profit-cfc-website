import { A, useLocation } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";
import { Navbar } from "@church/ui/navbar";
import { SiteFooter } from "@church/ui/site-footer";
import { siteContent } from "~/content/site.content";
import { session } from "~/app/stores/session";

export function Layout(props: ParentProps) {
  const location = useLocation();
  const isAdmin = () => location.pathname.startsWith("/admin");
  const isHome = () => location.pathname === "/";
  const isBoard = () => location.pathname === "/board";
  const isFullBleed = () => isHome() || isBoard() || isAdmin();

  const navLinks = () =>
    siteContent.nav.links.map((link) => ({
      ...link,
      active: location.pathname === link.href,
    }));

  return (
    <div
      classList={{
        "min-h-screen bg-surface-subtle text-ink": !isAdmin(),
        "min-h-screen": isAdmin(),
      }}
    >
      <Show when={!isAdmin()}>
        <Navbar
          brand={siteContent.brand}
          links={navLinks()}
          cta={siteContent.nav.signIn}
          userEmail={session.user?.email ?? null}
          variant={isFullBleed() ? "transparent" : "solid"}
          tone={isFullBleed() ? "light" : "dark"}
          Link={(linkProps) => (
            <A href={linkProps.href} class={linkProps.class} onClick={linkProps.onClick}>
              {linkProps.children}
            </A>
          )}
        />
      </Show>
      <main
        classList={{
          "mx-auto max-w-page px-4 py-8 lg:px-10": !isFullBleed(),
        }}
      >
        {props.children}
      </main>
      <Show when={!isAdmin()}>
        <SiteFooter
          churchName={siteContent.footer.churchName}
          logo={siteContent.footer.logo}
          g12Logo={siteContent.footer.g12Logo}
          contact={siteContent.footer.contact}
          social={[...(siteContent.footer.social ?? [])]}
          copyright={siteContent.footer.copyright}
        />
      </Show>
    </div>
  );
}
