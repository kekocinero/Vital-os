import { useMemo, useState, useSyncExternalStore, type SetStateAction } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Activity, ArrowRight, Bell, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, ExternalLink, FileText, FileUp, HeartPulse, Info, Leaf, Link2, Mail, Menu, Moon, Pill, Plus, Search, ShieldAlert, Smartphone, Sparkles, Upload, UserRound, Weight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'

type Tab = 'Hoy' | 'Mi Salud' | 'Cuerpo' | 'Historia' | 'VITAL' | 'Yo'
const tabs: { name: Tab; icon: typeof Leaf }[] = [
  { name: 'Hoy', icon: Leaf }, { name: 'Mi Salud', icon: HeartPulse }, { name: 'Cuerpo', icon: Activity }, { name: 'Historia', icon: FileText }, { name: 'VITAL', icon: Sparkles }, { name: 'Yo', icon: UserRound },
]

const vitalSeenSubscribe = (callback: () => void) => {
  window.addEventListener('vital-demo-seen', callback)
  return () => window.removeEventListener('vital-demo-seen', callback)
}

const getFirstVisit = () => !localStorage.getItem('vital-demo-seen')
const getServerFirstVisit = () => false

function useStoredState<T>(key: string, fallback: T) {
  const fallbackSnapshot = JSON.stringify(fallback)
  const subscribe = (callback: () => void) => {
    window.addEventListener(`vital-storage:${key}`, callback)
    return () => window.removeEventListener(`vital-storage:${key}`, callback)
  }
  const snapshot = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key) ?? fallbackSnapshot,
    () => fallbackSnapshot,
  )
  const value = useMemo(() => JSON.parse(snapshot) as T, [snapshot])
  const setValue = (next: SetStateAction<T>) => {
    const resolved = typeof next === 'function' ? (next as (current: T) => T)(value) : next
    localStorage.setItem(key, JSON.stringify(resolved))
    window.dispatchEvent(new Event(`vital-storage:${key}`))
  }
  return [value, setValue] as const
}

