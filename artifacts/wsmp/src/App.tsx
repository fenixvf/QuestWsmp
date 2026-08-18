import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { Activity, ArrowRight, Check, CheckCircle2, ChevronDown, ClipboardList, Egg as EggIcon, ExternalLink, Heart, LayoutDashboard, Menu, Pencil, Plus, Save, Settings, Sparkles, Star, Trash2, Trophy, X, Zap } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import logoAsset from '@assets/watermarked_img_10663692129455435167_(1)_1787017059477.jpg';

type SiteSettings = { siteName: string; tagline: string; welcomeMessage: string; logoImage: string };
type Quest = { id: string; title: string; description: string; reward: string; category: string; completed: boolean; active: boolean };
type Egg = { id: string; name: string; image: string; health: number; happiness: number; status: string; note: string };
type Store = { settings: SiteSettings; quests: Quest[]; eggs: Egg[] };

const seed: Store = {
  settings: { siteName: 'WSMP', tagline: 'Warm Small Magic Place', welcomeMessage: 'A tiny corner of the internet for checking in, cheering up, and taking care of our favorite little eggs.', logoImage: logoAsset },
  quests: [
    { id: 'q1', title: 'Morning hello', description: 'Check on one egg before your first scroll.', reward: '+12 warmth', category: 'Care', completed: false, active: true },
    { id: 'q2', title: 'Tiny compliment', description: 'Leave a kind note for the community.', reward: '+8 sparkle', category: 'Community', completed: true, active: true },
    { id: 'q3', title: 'Look closely', description: 'Visit an egg you have not checked this week.', reward: '+20 XP', category: 'Explore', completed: false, active: true },
  ],
  eggs: [
    { id: 'e1', name: 'Miso', image: logoAsset, health: 92, happiness: 88, status: 'Thriving', note: 'Loves a gentle check-in and long sunny pauses.' },
    { id: 'e2', name: 'Pip', image: logoAsset, health: 76, happiness: 94, status: 'Peppy', note: 'Very social today. Pip has been looking for friends.' },
    { id: 'e3', name: 'Clover', image: logoAsset, health: 84, happiness: 71, status: 'Resting', note: 'A little quiet, but cozy and safe in their nest.' },
  ],
};

const STORAGE = 'wsmp-companion-store';
const readStore = (): Store => {
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved) return { ...seed, ...JSON.parse(saved) };
  } catch { /* recover with seed */ }
  return seed;
};

function useStore() {
  const [store, setStore] = useState<Store>(readStore);
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(store)); }, [store]);
  const update = (next: Partial<Store>) => setStore(current => ({ ...current, ...next }));
  return { store, update };
}

function Brand({ settings, dark = false }: { settings: SiteSettings; dark?: boolean }) {
  return <Link href="/" className="flex items-center gap-3 focus-ring rounded-xl" data-testid="link-brand">
    <img src={settings.logoImage || logoAsset} alt="WSMP icon" className="h-11 w-11 rounded-xl object-cover shadow-sm" data-testid="img-site-logo" />
    <span className={dark ? 'text-primary-foreground' : 'text-foreground'}>
      <span className="block font-mono text-lg font-bold leading-none tracking-tight">{settings.siteName}</span>
      <span className={`mt-1 block text-[10px] font-semibold uppercase tracking-[.18em] ${dark ? 'text-primary-foreground/55' : 'text-muted-foreground'}`}>egg care club</span>
    </span>
  </Link>;
}

function PublicHeader({ settings }: { settings: SiteSettings }) {
  return <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
    <Brand settings={settings} />
    <nav className="flex items-center gap-2" aria-label="Main navigation">
      <a href="#quests" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground sm:block" data-testid="link-quests">Today's quests</a>
      <a href="#collection" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground sm:block" data-testid="link-collection">Collection</a>
      <Link href="/admin" className="press focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-sm transition hover:border-primary/40 hover:text-primary" data-testid="link-admin"><Settings size={15} /> <span className="hidden xs:inline">Owner studio</span></Link>
    </nav>
  </header>;
}

