import { A, useLocation } from "@solidjs/router";
import { ParentProps } from "solid-js";
import { Navbar } from "@church/ui/navbar";
import { SiteFooter } from "@church/ui/site-footer";
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
        tone={isHome() ? "light" : "dark"}
        Link={(linkProps) => (
          <A href={linkProps.href} class={linkProps.class} onClick={linkProps.onClick}>
            {linkProps.children}
          </A>
        )}
      />
      <main
        classList={{
          "mx-auto max-w-page px-4 py-8 lg:px-10": !isHome(),
        }}
      >
        {props.children}
      </main>
      <SiteFooter
        churchName={siteContent.footer.churchName}
        logo={siteContent.footer.logo}
        g12Logo={siteContent.footer.g12Logo}
        contact={siteContent.footer.contact}
        social={[...(siteContent.footer.social ?? [])]}
        copyright={siteContent.footer.copyright}
      />
    </div>
  );
}