function downloadCalendarEvent() {
  const event = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'SUMMARY:Cita con Dra. Laura Soler', 'DTSTART:20260923T083000Z', 'DTEND:20260923T093000Z', 'LOCATION:CAP Les Corts', 'DESCRIPTION:Preparar la visita desde VITAL OS.', 'END:VEVENT', 'END:VCALENDAR'].join('\\r\\n')
  const url = URL.createObjectURL(new Blob([event], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'cita-vital.ics'
  link.click()
  URL.revokeObjectURL(url)
}

function TabPanel({ tab, onBack }: { tab: Exclude<Tab, 'Hoy' | 'Yo'>; onBack: () => void }) {
  const [savedNote, setSavedNote] = useStoredState('vital-daily-note', '')
  const [visitNote, setVisitNote] = useStoredState('vital-visit-note', '')
  const [body, setBody] = useStoredState('vital-body-checkin', { energy: '', sleep: '', symptoms: '' })
  const [confirmedFile] = useStoredState<string | null>('vital-confirmed-document', null)
  const content = {
    'Mi Salud': { icon: HeartPulse, eyebrow: 'Tu resumen', title: 'Una visión tranquila de lo importante.', text: 'Aquí reuniremos tus informes, medicación, citas y señales de salud confirmadas por ti.', items: ['Medicación actual', 'Próximas citas', confirmedFile ? `Documento: ${confirmedFile}` : 'Informes revisados'] },
    'Cuerpo': { icon: Activity, eyebrow: 'Escúchalo', title: 'Tu cuerpo también habla.', text: 'Anota cómo duermes, tu energía o cualquier molestia sin convertirlo en una obligación.', items: ['Energía: pendiente', 'Sueño: pendiente', 'Síntomas: ninguno añadido'] },
    'Historia': { icon: FileText, eyebrow: 'Tu recorrido', title: 'Tu historia, ordenada y entendible.', text: 'Los documentos que confirmes podrán aparecer aquí con su fecha y fuente, siempre bajo tu control.', items: [confirmedFile ? `Documento confirmado: ${confirmedFile}` : 'Ningún documento confirmado todavía'] },
    VITAL: { icon: Sparkles, eyebrow: 'Tu acompañante', title: '¿Qué necesitas hoy?', text: 'Escribe una nota para recordar algo o preparar una pregunta para tu próxima visita.', items: ['Escribe una nota personal', 'Prepara una visita', 'Revisa tus conexiones'] },
  }[tab]
  const Icon = content.icon
  const bodyOptions = {
    energy: ['Con energía', 'Normal', 'Bajo'],
    sleep: ['He descansado', 'Regular', 'He dormido mal'],
    symptoms: ['Ninguno', 'Algo leve', 'Necesito revisarlo'],
  } as const
  const bodyItems = [
    `Energía: ${body.energy || 'sin registrar'}`,
    `Sueño: ${body.sleep || 'sin registrar'}`,
    `Síntomas: ${body.symptoms || 'ninguno añadido'}`,
  ]
  return <div className="fixed inset-0 z-40 overflow-y-auto bg-background px-5 pb-28 pt-8 lg:px-10"><div className="mx-auto max-w-4xl"><button type="button" onClick={onBack} className="mb-10 flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowRight className="size-4 rotate-180" /> Volver a Hoy</button><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="size-7" /></span><p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-primary">{content.eyebrow}</p><h1 className="mt-3 font-serif text-4xl leading-tight text-primary sm:text-6xl">{content.title}</h1><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{content.text}</p>{tab === 'Cuerpo' && <div className="mt-8"><BodyVisual body={body} /></div>}</div><div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold text-primary">Tu espacio</p>{tab === 'Cuerpo' && <div className="mt-5 space-y-5"><p className="text-sm leading-6 text-muted-foreground">Tres preguntas rápidas. Elige la respuesta que más se parezca a hoy.</p>{(Object.entries(bodyOptions) as [keyof typeof bodyOptions, readonly string[]][]).map(([key, options]) => <fieldset key={key}><legend className="mb-2 text-sm font-semibold text-primary">{key === 'energy' ? 'Energía' : key === 'sleep' ? 'Sueño' : 'Síntomas'}</legend><div className="grid gap-2 sm:grid-cols-3">{options.map(option => <button type="button" key={option} onClick={() => setBody(current => ({ ...current, [key]: option }))} className={`rounded-xl border px-3 py-3 text-left text-sm transition hover:border-primary hover:bg-secondary ${body[key] === option ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}>{option}</button>)}</div></fieldset>)}<label htmlFor="body-note" className="block text-sm font-semibold text-primary">Una nota, si quieres<textarea id="body-note" value={savedNote} onChange={event => setSavedNote(event.target.value)} placeholder="Por ejemplo: hoy me noto más cansado" className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/10" /></label><p className="text-xs text-muted-foreground">Se guarda solo en este dispositivo y puedes cambiarlo cuando quieras.</p></div>}{tab === 'VITAL' && <div className="mt-5"><label htmlFor="vital-note" className="text-sm font-semibold text-primary">Nota personal</label><textarea id="vital-note" value={savedNote} onChange={event => setSavedNote(event.target.value)} placeholder="Por ejemplo: preguntar por el sueño en la próxima visita" className="mt-3 min-h-36 w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm leading-6 outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-4" /><p className="mt-2 text-xs text-muted-foreground">Se guarda solo en este dispositivo.</p></div>}{tab === 'Historia' && <div className="mt-5 rounded-2xl bg-secondary/70 p-4 text-sm leading-6 text-primary">{confirmedFile ? `Documento confirmado: ${confirmedFile}` : 'Cuando confirmes un documento desde Conexiones, aparecerá aquí.'}</div>}{tab === 'Mi Salud' && <div className="mt-5 rounded-2xl bg-secondary/70 p-4 text-sm leading-6 text-primary">Tu resumen se construye con lo que tú añades. No hay datos inventados.</div>}{tab === 'VITAL' && <div className="mt-5 rounded-2xl border border-border p-4"><label htmlFor="visit-note" className="text-sm font-semibold text-primary">Preparar mi próxima visita</label><textarea id="visit-note" value={visitNote} onChange={event => setVisitNote(event.target.value)} placeholder="Escribe una pregunta para la Dra. Laura Soler" className="mt-3 min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-4 focus:ring-primary/10" /></div>}<div className="mt-5 space-y-3">{(tab === 'Cuerpo' ? bodyItems : content.items).map(item => <div key={item} className="flex items-center gap-3 rounded-2xl bg-secondary/60 px-4 py-4 text-sm text-primary"><CheckCircle2 className="size-5 shrink-0 text-primary" /> {item}</div>)}</div><p className="mt-6 text-xs leading-5 text-muted-foreground">VITAL no inventa datos: esta sección se completa cuando tú añades o confirmas información.</p></div></div></div></div>
}

