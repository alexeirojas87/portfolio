import type { L10n } from '../../shared/lang';
import { archOf, type ProjectData } from '../../shared/arch';
import raw from '../../../../src/content/projects/crypto-payments.json';

/**
 * Typed en/es dictionary of the crypto-payments story.
 *
 * Facts come ONLY from the project JSON (`src/content/projects/crypto-payments.json`): node and edge text is read from it
 * (see `arch`), decision "why" text is verbatim, every other sentence is a condensed excerpt. The one figure from outside
 * the JSON is the public resume metric (20% faster transaction processing), attributed on stage.
 * ILLUSTRATIVE (flagged in docs/CONTENT-AUDIT.md): boot lines, message keys, transaction hash, the 1/3 to 3/3 confirmation
 * counter, queue depth, the polling-versus-push timing. No company information.
 */
export const project = raw as unknown as ProjectData;
export const arch = archOf(project);

/** headline + one-sentence caption pair, one per beat of a world or terminal scene. */
export interface Pair { head: L10n; cap: L10n }

export const copy = {
  startHint: { en: 'Click or press → start', es: 'Clic o pulsa → para empezar' },
  storyLabel: { en: 'Project story', es: 'Historia del proyecto' },
  /** Title split in lines for the poster (joined with a space it equals `title` in the JSON). */
  titleLines: {
    en: ['Crypto Payments', 'Platform'],
    es: ['Plataforma de pagos', 'con criptomonedas'],
  } as L10n<string[]>,
  /** Illustrative boot lines: a request in, the three states the JSON names, the acknowledgement. */
  boot: {
    en: ['$ pay --coin btc', '> validated · pending · queued', '> acknowledged · awaiting chain'],
    es: ['$ pay --coin btc', '> validado · pendiente · en cola', '> confirmado · esperando la cadena'],
  } as L10n<string[]>,

  scene: {
    open: { en: 'Open', es: 'Apertura' },
    problem: { en: 'The problem', es: 'El problema' },
    intake: { en: 'Payment intake', es: 'Recepción del pago' },
    execution: { en: 'On-chain execution', es: 'Ejecución on-chain' },
    idempotent: { en: 'Never paid twice', es: 'Nunca se paga dos veces' },
    confirmation: { en: 'Confirmation and push', es: 'Confirmación y notificación' },
    decisions: { en: 'Decisions, why', es: 'Decisiones y por qué' },
    outcome: { en: 'Outcome', es: 'Resultado' },
  },

  problem: {
    wanted: { en: ['Merchants wanted', 'any cryptocurrency.'], es: ['Los comercios querían', 'cualquier criptomoneda.'] } as L10n<string[]>,
    noIntegration: { en: 'Without building blockchain integrations.', es: 'Sin construir integraciones con blockchains.' },
    coins: { en: ['Bitcoin', 'Ethereum', 'Litecoin', 'and more'], es: ['Bitcoin', 'Ethereum', 'Litecoin', 'y más'] } as L10n<string[]>,
    slow: { en: ['On-chain is slow', 'and can fail.'], es: ['On-chain es lento', 'y puede fallar.'] } as L10n<string[]>,
    slowCap: { en: 'Slow to confirm. It can take minutes.', es: 'Tarda en confirmarse. Puede llevar minutos.' },
    waiting: { en: 'waiting for confirmation', es: 'esperando confirmación' },
    failed: { en: 'failed', es: 'falló' },
    challenge: { en: ['Accept reliably.', 'Execute safely.', 'Tell clients.'], es: ['Aceptar con fiabilidad.', 'Ejecutar con seguridad.', 'Avisar al cliente.'] } as L10n<string[]>,
    challengeCap: { en: 'The moment the outcome is final.', es: 'En cuanto el resultado sea definitivo.' },
  },

  /** Payment intake world (5 beats). */
  intake: [
    {
      head: { en: 'The checkout calls one API.', es: 'El checkout llama a una sola API.' },
      cap: { en: 'No blockchain code on the merchant side: one payment request to the payment API.', es: 'Sin código blockchain en el comercio: una solicitud de pago a la API de pagos.' },
    },
    {
      head: { en: 'Validated, stored as pending.', es: 'Validado y guardado como pendiente.' },
      cap: { en: 'The API validates the request and persists the payment as pending in SQL Server.', es: 'La API valida la solicitud y persiste el pago como pendiente en SQL Server.' },
    },
    {
      head: { en: 'Then queued on RabbitMQ.', es: 'Luego, a la cola de RabbitMQ.' },
      cap: { en: 'The request is enqueued for asynchronous execution.', es: 'La solicitud se encola para su ejecución asíncrona.' },
    },
    {
      head: { en: 'Acknowledged at once.', es: 'Confirmado al instante.' },
      cap: { en: 'The merchant gets an immediate acknowledgement; the on-chain work has not even started.', es: 'El comercio recibe un acuse inmediato; el trabajo on-chain ni siquiera ha empezado.' },
    },
    {
      head: { en: 'The queue absorbs the bursts.', es: 'La cola absorbe los picos.' },
      cap: { en: 'Accepted requests wait safely in the queue while the heavy work happens asynchronously.', es: 'Las solicitudes aceptadas esperan seguras en la cola mientras el trabajo pesado ocurre de forma asíncrona.' },
    },
  ] as Pair[],
  rails: {
    ack: { en: 'acknowledgement', es: 'acuse' },
    ackVal: { en: 'instant', es: 'inmediato' },
    chain: { en: 'on-chain', es: 'on-chain' },
    chainVal: { en: 'minutes', es: 'minutos' },
  },

  /** Execution world (4 beats). */
  execution: [
    {
      head: { en: 'The executor takes it from the queue.', es: 'El ejecutor la toma de la cola.' },
      cap: { en: 'It consumes the request and signs the transaction with the user’s wallet.', es: 'Consume la solicitud y firma la transacción con la billetera del usuario.' },
    },
    {
      head: { en: 'One contract, three coins.', es: 'Un contrato, tres monedas.' },
      cap: { en: 'Coin adapters give Bitcoin, Ethereum and Litecoin a common execution contract, then broadcast through the node.', es: 'Los adaptadores dan a Bitcoin, Ethereum y Litecoin un contrato de ejecución común y emiten por el nodo.' },
    },
    {
      head: { en: 'Hash recorded, status submitted.', es: 'Hash registrado, estado enviado.' },
      cap: { en: 'The executor stores the transaction hash and the submitted status in SQL Server, and is free again.', es: 'El ejecutor guarda el hash y el estado enviado en SQL Server, y queda libre de nuevo.' },
    },
    {
      head: { en: 'Failures go to the dead-letter queue.', es: 'Los fallos van a la cola de fallidos.' },
      cap: { en: 'Messages that keep failing are kept for inspection instead of being lost or blocking the flow.', es: 'Los mensajes que siguen fallando se conservan para inspección, en lugar de perderse o bloquear el flujo.' },
    },
  ] as Pair[],
  coins: ['BTC', 'ETH', 'LTC'],
  badge: {
    pending: { en: 'Pending', es: 'Pendiente' },
    signed: { en: 'Signed', es: 'Firmado' },
    submitted: { en: 'Submitted', es: 'Enviado' },
    accepted: { en: 'Accepted', es: 'Aceptado' },
    confirmed: { en: 'Confirmed', es: 'Confirmado' },
    failed: { en: 'Failed', es: 'Falló' },
    dead: { en: 'Dead-lettered', es: 'En cola de fallidos' },
    tx: { en: 'tx 9c4e…demo', es: 'tx 9c4e…demo' },
    event: { en: 'payment-confirmed', es: 'pago-confirmado' },
    illustrative: { en: 'illustrative', es: 'ilustrativo' },
    confirmations: { en: 'confirmations', es: 'confirmaciones' },
  },

  /** Idempotency scene (3 beats): a message log, the redelivery, the verdict. Text itself lives in prompts.ts. */
  idem: [
    {
      head: { en: 'First delivery: paid once.', es: 'Primera entrega: se paga una vez.' },
      cap: { en: 'Each payment carries a unique key, and the handler checks persisted state before acting.', es: 'Cada pago lleva una clave única, y el manejador revisa el estado persistido antes de actuar.' },
    },
    {
      head: { en: 'The same message comes back.', es: 'El mismo mensaje vuelve.' },
      cap: { en: 'Messaging is at-least-once, so a redelivery will happen. It is normal, not an error.', es: 'La mensajería es at-least-once, así que habrá reentregas. Es normal, no un error.' },
    },
    {
      head: { en: 'Absorbed. Never paid twice.', es: 'Absorbido. Nunca se paga dos veces.' },
      cap: { en: 'The key is already in the persisted state, so no second on-chain transaction is submitted.', es: 'La clave ya está en el estado persistido, así que no se envía una segunda transacción on-chain.' },
    },
  ] as Pair[],
  idemUi: {
    delivered: { en: 'delivered', es: 'entregado' },
    paid: { en: 'paid on-chain', es: 'pagado on-chain' },
    key: { en: 'key', es: 'clave' },
    absorbed: { en: 'absorbed', es: 'absorbido' },
    skip: { en: 'skipped', es: 'omitido' },
  },

  /** Confirmation world (3 beats) + the push-versus-polling overlay (beat 4). */
  confirmation: [
    {
      head: { en: 'Fast to send. Slow to be final.', es: 'Rápido de enviar, lento de confirmar.' },
      cap: { en: 'A dedicated watcher polls the nodes for confirmations, which can take minutes, without blocking the executor.', es: 'Un watcher dedicado consulta los nodos por confirmaciones, algo que puede tardar minutos, sin bloquear al ejecutor.' },
    },
    {
      head: { en: 'Confirmed, then an event.', es: 'Confirmado, y luego un evento.' },
      cap: { en: 'The watcher marks the payment confirmed in SQL Server and publishes a payment-confirmed event.', es: 'El watcher marca el pago como confirmado en SQL Server y publica un evento de pago confirmado.' },
    },
    {
      head: { en: 'The notifier pushes the result.', es: 'El notificador envía el resultado.' },
      cap: { en: 'It consumes the event and pushes the outcome to the merchant in real time over SignalR.', es: 'Consume el evento y envía el resultado al comercio en tiempo real mediante SignalR.' },
    },
    {
      head: { en: 'Push, not polling.', es: 'Push, no polling.' },
      cap: { en: 'Clients learn the outcome the moment the event arrives, with less load and lower latency.', es: 'Los clientes conocen el resultado en cuanto llega el evento, con menos carga y menor latencia.' },
    },
  ] as Pair[],
  lanes: {
    poll: { en: 'Polling', es: 'Polling' },
    push: { en: 'Push', es: 'Push' },
    notYet: { en: 'not yet', es: 'aún no' },
    done: { en: 'done', es: 'listo' },
    client: { en: 'client', es: 'cliente' },
    server: { en: 'server', es: 'servidor' },
    late: { en: 'a request later', es: 'una consulta después' },
    now: { en: 'the moment it lands', es: 'en cuanto ocurre' },
  },

  /** Decision titles split in two lines; joined with a space each equals `decisions[i].title` in the JSON. */
  decisionLines: [
    { en: ['RabbitMQ as the bus', 'between microservices'], es: ['RabbitMQ como bus', 'entre microservicios'] },
    { en: ['Idempotent', 'processing'], es: ['Procesamiento', 'idempotente'] },
    { en: ['Separate execution', 'from confirmation'], es: ['Separar ejecución', 'de confirmación'] },
    { en: ['SignalR push', 'instead of polling'], es: ['Push con SignalR', 'en lugar de polling'] },
    { en: ['SQL Server as the', 'system of record'], es: ['SQL Server como', 'sistema de registro'] },
  ] as L10n<string[]>[],
  /** Words inside decision vignettes. */
  vig: {
    api: { en: 'API', es: 'API' },
    queue: { en: 'queue', es: 'cola' },
    worker: { en: 'worker', es: 'worker' },
    down: { en: 'down', es: 'caído' },
    safe: { en: 'kept safe', es: 'a salvo' },
    key: { en: 'same key', es: 'misma clave' },
    once: { en: '×1', es: '×1' },
    quick: { en: 'send: quick', es: 'envío: rápido' },
    slow: { en: 'finality: slow', es: 'finalidad: lenta' },
    executor: { en: 'executor', es: 'ejecutor' },
    watcher: { en: 'watcher', es: 'watcher' },
    free: { en: 'free', es: 'libre' },
    pending: { en: 'pending', es: 'pendiente' },
    submitted: { en: 'submitted', es: 'enviado' },
    confirmed: { en: 'confirmed', es: 'confirmado' },
  },

  outcome: {
    metric: { en: '20%', es: '20%' },
    faster: { en: ['faster transaction', 'processing'], es: ['más rápido el', 'procesamiento'] } as L10n<string[]>,
    attribution: { en: 'Blockchain adoption work · public resume metric', es: 'Trabajo de adopción de blockchain · métrica pública del currículum' },
    closing: { en: ['Accepted instantly.', 'Confirmed safely.', 'Pushed live.'], es: ['Aceptado al instante.', 'Confirmado con seguridad.', 'Entregado en vivo.'] } as L10n<string[]>,
  },
} as const;

// the authored splits must reproduce the JSON titles exactly, so a renamed decision cannot drift silently
for (const [i, d] of project.decisions.entries()) {
  for (const l of ['en', 'es'] as const) {
    if (copy.decisionLines[i][l].join(' ') !== d.title[l]) throw new Error(`story: decision ${i + 1} title (${l}) differs from project data`);
  }
}
for (const l of ['en', 'es'] as const) {
  if (copy.titleLines[l].join(' ') !== project.title[l]) throw new Error(`story: poster title (${l}) differs from project data`);
}
