import app from "../artifacts/api-server/src/app";

export default function handler(req: any, res: any) {
  // Replit mounts the Express router at /api, while Vercel invokes this
  // catch-all function with the /api prefix removed.
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }

  return (app as unknown as (request: any, response: any) => unknown)(req, res);
}