function BodyVisual({ body }: { body: { energy: string; sleep: string; symptoms: string } }) {
  const energyReady = Boolean(body.energy)
  const sleepReady = Boolean(body.sleep)
  const symptomsReady = Boolean(body.symptoms)
  const completed = [energyReady, sleepReady, symptomsReady].filter(Boolean).length
  return <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-secondary/45 p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Mapa de hoy</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Tu cuerpo no es una cifra. Es una conversación.</p></div><span className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-primary">{completed}/3 registrados</span></div><div className="mt-6 grid grid-cols-[0.72fr_1.28fr] items-center gap-4"><div className="relative mx-auto flex h-64 w-36 items-center justify-center"><div className="absolute top-0 size-14 rounded-full border-4 border-primary/60 bg-background shadow-sm" /><div className="absolute top-12 h-28 w-20 rounded-[45%] border-4 border-primary/60 bg-background shadow-sm" /><div className="absolute top-16 -left-1 h-24 w-7 -rotate-12 rounded-full border-4 border-primary/60 bg-background" /><div className="absolute top-16 -right-1 h-24 w-7 rotate-12 rounded-full border-4 border-primary/60 bg-background" /><div className="absolute bottom-0 left-10 h-28 w-7 -rotate-2 rounded-full border-4 border-primary/60 bg-background" /><div className="absolute bottom-0 right-10 h-28 w-7 rotate-2 rounded-full border-4 border-primary/60 bg-background" /><span className="absolute top-[4.3rem] size-3 rounded-full bg-accent shadow-[0_0_0_7px_oklch(0.79_0.13_82_/_0.22)]" /><span className="absolute top-[8.6rem] left-[4.1rem] size-3 rounded-full bg-primary shadow-[0_0_0_7px_oklch(0.39_0.09_145_/_0.14)]" /></div><div className="space-y-3"><BodyStatus label="Energía" value={body.energy || 'Pendiente'} ready={energyReady} icon={<Activity className="size-4" />} /><BodyStatus label="Sueño" value={body.sleep || 'Pendiente'} ready={sleepReady} icon={<Moon className="size-4" />} /><BodyStatus label="Síntomas" value={body.symptoms || 'Ninguno añadido'} ready={symptomsReady} icon={<HeartPulse className="size-4" />} /></div></div><div className="mt-5 rounded-2xl bg-background/75 px-4 py-3 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-primary">Sin diagnóstico.</span> Este mapa solo te ayuda a observarte y preparar una conversación con tu profesional.</div></div>
}

function BodyStatus({ label, value, ready, icon }: { label: string; value: string; ready: boolean; icon: React.ReactNode }) { return <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/75 px-3 py-3"><span className={`grid size-9 place-items-center rounded-xl ${ready ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}>{icon}</span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold text-primary">{value}</p></div></div> }

export const Route = createFileRoute('/app/')({
  head: () => ({ meta: [{ title: 'Hoy · VITAL OS' }, { name: 'description', content: 'Tu salud, contigo. Poquet a poquet.' }] }),
  component: VitalAppRoute,
})

function VitalAppRoute() {
  return <BlinkClientBoundary fallback={<AppLoading />}><VitalApp /></BlinkClientBoundary>
}

function AppLoading() {
  return <main className="grid min-h-dvh place-items-center bg-background"><div className="text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"><Leaf className="size-7" /></span><p className="mt-4 font-serif text-2xl text-primary">VITAL</p><p className="mt-2 text-sm text-muted-foreground">Preparando tu espacio...</p></div></main>
}

