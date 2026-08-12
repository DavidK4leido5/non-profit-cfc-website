import { timingSafeEqual } from "node:crypto";

export const GATEWAY_HEADER = "X-Church-Gateway";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * When GATEWAY_SHARED_SECRET is set, require X-Church-Gateway from web nginx.
 * Empty secret = local/dev passthrough (Vite may inject the header when set in .env).
 */
export function assertGatewayConfigured(): void {
  const secret = process.env.GATEWAY_SHARED_SECRET ?? "";
  if (process.env.NODE_ENV === "production" && !secret) {
    console.error("GATEWAY_SHARED_SECRET is required when NODE_ENV=production");
    process.exit(1);
  }
}

export function gatewaySecret(): string {
  return process.env.GATEWAY_SHARED_SECRET ?? "";
}

export function isValidGatewayRequest(headerValue: string | undefined): boolean {
  const secret = gatewaySecret();
  if (!secret) return true;
  return safeEqual(headerValue ?? "", secret);
}
