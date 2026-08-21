import app from "../app.mjs";

export default function handler(req, res) {
  const query = req.url?.includes("?")
    ? req.url.slice(req.url.indexOf("?"))
    : "";
  req.url = `/api/auth/login${query}`;
  return app(req, res);
}