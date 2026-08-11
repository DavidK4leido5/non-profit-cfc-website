import { For } from "solid-js";

export type InvitationMarqueeProps = {
  phrases: readonly string[];
  /** Accessible label for the region */
  label?: string;
  class?: string;
};

/**
 * Continuous left→right invitation strip under the landing hero.
 * Duplicates the phrase track for a seamless CSS loop.
 */
export function InvitationMarquee(props: InvitationMarqueeProps) {
  const phrases = () => (props.phrases.length > 0 ? props.phrases : ["You're invited"]);
  /** Two copies for seamless loop; aria-hidden on the duplicate track */
  const track = () => phrases();

  return (
    <section
      class={`invite-marquee ${props.class ?? ""}`}
      aria-label={props.label ?? "Sunday invitation"}
    >
      <div class="invite-marquee-viewport">
        <div class="invite-marquee-track">
          <div class="invite-marquee-group">
            <For each={track()}>
              {(phrase) => (
                <span class="invite-marquee-item">
                  <span class="font-display invite-marquee-phrase">{phrase}</span>
                  <span class="invite-marquee-dot" aria-hidden="true" />
                </span>
              )}
            </For>
          </div>
          <div class="invite-marquee-group" aria-hidden="true">
            <For each={track()}>
              {(phrase) => (
                <span class="invite-marquee-item">
                  <span class="font-display invite-marquee-phrase">{phrase}</span>
                  <span class="invite-marquee-dot" aria-hidden="true" />
                </span>
              )}
            </For>
          </div>
        </div>
      </div>
    </section>
  );
}
