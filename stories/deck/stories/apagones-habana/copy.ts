import type { L10n } from '../../shared/lang';
import { archOf, type ProjectData } from '../../shared/arch';
import raw from '../../../../src/content/projects/apagones-habana.json';

/**
 * Typed en/es dictionary for the apagones-habana story.
 *
 * Facts come ONLY from the project JSON (`src/content/projects/apagones-habana.json`): node text is read from it
 * (see `arch`), decision "why" text is verbatim, and every other sentence is a condensed excerpt of a JSON field.
 * docs/CONTENT-AUDIT.md maps each beat to its JSON path. Authored here: scene labels, short headlines, UI words
 * and the rhythm of the beats. The sample chat, the boot command, the map geometry and its zone states, the
 * 24 h strip and the report dots are ILLUSTRATIVE (see the audit).
 */
// In this JSON the extra views live under `architecture.additionalViews`; shared/arch.ts expects them at the top level.
const rawAny = raw as unknown as ProjectData & { architecture: { additionalViews?: ProjectData['additionalViews'] } };
// Only the fields the story reads are picked: spreading the whole JSON would bundle `links` (URLs trip the offline check).
export const project: ProjectData = {
  slug: rawAny.slug, title: rawAny.title, tagline: rawAny.tagline, summary: rawAny.summary, problem: rawAny.problem,
  architecture: rawAny.architecture, decisions: rawAny.decisions,
  additionalViews: rawAny.architecture.additionalViews ?? null,
};
export const arch = archOf(project);

/** A headline + one-sentence caption pair, one per beat of a world scene. */
export interface Pair { head: L10n; cap: L10n }

/**
 * The live host shown on stage: the host of `links.live` in the JSON. It is written here rather than read from the JSON
 * because bundling the full URL would trip the offline check (a URL in the bundle looks like a remote fetch).
 * The audit records the match with `links.live`.
 */
export const LIVE_HOST = 'apagoneshabana.lat';

