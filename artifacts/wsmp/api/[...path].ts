let appPromise: Promise<any> | undefined;

function loadApp(): Promise<any> {
  appPromise ??= import("../../api-server/src/app.js").then(
    (module) => module.default,
  );
  return appPromise;
}

export default async function handler(req: any, res: any) {
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

  const app = await loadApp();
  return app(req, res);
}