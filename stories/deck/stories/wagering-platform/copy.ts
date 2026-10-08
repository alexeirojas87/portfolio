import type { L10n } from '../../shared/lang';
import { archOf, type ProjectData } from '../../shared/arch';
import raw from '../../../../src/content/projects/wagering-platform.json';

/**
 * Typed en/es dictionary for the wagering-platform story.
 *
 * Facts come ONLY from the project JSON (`src/content/projects/wagering-platform.json`) plus the four public
 * resume metrics (see `metrics`). Node text is read from the JSON (see `arch`); decision titles are verbatim
 * (checked at load). Everything else is a condensed excerpt or an authored UI word. docs/CONTENT-AUDIT-wagering-platform.md
 * maps each beat to its source. Illustrative: the boot lines, player/bet labels (A1, A2), cap numbers.
 * Scope (owner decisions): only the live path; the validation service validates and never inserts;
 * no ticket writer; no live-bet delay. No company information.
 */
export const project = raw as unknown as ProjectData;
export const arch = archOf(project);

export interface Pair { head: L10n; cap: L10n }

export const copy = {
  startHint: { en: 'Click or press → to start', es: 'Clic o pulsa → para empezar' },
  storyLabel: { en: 'Project story', es: 'Historia del proyecto' },
  titleLines: { en: ['Sports Wagering', 'Platform'], es: ['Plataforma de Apuestas', 'Deportivas'] } as L10n<string[]>,
  /** Illustrative boot lines (a command, then the stages named in the JSON). */
  boot: {
    en: ['$ bet place --live --player A', '> intake · validate · hand off · insert', '> one player, one order'],
    es: ['$ bet place --live --player A', '> recepción · validación · entrega · inserción', '> un jugador, un orden'],
  } as L10n<string[]>,

  scene: {
    open: { en: 'Open', es: 'Inicio' },
    problem: { en: 'The problem', es: 'El problema' },
    path: { en: 'The live bet path', es: 'La ruta de la apuesta en vivo' },
    one: { en: 'One player at a time', es: 'Un jugador a la vez' },
    limits: { en: 'The limits engine', es: 'El motor de límites' },
    rt: { en: 'Real-time state and telemetry', es: 'Estado en tiempo real y telemetría' },
    decisions: { en: 'Decisions, and why', es: 'Decisiones y por qué' },
    outcome: { en: 'The outcome', es: 'El resultado' },
  },

  problem: {
    old: { en: ['A monolithic,', 'synchronous path.'], es: ['Una ruta monolítica', 'y síncrona.'] } as L10n<string[]>,
    oldCap: { en: 'Every wager went through one bet-insertion path.', es: 'Toda apuesta pasaba por una sola ruta de inserción.' },
    couldNot: { en: 'The old path could not…', es: 'La ruta anterior no podía…' },
    list: {
      en: ['absorb peak event traffic', 'give players feedback while validating', 'test or evolve its limit rules'],
      es: ['absorber los picos de tráfico de eventos', 'dar retroalimentación al jugador al validar', 'probar ni evolucionar sus reglas de límites'],
    } as L10n<string[]>,
    need: { en: ['Decouple.', 'Keep order.', 'Don’t break the ledger.'], es: ['Desacoplar.', 'Mantener el orden.', 'No romper el libro.'] } as L10n<string[]>,
    needCap: {
      en: 'Intake, validation and persistence apart; strict ordering per player; richer live limit rules.',
      es: 'Recepción, validación y persistencia separadas; orden estricto por jugador; reglas de límites en vivo más ricas.',
    },
    pipe: { en: 'one synchronous path', es: 'una ruta síncrona' },
  },

  /** Live path world: one pair per beat (5). */
  path: [
    {
      head: { en: 'The bet reaches the API.', es: 'La apuesta llega a la API.' },
      cap: {
        en: 'The front-end posts the wager with a client-generated transaction id. The API answers “received” without waiting for validation.',
        es: 'El front-end envía la apuesta con un identificador de transacción generado en el cliente. La API responde «recibida» sin esperar la validación.',
      },
    },
    {
      head: { en: 'Straight onto the stream.', es: 'Directo al flujo.' },
      cap: {
        en: 'The batch is published to the validation topic keyed by player, so one player’s bets are processed in order.',
        es: 'El lote se publica en el tópico de validación con clave por jugador, de modo que sus apuestas se procesan en orden.',
      },
    },
    {
      head: { en: 'Validate. Only validate.', es: 'Validar. Solo validar.' },
      cap: {
        en: 'Freshness, odds, limits through the limits engine, and the player’s history read from the live database.',
        es: 'Vigencia, cuotas, límites con el motor de límites e historial del jugador leído de la base de datos en vivo.',
      },
    },
    {
      head: { en: 'Hand off, with an idempotent id.', es: 'Entrega con id idempotente.' },
      cap: {
        en: 'The accepted wager goes to the live engine’s bet API, with an id derived deterministically from the transaction id.',
        es: 'La apuesta aceptada pasa a la API de apuestas del motor en vivo, con un id derivado de forma determinista del id de transacción.',
      },
    },
    {
      head: { en: 'The live API inserts it.', es: 'La API en vivo la inserta.' },
      cap: {
        en: 'Its insert runs in a serializable transaction, into the live wagering database.',
        es: 'Su inserción corre en una transacción serializable, en la base de datos de apuestas en vivo.',
      },
    },
  ] as Pair[],
  badge: {
    received: { en: 'received', es: 'recibida' },
    keyed: { en: 'key: player', es: 'clave: jugador' },
    validates: { en: 'validates only', es: 'solo valida' },
    handoff: { en: 'idempotent id', es: 'id idempotente' },
    inserted: { en: 'inserted', es: 'insertada' },
    sameKey: { en: 'same key, same lane', es: 'misma clave, mismo carril' },
    locked: { en: 'locked', es: 'bloqueo' },
    waits: { en: 'A2 waits', es: 'A2 espera' },
    fresh: { en: 'fresh history', es: 'historial al día' },
    retry: { en: 'same id again', es: 'mismo id otra vez' },
    absorbed: { en: 'existing wager id', es: 'id de apuesta existente' },
    violation: { en: 'violation', es: 'violación' },
    rejected: { en: 'rejected', es: 'rechazada' },
    pushed: { en: 'pushed', es: 'enviado' },
    otlp: { en: 'OTLP', es: 'OTLP' },
  },
  checks: {
    en: ['freshness', 'odds', 'limits', 'history'],
    es: ['vigencia', 'cuotas', 'límites', 'historial'],
  } as L10n<string[]>,
  lane: { en: 'player A · one partition', es: 'jugador A · una partición' },

  /** One-player world (4). */
  one: [
    {
      head: { en: 'Same player, same lane.', es: 'Mismo jugador, mismo carril.' },
      cap: {
        en: 'Messages are keyed by player, so two concurrent bets of one player queue up in order.',
        es: 'Los mensajes llevan clave por jugador, así que dos apuestas simultáneas de un jugador hacen fila en orden.',
      },
    },
    {
      head: { en: 'One at a time.', es: 'Una a la vez.' },
      cap: {
        en: 'History is read under an exclusive per-player lock, so two simultaneous reads cannot bypass the caps.',
        es: 'El historial se lee bajo un bloqueo exclusivo por jugador, y dos lecturas simultáneas no pueden eludir los topes.',
      },
    },
    {
      head: { en: 'The second sees the first.', es: 'La segunda ve a la primera.' },
      cap: {
        en: 'Once the first is inserted, the next one is validated against fresh history.',
        es: 'Cuando la primera se inserta, la siguiente se valida contra el historial actualizado.',
      },
    },
    {
      head: { en: 'A duplicate is absorbed.', es: 'Un duplicado se absorbe.' },
      cap: {
        en: 'Replaying the same id returns the existing wager id instead of inserting twice.',
        es: 'Repetir el mismo id devuelve el id de apuesta existente en lugar de insertar dos veces.',
      },
    },
  ] as Pair[],

  /** Limits engine (3). */
  limits: [
    {
      head: { en: 'A pure library, not a service.', es: 'Una biblioteca pura, no un servicio.' },
      cap: {
        en: 'No HTTP, database or Kafka. The caller supplies a history snapshot; the engine only decides.',
        es: 'Sin HTTP, base de datos ni Kafka. Quien llama aporta una instantánea del historial; el motor solo decide.',
      },
    },
    {
      head: { en: 'Caps, evaluated.', es: 'Topes, evaluados.' },
      cap: {
        en: 'Per-pick, parlay and maximum-per-game rules; limits from several scopes merge to the most restrictive.',
        es: 'Reglas por selección, parlay y máximo por juego; los límites de varios alcances se unen en el más restrictivo.',
      },
    },
    {
      head: { en: 'Over the cap: rejected.', es: 'Sobre el tope: rechazada.' },
      cap: {
        en: 'The engine returns violation codes, and if limit data is missing the live wager is rejected: it fails closed.',
        es: 'El motor devuelve códigos de violación y, si faltan datos de límites, la apuesta en vivo se rechaza: falla de forma cerrada.',
      },
    },
  ] as Pair[],
  meters: {
    pick: { en: 'Per pick', es: 'Por selección' },
    parlay: { en: 'Parlay', es: 'Parlay' },
    game: { en: 'Max per game', es: 'Máx. por juego' },
    over: { en: 'over cap', es: 'sobre el tope' },
    illustrative: { en: 'illustrative numbers', es: 'números ilustrativos' },
  },

  /** Real-time and telemetry world (4). */
  rt: [
    {
      head: { en: 'Every stage reports its state.', es: 'Cada etapa reporta su estado.' },
      cap: {
        en: 'Services emit wager state changes to one notification topic, keyed by player.',
        es: 'Los servicios emiten los cambios de estado de la apuesta a un solo tópico de notificaciones, con clave por jugador.',
      },
    },
    {
      head: { en: 'One hub, straight to the player.', es: 'Un hub, directo al jugador.' },
      cap: {
        en: 'A single hub fans the events out over WebSocket. Services never talk to the front-end directly.',
        es: 'Un único hub distribuye los eventos por WebSocket. Los servicios nunca hablan directo con el front-end.',
      },
    },
    {
      head: { en: 'Observed end to end.', es: 'Observado de punta a punta.' },
      cap: {
        en: 'Traces and custom meters go out over OTLP, among them limit-evaluation duration and violation counts.',
        es: 'Las trazas y métricas propias salen por OTLP, entre ellas la duración de evaluación de límites y el conteo de violaciones.',
      },
    },
    {
      head: { en: 'One wager, followable.', es: 'Una apuesta, rastreable.' },
      cap: {
        en: 'Trace context travels in Kafka message headers, so a single wager can be followed across stages.',
        es: 'El contexto de traza viaja en las cabeceras de Kafka, así que una sola apuesta puede seguirse entre etapas.',
      },
    },
  ] as Pair[],
  states: {
    en: ['received', 'validated', 'completed', 'validation error', 'process error', 'invalid'],
    es: ['recibida', 'validada', 'completada', 'error de validación', 'error de proceso', 'inválida'],
  } as L10n<string[]>,
  /** Short labels on world tokens. */
  tok: { bet: { en: 'bet', es: 'apuesta' }, state: { en: 'state', es: 'estado' }, trace: { en: 'trace', es: 'traza' }, id: { en: 'id', es: 'id' } },

  /**
   * Decisions shown: JSON indices 0, 1, 2, 3, 5 (index 4 is about the legacy insertion path, outside this story).
   * Titles are verbatim; `why` is the JSON text, condensed where a sentence concerns something off the live path.
   */
  decisionIdx: [0, 1, 2, 3, 5] as const,
  decisionLines: [
    { en: ['Kafka as the backbone between', 'intake, validation and persistence'], es: ['Kafka como columna vertebral entre', 'recepción, validación y persistencia'] },
    { en: ['Limits engine as a pure', 'library, not a service'], es: ['Motor de límites como biblioteca', 'pura, no como servicio'] },
    { en: ['Authoritative second validation', 'under a per-player lock'], es: ['Segunda validación autoritativa', 'bajo bloqueo por jugador'] },
    { en: ['Dedicated notification', 'stream feeding SignalR'], es: ['Flujo de notificación dedicado', 'que alimenta SignalR'] },
    { en: ['Resilient HTTP clients', 'with explicit timeouts'], es: ['Clientes HTTP resilientes', 'con timeouts explícitos'] },
  ] as L10n<string[]>[],
  decisionWhy: [
    null,
    null,
    {
      en: 'A live wager is re-validated against the freshest limit snapshot and again under a per-player lock, so concurrent bets cannot jointly breach per-game caps.',
      es: 'Una apuesta en vivo se revalida contra la instantánea de límites más reciente y otra vez bajo un bloqueo por jugador, de modo que apuestas concurrentes no superen en conjunto los topes por juego.',
    },
    null,
    {
      en: 'All upstream calls use typed clients with retry, timeout and circuit-breaker policies. Failures translate into explicit business error keys instead of silent drops.',
      es: 'Todas las llamadas externas usan clientes tipados con políticas de reintento, timeout y circuit breaker. Los fallos se traducen en claves de error de negocio explícitas en lugar de pérdidas silenciosas.',
    },
  ] as (L10n | null)[],
  vig: {
    api: { en: 'api', es: 'api' },
    validate: { en: 'validate', es: 'validar' },
    snapshot: { en: 'snapshot', es: 'instantánea' },
    decision: { en: 'decision', es: 'decisión' },
    pass1: { en: '1st pass', es: '1.ª pasada' },
    pass2: { en: '2nd · lock', es: '2.ª · bloqueo' },
    services: { en: 'services', es: 'servicios' },
    topic: { en: 'one topic', es: 'un tópico' },
    hub: { en: 'hub', es: 'hub' },
    clients: { en: 'clients', es: 'clientes' },
    retry: { en: 'retry', es: 'reintento' },
    breaker: { en: 'breaker', es: 'breaker' },
    errorKey: { en: 'error key', es: 'clave de error' },
    client: { en: 'client', es: 'cliente' },
  },

  outcome: {
    scope: { en: 'The modernization, as a whole', es: 'La modernización, en conjunto' },
    /** Public resume metrics, as written there. `n` counts up. */
    metrics: [
      { n: 30, prefix: '', label: { en: 'less downtime', es: 'menos tiempo de inactividad' } },
      { n: 60, prefix: '', label: { en: 'faster', es: 'más rápido' } },
      { n: 40, prefix: '+', label: { en: 'concurrent users', es: 'usuarios concurrentes' } },
      { n: 50, prefix: '', label: { en: 'faster response', es: 'respuesta más rápida' } },
    ] as { n: number; prefix: string; label: L10n }[],
    closing: { en: ['Decoupled.', 'Ordered.', 'Idempotent.'], es: ['Desacoplada.', 'Ordenada.', 'Idempotente.'] } as L10n<string[]>,
  },
};

// Fidelity checks (run at module load, so `npm run verify` fails if the JSON and the copy drift apart).
for (const [k, di] of copy.decisionIdx.entries()) {
  for (const l of ['en', 'es'] as const) {
    const joined = copy.decisionLines[k][l].join(' ');
    if (joined !== project.decisions[di].title[l]) throw new Error(`story: decision ${di} title (${l}) differs from the project data: "${joined}"`);
  }
}
for (const l of ['en', 'es'] as const) {
  if (copy.titleLines[l].join(' ') !== project.title[l]) throw new Error(`story: poster title (${l}) differs from the project data`);
}
