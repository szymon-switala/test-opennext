// @ts-ignore generated at build time
import { default as nextHandler } from "../.open-next/worker.js";

interface Env {
  SITE_ORIGIN: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
}

const MAX_BODY = 16_384;
const reply = (status: number, error?: string) =>
  Response.json(error ? { ok: false, error } : { ok: true }, { status });

const text = (value: unknown, max: number) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value.trim()
    : null;

async function verifyTurnstile(token: string, ip: string | null, secret: string) {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined }),
    signal: AbortSignal.timeout(5_000),
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

async function readBody(request: Request): Promise<string | null> {
  if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let raw = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return raw + decoder.decode();
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      return null;
    }
    raw += decoder.decode(value, { stream: true });
  }
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.headers.get("Origin") !== env.SITE_ORIGIN) return reply(403, "origin");

  const raw = await readBody(request);
  if (raw === null) return reply(413, "too_large");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return reply(400, "invalid");
  }
  if (typeof parsed !== "object" || parsed === null) return reply(400, "invalid");
  const body = parsed as Record<string, unknown>;

  // Honeypot: bot gets a fake success and nothing is sent.
  if (body.website) return reply(200);

  const name = text(body.name, 100);
  const email = text(body.email, 254);
  const message = text(body.message, 5_000);
  const token = text(body["cf-turnstile-response"], 2_048);
  const emailOk = email !== null && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || /[\r\n]/.test(name) || !emailOk || !message || !token) {
    return reply(400, "invalid");
  }

  const human = await verifyTurnstile(
    token,
    request.headers.get("CF-Connecting-IP"),
    env.TURNSTILE_SECRET,
  );
  if (!human) return reply(403, "turnstile");

  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "contact-form-worker",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: "Nowa wiadomość z formularza",
      text: `Imię: ${name}\nE-mail: ${email}\n\n${message}`,
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!sent.ok) {
    console.error("email_failed", sent.status); // Never log the message itself.
    return reply(502, "send_failed");
  }
  return reply(200);
}

export default {
  async fetch(request: Request, env: Env, ctx: unknown): Promise<Response> {
    // The contact form skips Next.js, so it stays well under the 10 ms CPU limit on Free.
    if (new URL(request.url).pathname !== "/api/contact") {
      return nextHandler.fetch(request, env, ctx);
    }
    if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
    try {
      return await handleContact(request, env);
    } catch (error) {
      console.error("contact_failed", error instanceof Error ? error.name : "unknown");
      return reply(502, "send_failed");
    }
  },
};
