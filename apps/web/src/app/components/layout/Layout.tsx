import { A, useLocation } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";
import { Navbar } from "@church/ui/navbar";
import { SiteFooter } from "@church/ui/site-footer";
import { siteContent } from "~/content/site.content";
import { useAuthSession } from "~/app/stores/session";
import { NavUserAvatar } from "./NavUserAvatar";

export function Layout(props: ParentProps) {
  const location = useLocation();
  const sessionState = useAuthSession();
  const isCmsAdmin = () => location.pathname.startsWith("/admin");
  const isDashboard = () => location.pathname.startsWith("/dashboard");
  const isAuth = () => location.pathname.startsWith("/auth");
  const isHome = () => location.pathname === "/";
  const isBoard = () =>
    location.pathname === "/board" || location.pathname.startsWith("/board/");
  const isFullBleed = () => isHome() || isBoard() || isCmsAdmin() || isAuth();

  const user = () => sessionState()?.data?.user ?? null;
  const userEmail = () => user()?.email ?? null;

  const navLinks = () => {
    const links = siteContent.nav.links.map((link) => ({
      ...link,
      active: location.pathname === link.href,
    }));
    if (userEmail()) {
      links.push({
        href: "/dashboard",
        label: "Admin",
        active: isDashboard(),
      });
    }
    return links;
  };

  return (
    <div
      classList={{
        "min-h-screen bg-primary text-on-hero": isBoard() || isAuth(),
        "min-h-screen bg-surface-subtle text-ink":
          !isCmsAdmin() && !isBoard() && !isAuth(),
        "min-h-screen": isCmsAdmin(),
      }}
    >
      <Show when={!isCmsAdmin() && !isAuth()}>
        <a
          href="#main-content"
          class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-ink focus:shadow-lg focus:ring-2 focus:ring-accent-600 focus:ring-offset-2 focus:outline-none"
        >
          Skip to main content
        </a>
        <Navbar
          brand={siteContent.brand}
          links={navLinks()}
          cta={userEmail() ? undefined : siteContent.nav.signIn}
          userEmail={userEmail()}
          userSlot={
            user() ? (
              <NavUserAvatar
                name={user()?.name}
                email={user()?.email}
                image={user()?.image}
                href="/dashboard"
                light={isFullBleed() && !isDashboard()}
              />
            ) : undefined
          }
          variant={isFullBleed() && !isDashboard() ? "transparent" : "solid"}
          tone={isFullBleed() && !isDashboard() ? "light" : "dark"}
          Link={(linkProps) => (
            <A
              href={linkProps.href}
              class={linkProps.class}
              onClick={linkProps.onClick}
            >
              {linkProps.children}
            </A>
          )}
        />
      </Show>
      <main
        id="main-content"
        tabindex="-1"
        classList={{
          "mx-auto max-w-page px-4 py-8 lg:px-10":
            !isFullBleed() && !isDashboard(),
        }}
      >
        {props.children}
      </main>
      <Show when={!isCmsAdmin() && !isAuth()}>
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
