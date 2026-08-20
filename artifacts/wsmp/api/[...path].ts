import app from "../../api-server/src/app";

export default function handler(req: any, res: any) {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }

  return (app as unknown as (request: any, response: any) => unknown)(req, res);
}