export const copy = {
  startHint: { en: 'Click or press → to start', es: 'Clic o pulsa → para empezar' },
  storyLabel: { en: 'Project story', es: 'Historia del proyecto' },
  /** Title split in lines for the poster (joined with a space it equals `title` in the JSON). */
  titleLines: { en: ['Apagones', 'Habana'], es: ['Apagones', 'Habana'] } as L10n<string[]>,
  /** Illustrative boot lines: a command, then the pieces named in the JSON. */
  boot: {
    en: ['$ apagones ingest --since last_id', '> telegram · whisper · embeddings', `> publish → ${LIVE_HOST}`],
    es: ['$ apagones ingest --since last_id', '> telegram · whisper · embeddings', `> publicar → ${LIVE_HOST}`],
  } as L10n<string[]>,

  scene: {
    open: { en: 'Open', es: 'Inicio' },
    problem: { en: 'The problem', es: 'El problema' },
    pipeline: { en: 'The pipeline', es: 'El pipeline' },
    map: { en: 'The map', es: 'El mapa' },
    assistant: { en: 'The assistant', es: 'El asistente' },
    ops: { en: 'Self-healing and operations', es: 'Autorreparación y operación' },
    decisions: { en: 'Decisions, and why', es: 'Decisiones y por qué' },
    outcome: { en: 'Live', es: 'En vivo' },
  },

  problem: {
    ask: { en: ['Is there power', 'on my block?'], es: ['¿Hay corriente', 'en mi cuadra?'] } as L10n<string[]>,
    scattered: { en: ['Scattered across', 'a Telegram channel.'], es: ['Dispersa en un', 'canal de Telegram.'] } as L10n<string[]>,
    kinds: {
      post: { en: 'Post', es: 'Publicación' },
      comment: { en: 'Comment', es: 'Comentario' },
      voice: { en: 'Voice note', es: 'Nota de voz' },
    },
    noView: { en: 'Residents had no structured, searchable view of…', es: 'Los vecinos no tenían una vista estructurada y consultable de…' },
    list: {
      en: ['the current state', 'hours without power per circuit', 'the history'],
      es: ['el estado actual', 'las horas sin corriente por circuito', 'el histórico'],
    } as L10n<string[]>,
  },

  /** Pipeline world: one pair per beat (5 beats). */
  pipeline: [
    {
      head: { en: 'Every 30 minutes, on the dot.', es: 'Cada 30 minutos, puntual.' },
      cap: {
        en: 'A Cloudflare Worker with a cron trigger lives outside GitHub on purpose and dispatches the pipeline. Regression tests run first.',
        es: 'Un Worker de Cloudflare con cron vive fuera de GitHub a propósito y dispara el pipeline. Primero corren las pruebas de regresión.',
      },
    },
    {
      head: { en: 'Pull only what is new.', es: 'Solo lo que es nuevo.' },
      cap: {
        en: 'Telethon reads messages newer than the last stored id and upserts them. A user account is needed: a bot cannot read the channel.',
        es: 'Telethon lee los mensajes posteriores al último id guardado y los inserta. Hace falta una cuenta de usuario: un bot no puede leer el canal.',
      },
    },
    {
      head: { en: 'Rules read the posts first.', es: 'Primero leen las reglas.' },
      cap: {
        en: 'Official posts follow regular templates, so regex rules turn them into typed events: predictable and unit-testable.',
        es: 'Los posts oficiales siguen plantillas regulares, así que reglas regex los convierten en eventos tipados: predecibles y con pruebas.',
      },
    },
    {
      head: { en: 'Then the LLM fills the gaps.', es: 'Luego el LLM llena los huecos.' },
      cap: {
        en: 'Voice notes are transcribed, structured parts are extracted and fragments are embedded. It enriches; it never gates publishing.',
        es: 'Se transcriben las notas de voz, se extraen datos estructurados y se calculan embeddings. Enriquece; nunca bloquea la publicación.',
      },
    },
    {
      head: { en: 'Tested, built, published.', es: 'Probado, generado, publicado.' },
      cap: {
        en: 'Scripts precompute the JSON that the site and bot read, then Cloudflare Pages deploys it: no always-on server.',
        es: 'Scripts precalculan el JSON que leen el sitio y el bot, y Cloudflare Pages lo despliega: sin servidor encendido.',
      },
    },
  ] as Pair[],

  /** Words on the world: step badges. */
  badge: {
    every: { en: 'Every 30 min', es: 'Cada 30 min' },
    testing: { en: 'Running tests', es: 'Corriendo pruebas' },
    tests: { en: 'Tests pass', es: 'Pruebas correctas' },
    upsert: { en: 'Upsert', es: 'Upsert' },
    events: { en: 'Typed events', es: 'Eventos tipados' },
    voice: { en: 'Voice to text', es: 'Voz a texto' },
    parts: { en: 'Structured parts', es: 'Datos estructurados' },
    embed: { en: 'Embeddings', es: 'Embeddings' },
    deploy: { en: 'Deploy', es: 'Despliegue' },
    stale: { en: 'Stale', es: 'Viejo' },
    fresh: { en: 'Fresh', es: 'Al día' },
    zombie: { en: 'Zombie run', es: 'Corrida zombi' },
    cancelled: { en: 'Cancelled', es: 'Cancelada' },
    dispatch: { en: 'ingest.yml dispatched', es: 'ingest.yml lanzado' },
    guardian: { en: 'Guardian issue', es: 'Issue guardian' },
    sent: { en: 'Sent', es: 'Enviado' },
    purged: { en: 'Bad geocodes purged', es: 'Geocodes erróneos purgados' },
    oneIssue: { en: 'One open issue', es: 'Un issue abierto' },
    gauge: { en: 'Age of published data (min)', es: 'Edad de los datos publicados (min)' },
    stale45: { en: 'stale', es: 'viejo' },
    alert120: { en: 'alert', es: 'alerta' },
    topk: { en: 'Top fragments', es: 'Fragmentos top' },
    fragment: { en: 'fragment', es: 'fragmento' },
  },

  /** Map scene (4 beats). */
  map: [
    {
      head: { en: 'A map that answers at a glance.', es: 'Un mapa que responde de un vistazo.' },
      cap: {
        en: 'The public site reads precomputed JSON: outage map, circuit pages and analytics, with map tiles served from the same origin.',
        es: 'El sitio público lee JSON precalculado: mapa de apagones, páginas por circuito y analítica, con los tiles servidos desde el mismo origen.',
      },
    },
    {
      head: { en: 'Zones go dark as notices land.', es: 'Las zonas se apagan con cada aviso.' },
      cap: {
        en: 'Each notice becomes a typed event. With no news, state ages to unknown instead of guessing.',
        es: 'Cada aviso se convierte en un evento tipado. Sin noticias, el estado envejece a desconocido en lugar de adivinar.',
      },
    },
    {
      head: { en: 'And come back, on the record.', es: 'Y vuelven, con registro.' },
      cap: {
        en: 'Restoration events close the outage, so hours without power per circuit and the history are kept.',
        es: 'Los eventos de restablecimiento cierran el apagón, así se guardan las horas sin corriente por circuito y el histórico.',
      },
    },
    {
      head: { en: 'Neighbors report, privately.', es: 'Los vecinos reportan, con privacidad.' },
      cap: {
        en: 'Reports stay inside Havana, IPs are salted, hashed and rate-limited, and the last 6 h aggregate into ~110 m cells.',
        es: 'Los reportes se acotan a La Habana, las IP se hashean con sal y se limitan, y las últimas 6 h se agregan en celdas de ~110 m.',
      },
    },
  ] as Pair[],
  mapUi: {
    illustrative: { en: 'Illustrative positions', es: 'Posiciones ilustrativas' },
    power: { en: 'With power', es: 'Con corriente' },
    off: { en: 'No power', es: 'Sin corriente' },
    unknown: { en: 'Unknown', es: 'Desconocido' },
    report: { en: 'Report', es: 'Reporte' },
    strip: { en: 'Last 24 h · one circuit', es: 'Últimas 24 h · un circuito' },
  },

  /** Assistant scene (4 beats). */
  assistant: [
    {
      head: { en: 'Ask in plain words.', es: 'Pregunta con tus palabras.' },
      cap: {
        en: 'Residents write to the Telegram bot or the web chat. Only text messages are processed.',
        es: 'Los vecinos escriben al bot de Telegram o al chat web. Solo se procesan mensajes de texto.',
      },
    },
    {
      head: { en: 'Search by meaning.', es: 'Busca por significado.' },
      cap: {
        en: 'The query is embedded and matched in the database with pgvector. Only the top fragments come back.',
        es: 'La consulta se convierte en embedding y se busca en la base con pgvector. Solo vuelven los fragmentos más relevantes.',
      },
    },
    {
      head: { en: 'Answer from the data.', es: 'Responde con los datos.' },
      cap: {
        en: 'Every figure comes from tools, not model arithmetic, so each answer stays verifiable.',
        es: 'Cada cifra sale de herramientas y no de aritmética del modelo, así cada respuesta es verificable.',
      },
    },
    {
      head: { en: 'Tools first, vectors last.', es: 'Herramientas primero, vectores al final.' },
      cap: {
        en: 'Deterministic tools over precomputed data answer first; semantic search is the last resort, within at most 4 tool rounds.',
        es: 'Herramientas deterministas sobre datos precalculados responden primero; la búsqueda semántica es el último recurso, con un máximo de 4 rondas.',
      },
    },
  ] as Pair[],
  chat: {
    channel: { en: 'Telegram bot · web chat', es: 'Bot de Telegram · chat web' },
    illustrative: { en: 'Illustrative example', es: 'Ejemplo ilustrativo' },
    /** ILLUSTRATIVE sample: no real person, place or circuit. */
    question: { en: 'Does my block have power right now?', es: '¿Mi cuadra tiene corriente ahora?' },
    answer: {
      en: 'Your circuit has an active outage notice. No restoration has been announced yet.',
      es: 'Tu circuito tiene un aviso de apagón activo. Todavía no se anunció el restablecimiento.',
    },
    facts: {
      en: ['Deterministic tools over precomputed data', 'Semantic search as the last resort', 'At most 4 tool rounds'],
      es: ['Herramientas deterministas sobre datos precalculados', 'Búsqueda semántica como último recurso', 'Máximo 4 rondas de herramientas'],
    } as L10n<string[]>,
  },

  /** Operations world (5 beats): watchdog (3) then digest and verification (2). */
  ops: [
    {
      head: { en: 'A watchdog outside GitHub.', es: 'Un guardián fuera de GitHub.' },
      cap: {
        en: 'Each tick it reads the published estado.json and computes its age. Data older than 45 min counts as stale.',
        es: 'En cada tick lee el estado.json publicado y calcula su edad. Datos de más de 45 min se consideran viejos.',
      },
    },
    {
      head: { en: 'Stale? Cancel zombies, re-run.', es: '¿Viejo? Cancelar zombis y relanzar.' },
      cap: {
        en: 'It cancels stuck runs (queued over 15 min, in progress over 22 min) and dispatches ingest.yml again.',
        es: 'Cancela las corridas atascadas (en cola más de 15 min, en curso más de 22 min) y lanza ingest.yml otra vez.',
      },
    },
    {
      head: { en: 'Still stale? Raise the alarm.', es: '¿Sigue viejo? Levantar la alarma.' },
      cap: {
        en: 'Past 120 min it opens, or comments on, a single guardian issue. It was born from a real 18-hour stall.',
        es: 'Pasados 120 min abre, o comenta, un único issue guardian. Nació de un atasco real de 18 horas.',
      },
    },
    {
      head: { en: 'Fridays: the weekly digest.', es: 'Los viernes: el resumen semanal.' },
      cap: {
        en: 'An offline, deterministic summary of the last 7 days goes out by email with an inline chart.',
        es: 'Un resumen offline y determinista de los últimos 7 días sale por email con un gráfico incrustado.',
      },
    },
    {
      head: { en: 'Daily: the data audits itself.', es: 'A diario, los datos se auditan solos.' },
      cap: {
        en: 'It checks the published JSON, purges badly geocoded points so the next ingest redoes them, and keeps one issue open.',
        es: 'Revisa el JSON publicado, purga los puntos mal geocodificados para que la próxima ingesta los rehaga y mantiene un solo issue abierto.',
      },
    },
  ] as Pair[],

  /** Decision titles split in two lines; joined with a space each equals `decisions[i].title` in the JSON. */
  decisionLines: [
    { en: ['Cloudflare for hosting', 'instead of Vercel/AWS'], es: ['Cloudflare como hosting', 'en vez de Vercel/AWS'] },
    { en: ['Pull-based ingestion via CI cron,', 'not a persistent connection'], es: ['Ingesta por pull con cron de CI,', 'no una conexión persistente'] },
    { en: ['A Cloudflare Worker as the', 'only trigger and watchdog'], es: ['Un Worker de Cloudflare como', 'único disparador y guardián'] },
    { en: ['Rules first, LLM as', 'best-effort enrichment'], es: ['Reglas primero, LLM como', 'enriquecimiento best-effort'] },
    { en: ['Embeddings in Supabase pgvector', 'instead of a static JSON'], es: ['Embeddings en pgvector de Supabase', 'en vez de un JSON estático'] },
  ] as L10n<string[]>[],

  /** Words inside decision vignettes. */
  vig: {
    cuba: { en: 'users', es: 'usuarios' },
    edge: { en: 'Cloudflare', es: 'Cloudflare' },
    third: { en: 'third party', es: 'tercero' },
    blocked: { en: 'blocked', es: 'bloqueado' },
    pull: { en: 'pull', es: 'pull' },
    server: { en: 'always-on', es: 'siempre on' },
    github: { en: 'GitHub', es: 'GitHub' },
    worker: { en: 'Worker', es: 'Worker' },
    stalled: { en: 'stalled', es: 'atascado' },
    rules: { en: 'rules', es: 'reglas' },
    llm: { en: 'LLM', es: 'LLM' },
    publish: { en: 'publish', es: 'publicar' },
    db: { en: 'pgvector', es: 'pgvector' },
    query: { en: 'query', es: 'consulta' },
    json: { en: 'static JSON', es: 'JSON estático' },
  },

  outcome: {
    closing: { en: ['Structured.', 'Searchable.', 'Live.'], es: ['Estructurado.', 'Consultable.', 'En vivo.'] } as L10n<string[]>,
    min: { en: 'min', es: 'min' },
  },
};

// Fidelity checks (run at module load, so `npm run verify` fails if the story and the JSON drift apart).
for (const [i, d] of copy.decisionLines.entries()) {
  for (const l of ['en', 'es'] as const) {
    const joined = d[l].join(' ');
    if (joined !== project.decisions[i].title[l]) throw new Error(`story: decision ${i + 1} title (${l}) differs from project data: "${joined}"`);
  }
}
for (const l of ['en', 'es'] as const) {
  if (copy.titleLines[l].join(' ') !== project.title[l]) throw new Error(`story: poster title (${l}) differs from project data`);
}
if (project.decisions.length !== copy.decisionLines.length) throw new Error('story: decision count differs from project data');