function VitalApp() {
  const [activeTab, setActiveTab] = useState<Tab>('Hoy')
  const [done, setDone] = useStoredState('vital-medication-done', false)
  const [note, setNote] = useStoredState('vital-daily-note', '')
  const firstVisit = useSyncExternalStore(vitalSeenSubscribe, getFirstVisit, getServerFirstVisit)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [meds, setMeds] = useStoredState('vital-medications', ['Enalapril · 8:00', 'Vitamina D · 13:00'])
  const [showAllMeds, setShowAllMeds] = useState(false)
  const [body] = useStoredState('vital-body-checkin', { energy: '', sleep: '', symptoms: '' })

  const greeting = useMemo(() => 'Bon dia', [])
  const searchResults = useMemo(() => {
    const items = ['Hoy: medicación, cómo te sientes y próxima cita', 'Cuerpo: energía, sueño y síntomas', 'Mi Salud: resumen de medicación e informes', 'Historia: documentos confirmados', 'Conexiones: Apple Salud, Withings y portales médicos']
    return items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  function resetLocalSpace() {
    for (const key of ['vital-demo-seen', 'vital-medication-done', 'vital-daily-note', 'vital-visit-note', 'vital-body-checkin', 'vital-medications', 'vital-confirmed-document', 'vital-emergency-profile']) localStorage.removeItem(key)
    window.location.reload()
  }

  function start() { localStorage.setItem('vital-demo-seen', '1'); window.dispatchEvent(new Event('vital-demo-seen')) }

  if (firstVisit) return <Onboarding onStart={start} />

  return (
    <main className="min-h-dvh bg-background pb-24 lg:pb-8">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"><Leaf className="size-6" /></span><div><p className="font-serif text-xl font-bold text-primary">VITAL</p><p className="text-xs text-muted-foreground">Poquet a poquet</p></div></div><div className="hidden items-center gap-3 sm:flex"><button type="button" onClick={() => setSearchOpen(value => !value)} className="grid size-11 place-items-center rounded-full text-primary hover:bg-secondary" aria-label="Buscar"><Search className="size-5" /></button><button type="button" onClick={() => setEmergencyOpen(true)} className="flex h-11 items-center gap-2 rounded-full border border-accent/60 bg-accent/20 px-4 font-semibold text-accent-foreground hover:bg-accent/30"><ShieldAlert className="size-5" /> Ayuda</button><button type="button" className="grid size-11 place-items-center rounded-full text-primary hover:bg-secondary" aria-label="Menú" onClick={() => setMenuOpen(value => !value)}><Menu className="size-5" /></button></div><button type="button" onClick={() => setEmergencyOpen(true)} className="grid size-11 place-items-center rounded-full bg-accent/20 text-accent-foreground sm:hidden" aria-label="Ayuda"><ShieldAlert className="size-5" /></button></header>
      {searchOpen && <div className="mx-5 mb-5 rounded-2xl border border-border bg-card p-4 shadow-md sm:mx-auto sm:max-w-7xl"><div className="flex items-center gap-3"><Search className="size-5 text-primary" /><input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} onKeyDown={event => event.key === 'Escape' && setSearchOpen(false)} placeholder="Buscar en tu espacio VITAL..." className="w-full bg-transparent text-sm outline-none" aria-label="Buscar en tu espacio VITAL" /><button type="button" onClick={() => { setSearchQuery(''); setSearchOpen(false) }} aria-label="Cerrar búsqueda"><X className="size-5 text-muted-foreground" /></button></div>{searchQuery && <div className="mt-4 space-y-2">{searchResults.length ? searchResults.map(result => <button type="button" key={result} onClick={() => { setActiveTab(result.startsWith('Cuerpo') ? 'Cuerpo' : result.startsWith('Mi Salud') ? 'Mi Salud' : result.startsWith('Historia') ? 'Historia' : result.startsWith('Conexiones') ? 'Yo' : 'Hoy'); setSearchOpen(false) }} className="block w-full rounded-xl bg-secondary px-4 py-3 text-left text-sm text-primary hover:bg-secondary/80">{result}</button>) : <p className="text-sm text-muted-foreground">No hay resultados para “{searchQuery}”.</p>}</div>}</div>}
      {menuOpen && <div className="mx-5 rounded-2xl border border-border bg-card p-4 shadow-md sm:mx-auto sm:max-w-7xl"><p className="font-semibold text-primary">Tu espacio VITAL</p><p className="mt-1 text-sm text-muted-foreground">Todo funciona sin cuenta y se guarda en este dispositivo.</p><button type="button" onClick={resetLocalSpace} className="mt-3 text-xs font-semibold text-primary underline underline-offset-4 hover:text-accent-foreground">Restablecer este espacio</button></div>}
      <div className="mx-auto max-w-7xl px-5 lg:px-10"><div className="mb-8 flex items-end justify-between"><div><p className="text-base font-medium text-muted-foreground">{greeting}, Marc</p><h1 className="mt-1 font-serif text-4xl leading-tight text-primary sm:text-5xl">¿Cómo estás hoy?</h1></div><span className="hidden rounded-full bg-secondary px-4 py-2 text-sm text-primary sm:block">Martes, 15 septiembre</span></div>
        <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
          <section className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-lg sm:p-8"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-primary-foreground/70">Lo más importante ahora</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">Tu medicación de la mañana</h2><p className="mt-3 max-w-md text-base leading-7 text-primary-foreground/75">Un pequeño paso para cuidar de ti. Sin prisas.</p></div><span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground"><Pill className="size-6" /></span></div><Button onClick={() => setDone(true)} className="mt-7 h-14 rounded-full bg-accent px-6 text-base text-accent-foreground hover:bg-accent/85">{done ? <><Check className="size-5" /> Hecho. Ya está.</> : <>Marcar como tomada <Check className="size-5" /></>}</Button></section>
          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-primary">¿Cómo te sientes?</h2><Moon className="size-6 text-accent" /></div><p className="mt-2 text-sm text-muted-foreground">Solo una palabra, si quieres.</p><div className="mt-6 flex justify-between">{['Tranquilo', 'Bien', 'Regular', 'Cansado', 'Mal'].map((face, index) => <button key={face} type="button" onClick={() => setNote(face)} className={`flex flex-col items-center gap-2 rounded-xl p-2 text-xs transition hover:bg-secondary ${note === face ? 'bg-secondary text-primary' : 'text-muted-foreground'}`}><span className="text-2xl">{['☀', '◡', '—', '◠', '○'][index]}</span><span>{face}</span></button>)}</div>{note && <p className="mt-5 rounded-xl bg-secondary px-4 py-3 text-sm text-primary">Gracias por contármelo. Lo tendré en cuenta.</p>}</section>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2"><section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-primary">Tus tomas de hoy</h2><button type="button" onClick={() => setShowAllMeds(value => !value)} className="text-sm font-semibold text-primary hover:underline">{showAllMeds ? 'Ocultar' : 'Ver todo'}</button></div><div className="mt-5 space-y-3">{(showAllMeds ? meds : meds.slice(0, 2)).map((med, index) => <div key={`${med}-${index}`} className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-background text-primary"><Pill className="size-5" /></span><div><p className="font-semibold text-primary">{med.split(' · ')[0]}</p><p className="text-sm text-muted-foreground">{med.split(' · ')[1]}</p></div></div><button type="button" onClick={() => setMeds(current => current.filter((_, i) => i !== index))} className="grid size-11 place-items-center rounded-full bg-background text-primary hover:bg-accent" aria-label={`Marcar ${med} como tomada`}><Check className="size-5" /></button></div>)}</div><button type="button" onClick={() => setMeds(current => [...current, 'Nueva medicación · Ahora'])} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-semibold text-primary hover:bg-secondary"><Plus className="size-4" /> Añadir una toma</button></section><section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-primary">Tu próxima cita</h2><CalendarDays className="size-6 text-accent" /></div><div className="mt-5 rounded-2xl bg-secondary/70 p-5"><p className="text-sm text-muted-foreground">Dentro de 8 días · 23 septiembre, 10:30</p><p className="mt-2 text-xl font-semibold text-primary">Dra. Laura Soler</p><p className="mt-1 text-sm text-muted-foreground">Medicina de familia · CAP Les Corts</p><button type="button" onClick={() => setActiveTab('VITAL')} className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Preparar mi visita <ArrowRight className="size-4" /></button></div><button type="button" onClick={downloadCalendarEvent} className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><CalendarDays className="size-4" /> Añadir al calendario</button><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Bell className="size-4 text-primary" /> Te avisaré con calma.</p></section></div>
        <section className="mt-5 rounded-[2rem] border border-primary/15 bg-secondary/40 p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-background text-primary"><Activity className="size-6" /></span><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Cuerpo</p><p className="mt-1 text-xs text-muted-foreground">Tu registro de hoy</p></div></div><h2 className="mt-4 font-serif text-3xl text-primary">Escucha cómo estás, sin presión.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Registra tu energía, sueño o síntomas cuando te apetezca. No hay rachas ni juicios.</p></div><Button onClick={() => setActiveTab('Cuerpo')} variant="outline" className="h-12 rounded-full px-5">Abrir sección Cuerpo <ChevronRight className="size-5" /></Button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><button type="button" onClick={() => setActiveTab('Cuerpo')} className="rounded-2xl border border-border bg-background p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-primary">Energía</span><Activity className="size-4 text-primary" /></div><p className="mt-3 font-serif text-2xl text-primary">{body.energy || 'Sin registrar'}</p><p className="mt-1 text-xs text-muted-foreground">¿Cómo te encuentras?</p></button><button type="button" onClick={() => setActiveTab('Cuerpo')} className="rounded-2xl border border-border bg-background p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-primary">Sueño</span><Moon className="size-4 text-primary" /></div><p className="mt-3 font-serif text-2xl text-primary">{body.sleep || 'Sin registrar'}</p><p className="mt-1 text-xs text-muted-foreground">¿Has descansado?</p></button><button type="button" onClick={() => setActiveTab('Cuerpo')} className="rounded-2xl border border-border bg-background p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-primary">Síntomas</span><HeartPulse className="size-4 text-primary" /></div><p className="mt-3 font-serif text-2xl text-primary">{body.symptoms || 'Ninguno'}</p><p className="mt-1 text-xs text-muted-foreground">Añade algo si quieres</p></button></div></section>
        <section className="mt-5 flex flex-col justify-between gap-4 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center"><div><p className="text-sm font-medium text-muted-foreground">¿Hay algo que quieras apuntar?</p><p className="mt-1 font-serif text-2xl text-primary">Tu cuerpo también habla.</p></div><Button onClick={() => setActiveTab('VITAL')} variant="outline" className="h-12 rounded-full px-5">Hablar con VITAL <ChevronRight className="size-5" /></Button></section>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 py-2 backdrop-blur lg:static lg:mx-auto lg:mt-8 lg:max-w-7xl lg:border-t-0 lg:bg-transparent lg:px-10"><div className="mx-auto grid max-w-2xl grid-cols-6 gap-1 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-2">{tabs.map(({ name, icon: Icon }) => <button key={name} type="button" onClick={() => setActiveTab(name)} className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${activeTab === name ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-primary'}`}><Icon className="size-5" /><span>{name}</span></button>)}</div></nav>
      {emergencyOpen && <Emergency onClose={() => setEmergencyOpen(false)} />}
      {activeTab === 'Yo' && !emergencyOpen && <ConnectionsScreen onClose={() => setActiveTab('Hoy')} />}
      {activeTab !== 'Hoy' && activeTab !== 'Yo' && !emergencyOpen && <TabPanel tab={activeTab} onBack={() => setActiveTab('Hoy')} />}
    </main>
  )
}

