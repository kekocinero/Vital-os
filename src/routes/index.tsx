import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Activity, ArrowRight, ChevronRight, HeartPulse, Leaf, LockKeyhole, Menu, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'

const featureCards = [
  { icon: HeartPulse, title: 'Tu salud, en un solo lugar', text: 'Medicaciones, citas, informes y síntomas. Sin perderte entre papeles.' },
  { icon: Activity, title: 'Cuerpo, tal como estás hoy', text: 'Registra energía, sueño y síntomas sin rachas, sin juicios y sin convertirlo en otra tarea.' },
  { icon: Leaf, title: 'Poquet a poquet', text: 'Una pantalla, una acción. Sin rachas, sin culpa y sin prisas.' },
  { icon: ShieldCheck, title: 'Tu información es tuya', text: 'Empieza sin cuenta. Tus datos se quedan en este dispositivo.' },
]

const navItems = ['Cómo funciona', 'Por qué VITAL', 'Privacidad']

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'VITAL OS · Tu salud, contigo' },
      { name: 'description', content: 'VITAL OS es la copia de tu salud, para ti: calmada, clara y siempre a mano.' },
    ],
  }),
  component: Home,
})

function Home() {
  return <BlinkClientBoundary fallback={<LandingLoading />}><HomeContent /></BlinkClientBoundary>
}

function LandingLoading() {
  return <main suppressHydrationWarning className="grid min-h-dvh place-items-center bg-background"><div suppressHydrationWarning className="text-center"><span suppressHydrationWarning className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"><Leaf className="size-7" /></span><p suppressHydrationWarning className="mt-4 font-serif text-2xl text-primary">VITAL</p><p suppressHydrationWarning className="mt-2 text-sm text-muted-foreground">Preparando tu espacio...</p></div></main>
}

