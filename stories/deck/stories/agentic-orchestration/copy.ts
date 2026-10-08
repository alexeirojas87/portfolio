import type { L10n } from '../../shared/lang';
import { archOf, type ProjectData } from '../../shared/arch';
import raw from '../../../../src/content/projects/agentic-orchestration.json';

/**
 * Typed en/es dictionary for the agentic-orchestration story.
 *
 * Facts come ONLY from the project JSON (`src/content/projects/agentic-orchestration.json`):
 * node and edge text is read from it (see `arch`), decision "why" text is verbatim, and every other
 * sentence is a condensed excerpt. docs/CONTENT-AUDIT.md maps each beat to its JSON path.
 * Authored here: scene labels, short headlines, UI words (badges), and the rhythm of the beats.
 * The Cerberus prompt and the rate-limit numbers are ILLUSTRATIVE (see the audit). No company information.
 */
export const project = raw as unknown as ProjectData;
export const arch = archOf(project);

/** A headline + one-sentence caption pair, one per beat of a world or terminal scene. */
export interface Pair { head: L10n; cap: L10n }

export const copy = {
  startHint: { en: 'Click or press → to start', es: 'Clic o pulsa → para empezar' },
  storyLabel: { en: 'Project story', es: 'Historia del proyecto' },
  /** Title split in lines for the poster (joined with a space it equals `title` in the JSON). */
  titleLines: {
    en: ['Agentic Software', 'Delivery Platform'],
    es: ['Plataforma agéntica', 'de entrega de software'],
  } as L10n<string[]>,
  /** Illustrative boot lines: a command, then the phases named in the JSON summary. */
  boot: {
    en: ['$ agent run --item ready', '> requirements · qa · dev · review · ci', '> human gates armed'],
    es: ['$ agent run --item ready', '> requisitos · qa · dev · revisión · ci', '> puertas humanas activas'],
  } as L10n<string[]>,

  scene: {
    open: { en: 'Open', es: 'Inicio' },
    problem: { en: 'The problem', es: 'El problema' },
    idea: { en: 'The idea', es: 'La idea' },
    lifecycle: { en: 'The lifecycle', es: 'El ciclo de vida' },
    cerberus: { en: 'Cerberus', es: 'Cerberus' },
    gateway: { en: 'The LLM gateway', es: 'El gateway de LLM' },
    tools: { en: 'Tools, memory, code graph', es: 'Herramientas, memoria, grafo' },
    decisions: { en: 'Decisions, and why', es: 'Decisiones y por qué' },
    summary: { en: 'In short', es: 'En resumen' },
  },

  problem: {
    wanted: { en: ['Teams wanted', 'LLM-assisted delivery.'], es: ['Los equipos querían', 'entrega asistida por LLM.'] } as L10n<string[]>,
    couldNot: { en: 'Teams could not allow agents to…', es: 'Los equipos no podían permitir que los agentes…' },
    list: {
      en: ['talk directly to providers', 'leak sensitive data in prompts', 'hold unrestricted repository or backlog access', 'lose work when a long-running run crashed'],
      es: ['hablaran directo con los proveedores', 'filtraran datos sensibles en prompts', 'tuvieran acceso irrestricto al repositorio o al backlog', 'perdieran trabajo cuando una ejecución larga fallaba'],
    } as L10n<string[]>,
    challenge: { en: ['Auditable.', 'Resumable.', 'Governed.'], es: ['Auditable.', 'Reanudable.', 'Gobernado.'] } as L10n<string[]>,
    notAdHoc: { en: 'Not a chain of ad hoc prompts.', es: 'No una cadena de prompts ad hoc.' },
  },

  idea: {
    work: { en: ['Agents do', 'the work.'], es: ['Los agentes', 'hacen el trabajo.'] } as L10n<string[]>,
    /** Split on " · " into one chip each. */
    workList: {
      en: 'Requirements · QA planning · development · adversarial review · CI repair',
      es: 'Requisitos · planificación de QA · desarrollo · revisión adversarial · reparación de CI',
    },
    decide: { en: ['Humans', 'decide.'], es: ['Las personas', 'deciden.'] } as L10n<string[]>,
    decideCap: { en: 'Human approval gates at every critical step.', es: 'Aprobación humana en cada paso crítico.' },
    gateLabel: { en: 'Approval gate', es: 'Puerta de aprobación' },
    four: { en: 'Four role-specific agents.', es: 'Cuatro agentes, uno por rol.' },
  },

  /** Lifecycle world: one pair per beat (7 beats). */
  lifecycle: [
    {
      head: { en: 'A ready signal starts a run.', es: 'Una señal inicia la ejecución.' },
      cap: {
        en: 'A work item marked ready signals the orchestrator through a webhook. Phase, pending work and lease are persisted.',
        es: 'Un ítem marcado como listo avisa al orquestador mediante un webhook. Se persisten la fase, el trabajo pendiente y el lease.',
      },
    },
    {
      head: { en: 'Definition, then QA planning.', es: 'Definición y luego plan de QA.' },
      cap: {
        en: 'The orchestrator dispatches each phase to a role-specific agent.',
        es: 'El orquestador despacha cada fase a un agente especializado en su rol.',
      },
    },
    {
      head: { en: 'A plan a human approves.', es: 'Un plan que aprueba una persona.' },
      cap: {
        en: 'The dev agent drafts a reviewable plan that waits for approval, then implements.',
        es: 'El agente de desarrollo redacta un plan revisable que espera aprobación y luego implementa.',
      },
    },
    {
      head: { en: 'Review, rework, escalate.', es: 'Revisar, rehacer, escalar.' },
      cap: {
        en: 'Findings return to the dev agent as structured rework, with a bounded number of iterations before a person steps in.',
        es: 'Los hallazgos regresan al agente de desarrollo como retrabajo estructurado, con un número acotado de iteraciones antes de que intervenga una persona.',
      },
    },
    {
      head: { en: 'Pull request, CI watched and fixed.', es: 'Pull request, CI vigilado y reparado.' },
      cap: {
        en: 'The orchestrator publishes the pull request, then watches CI status and PR feedback. Failures go back to be fixed.',
        es: 'El orquestador publica el pull request y vigila el estado del CI y el feedback del PR. Los fallos vuelven para repararse.',
      },
    },
    {
      head: { en: 'A person approves the last gate.', es: 'Una persona aprueba la última puerta.' },
      cap: {
        en: 'Approvals and clarifications come from the portal or as chat cards; the run is parked until someone answers.',
        es: 'Las aprobaciones y aclaraciones llegan desde el portal o como tarjetas de chat; la ejecución queda en pausa hasta que alguien responde.',
      },
    },
    {
      head: { en: 'State survives restarts.', es: 'El estado sobrevive reinicios.' },
      cap: {
        en: 'Phase, pending work and execution lease are persisted, so runs resume exactly where they stopped.',
        es: 'Se persisten la fase, el trabajo pendiente y el lease, de modo que las ejecuciones retoman exactamente donde se detuvieron.',
      },
    },
  ] as Pair[],

  badge: {
    awaiting: { en: 'Awaiting approval', es: 'Esperando aprobación' },
    approved: { en: 'Approved', es: 'Aprobado' },
    rework: { en: 'Rework', es: 'Retrabajo' },
    ciFail: { en: 'CI failed', es: 'CI falló' },
    ciOk: { en: 'CI passed', es: 'CI correcto' },
    persisted: { en: 'Persisted', es: 'Persistido' },
    resumed: { en: 'Resumed', es: 'Reanudado' },
    crash: { en: 'Crash', es: 'Caída' },
    limit: { en: 'Limit', es: 'Límite' },
  },

  /** Cerberus terminal scene. The prompt itself lives in prompts.ts. */
  cerberus: [
    {
      head: { en: 'An agent writes a prompt.', es: 'Un agente escribe un prompt.' },
      cap: {
        en: 'Before routing, the gateway hands it to Cerberus, an in-process prompt-safety layer.',
        es: 'Antes del enrutamiento, el gateway se lo entrega a Cerberus, una capa de seguridad de prompts en proceso.',
      },
    },
    {
      head: { en: 'Cerberus scans it.', es: 'Cerberus lo escanea.' },
      cap: {
        en: 'Shared detection rules look for secrets, credentials and personal or payment data.',
        es: 'Reglas de detección compartidas buscan secretos, credenciales y datos personales o de pago.',
      },
    },
    {
      head: { en: 'Blocked before it leaves.', es: 'Bloqueado antes de salir.' },
      cap: {
        en: 'Sensitive content never reaches an external provider, with no extra network hop.',
        es: 'El contenido sensible nunca llega a un proveedor externo, sin salto de red adicional.',
      },
    },
    {
      head: { en: 'A clean prompt passes.', es: 'Un prompt limpio pasa.' },
      cap: {
        en: 'Rules are shared data, so they evolve without redeploying the gateway.',
        es: 'Las reglas son datos compartidos, por lo que evolucionan sin redesplegar el gateway.',
      },
    },
  ] as Pair[],
  mark: {
    credential: { en: 'credential', es: 'credencial' },
    pii: { en: 'personal data', es: 'dato personal' },
    secret: { en: 'secret key', es: 'clave secreta' },
    redacted: { en: 'redacted', es: 'redactado' },
  },
  verdict: {
    blocked: { en: 'Blocked', es: 'Bloqueado' },
    blockedCap: { en: 'before leaving the trust boundary', es: 'antes de salir del límite de confianza' },
    allowed: { en: 'Allowed', es: 'Permitido' },
    allowedCap: { en: 'clean: routed to the provider', es: 'limpio: se enruta al proveedor' },
    boundary: { en: 'Cerberus · trust boundary', es: 'Cerberus · límite de confianza' },
  },

  /** Gateway world (4 beats). */
  gateway: [
    {
      head: { en: 'Every model call, one gateway.', es: 'Toda llamada al modelo, un gateway.' },
      cap: {
        en: 'The gateway only provides safe, audited, routed model access; it knows nothing about work items or branches.',
        es: 'El gateway solo ofrece acceso al modelo seguro, auditado y enrutado; no sabe nada de ítems ni de ramas.',
      },
    },
    {
      head: { en: 'Rate limits, per role.', es: 'Límites de tasa, por rol.' },
      cap: {
        en: 'Role-based routing and per-role rate limiting keep each agent inside its own budget.',
        es: 'El enrutamiento por rol y los límites de tasa por rol mantienen a cada agente dentro de su presupuesto.',
      },
    },
    {
      head: { en: 'Routed, with automatic fallback.', es: 'Enrutado, con fallback automático.' },
      cap: {
        en: 'Scan first, then call the primary provider. If it fails, fallback with circuit breaking keeps the request alive.',
        es: 'Primero se escanea y luego se llama al proveedor principal. Si falla, el fallback con circuit breaker mantiene viva la solicitud.',
      },
    },
    {
      head: { en: 'The answer is scanned, then audited.', es: 'La respuesta se escanea y se audita.' },
      cap: {
        en: 'Responses are scanned on the way out, and every allowed or rejected call is audited.',
        es: 'Las respuestas se escanean al salir, y cada llamada permitida o rechazada queda auditada.',
      },
    },
  ] as Pair[],

  /** Tools world (4 beats): map, hub, calls, graph. */
  tools: [
    {
      head: { en: 'Orchestrator, gateway, tools.', es: 'Orquestador, gateway, herramientas.' },
      cap: {
        en: 'Workflow state, tools and memory live in the orchestrator and agent runtimes; the gateway only provides model access.',
        es: 'El estado, las herramientas y la memoria viven en el orquestador y los runtimes de agentes; el gateway solo da acceso al modelo.',
      },
    },
    {
      head: { en: 'Tools live on the MCP server.', es: 'Herramientas en el servidor MCP.' },
      cap: {
        en: 'Permissions per agent role and branch rules are enforced server-side, and no generic mutation tool exists.',
        es: 'Los permisos por rol y las reglas de ramas se validan en el servidor, y no existe una herramienta genérica de mutación.',
      },
    },
    {
      head: { en: 'One scoped tool at a time.', es: 'Una herramienta acotada a la vez.' },
      cap: {
        en: 'Memory and code-graph context, isolated edits and tests, then a branch and a pull request: all through scoped tools.',
        es: 'Memoria y contexto del grafo, ediciones y pruebas aisladas, luego una rama y un pull request: todo con herramientas acotadas.',
      },
    },
    {
      head: { en: 'Context from a code graph.', es: 'Contexto desde un grafo de código.' },
      cap: {
        en: 'An immutable, commit-addressed graph gives agents precise context instead of raw file dumps.',
        es: 'Un grafo inmutable, direccionado por commit, da a los agentes contexto preciso en lugar de volcados de archivos.',
      },
    },
  ] as Pair[],

  /** Decision titles split in two lines; joined with a space each equals `decisions[i].title` in the JSON. */
  decisionLines: [
    { en: ['The agent is not the model,', 'and the gateway is not the agent'], es: ['El agente no es el modelo', 'y el gateway no es el agente'] },
    { en: ['Durable, leased state machine', 'instead of in-memory loops'], es: ['Máquina de estados durable con leases', 'en lugar de bucles en memoria'] },
    { en: ['Prompt safety as an', 'in-process pre-flight gate'], es: ['Seguridad de prompts como', 'compuerta previa en proceso'] },
    { en: ['Separate roles and providers', 'for builder and reviewer'], es: ['Roles y proveedores separados', 'para constructor y revisor'] },
    { en: ['Tools enforced by the MCP server,', 'not by prompt text'], es: ['Herramientas impuestas por el servidor', 'MCP, no por texto del prompt'] },
    { en: ['Immutable commit-addressed', 'code graph'], es: ['Grafo de código inmutable', 'direccionado por commit'] },
  ] as L10n<string[]>[],
  /** Words inside the decision vignettes. */
  vig: {
    agent: { en: 'agent', es: 'agente' },
    gateway: { en: 'gateway', es: 'gateway' },
    model: { en: 'model', es: 'modelo' },
    lease: { en: 'lease', es: 'lease' },
    builder: { en: 'builder', es: 'constructor' },
    reviewer: { en: 'reviewer', es: 'revisor' },
    scoped: { en: 'role-scoped', es: 'por rol' },
  },

  summary: {
    closing: { en: ['Auditable.', 'Resumable.', 'Governed.'], es: ['Auditable.', 'Reanudable.', 'Gobernado.'] } as L10n<string[]>,
  },
};

// Fidelity checks (run at module load, so `npm run verify` fails if the JSON and the copy drift apart).
for (const [i, d] of copy.decisionLines.entries()) {
  for (const l of ['en', 'es'] as const) {
    const joined = d[l].join(' ');
    if (joined !== project.decisions[i].title[l]) {
      throw new Error(`story: decision ${i + 1} title (${l}) differs from the project data: "${joined}"`);
    }
  }
}
for (const l of ['en', 'es'] as const) {
  if (copy.titleLines[l].join(' ') !== project.title[l]) throw new Error(`story: poster title (${l}) differs from the project data`);
}
