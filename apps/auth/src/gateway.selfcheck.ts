import { timingSafeEqual } from "node:crypto";
import assert from "node:assert/strict";
import { GATEWAY_HEADER, isValidGatewayRequest } from "./gateway.js";

// Minimal check — no test framework. Run: pnpm --filter @church/auth exec tsx src/gateway.selfcheck.ts
process.env.GATEWAY_SHARED_SECRET = "test-secret-value-32chars!!!!!!";

assert.equal(isValidGatewayRequest("test-secret-value-32chars!!!!!!"), true);
assert.equal(isValidGatewayRequest("wrong"), false);
assert.equal(isValidGatewayRequest(undefined), false);

const a = Buffer.from("test-secret-value-32chars!!!!!!");
const b = Buffer.from("test-secret-value-32chars!!!!!!");
assert.equal(timingSafeEqual(a, b), true);
assert.equal(GATEWAY_HEADER, "X-Church-Gateway");

console.log("gateway.selfcheck: ok");
