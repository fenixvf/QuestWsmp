import app from "../artifacts/api-server/src/app";

export default function handler(req: any, res: any) {
  // Replit mounts the Express router at /api, while Vercel invokes this
  // catch-all function with the /api prefix removed.
  if (req.url && !req.url.startsWith("/api")) {
    const pathParam = req.query?.path;
    if (pathParam) {
      const path = (Array.isArray(pathParam) ? pathParam : [pathParam])
        .map(String)
        .join("/");
      const query = req.url.includes("?")
        ? req.url.slice(req.url.indexOf("?"))
        : "";
      req.url = `/api/${path}${query}`;
    } else {
      req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
    }
  }

  return (app as unknown as (request: any, response: any) => unknown)(req, res);
}