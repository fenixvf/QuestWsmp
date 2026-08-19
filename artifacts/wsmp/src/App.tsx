import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Switch, Router as WouterRouter } from 'wouter';
import { Activity, ArrowRight, Check, CheckCircle2, ChevronDown, ClipboardList, Egg as EggIcon, ExternalLink, Heart, LayoutDashboard, Menu, Pencil, Plus, Save, Settings, Sparkles, Star, Trash2, Trophy, X, Zap } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import logoAsset from '@assets/watermarked_img_10663692129455435167_(1)_1787017059477.jpg';

type SiteSettings = { siteName: string; tagline: string; welcomeMessage: string; logoImage: string };
type Quest = { id: string; title: string; description: string; reward: string; category: string; completed: boolean; active: boolean };
type Egg = { id: string; name: string; image: string; health: number; happiness: number; maxHearts: number; status: string; note: string };
type Store = { settings: SiteSettings; quests: Quest[]; eggs: Egg[] };

const seed: Store = {
  settings: { siteName: 'WSMP', tagline: 'Um cantinho para cuidar', welcomeMessage: 'Faça uma pausa, complete uma missão e cuide dos seus ovos.', logoImage: logoAsset },
  quests: [
    { id: 'q1', title: 'Dar bom-dia', description: 'Visite um ovo antes da primeira rolagem.', reward: '+12 carinho', category: 'Cuidado', completed: false, active: true },
    { id: 'q2', title: 'Deixar um recado', description: 'Escreva uma frase gentil para a comunidade.', reward: '+8 brilho', category: 'Comunidade', completed: true, active: true },
    { id: 'q3', title: 'Olhar de perto', description: 'Visite um ovo que você ainda não viu nesta semana.', reward: '+20 XP', category: 'Explorar', completed: false, active: true },
  ],
  eggs: [
    { id: 'e1', name: 'Miso', image: logoAsset, health: 92, happiness: 88, maxHearts: 10, status: 'Radiante', note: 'Gosta de uma visita tranquila e de pausas ao sol.' },
    { id: 'e2', name: 'Pip', image: logoAsset, health: 76, happiness: 94, maxHearts: 8, status: 'Animado', note: 'Muito sociável hoje. Pip está procurando amigos.' },
    { id: 'e3', name: 'Clover', image: logoAsset, health: 84, happiness: 71, maxHearts: 12, status: 'Descansando', note: 'Mais quieto, mas confortável e seguro no ninho.' },
  ],
};

const STORAGE = 'wsmp-companion-store';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const normalizeEgg = (egg: Partial<Egg> & { id: string; name: string }): Egg => ({
  id: egg.id, name: egg.name, image: egg.image || logoAsset, health: clamp(Number(egg.health ?? 0), 0, 100),
  happiness: clamp(Number(egg.happiness ?? 0), 0, 100), maxHearts: clamp(Number(egg.maxHearts ?? 10), 1, 20),
  status: egg.status || 'Novo', note: egg.note || '',
});
const migrateQuest = (quest: Quest): Quest => {
  const titles: Record<string, string> = { 'Morning hello': 'Dar bom-dia', 'Tiny compliment': 'Deixar um recado', 'Look closely': 'Olhar de perto' };
  const descriptions: Record<string, string> = {
    'Check on one egg before your first scroll.': 'Visite um ovo antes da primeira rolagem.',
    'Leave a kind note for the community.': 'Escreva uma frase gentil para a comunidade.',
    'Visit an egg you have not checked this week.': 'Visite um ovo que você ainda não viu nesta semana.',
  };
  const categories: Record<string, string> = { Care: 'Cuidado', Community: 'Comunidade', Explore: 'Explorar' };
  const rewards: Record<string, string> = { '+12 warmth': '+12 carinho', '+8 sparkle': '+8 brilho' };
  return { ...quest, title: titles[quest.title] || quest.title, description: descriptions[quest.description] || quest.description, category: categories[quest.category] || quest.category, reward: rewards[quest.reward] || quest.reward };
};
const migrateEgg = (egg: Partial<Egg> & { id: string; name: string }): Egg => {
  const statuses: Record<string, string> = { Thriving: 'Radiante', Peppy: 'Animado', Resting: 'Descansando', 'Feeling seen': 'Visto hoje' };
  const notes: Record<string, string> = {
    'Loves a gentle check-in and long sunny pauses.': 'Gosta de uma visita tranquila e de pausas ao sol.',
    'Very social today. Pip has been looking for friends.': 'Muito sociável hoje. Pip está procurando amigos.',
    'A little quiet, but cozy and safe in their nest.': 'Mais quieto, mas confortável e seguro no ninho.',
  };
  const normalized = normalizeEgg(egg);
  return { ...normalized, status: statuses[normalized.status] || normalized.status, note: notes[normalized.note] || normalized.note };
};
const readStore = (): Store => {
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<Store>;
      return {
        settings: {
          ...seed.settings,
          ...(parsed.settings || {}),
          tagline: parsed.settings?.tagline === 'Warm Small Magic Place' ? seed.settings.tagline : (parsed.settings?.tagline || seed.settings.tagline),
          welcomeMessage: parsed.settings?.welcomeMessage?.startsWith('A tiny corner') ? seed.settings.welcomeMessage : (parsed.settings?.welcomeMessage || seed.settings.welcomeMessage),
        },
        quests: Array.isArray(parsed.quests) ? parsed.quests.map(migrateQuest) : seed.quests,
        eggs: Array.isArray(parsed.eggs) ? parsed.eggs.map(migrateEgg) : seed.eggs,
      };
    }
  } catch { /* usa os dados iniciais */ }
  return seed;
};