function HomeContent() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => featureCards.filter(card => `${card.title} ${card.text}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <main suppressHydrationWarning className="min-h-dvh overflow-hidden bg-background">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3" aria-label="VITAL OS inicio">
          <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Leaf className="size-6" strokeWidth={1.7} />
          </span>
          <span className="font-serif text-2xl font-bold tracking-tight text-primary">VITAL</span>
        </Link>
        <nav className="hidden items-center gap-9 text-sm font-medium text-muted-foreground md:flex">
          {navItems.map(item => <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="transition-colors hover:text-primary">{item}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSearchOpen(value => !value)} className="grid size-11 place-items-center rounded-full text-primary transition hover:bg-secondary" aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar'} aria-expanded={searchOpen} aria-controls="vital-search">
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </button>
          <Button asChild className="hidden h-12 rounded-full px-6 text-base shadow-md hover:scale-[1.02] sm:inline-flex">
            <Link to="/app">Entrar en VITAL <ArrowRight className="size-4" /></Link>
          </Button>
          <button type="button" onClick={() => setMenuOpen(value => !value)} className="grid size-11 place-items-center rounded-full text-primary md:hidden" aria-label="Abrir menú">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && <div className="absolute right-6 top-20 w-64 rounded-2xl border border-border bg-card p-3 shadow-lg md:hidden">
          {navItems.map(item => <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-base hover:bg-secondary">{item}</a>)}
          <Link to="/app" className="mt-2 block rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-foreground">Entrar en VITAL</Link>
        </div>}
      </header>

      {searchOpen && <div id="vital-search" className="mx-auto max-w-2xl px-6"><div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"><Search className="size-5 text-primary" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') { setQuery(''); setSearchOpen(false) } }} className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground" placeholder="Busca algo sobre VITAL..." aria-label="Buscar en VITAL" /></div></div>}

      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-14 lg:grid-cols-[1fr_0.88fr] lg:px-10 lg:pb-32 lg:pt-20">
        <div className="relative z-10 max-w-2xl animate-fade-in">
          <p className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-primary"><span className="h-px w-8 bg-accent" /> Poquet a poquet</p>
          <h1 className="font-serif text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-primary sm:text-7xl lg:text-[5.8rem]">La copia de tu salud,<br /><span className="text-foreground">para ti.</span></h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground sm:text-xl">Todo lo que necesitas saber sobre tu salud, en un sitio. Claro, tranquilo y explicado como te lo explicaría alguien de confianza.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 rounded-full px-7 text-base shadow-md hover:scale-[1.02]"><Link to="/app">Empezar ahora <ArrowRight className="size-5" /></Link></Button>
            <a href="#cómo-funciona" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 text-base font-semibold text-primary transition hover:border-primary hover:bg-secondary">Descubre cómo funciona <ChevronRight className="size-5" /></a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground"><LockKeyhole className="size-4 text-primary" /> Sin cuenta. Sin nube por defecto. Tus datos son tuyos.</div>
        </div>
        <div className="relative mx-auto flex min-h-[390px] w-full max-w-[500px] items-center justify-center lg:min-h-[560px]">
          <div className="absolute inset-8 rounded-[45%] bg-accent/25 blur-3xl" />
          <div className="relative flex aspect-square w-[72%] items-center justify-center rounded-[48%_52%_55%_45%] border border-primary/10 bg-secondary/70 shadow-lg">
            <div className="absolute -right-3 top-10 rounded-2xl border border-border bg-card px-4 py-3 shadow-md"><p className="text-xs text-muted-foreground">Hoy</p><p className="mt-1 font-semibold text-primary">Todo en calma</p></div>
            <div className="absolute -bottom-3 -left-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-md"><p className="text-xs text-muted-foreground">Tu próximo paso</p><p className="mt-1 font-semibold text-primary">Tomar medicación</p></div>
            <Leaf className="size-32 text-primary/80 sm:size-44" strokeWidth={0.8} />
          </div>
          <span className="absolute left-5 top-12 size-3 rounded-full bg-accent" /><span className="absolute bottom-20 right-9 size-5 rounded-full border-4 border-accent/60" />
        </div>
      </section>

      <section id="cómo-funciona" className="border-y border-border bg-card/40 px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl"><div className="max-w-xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Hecha para la vida real</p><h2 className="mt-4 font-serif text-4xl leading-tight text-primary sm:text-5xl">Cuidarte no debería sentirse como otra tarea.</h2></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">{(query ? filtered : featureCards).map(({ icon: Icon, title, text }, index) => <article key={title} className="rounded-3xl border border-border bg-background p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"><span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="size-6" /></span><p className="mt-8 text-sm font-bold text-accent-foreground">0{index + 1}</p><h3 className="mt-2 font-serif text-2xl text-primary">{title}</h3><p className="mt-3 text-base leading-7 text-muted-foreground">{text}</p></article>)}{query && filtered.length === 0 && <p className="rounded-3xl border border-dashed border-border bg-background p-7 text-muted-foreground md:col-span-3">No hemos encontrado nada con “{query}”. Prueba con salud, medicación o privacidad.</p>}</div>
        </div>
      </section>

      <section id="por-qué-vital" className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-28"><div><Sparkles className="size-9 text-accent" /><h2 className="mt-6 font-serif text-4xl leading-tight text-primary sm:text-5xl">No cuidamos datos.<br />Cuidamos a la persona.</h2></div><div className="rounded-[2rem] bg-primary p-8 text-primary-foreground shadow-lg sm:p-12"><p className="font-serif text-3xl leading-tight sm:text-4xl">“No hace falta tenerlo todo resuelto hoy. Solo saber cuál es el siguiente paso.”</p><p className="mt-8 text-base text-primary-foreground/75">VITAL te ayuda a encontrarlo, con calma y sin juicios.</p></div></section>

      <footer id="privacidad" className="border-t border-border px-6 py-10 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-semibold text-primary"><Leaf className="size-5" /> VITAL OS</div><p>Tu información de salud merece calma.</p><p>© 2026 VITAL</p></div></footer>
    </main>
  )
}
