/**
 * Smoke check for CtaButton class composition.
 * Run: node --experimental-strip-types packages/ui/scripts/cta-button.check.ts
 */
import assert from "node:assert/strict";
import {
  CTA_BUTTON_VARIANTS,
  ctaButtonClass,
} from "../src/components/cta-button-class.ts";

assert.ok(CTA_BUTTON_VARIANTS.includes("cta"), "cta variant required for Sign in");

const cta = ctaButtonClass({ variant: "cta", size: "sm" });
assert.match(cta, /bg-accent-600/);
assert.match(cta, /px-3\.5/);
assert.doesNotMatch(ctaButtonClass({ variant: "link" }), /px-6/);

const full = ctaButtonClass({ variant: "primary", fullWidth: true, class: "extra" });
assert.match(full, /\bw-full\b/);
assert.match(full, /\bextra\b/);

console.log("cta-button.check: ok");