function Onboarding({ onStart }: { onStart: () => void }) { return <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-10"><div className="w-full max-w-lg text-center"><span className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"><Leaf className="size-10" /></span><p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-primary">VITAL OS</p><h1 className="mt-5 font-serif text-5xl leading-tight text-primary sm:text-6xl">Bon dia.<br />Soy VITAL.</h1><p className="mx-auto mt-6 max-w-md text-lg leading-8 text-muted-foreground">Tu compañero de salud. Vamos a empezar con calma, solo con lo que quieras compartir.</p><Button onClick={onStart} size="lg" className="mt-9 h-14 rounded-full px-8 text-base">Empezar, sin cuenta <ArrowRight className="size-5" /></Button><p className="mt-5 text-sm text-muted-foreground">Puedes saltarte cualquier paso. Poquet a poquet.</p></div></main> }

function Emergency({ onClose }: { onClose: () => void }) {
  const [profile, setProfile] = useStoredState('vital-emergency-profile', { name: 'Marc', birthYear: '1972', allergies: 'Ninguna registrada', contact: 'Anna · 600 000 000' })
  const [editing, setEditing] = useState(false)
  const [meds] = useStoredState('vital-medications', ['Enalapril · 8:00', 'Vitamina D · 13:00'])
  const cardText = `Tarjeta de emergencia VITAL · ${profile.name} · Alergias: ${profile.allergies} · Medicación: ${meds.join(', ')} · Contacto: ${profile.contact}`
  return <div className="fixed inset-0 z-50 grid place-items-center bg-primary/20 px-5 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-border bg-background p-6 shadow-lg sm:p-8"><div className="flex items-start justify-between"><div><span className="grid size-12 place-items-center rounded-2xl bg-accent/30 text-accent-foreground"><ShieldAlert className="size-6" /></span><h2 className="mt-5 font-serif text-3xl text-primary">Tarjeta de emergencia</h2></div><button type="button" onClick={onClose} aria-label="Cerrar"><X className="text-muted-foreground" /></button></div>{editing ? <div className="mt-6 space-y-4"><ProfileField label="Nombre" value={profile.name} onChange={value => setProfile(current => ({ ...current, name: value }))} /><ProfileField label="Año de nacimiento" value={profile.birthYear} onChange={value => setProfile(current => ({ ...current, birthYear: value }))} /><ProfileField label="Alergias" value={profile.allergies} onChange={value => setProfile(current => ({ ...current, allergies: value }))} /><ProfileField label="Contacto de emergencia" value={profile.contact} onChange={value => setProfile(current => ({ ...current, contact: value }))} /><button type="button" onClick={() => setEditing(false)} className="h-12 w-full rounded-full bg-primary font-semibold text-primary-foreground">Guardar datos</button></div> : <><div className="mt-6 space-y-3 text-base"><p><strong>Nombre:</strong> {profile.name}</p><p><strong>Fecha de nacimiento:</strong> {profile.birthYear}</p><p><strong>Alergias:</strong> {profile.allergies}</p><p><strong>Medicación:</strong> {meds.join(', ')}</p><p><strong>Contacto:</strong> {profile.contact}</p></div><div className="mt-7 grid gap-3"><a href="tel:112" className="flex h-14 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">Llamar al 112</a><button type="button" onClick={() => { void navigator.clipboard?.writeText(cardText) }} className="h-14 rounded-full border border-border font-semibold text-primary hover:bg-secondary">Copiar tarjeta</button><button type="button" onClick={() => setEditing(true)} className="h-12 rounded-full border border-border text-sm font-semibold text-primary hover:bg-secondary">Editar mis datos</button></div></>}<p className="mt-5 text-center text-xs text-muted-foreground">Si hay dolor en el pecho, dificultad para respirar o pérdida repentina de fuerza, llama al 112.</p></div></div>
}

function ProfileField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm font-semibold text-primary">{label}<input value={value} onChange={event => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 font-normal outline-none focus:ring-4 focus:ring-primary/10" /></label> }

