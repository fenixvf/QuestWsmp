import crypto from "node:crypto";
import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";

const router: IRouter = Router();
const COOKIE_NAME = "wsmp_admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function timingSafeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function getAuthConfig() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!username || !password || !sessionSecret) {
    throw new Error(
      "ADMIN_USERNAME, ADMIN_PASSWORD, and SESSION_SECRET must be configured.",
    );
  }

  return { username, password, sessionSecret };
}

function createSession(username: string, sessionSecret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", sessionSecret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function readSession(token: string | undefined, sessionSecret: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", sessionSecret)
    .update(payload)
    .digest("base64url");
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { username?: unknown; expiresAt?: unknown };
    if (
      typeof parsed.username !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Date.now()
    ) {
      return null;
    }
    return { username: parsed.username };
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

router.post("/auth/login", (req, res) => {
  const { username, password, sessionSecret } = getAuthConfig();
  const inputUsername =
    typeof req.body?.username === "string" ? req.body.username : "";
  const inputPassword =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (
    !timingSafeEqual(inputUsername, username) ||
    !timingSafeEqual(inputPassword, password)
  ) {
    res.status(401).json({ message: "Usuário ou senha inválidos." });
    return;
  }

  res
    .cookie(COOKIE_NAME, createSession(username, sessionSecret), {
      ...cookieOptions(),
      maxAge: SESSION_DURATION_MS,
    })
    .json({ authenticated: true, username });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions()).json({ authenticated: false });
});

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { sessionSecret } = getAuthConfig();
  const session = readSession(req.cookies?.[COOKIE_NAME], sessionSecret);
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }
  next();
}

router.get("/auth/me", (req, res) => {
  const { sessionSecret } = getAuthConfig();
  const session = readSession(req.cookies?.[COOKIE_NAME], sessionSecret);
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, username: session.username });
});

export default router;