function useStore() {
  const [store, setStore] = useState<Store>(readStore);
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(store)); }, [store]);
  const update = (next: Partial<Store>) => setStore(current => ({ ...current, ...next }));
  return { store, update };
}

function Brand({ settings, dark = false }: { settings: SiteSettings; dark?: boolean }) {
  return <Link href="/" className="focus-ring flex items-center gap-3" data-testid="link-brand">
    <img src={settings.logoImage || logoAsset} alt="Logo WSMP" className="h-11 w-11 object-cover pixel-border-light" data-testid="img-site-logo" />
    <span className={dark ? 'text-primary-foreground' : 'text-foreground'}>
      <span className="block font-mono text-lg font-bold leading-none tracking-tight">{settings.siteName}</span>
      <span className={`mt-1 block text-[10px] font-bold uppercase tracking-[.16em] ${dark ? 'text-primary-foreground/55' : 'text-muted-foreground'}`}>quadro de missões</span>
    </span>
  </Link>;
}

function PublicHeader({ settings }: { settings: SiteSettings }) {
  return <header className="mx-auto flex max-w-4xl items-center justify-between border-b-2 border-foreground/10 px-5 py-5 md:px-8">
    <Brand settings={settings} />
    <span className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Hoje</span>
  </header>;
}

function HeartSlots({ value, maxHearts, label }: { value: number; maxHearts: number; label: string }) {
  const level = clamp(value, 0, 100) / 100 * maxHearts;
  const full = Math.floor(level);
  const partial = level - full > 0.1 && full < maxHearts;
  return <div className="flex flex-wrap items-center gap-0.5" aria-label={`${label}: ${value}%`}>
    {Array.from({ length: maxHearts }, (_, index) => {
      if (index < full) return <span className="heart-slot filled" key={index}><Heart fill="currentColor" /></span>;
      if (index === full && partial) return <span className="heart-half" key={index}><Heart /><span><Heart fill="currentColor" /></span></span>;
      return <span className="heart-slot empty" key={index}><Heart /></span>;
    })}
  </div>;
}

function HeartMeter({ label, value, maxHearts, icon }: { label: string; value: number; maxHearts: number; icon: ReactNode }) {
  return <div className="flex items-center justify-between gap-3" data-testid={`hearts-${label.toLowerCase()}-${value}`}>
    <span className="flex min-w-[7rem] items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{icon}{label}</span>
    <HeartSlots value={value} maxHearts={maxHearts} label={label} />
    <span className="w-9 text-right font-mono text-[11px] font-bold text-foreground">{value}%</span>
  </div>;
}