function ConnectionsScreen({ onClose }: { onClose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [confirmedFile, setConfirmedFile] = useStoredState<string | null>('vital-confirmed-document', null)
  const [withingsMessage, setWithingsMessage] = useState('')
  const [openInfo, setOpenInfo] = useState<string | null>(null)

  function handleFile(event: React.ChangeEvent<HTMLInputElement>, source: string) {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file.name)
    setSelectedSource(source)
    setReviewOpen(true)
  }

  return <section className="fixed inset-0 z-10 overflow-y-auto bg-background pb-28 pt-5">
    <div className="mx-auto max-w-5xl px-5 lg:px-10">
      <div className="flex items-start justify-between gap-5">
        <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Tu espacio</p><h1 className="mt-2 font-serif text-4xl text-primary sm:text-5xl">Conexiones</h1><p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Aquí decides qué entra en VITAL. Nada se conecta solo sin que tú lo sepas.</p></div>
        <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-primary hover:bg-secondary" aria-label="Volver a Hoy"><X className="size-5" /></button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4"><Smartphone className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold text-primary">Sin cuenta</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Los documentos seleccionados se quedan en este dispositivo.</p></div>
        <div className="rounded-2xl border border-border bg-card p-4"><CheckCircle2 className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold text-primary">Tú confirmas</p><p className="mt-1 text-xs leading-5 text-muted-foreground">VITAL nunca guarda una cita o dato sin preguntarte antes.</p></div>
        <div className="rounded-2xl border border-border bg-card p-4"><Info className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold text-primary">Sin promesas falsas</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Si requiere ayuda tuya, lo decimos claramente.</p></div>
      </div>

      <div className="mt-10 flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Tus fuentes de salud</p><h2 className="mt-2 font-serif text-3xl text-primary">Conecta lo que ya usas</h2></div><Link2 className="hidden size-8 text-accent sm:block" /></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ConnectionCard icon={<HeartPulse className="size-6" />} title="Apple Salud" status="Necesita tu ayuda: sube una captura" tone="amber" infoOpen={openInfo === 'apple'} onInfo={() => setOpenInfo(openInfo === 'apple' ? null : 'apple')}>
          <p>La web no puede leer Apple Salud directamente. Haz una captura del resumen en tu iPhone y selecciónala aquí.</p>
          <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"><Upload className="size-4" /> {selectedFile ?? 'Elegir captura o PDF'}<input type="file" accept="image/*,.pdf" onChange={event => handleFile(event, 'Apple Salud')} className="sr-only" /></label>
          {selectedFile && <p className="mt-3 flex items-center gap-2 text-xs text-primary"><FileUp className="size-4" /> {selectedFile} · listo para revisar</p>}
        </ConnectionCard>
        <ConnectionCard icon={<Weight className="size-6" />} title="Withings" status="No conectado" tone="teal" infoOpen={openInfo === 'withings'} onInfo={() => setOpenInfo(openInfo === 'withings' ? null : 'withings')}>
          <p>La conexión automática necesita una autorización segura de Withings. En esta versión puedes dejarla preparada, pero no fingimos que está conectada.</p>
          <Button variant="outline" className="mt-4 h-12 w-full rounded-xl" onClick={() => setWithingsMessage('La conexión Withings quedará disponible cuando podamos completar la autorización segura.')}>Conectar Withings <ArrowRight className="size-4" /></Button>
          {withingsMessage && <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-xs leading-5 text-primary">{withingsMessage}</p>}
        </ConnectionCard>
        <ConnectionCard icon={<Mail className="size-6" />} title="La Meva Salut · Quirónsalud · MediFIATC" status="Necesita tu ayuda: importa un documento" tone="sand" infoOpen={openInfo === 'centres'} onInfo={() => setOpenInfo(openInfo === 'centres' ? null : 'centres')}>
          <p>Puedes subir una captura o PDF de una cita, analítica o informe. Primero verás lo que VITAL ha encontrado y después decides si guardarlo.</p>
          {confirmedFile && <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-xs leading-5 text-primary"><CheckCircle2 className="mr-1 inline size-4" /> Documento confirmado: {confirmedFile}</p>}
          <div className="mt-4 grid gap-2 sm:grid-cols-3"><a href="https://lamevasalut.gencat.cat/" target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1 rounded-xl border border-border text-xs font-semibold text-primary hover:bg-secondary">La Meva Salut <ExternalLink className="size-3" /></a><a href="https://www.quironsalud.com/" target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1 rounded-xl border border-border text-xs font-semibold text-primary hover:bg-secondary">Quirón <ExternalLink className="size-3" /></a><a href="https://www.fiatc.es/" target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1 rounded-xl border border-border text-xs font-semibold text-primary hover:bg-secondary">FIATC <ExternalLink className="size-3" /></a></div><label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"><Upload className="size-4" /> Importar documento<input type="file" accept="image/*,.pdf" onChange={event => handleFile(event, 'La Meva Salut · Quirónsalud · MediFIATC')} className="sr-only" /></label>
        </ConnectionCard>
        <ConnectionCard icon={<CalendarDays className="size-6" />} title="Calendario" status="Actualiza tú cuando quieras" tone="lavender" infoOpen={openInfo === 'calendar'} onInfo={() => setOpenInfo(openInfo === 'calendar' ? null : 'calendar')}>
          <p>VITAL no lee tu calendario sin permiso. Cuando tengas una cita aquí, podrás añadirla al calendario del móvil con un toque.</p>
          <button type="button" onClick={downloadCalendarEvent} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-primary hover:bg-secondary"><CalendarDays className="size-4" /> Añadir una cita de VITAL</button>
        </ConnectionCard>
      </div>

      <div className="mt-10 rounded-[2rem] border border-border bg-card p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"><FileText className="size-6" /></span><div><h2 className="font-serif text-2xl text-primary">Otras conexiones</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Google Fit, Fitbit, Garmin, Oura y Apple Health Records necesitan permisos y conexiones que todavía no podemos completar de forma segura desde esta versión. No están activas.</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Todavía no disponible</span><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Sincronización manual siempre disponible</span></div></div></div></div>
      <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">La información que aparece aquí se basa en las funciones públicas de las apps y áreas privadas de cada compañía. VITAL no entra en ellas ni guarda nada automáticamente.</p>
    </div>
    {reviewOpen && selectedFile && <div className="fixed inset-0 z-50 grid place-items-center bg-primary/20 px-5 backdrop-blur-sm"><div className="w-full max-w-md rounded-[2rem] border border-border bg-background p-6 shadow-lg sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><FileText className="size-6" /></span><h2 className="mt-5 font-serif text-3xl text-primary">Revisar antes de guardar</h2></div><button type="button" onClick={() => setReviewOpen(false)} aria-label="Cerrar"><X className="text-muted-foreground" /></button></div><div className="mt-6 rounded-2xl bg-secondary/70 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Fuente</p><p className="mt-1 font-semibold text-primary">{selectedSource}</p><p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Documento</p><p className="mt-1 break-all text-sm text-muted-foreground">{selectedFile}</p></div><p className="mt-5 text-sm leading-6 text-muted-foreground">El archivo está seleccionado en este dispositivo. En esta versión no se sube ni se guarda automáticamente.</p><div className="mt-6 grid gap-3"><button type="button" onClick={() => { setConfirmedFile(selectedFile); setReviewOpen(false) }} className="h-12 rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90">Confirmar selección</button><button type="button" onClick={() => { setSelectedFile(null); setSelectedSource(''); setReviewOpen(false) }} className="h-12 rounded-full border border-border font-semibold text-primary hover:bg-secondary">Descartar documento</button></div></div></div>}
  </section>
}

function ConnectionCard({ icon, title, status, tone, children, infoOpen, onInfo }: { icon: React.ReactNode; title: string; status: string; tone: 'amber' | 'teal' | 'sand' | 'lavender'; children: React.ReactNode; infoOpen: boolean; onInfo: () => void }) {
  const toneClass = { amber: 'bg-accent/25 text-accent-foreground', teal: 'bg-primary/10 text-primary', sand: 'bg-secondary text-primary', lavender: 'bg-primary/10 text-primary' }[tone]
  return <article className="rounded-[2rem] border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"><div className="flex items-start justify-between gap-4"><div className={`grid size-12 place-items-center rounded-2xl ${toneClass}`}>{icon}</div><button type="button" onClick={onInfo} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"><Info className="size-4" /> Cómo funciona</button></div><h3 className="mt-5 font-serif text-2xl text-primary">{title}</h3><p className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Clock3 className="size-3.5" /> {status}</p>{infoOpen && <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm leading-6 text-primary">Esto no es una sincronización silenciosa. VITAL solo prepara el dato y te lo enseña para que tú lo confirmes.</p>}<div className="mt-4 text-sm leading-6 text-muted-foreground">{children}</div></article>
}
