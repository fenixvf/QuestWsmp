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

const DEFAULT_STORE: StorePayload = {
  settings: {
    siteName: "WSMP",
    tagline: "Um cantinho para cuidar",
    welcomeMessage:
      "Faça uma pausa, complete uma missão e cuide dos seus ovos.",
    logoImage: "",
  },
  quests: [
    {
      id: "q1",
      title: "Dar bom-dia",
      description: "Visite um ovo antes da primeira rolagem.",
      reward: "+12 carinho",
      category: "Cuidado",
      completed: false,
      active: true,
    },
    {
      id: "q2",
      title: "Deixar um recado",
      description: "Escreva uma frase gentil para a comunidade.",
      reward: "+8 brilho",
      category: "Comunidade",
      completed: true,
      active: true,
    },
    {
      id: "q3",
      title: "Olhar de perto",
      description: "Visite um ovo que você ainda não viu nesta semana.",
      reward: "+20 XP",
      category: "Explorar",
      completed: false,
      active: true,
    },
  ],
  eggs: [
    {
      id: "e1",
      name: "Miso",
      image: "",
      health: 92,
      happiness: 88,
      maxHearts: 10,
      status: "Radiante",
      note: "Gosta de uma visita tranquila e de pausas ao sol.",
    },
    {
      id: "e2",
      name: "Pip",
      image: "",
      health: 76,
      happiness: 94,
      maxHearts: 8,
      status: "Animado",
      note: "Muito sociável hoje. Pip está procurando amigos.",
    },
    {
      id: "e3",
      name: "Clover",
      image: "",
      health: 84,
      happiness: 71,
      maxHearts: 12,
      status: "Descansando",
      note: "Mais quieto, mas confortável e seguro no ninho.",
    },
  ],
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
    res.json({
      ...DEFAULT_STORE,
      updated_at: new Date().toISOString(),
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
      res.json({
        ...DEFAULT_STORE,
        updated_at: new Date().toISOString(),
      });
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