function EggCard({ egg }: { egg: Egg }) {
  return <article className="card-lift overflow-hidden pixel-border-light bg-card p-3" data-testid={`card-egg-${egg.id}`}>
    <div className="relative flex h-48 items-center justify-center overflow-hidden border-2 border-foreground/15 bg-secondary/60 pixel-grid">
      <div className="absolute right-2 top-2 border-2 border-foreground/15 bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider"><span className="mr-1.5 inline-block h-2 w-2 bg-accent" />{egg.status}</div>
      <div className="absolute bottom-2 h-4 w-28 bg-foreground/15" />
      <img src={egg.image || logoAsset} alt={`Imagem do ovo ${egg.name}`} className="animate-floaty relative h-36 w-36 object-cover pixel-border" data-testid={`img-egg-${egg.id}`} />
    </div>
    <div className="px-2 pb-2 pt-4">
      <div className="mb-5 flex items-center justify-between gap-2"><h3 className="font-mono text-xl font-bold tracking-tight" data-testid={`text-egg-name-${egg.id}`}>{egg.name}</h3><Heart size={17} className="text-primary" fill="currentColor" /></div>
      <div className="space-y-3"><HeartMeter label="Vida" value={egg.health} maxHearts={egg.maxHearts} icon={<Activity size={13} />} /><HeartMeter label="Felicidade" value={egg.happiness} maxHearts={egg.maxHearts} icon={<Heart size={13} />} /></div>
    </div>
  </article>;
}

function QuestRow({ quest, onComplete }: { quest: Quest; onComplete: (id: string) => void }) {
  return <div className={`flex items-center gap-4 border-2 p-4 transition ${quest.completed ? 'border-accent/30 bg-accent/[.08]' : 'border-card-border bg-card hover:border-primary/40'}`} data-testid={`row-quest-${quest.id}`}>
    <button aria-label={quest.completed ? 'Missão concluída' : `Concluir missão ${quest.title}`} onClick={() => onComplete(quest.id)} className={`press focus-ring flex h-9 w-9 shrink-0 items-center justify-center border-2 transition ${quest.completed ? 'border-accent bg-accent text-accent-foreground' : 'border-muted-foreground/40 bg-background text-transparent hover:border-primary'}`} data-testid={`button-complete-quest-${quest.id}`}><Check size={17} strokeWidth={3} /></button>
    <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><h3 className={`font-bold ${quest.completed ? 'text-muted-foreground line-through' : ''}`}>{quest.title}</h3><span className="border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/65">{quest.category}</span></div><p className="truncate text-sm text-muted-foreground">{quest.description}</p></div>
    <span className={`hidden shrink-0 font-mono text-xs font-bold sm:block ${quest.completed ? 'text-accent' : 'text-primary'}`}>{quest.reward}</span>
  </div>;
}

function Home({ store, update }: { store: Store; update: (next: Partial<Store>) => void }) {
  const activeQuests = store.quests.filter(q => q.active);
  const completed = activeQuests.filter(q => q.completed).length;
  const completeQuest = (id: string) => update({ quests: store.quests.map(q => q.id === id ? { ...q, completed: !q.completed } : q) });
  return <div className="grain min-h-[100dvh] overflow-hidden bg-background">
    <PublicHeader settings={store.settings} />
    <main className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
      <section className="animate-rise">
        <div className="mb-8"><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><ClipboardList size={15} /> Missões diárias</p><h1 className="font-mono text-4xl font-bold tracking-tight md:text-5xl">O que fazer hoje</h1><p className="mt-3 max-w-xl text-muted-foreground">Marque as missões conforme você completar.</p></div>
        <div className="grid gap-3">{activeQuests.map((quest, index) => <div key={quest.id} className="animate-rise" style={{ animationDelay: `${index * 70}ms` }}><QuestRow quest={quest} onComplete={completeQuest} /></div>)}</div>
        {activeQuests.length === 0 && <Empty title="Nenhuma missão" text="As missões diárias aparecerão aqui." icon={<ClipboardList size={26} />} />}
        <div className="mt-4 text-right font-mono text-sm font-bold text-muted-foreground">{completed}/{activeQuests.length} concluídas</div>
      </section>
      <section id="colecao" className="mt-16 border-t-2 border-foreground/10 pt-12">
        <div className="mb-8"><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-accent"><EggIcon size={15} /> Status dos ovos</p><h2 className="font-mono text-3xl font-bold tracking-tight md:text-4xl">Como eles estão?</h2></div>
        {store.eggs.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{store.eggs.map((egg, index) => <div key={egg.id} className="animate-rise" style={{ animationDelay: `${index * 80}ms` }}><EggCard egg={egg} /></div>)}</div> : <Empty title="Nenhum ovo" text="A coleção está vazia." icon={<EggIcon size={26} />} />}
      </section>
    </main>
  </div>;
}

