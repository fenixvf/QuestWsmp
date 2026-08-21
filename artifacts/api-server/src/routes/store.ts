import { Router } from "express";
import { requireAdmin } from "./auth.js";
import type { Request, Response as ExpressResponse } from "express-serve-static-core";

const router = Router();
const STORE_ID = "default";

type StorePayload = {
  settings: unknown;
  quests: unknown;
  eggs: unknown;
};

type ProxyInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

type SupabaseResponse = {
  ok: boolean;
  json(): Promise<unknown>;
};

async function supabase(
  path: string,
  init: ProxyInit = {},
): Promise<SupabaseResponse> {
  const projectUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!projectUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.",
    );
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  return (await fetch(`${projectUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers,
  })) as unknown as SupabaseResponse;
}

function isStorePayload(value: unknown): value is StorePayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return Boolean(
    candidate.settings &&
      typeof candidate.settings === "object" &&
      Array.isArray(candidate.quests) &&
      Array.isArray(candidate.eggs),
  );
}

router.get("/store", async (_req: Request, res: ExpressResponse) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    res.status(503).json({
      message: "O Supabase não está configurado no servidor.",
    });
    return;
  }

  try {
    const response = await supabase(
      `/rest/v1/wsmp_store?id=eq.${STORE_ID}&select=settings,quests,eggs,updated_at`,
    );
    if (!response.ok) {
      res.status(502).json({ message: "Não foi possível consultar o Supabase." });
      return;
    }

    const rows = (await response.json()) as Array<StorePayload & { updated_at: string }>;
    if (!rows.length) {
      res.status(404).json({ message: "O quadro ainda não foi inicializado." });
      return;
    }

    res.json(rows[0]);
  } catch {
    res.status(502).json({ message: "Não foi possível conectar ao Supabase." });
  }
});

router.put(
  "/store",
  requireAdmin,
  async (req: Request, res: ExpressResponse) => {
  if (!isStorePayload(req.body)) {
    res.status(400).json({ message: "Dados inválidos para o quadro." });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    res.status(503).json({
      message: "O Supabase não está configurado no servidor.",
    });
    return;
  }

  try {
    const response = await supabase("/rest/v1/wsmp_store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        id: STORE_ID,
        settings: req.body.settings,
        quests: req.body.quests,
        eggs: req.body.eggs,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      res.status(502).json({ message: "Não foi possível salvar no Supabase." });
      return;
    }

    const rows = (await response.json()) as unknown[];
    res.json(rows[0] ?? req.body);
  } catch {
    res.status(502).json({ message: "Não foi possível conectar ao Supabase." });
  }
  },
);

export default router;