function Meter({ label, value, tone = 'orange', icon }: { label: string; value: number; tone?: 'orange' | 'teal'; icon: ReactNode }) {
  return <div className="space-y-1.5" data-testid={`meter-${label.toLowerCase()}`}>
    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground"><span className="flex items-center gap-1.5">{icon}{label}</span><span className="font-mono text-foreground">{value}%</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`meter-fill h-full rounded-full ${tone === 'orange' ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} /></div>
  </div>;
}

function EggCard({ egg, onCheck }: { egg: Egg; onCheck: (egg: Egg) => void }) {
  const [checked, setChecked] = useState(false);
  const check = () => { onCheck(egg); setChecked(true); window.setTimeout(() => setChecked(false), 1300); };
  return <article className="card-lift relative overflow-hidden rounded-[1.5rem] border border-card-border bg-card p-3 shadow-[var(--shadow-card)]" data-testid={`card-egg-${egg.id}`}>
    <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-[1.15rem] bg-[#fff0bd]">
      <div className="absolute right-3 top-3 rounded-full bg-card/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent backdrop-blur-sm"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />{egg.status}</div>
      <div className="absolute bottom-2 h-5 w-28 rounded-[50%] bg-[#ca7c23]/15 blur-sm" />
      <img src={egg.image || logoAsset} alt={`${egg.name} egg`} className={`animate-floaty relative h-36 w-36 rounded-[2rem] object-cover shadow-lg transition-transform ${checked ? 'scale-110' : ''}`} data-testid={`img-egg-${egg.id}`} />
      {checked && <div className="absolute inset-0 flex items-center justify-center bg-card/30"><span className="animate-pop flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-lg"><Check size={16} /> Checked in!</span></div>}
    </div>
    <div className="px-2 pb-2 pt-4">
      <div className="mb-3 flex items-start justify-between gap-2"><div><h3 className="font-mono text-xl font-bold tracking-tight" data-testid={`text-egg-name-${egg.id}`}>{egg.name}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{egg.note}</p></div><div className="rounded-xl bg-secondary/35 p-2 text-primary"><Heart size={16} fill="currentColor" /></div></div>
      <div className="space-y-3"><Meter label="Health" value={egg.health} icon={<Activity size={13} />} /><Meter label="Happiness" value={egg.happiness} tone="teal" icon={<Heart size={13} />} /></div>
      <button onClick={check} className="press focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-bold text-card transition hover:bg-primary" data-testid={`button-check-egg-${egg.id}`}><Sparkles size={15} /> Check on {egg.name}</button>
    </div>
  </article>;
}

function QuestRow({ quest, onComplete }: { quest: Quest; onComplete: (id: string) => void }) {
  return <div className={`group flex items-center gap-4 rounded-2xl border p-4 transition ${quest.completed ? 'border-accent/20 bg-accent/[.06]' : 'border-card-border bg-card hover:border-primary/30'}`} data-testid={`row-quest-${quest.id}`}>
    <button aria-label={quest.completed ? 'Quest completed' : `Complete ${quest.title}`} onClick={() => onComplete(quest.id)} className={`press focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition ${quest.completed ? 'border-accent bg-accent text-accent-foreground' : 'border-muted-foreground/30 bg-background text-transparent hover:border-primary'}`} data-testid={`button-complete-quest-${quest.id}`}><Check size={17} strokeWidth={3} /></button>
    <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><h3 className={`font-bold ${quest.completed ? 'text-muted-foreground line-through' : ''}`}>{quest.title}</h3><span className="rounded-full bg-secondary/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/65">{quest.category}</span></div><p className="truncate text-sm text-muted-foreground">{quest.description}</p></div>
    <span className={`hidden shrink-0 text-xs font-bold sm:block ${quest.completed ? 'text-accent' : 'text-primary'}`}>{quest.reward}</span>
  </div>;
}

function Home({ store, update }: { store: Store; update: (next: Partial<Store>) => void }) {
  const activeQuests = store.quests.filter(q => q.active);
  const completed = activeQuests.filter(q => q.completed).length;
  const checkEgg = (egg: Egg) => update({ eggs: store.eggs.map(item => item.id === egg.id ? { ...item, happiness: Math.min(100, item.happiness + 2), status: item.happiness < 90 ? 'Feeling seen' : item.status } : item) });
  const completeQuest = (id: string) => update({ quests: store.quests.map(q => q.id === id ? { ...q, completed: !q.completed } : q) });
  return <div className="grain min-h-[100dvh] overflow-hidden bg-background">
    <PublicHeader settings={store.settings} />
    <main>
      <section className="relative mx-auto max-w-6xl px-5 pb-14 pt-10 md:px-8 md:pb-24 md:pt-16">
        <div className="pointer-events-none absolute -right-28 -top-32 h-[30rem] w-[30rem] rounded-full bg-secondary/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-60 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <div className="animate-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-primary"><Zap size={14} fill="currentColor" /> Daily care club · {new Date().toLocaleDateString(undefined, { weekday: 'long' })}</div>
            <h1 className="max-w-2xl font-mono text-[clamp(3.2rem,8vw,6.8rem)] font-bold leading-[.88] tracking-[-.08em]">Keep a little<br /><span className="text-primary">magic</span> going.</h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">{store.settings.welcomeMessage}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3"><a href="#collection" className="press focus-ring inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5" data-testid="link-check-eggs">Check the eggs <ArrowRight size={17} /></a><span className="flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground"><Star size={16} className="text-secondary-foreground" fill="hsl(var(--secondary))" /> {store.eggs.length} tiny companions</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-md animate-rise [animation-delay:120ms]">
            <div className="relative rotate-2 rounded-[2.5rem] border-2 border-foreground/10 bg-[#ffb20c] p-5 shadow-[12px_14px_0_hsl(var(--foreground)/.1)]">
              <div className="rounded-[2rem] border border-foreground/10 bg-[#ffc72c] p-5"><img src={store.settings.logoImage || logoAsset} alt="WSMP warm egg icon" className="mx-auto aspect-square w-full max-w-[20rem] rounded-[1.6rem] object-cover" data-testid="img-hero-logo" /></div>
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-foreground/10 bg-card px-4 py-3 shadow-lg"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today’s mood</p><p className="mt-1 font-mono font-bold text-accent">bright & curious</p></div>
              <div className="absolute -right-3 top-8 rounded-full bg-accent p-3 text-accent-foreground shadow-lg"><Heart size={20} fill="currentColor" /></div>
            </div>
          </div>
        </div>
      </section>

      <section id="quests" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-12 md:px-8 md:py-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><ClipboardList size={15} /> The little list</p><h2 className="font-mono text-3xl font-bold tracking-tight md:text-4xl">Today’s quests</h2></div><div className="rounded-2xl border border-card-border bg-card px-4 py-3 text-right shadow-sm"><p className="font-mono text-xl font-bold text-accent">{completed}<span className="text-muted-foreground">/{activeQuests.length}</span></p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">wrapped up</p></div></div>
        <div className="grid gap-3">{activeQuests.map((quest, index) => <div key={quest.id} className="animate-rise" style={{ animationDelay: `${index * 70}ms` }}><QuestRow quest={quest} onComplete={completeQuest} /></div>)}</div>
        {activeQuests.length === 0 && <Empty title="A quiet little day" text="The owner is dreaming up new ways to care for the eggs." icon={<ClipboardList size={26} />} />}
      </section>

      <section id="collection" className="scroll-mt-5 bg-[#f7e7b1]/45 py-14 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-accent"><EggIcon size={15} /> Your collection</p><h2 className="font-mono text-3xl font-bold tracking-tight md:text-4xl">How are they doing?</h2><p className="mt-2 text-muted-foreground">A quick check-in makes a surprisingly big difference.</p></div><div className="hidden items-center gap-2 rounded-full border border-accent/20 bg-card/80 px-3 py-2 text-xs font-bold text-accent sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> All systems cozy</div></div>
          {store.eggs.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{store.eggs.map((egg, index) => <div key={egg.id} className="animate-rise" style={{ animationDelay: `${index * 80}ms` }}><EggCard egg={egg} onCheck={checkEgg} /></div>)}</div> : <Empty title="The nest is waiting" text="No eggs have been added yet. Check back soon." icon={<EggIcon size={26} />} />}
        </div>
      </section>
    </main>
    <footer className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center md:px-8"><Brand settings={store.settings} /><p>{store.settings.tagline} · made for daily check-ins.</p></footer>
  </div>;
}

function Empty({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-card-border bg-card/60 px-6 py-14 text-center"><div className="mb-4 rounded-2xl bg-secondary/40 p-3 text-primary">{icon}</div><h3 className="font-mono text-lg font-bold">{title}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p></div>;
}

function Field({ label, value, onChange, multiline = false, placeholder, type = 'text' }: { label: string; value: string | number; onChange: (value: string) => void; multiline?: boolean; placeholder?: string; type?: string }) {
  const common = { value, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), placeholder, className: 'focus-ring mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground/55 focus:border-primary' };
  return <label className="block text-sm font-bold text-foreground">{label}{multiline ? <textarea {...common} rows={3} /> : <input {...common} type={type} />}</label>;
}

function AdminShell({ settings, children, section, setSection }: { settings: SiteSettings; children: ReactNode; section: string; setSection: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const items = [{ id: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> }, { id: 'settings', label: 'Site settings', icon: <Settings size={17} /> }, { id: 'quests', label: 'Daily quests', icon: <ClipboardList size={17} /> }, { id: 'eggs', label: 'Egg collection', icon: <EggIcon size={17} /> }];
  return <div className="grain min-h-[100dvh] bg-[#f8efd1] lg:flex">
    <aside className={`fixed inset-y-0 left-0 z-30 w-[274px] -translate-x-full bg-sidebar px-5 py-6 text-sidebar-foreground shadow-2xl transition-transform lg:static lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : ''}`}><div className="flex items-center justify-between"><Brand settings={settings} dark /><button className="rounded-lg p-2 text-sidebar-foreground/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu" data-testid="button-close-menu"><X size={19} /></button></div><div className="mt-12"><p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-sidebar-foreground/40">Manage your nest</p><nav className="mt-3 space-y-1">{items.map(item => <button key={item.id} onClick={() => { setSection(item.id); setOpen(false); }} className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === item.id ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`} data-testid={`button-admin-${item.id}`}>{item.icon}{item.label}{section === item.id && <ChevronDown className="ml-auto -rotate-90" size={15} />}</button>)}</nav></div><div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-sidebar-border bg-sidebar-accent p-4"><p className="text-xs font-bold text-sidebar-foreground">Owner studio</p><p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/55">Small changes here show up in the club instantly.</p><Link href="/" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-secondary" data-testid="link-view-club">View public club <ExternalLink size={12} /></Link></div></aside>
    {open && <button className="fixed inset-0 z-20 bg-foreground/25 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" data-testid="button-overlay-menu" />}
    <div className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b border-border/70 bg-background/80 px-5 backdrop-blur md:px-9"><button onClick={() => setOpen(true)} className="rounded-xl border border-border bg-card p-2.5 lg:hidden" aria-label="Open menu" data-testid="button-open-menu"><Menu size={19} /></button><div className="hidden lg:block"><p className="text-xs font-bold uppercase tracking-[.17em] text-muted-foreground">Owner studio</p><h1 className="font-mono text-xl font-bold">{items.find(item => item.id === section)?.label}</h1></div><div className="flex items-center gap-3"><span className="hidden text-xs font-semibold text-muted-foreground sm:block">Changes save automatically</span><div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold">WS</span><span className="pr-1 text-xs font-bold">Owner</span></div></div></header><main className="mx-auto max-w-6xl p-5 md:p-9">{children}</main></div>
  </div>;
}

function Stat({ value, label, icon, tint }: { value: string | number; label: string; icon: ReactNode; tint: string }) { return <div className="rounded-2xl border border-card-border bg-card p-4 shadow-sm"><div className={`mb-5 flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}>{icon}</div><p className="font-mono text-3xl font-bold">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p></div>; }

function Admin({ store, update }: { store: Store; update: (next: Partial<Store>) => void }) {
  const [section, setSection] = useState('overview');
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editingEgg, setEditingEgg] = useState<Egg | null>(null);
  const [notice, setNotice] = useState('');
  const saveNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2200); };
  const avg = store.eggs.length ? Math.round(store.eggs.reduce((a, e) => a + e.health, 0) / store.eggs.length) : 0;
  return <AdminShell settings={store.settings} section={section} setSection={setSection}>
    {notice && <div className="animate-pop fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-bold text-card shadow-xl" data-testid="status-save-notice"><CheckCircle2 size={17} className="text-secondary" />{notice}</div>}
    {section === 'overview' && <Overview store={store} avg={avg} setSection={setSection} />}
    {section === 'settings' && <SettingsPanel settings={store.settings} update={update} onSaved={() => saveNotice('Site settings saved')} />}
    {section === 'quests' && <QuestsPanel quests={store.quests} update={update} editing={editingQuest} setEditing={setEditingQuest} onSaved={saveNotice} />}
    {section === 'eggs' && <EggsPanel eggs={store.eggs} update={update} editing={editingEgg} setEditing={setEditingEgg} onSaved={saveNotice} />}
  </AdminShell>;
}

function Overview({ store, avg, setSection }: { store: Store; avg: number; setSection: (s: string) => void }) {
  const active = store.quests.filter(q => q.active);
  return <div className="animate-rise"><div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-primary">Good morning, owner</p><h2 className="font-mono text-4xl font-bold tracking-tight md:text-5xl">The nest is looking good.</h2><p className="mt-3 max-w-xl text-muted-foreground">A quick pulse check for the little world you are keeping warm.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat value={store.eggs.length} label="Eggs in the nest" icon={<EggIcon size={18} />} tint="bg-secondary/35 text-primary" /><Stat value={`${avg}%`} label="Average health" icon={<Activity size={18} />} tint="bg-accent/15 text-accent" /><Stat value={`${active.filter(q => q.completed).length}/${active.length}`} label="Quests complete" icon={<Trophy size={18} />} tint="bg-primary/12 text-primary" /><Stat value="Today" label="Last little update" icon={<Sparkles size={18} />} tint="bg-[#d9c9ff] text-[#6540a8]" /></div><div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><div className="rounded-3xl border border-card-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-mono text-xl font-bold">At a glance</h3><p className="mt-1 text-sm text-muted-foreground">The most important things today.</p></div><Activity className="text-accent" size={21} /></div><div className="mt-6 space-y-4">{store.eggs.slice(0, 3).map(egg => <div className="flex items-center gap-3" key={egg.id}><img src={egg.image || logoAsset} alt="" className="h-10 w-10 rounded-xl object-cover" /><span className="w-20 text-sm font-bold">{egg.name}</span><div className="h-2 flex-1 rounded-full bg-muted"><div className="h-2 rounded-full bg-accent" style={{ width: `${egg.health}%` }} /></div><span className="font-mono text-xs font-bold">{egg.health}%</span></div>)}</div></div><div className="rounded-3xl bg-foreground p-6 text-card"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Settings size={19} /></div><h3 className="mt-6 font-mono text-2xl font-bold">Shape the club</h3><p className="mt-2 text-sm leading-relaxed text-card/65">Tune the welcome message, keep quests fresh, or give an egg a new chapter.</p><div className="mt-6 space-y-2"><button onClick={() => setSection('settings')} className="press flex w-full items-center justify-between rounded-xl bg-card/10 px-3 py-2.5 text-left text-sm font-bold hover:bg-card/20" data-testid="button-quick-settings">Edit site settings <ArrowRight size={15} /></button><button onClick={() => setSection('eggs')} className="press flex w-full items-center justify-between rounded-xl bg-card/10 px-3 py-2.5 text-left text-sm font-bold hover:bg-card/20" data-testid="button-quick-eggs">Manage eggs <ArrowRight size={15} /></button></div></div></div></div>;
}

function SettingsPanel({ settings, update, onSaved }: { settings: SiteSettings; update: (next: Partial<Store>) => void; onSaved: () => void }) {
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);
  const submit = (event: FormEvent) => { event.preventDefault(); update({ settings: form }); onSaved(); };
  return <div className="animate-rise max-w-3xl"><div className="mb-8"><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><Settings size={15} /> Your corner</p><h2 className="font-mono text-4xl font-bold tracking-tight">Site settings</h2><p className="mt-3 text-muted-foreground">Give the welcome page its voice and familiar face.</p></div><form onSubmit={submit} className="space-y-5 rounded-3xl border border-card-border bg-card p-5 shadow-sm md:p-7"><div className="grid gap-5 sm:grid-cols-2"><Field label="Site name" value={form.siteName} onChange={value => setForm({ ...form, siteName: value })} /><Field label="Tagline" value={form.tagline} onChange={value => setForm({ ...form, tagline: value })} /></div><Field label="Welcome message" multiline value={form.welcomeMessage} onChange={value => setForm({ ...form, welcomeMessage: value })} /><Field label="Logo image URL" value={form.logoImage} onChange={value => setForm({ ...form, logoImage: value })} placeholder="Paste a local or hosted image URL" /><div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-4"><img src={form.logoImage || logoAsset} alt="Logo preview" className="h-16 w-16 rounded-2xl object-cover" data-testid="img-logo-preview" /><div><p className="text-sm font-bold">Logo preview</p><p className="mt-1 text-xs text-muted-foreground">Shown in the header, footer, and browser tab.</p></div></div><button type="submit" className="press focus-ring inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-md shadow-primary/15" data-testid="button-save-settings"><Save size={16} /> Save settings</button></form></div>;
}

function QuestsPanel({ quests, update, editing, setEditing, onSaved }: { quests: Quest[]; update: (next: Partial<Store>) => void; editing: Quest | null; setEditing: (q: Quest | null) => void; onSaved: (message: string) => void }) {
  const blank: Quest = { id: '', title: '', description: '', reward: '+10 warmth', category: 'Care', completed: false, active: true };
  const [form, setForm] = useState<Quest>(blank);
  useEffect(() => setForm(editing || blank), [editing]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.title.trim()) return; const next = form.id ? quests.map(q => q.id === form.id ? form : q) : [...quests, { ...form, id: `q${Date.now()}` }]; update({ quests: next }); setEditing(null); setForm(blank); onSaved(form.id ? 'Quest updated' : 'Quest added'); };
  const remove = (id: string) => { if (window.confirm('Remove this daily quest?')) { update({ quests: quests.filter(q => q.id !== id) }); onSaved('Quest removed'); } };
  return <div className="animate-rise"><PanelHeading icon={<ClipboardList size={15} />} eyebrow="Keep the rhythm" title="Daily quests" text="Small prompts make a cozy community feel alive." button={<button onClick={() => setEditing(blank)} className="press inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/15" data-testid="button-add-quest"><Plus size={16} /> New quest</button>} />{editing && <QuestForm form={form} setForm={setForm} submit={submit} cancel={() => setEditing(null)} />}{quests.length ? <div className="mt-5 grid gap-3">{quests.map(q => <div key={q.id} className="card-lift flex flex-wrap items-center gap-4 rounded-2xl border border-card-border bg-card p-4 shadow-sm" data-testid={`admin-quest-${q.id}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${q.active ? 'bg-secondary/40 text-primary' : 'bg-muted text-muted-foreground'}`}><ClipboardList size={18} /></div><div className="min-w-[12rem] flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{q.title}</h3><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{q.category}</span>{!q.active && <span className="text-[10px] font-bold uppercase text-destructive">Hidden</span>}</div><p className="mt-1 text-sm text-muted-foreground">{q.description}</p></div><span className="font-mono text-xs font-bold text-primary">{q.reward}</span><div className="flex gap-1"><button onClick={() => setEditing(q)} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Edit ${q.title}`} data-testid={`button-edit-quest-${q.id}`}><Pencil size={16} /></button><button onClick={() => remove(q.id)} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${q.title}`} data-testid={`button-delete-quest-${q.id}`}><Trash2 size={16} /></button></div></div>)}</div> : <div className="mt-5"><Empty title="No quests on the board" text="Add a small nudge for the community." icon={<ClipboardList size={26} />} /></div>}</div>;
}

function PanelHeading({ icon, eyebrow, title, text, button }: { icon: ReactNode; eyebrow: string; title: string; text: string; button?: ReactNode }) { return <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary">{icon}{eyebrow}</p><h2 className="font-mono text-4xl font-bold tracking-tight">{title}</h2><p className="mt-3 text-muted-foreground">{text}</p></div>{button}</div>; }
function QuestForm({ form, setForm, submit, cancel }: { form: Quest; setForm: (q: Quest) => void; submit: (e: FormEvent) => void; cancel: () => void }) { return <form onSubmit={submit} className="mt-5 grid gap-4 rounded-3xl border border-primary/25 bg-card p-5 shadow-sm md:grid-cols-2"><Field label="Title" value={form.title} onChange={value => setForm({ ...form, title: value })} /><Field label="Reward" value={form.reward} onChange={value => setForm({ ...form, reward: value })} /><Field label="Description" value={form.description} onChange={value => setForm({ ...form, description: value })} /><Field label="Category" value={form.category} onChange={value => setForm({ ...form, category: value })} /><label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} data-testid="input-quest-active" /> Show on public board</label><div className="flex justify-end gap-2 md:col-span-2"><button type="button" onClick={cancel} className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted" data-testid="button-cancel-quest">Cancel</button><button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground" data-testid="button-save-quest"><Save size={15} className="mr-2 inline" />Save quest</button></div></form>; }

function EggsPanel({ eggs, update, editing, setEditing, onSaved }: { eggs: Egg[]; update: (next: Partial<Store>) => void; editing: Egg | null; setEditing: (e: Egg | null) => void; onSaved: (message: string) => void }) {
  const blank: Egg = { id: '', name: '', image: logoAsset, health: 80, happiness: 80, status: 'Cozy', note: '' };
  const [form, setForm] = useState<Egg>(blank);
  useEffect(() => setForm(editing || blank), [editing]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name.trim()) return; const next = form.id ? eggs.map(e => e.id === form.id ? { ...form, health: Number(form.health), happiness: Number(form.happiness) } : e) : [...eggs, { ...form, id: `e${Date.now()}`, health: Number(form.health), happiness: Number(form.happiness) }]; update({ eggs: next }); setEditing(null); setForm(blank); onSaved(form.id ? 'Egg updated' : 'Egg added'); };
  const remove = (id: string) => { if (window.confirm('Remove this egg from the collection?')) { update({ eggs: eggs.filter(e => e.id !== id) }); onSaved('Egg removed'); } };
  return <div className="animate-rise"><PanelHeading icon={<EggIcon size={15} />} eyebrow="Care, recorded" title="Egg collection" text="Every egg has a name, a mood, and a story." button={<button onClick={() => setEditing(blank)} className="press inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/15" data-testid="button-add-egg"><Plus size={16} /> Add an egg</button>} />{editing && <EggForm form={form} setForm={setForm} submit={submit} cancel={() => setEditing(null)} />}{eggs.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{eggs.map(egg => <div key={egg.id} className="card-lift flex gap-4 rounded-2xl border border-card-border bg-card p-4 shadow-sm" data-testid={`admin-egg-${egg.id}`}><img src={egg.image || logoAsset} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-mono text-lg font-bold">{egg.name}</h3><p className="text-xs font-semibold text-accent">{egg.status}</p></div><div className="flex gap-0.5"><button onClick={() => setEditing(egg)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label={`Edit ${egg.name}`} data-testid={`button-edit-egg-${egg.id}`}><Pencil size={15} /></button><button onClick={() => remove(egg.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${egg.name}`} data-testid={`button-delete-egg-${egg.id}`}><Trash2 size={15} /></button></div></div><div className="mt-3 grid grid-cols-2 gap-3"><Meter label="Health" value={egg.health} icon={<Activity size={12} />} /><Meter label="Happy" value={egg.happiness} tone="teal" icon={<Heart size={12} />} /></div></div></div>)}</div> : <div className="mt-5"><Empty title="An empty nest" text="Give the collection its first tiny character." icon={<EggIcon size={26} />} /></div>}</div>;
}