function Empty({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return <div className="flex flex-col items-center justify-center border-2 border-dashed border-card-border bg-card/60 px-6 py-14 text-center"><div className="mb-4 border-2 border-primary/20 bg-secondary/40 p-3 text-primary">{icon}</div><h3 className="font-mono text-lg font-bold">{title}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p></div>;
}

function Field({ label, value, onChange, multiline = false, placeholder, type = 'text', min, max }: { label: string; value: string | number; onChange: (value: string) => void; multiline?: boolean; placeholder?: string; type?: string; min?: number; max?: number }) {
  const common = { value, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), placeholder, className: 'focus-ring mt-2 w-full border-2 border-input bg-background px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground/55 focus:border-primary' };
  return <label className="block text-sm font-bold text-foreground">{label}{multiline ? <textarea {...common} rows={3} /> : <input {...common} type={type} min={min} max={max} />}</label>;
}

function AdminShell({ settings, children, section, setSection }: { settings: SiteSettings; children: ReactNode; section: string; setSection: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const items = [{ id: 'overview', label: 'Resumo', icon: <LayoutDashboard size={17} /> }, { id: 'settings', label: 'Configurações', icon: <Settings size={17} /> }, { id: 'quests', label: 'Missões', icon: <ClipboardList size={17} /> }, { id: 'eggs', label: 'Ovos', icon: <EggIcon size={17} /> }];
  return <div className="grain min-h-[100dvh] bg-background lg:flex">
    <aside className={`fixed inset-y-0 left-0 z-30 w-[274px] -translate-x-full bg-sidebar px-5 py-6 text-sidebar-foreground shadow-2xl transition-transform lg:static lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : ''}`}><div className="flex items-center justify-between"><Brand settings={settings} dark /><button className="focus-ring p-2 text-sidebar-foreground/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu" data-testid="button-close-menu"><X size={19} /></button></div><div className="mt-12"><p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-sidebar-foreground/40">Gerenciar ninho</p><nav className="mt-3 space-y-1" aria-label="Menu administrativo">{items.map(item => <button key={item.id} onClick={() => { setSection(item.id); setOpen(false); }} className={`focus-ring flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-bold transition ${section === item.id ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`} data-testid={`button-admin-${item.id}`}>{item.icon}{item.label}{section === item.id && <ChevronDown className="ml-auto -rotate-90" size={15} />}</button>)}</nav></div><div className="absolute bottom-6 left-5 right-5 border-2 border-sidebar-border bg-sidebar-accent p-4"><p className="text-xs font-bold text-sidebar-foreground">Painel WSMP</p><p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/55">As mudanças aparecem no quadro na hora.</p><Link href="/" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-secondary" data-testid="link-view-club">Ver quadro público <ExternalLink size={12} /></Link></div></aside>
    {open && <button className="fixed inset-0 z-20 bg-foreground/25 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar navegação" data-testid="button-overlay-menu" />}
    <div className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b-2 border-border/70 bg-background/90 px-5 backdrop-blur md:px-9"><button onClick={() => setOpen(true)} className="focus-ring border-2 border-border bg-card p-2.5 lg:hidden" aria-label="Abrir menu" data-testid="button-open-menu"><Menu size={19} /></button><div className="hidden lg:block"><p className="text-xs font-bold uppercase tracking-[.17em] text-muted-foreground">Painel de controle</p><h1 className="font-mono text-xl font-bold">{items.find(item => item.id === section)?.label}</h1></div><div className="flex items-center gap-3"><span className="hidden text-xs font-bold text-muted-foreground sm:block">Salvo no navegador</span><div className="flex items-center gap-2 border-2 border-border bg-card px-2.5 py-1.5"><span className="flex h-7 w-7 items-center justify-center bg-secondary font-mono text-xs font-bold">WS</span><span className="pr-1 text-xs font-bold">Administrador</span></div></div></header><main className="mx-auto max-w-6xl p-5 md:p-9">{children}</main></div>
  </div>;
}

function Stat({ value, label, icon, tint }: { value: string | number; label: string; icon: ReactNode; tint: string }) {
  return <div className="border-2 border-card-border bg-card p-4 shadow-sm"><div className={`mb-5 flex h-9 w-9 items-center justify-center border-2 border-foreground/10 ${tint}`}>{icon}</div><p className="font-mono text-3xl font-bold">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p></div>;
}

function Overview({ store, avg, setSection }: { store: Store; avg: number; setSection: (s: string) => void }) {
  const active = store.quests.filter(q => q.active);
  return <div className="animate-rise"><div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-primary">Olá, admin</p><h2 className="font-mono text-4xl font-bold tracking-tight md:text-5xl">O ninho está bem.</h2><p className="mt-3 max-w-xl text-muted-foreground">Veja o estado do quadro e faça ajustes rápidos.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat value={store.eggs.length} label="Ovos no ninho" icon={<EggIcon size={18} />} tint="bg-secondary/35 text-primary" /><Stat value={`${avg}%`} label="Vida média" icon={<Activity size={18} />} tint="bg-accent/15 text-accent" /><Stat value={`${active.filter(q => q.completed).length}/${active.length}`} label="Missões feitas" icon={<Trophy size={18} />} tint="bg-primary/12 text-primary" /><Stat value="Hoje" label="Última visita" icon={<Sparkles size={18} />} tint="bg-secondary text-secondary-foreground" /></div><div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><div className="border-2 border-card-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-mono text-xl font-bold">Visão dos ovos</h3><p className="mt-1 text-sm text-muted-foreground">Corações por criatura.</p></div><Heart className="text-primary" size={21} /></div><div className="mt-6 space-y-4">{store.eggs.slice(0, 4).map(egg => <div className="flex flex-wrap items-center gap-3" key={egg.id}><img src={egg.image || logoAsset} alt="" className="h-10 w-10 object-cover pixel-border-light" /><span className="w-20 text-sm font-bold">{egg.name}</span><HeartSlots value={egg.health} maxHearts={egg.maxHearts} label={`Vida de ${egg.name}`} /><span className="font-mono text-xs font-bold">{egg.health}%</span></div>)}</div>{!store.eggs.length && <p className="mt-5 text-sm text-muted-foreground">Nenhum ovo cadastrado.</p>}</div><div className="border-2 border-foreground bg-foreground p-6 text-card"><div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground"><Settings size={19} /></div><h3 className="mt-6 font-mono text-2xl font-bold">Ajustar o quadro</h3><p className="mt-2 text-sm leading-relaxed text-card/65">Edite as mensagens, missões ou ovos.</p><div className="mt-6 space-y-2"><button onClick={() => setSection('settings')} className="press flex w-full items-center justify-between bg-card/10 px-3 py-2.5 text-left text-sm font-bold hover:bg-card/20" data-testid="button-quick-settings">Configurações <ArrowRight size={15} /></button><button onClick={() => setSection('eggs')} className="press flex w-full items-center justify-between bg-card/10 px-3 py-2.5 text-left text-sm font-bold hover:bg-card/20" data-testid="button-quick-eggs">Gerenciar ovos <ArrowRight size={15} /></button></div></div></div></div>;
}

function PanelHeading({ icon, eyebrow, title, text, button }: { icon: ReactNode; eyebrow: string; title: string; text: string; button?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary">{icon}{eyebrow}</p><h2 className="font-mono text-4xl font-bold tracking-tight">{title}</h2><p className="mt-3 text-muted-foreground">{text}</p></div>{button}</div>;
}

function SettingsPanel({ settings, update, onSaved }: { settings: SiteSettings; update: (next: Partial<Store>) => void; onSaved: () => void }) {
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);
  const submit = (event: FormEvent) => { event.preventDefault(); update({ settings: form }); onSaved(); };
  return <div className="animate-rise max-w-3xl"><PanelHeading icon={<Settings size={15} />} eyebrow="Identidade" title="Configurações" text="Nome, mensagem e imagem do quadro." /><form onSubmit={submit} className="mt-7 space-y-5 border-2 border-card-border bg-card p-5 shadow-sm md:p-7"><div className="grid gap-5 sm:grid-cols-2"><Field label="Nome do site" value={form.siteName} onChange={value => setForm({ ...form, siteName: value })} /><Field label="Frase curta" value={form.tagline} onChange={value => setForm({ ...form, tagline: value })} /></div><Field label="Mensagem de boas-vindas" multiline value={form.welcomeMessage} onChange={value => setForm({ ...form, welcomeMessage: value })} /><Field label="URL da imagem do logo" value={form.logoImage} onChange={value => setForm({ ...form, logoImage: value })} placeholder="URL local ou hospedada" /><div className="flex flex-wrap items-center gap-4 border-2 border-border bg-background p-4"><img src={form.logoImage || logoAsset} alt="Prévia do logo" className="h-16 w-16 object-cover pixel-border-light" data-testid="img-logo-preview" /><div><p className="text-sm font-bold">Prévia do logo</p><p className="mt-1 text-xs text-muted-foreground">Usado no topo e na aba do navegador.</p></div></div><button type="submit" className="press focus-ring inline-flex items-center gap-2 pixel-border bg-primary px-5 py-3 font-bold text-primary-foreground" data-testid="button-save-settings"><Save size={16} /> Salvar</button></form></div>;
}

function QuestForm({ form, setForm, submit, cancel }: { form: Quest; setForm: (q: Quest) => void; submit: (event: FormEvent) => void; cancel: () => void }) {
  return <form onSubmit={submit} className="mt-5 border-2 border-primary/35 bg-secondary/25 p-5"><div className="mb-5 flex items-center justify-between"><h3 className="font-mono text-lg font-bold">{form.id ? 'Editar missão' : 'Nova missão'}</h3><button type="button" onClick={cancel} className="focus-ring p-1" aria-label="Cancelar edição"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Título" value={form.title} onChange={value => setForm({ ...form, title: value })} /><Field label="Categoria" value={form.category} onChange={value => setForm({ ...form, category: value })} /><Field label="Descrição" value={form.description} onChange={value => setForm({ ...form, description: value })} /><Field label="Recompensa" value={form.reward} onChange={value => setForm({ ...form, reward: value })} /></div><label className="mt-4 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={event => setForm({ ...form, active: event.target.checked })} /> Mostrar no quadro público</label><div className="mt-5 flex gap-2"><button type="submit" className="press pixel-border bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"><Save size={15} className="mr-2 inline" />Salvar missão</button><button type="button" onClick={cancel} className="border-2 border-border bg-card px-4 py-2.5 text-sm font-bold">Cancelar</button></div></form>;
}

function QuestsPanel({ quests, update, editing, setEditing, onSaved }: { quests: Quest[]; update: (next: Partial<Store>) => void; editing: Quest | null; setEditing: (q: Quest | null) => void; onSaved: (message: string) => void }) {
  const blank: Quest = { id: '', title: '', description: '', reward: '+10 carinho', category: 'Cuidado', completed: false, active: true };
  const [form, setForm] = useState<Quest>(blank);
  useEffect(() => setForm(editing || blank), [editing]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.title.trim()) return; const next = form.id ? quests.map(q => q.id === form.id ? form : q) : [...quests, { ...form, id: `q${Date.now()}` }]; update({ quests: next }); setEditing(null); setForm(blank); onSaved(form.id ? 'Missão atualizada' : 'Missão criada'); };
  const remove = (id: string) => { if (window.confirm('Excluir esta missão?')) { update({ quests: quests.filter(q => q.id !== id) }); onSaved('Missão excluída'); } };
  return <div className="animate-rise"><PanelHeading icon={<ClipboardList size={15} />} eyebrow="Rotina" title="Missões" text="Tarefas curtas para o quadro." button={<button onClick={() => setEditing(blank)} className="press inline-flex items-center gap-2 pixel-border bg-primary px-4 py-3 text-sm font-bold text-primary-foreground" data-testid="button-add-quest"><Plus size={16} /> Nova missão</button>} />{editing && <QuestForm form={form} setForm={setForm} submit={submit} cancel={() => setEditing(null)} />}{quests.length ? <div className="mt-5 grid gap-3">{quests.map(q => <div key={q.id} className="card-lift flex flex-wrap items-center gap-4 border-2 border-card-border bg-card p-4 shadow-sm" data-testid={`admin-quest-${q.id}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground/10 ${q.active ? 'bg-secondary/40 text-primary' : 'bg-muted text-muted-foreground'}`}><ClipboardList size={18} /></div><div className="min-w-[12rem] flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{q.title}</h3><span className="border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{q.category}</span>{!q.active && <span className="text-[10px] font-bold uppercase text-destructive">Oculta</span>}</div><p className="mt-1 text-sm text-muted-foreground">{q.description}</p></div><span className="font-mono text-xs font-bold text-primary">{q.reward}</span><div className="flex gap-1"><button onClick={() => setEditing(q)} className="focus-ring p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Editar ${q.title}`} data-testid={`button-edit-quest-${q.id}`}><Pencil size={16} /></button><button onClick={() => remove(q.id)} className="focus-ring p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Excluir ${q.title}`} data-testid={`button-delete-quest-${q.id}`}><Trash2 size={16} /></button></div></div>)}</div> : <div className="mt-5"><Empty title="Nenhuma missão" text="Crie a primeira tarefa do quadro." icon={<ClipboardList size={26} />} /></div>}</div>;
}

function EggForm({ form, setForm, submit, cancel }: { form: Egg; setForm: (egg: Egg) => void; submit: (event: FormEvent) => void; cancel: () => void }) {
  return <form onSubmit={submit} className="mt-5 border-2 border-primary/35 bg-secondary/25 p-5"><div className="mb-5 flex items-center justify-between"><h3 className="font-mono text-lg font-bold">{form.id ? 'Editar ovo' : 'Novo ovo'}</h3><button type="button" onClick={cancel} className="focus-ring p-1" aria-label="Cancelar edição"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome" value={form.name} onChange={value => setForm({ ...form, name: value })} /><Field label="Status" value={form.status} onChange={value => setForm({ ...form, status: value })} /><Field label="URL da imagem" value={form.image} onChange={value => setForm({ ...form, image: value })} placeholder="URL local ou hospedada" /><Field label="Nota" value={form.note} onChange={value => setForm({ ...form, note: value })} multiline /><Field label="Vida atual (0–100)" type="number" min={0} max={100} value={form.health} onChange={value => setForm({ ...form, health: clamp(Number(value) || 0, 0, 100) })} /><Field label="Alegria atual (0–100)" type="number" min={0} max={100} value={form.happiness} onChange={value => setForm({ ...form, happiness: clamp(Number(value) || 0, 0, 100) })} /><Field label="Máximo de corações (1–20)" type="number" min={1} max={20} value={form.maxHearts} onChange={value => setForm({ ...form, maxHearts: clamp(Number(value) || 1, 1, 20) })} /></div><div className="mt-5 flex items-center gap-4 border-2 border-border bg-card p-3"><img src={form.image || logoAsset} alt="Prévia do ovo" className="h-14 w-14 object-cover pixel-border-light" /><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prévia</p><HeartSlots value={form.health} maxHearts={form.maxHearts} label="Vida" /></div></div><div className="mt-5 flex gap-2"><button type="submit" className="press pixel-border bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"><Save size={15} className="mr-2 inline" />Salvar ovo</button><button type="button" onClick={cancel} className="border-2 border-border bg-card px-4 py-2.5 text-sm font-bold">Cancelar</button></div></form>;
}

function EggsPanel({ eggs, update, editing, setEditing, onSaved }: { eggs: Egg[]; update: (next: Partial<Store>) => void; editing: Egg | null; setEditing: (e: Egg | null) => void; onSaved: (message: string) => void }) {
  const blank: Egg = { id: '', name: '', image: logoAsset, health: 80, happiness: 80, maxHearts: 10, status: 'Novo', note: '' };
  const [form, setForm] = useState<Egg>(blank);
  useEffect(() => setForm(editing || blank), [editing]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name.trim()) return; const clean = normalizeEgg(form); const next = form.id ? eggs.map(e => e.id === form.id ? clean : e) : [...eggs, { ...clean, id: `e${Date.now()}` }]; update({ eggs: next }); setEditing(null); setForm(blank); onSaved(form.id ? 'Ovo atualizado' : 'Ovo criado'); };
  const remove = (id: string) => { if (window.confirm('Excluir este ovo?')) { update({ eggs: eggs.filter(e => e.id !== id) }); onSaved('Ovo excluído'); } };
  return <div className="animate-rise"><PanelHeading icon={<EggIcon size={15} />} eyebrow="Coleção" title="Ovos" text="Defina status, números e capacidade de corações." button={<button onClick={() => setEditing(blank)} className="press inline-flex items-center gap-2 pixel-border bg-primary px-4 py-3 text-sm font-bold text-primary-foreground" data-testid="button-add-egg"><Plus size={16} /> Novo ovo</button>} />{editing && <EggForm form={form} setForm={setForm} submit={submit} cancel={() => setEditing(null)} />}{eggs.length ? <div className="mt-5 grid gap-3">{eggs.map(egg => <div key={egg.id} className="card-lift flex flex-wrap items-center gap-4 border-2 border-card-border bg-card p-4 shadow-sm" data-testid={`admin-egg-${egg.id}`}><img src={egg.image || logoAsset} alt={`Imagem de ${egg.name}`} className="h-14 w-14 object-cover pixel-border-light" /><div className="min-w-[11rem] flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{egg.name}</h3><span className="border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{egg.status}</span></div><div className="mt-2 flex flex-wrap items-center gap-2"><HeartSlots value={egg.health} maxHearts={egg.maxHearts} label={`Vida de ${egg.name}`} /><span className="font-mono text-xs text-muted-foreground">{egg.health}% vida · {egg.happiness}% alegria · {egg.maxHearts} corações</span></div></div><div className="flex gap-1"><button onClick={() => setEditing(egg)} className="focus-ring p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Editar ${egg.name}`} data-testid={`button-edit-egg-${egg.id}`}><Pencil size={16} /></button><button onClick={() => remove(egg.id)} className="focus-ring p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Excluir ${egg.name}`} data-testid={`button-delete-egg-${egg.id}`}><Trash2 size={16} /></button></div></div>)}</div> : <div className="mt-5"><Empty title="Nenhum ovo" text="Adicione um ovo para começar a coleção." icon={<EggIcon size={26} />} /></div>}</div>;
}

function Admin({ store, update }: { store: Store; update: (next: Partial<Store>) => void }) {
  const [section, setSection] = useState('overview');
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editingEgg, setEditingEgg] = useState<Egg | null>(null);
  const [notice, setNotice] = useState('');
  const saveNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2200); };
  const avg = store.eggs.length ? Math.round(store.eggs.reduce((sum, egg) => sum + egg.health, 0) / store.eggs.length) : 0;
  return <AdminShell settings={store.settings} section={section} setSection={setSection}>
    {notice && <div className="animate-pop fixed bottom-5 right-5 z-50 flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-3 text-sm font-bold text-card shadow-xl" role="status" data-testid="status-save-notice"><CheckCircle2 size={17} className="text-secondary" />{notice}</div>}
    {section === 'overview' && <Overview store={store} avg={avg} setSection={setSection} />}
    {section === 'settings' && <SettingsPanel settings={store.settings} update={update} onSaved={() => saveNotice('Configurações salvas')} />}
    {section === 'quests' && <QuestsPanel quests={store.quests} update={update} editing={editingQuest} setEditing={setEditingQuest} onSaved={saveNotice} />}
    {section === 'eggs' && <EggsPanel eggs={store.eggs} update={update} editing={editingEgg} setEditing={setEditingEgg} onSaved={saveNotice} />}
  </AdminShell>;
}

function App() {
  const { store, update } = useStore();
  useEffect(() => {
    document.title = `${store.settings.siteName || 'WSMP'} · Quadro de missões`;
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); }
    favicon.href = store.settings.logoImage || logoAsset;
  }, [store.settings.siteName, store.settings.logoImage]);
  return <WouterRouter><Switch><Route path="/"><Home store={store} update={update} /></Route><Route><Home store={store} update={update} /></Route></Switch></WouterRouter>;
}

export default function AppWithBoundary() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}