function EggForm({ form, setForm, submit, cancel }: { form: Egg; setForm: (e: Egg) => void; submit: (e: FormEvent) => void; cancel: () => void }) { return <form onSubmit={submit} className="mt-5 grid gap-4 rounded-3xl border border-primary/25 bg-card p-5 shadow-sm md:grid-cols-2"><Field label="Egg name" value={form.name} onChange={value => setForm({ ...form, name: value })} /><Field label="Status" value={form.status} onChange={value => setForm({ ...form, status: value })} /><Field label="Image URL" value={form.image} onChange={value => setForm({ ...form, image: value })} /><Field label="Note" value={form.note} onChange={value => setForm({ ...form, note: value })} /><Field label="Health (0–100)" type="number" value={form.health} onChange={value => setForm({ ...form, health: Number(value) })} /><Field label="Happiness (0–100)" type="number" value={form.happiness} onChange={value => setForm({ ...form, happiness: Number(value) })} /><div className="flex justify-end gap-2 md:col-span-2"><button type="button" onClick={cancel} className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted" data-testid="button-cancel-egg">Cancel</button><button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground" data-testid="button-save-egg"><Save size={15} className="mr-2 inline" />Save egg</button></div></form>; }

function NotFound() { return <div className="flex min-h-[100dvh] items-center justify-center bg-background p-6 text-center"><div><img src={logoAsset} alt="WSMP" className="mx-auto h-20 w-20 rounded-2xl" /><h1 className="mt-6 font-mono text-3xl font-bold">Wrong little corner.</h1><p className="mt-2 text-muted-foreground">That page is not in the nest.</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground" data-testid="link-back-home">Back to WSMP</Link></div></div>; }

function Router() {
  const { store, update } = useStore();
  useEffect(() => { document.title = `${store.settings.siteName} · egg care club`; let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]'); if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); } favicon.href = store.settings.logoImage || logoAsset; }, [store.settings.siteName, store.settings.logoImage]);
  return <ErrorBoundary><Switch><Route path="/" component={() => <Home store={store} update={update} />} /><Route path="/admin" component={() => <Admin store={store} update={update} />} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() { return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>; }
export default App;
