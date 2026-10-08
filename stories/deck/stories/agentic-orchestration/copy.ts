import type { L10n } from '../../shared/lang';
import { archOf, type ProjectData } from '../../shared/arch';
import raw from '../../../../src/content/projects/agentic-orchestration.json';

/**
 * Typed en/es dictionary for the agentic-orchestration story.
 *
 * Facts come ONLY from the project JSON (`src/content/projects/agentic-orchestration.json`):
 * node and edge text is read from it directly (see `arch`), decision "why" text is verbatim, and every
 * sentence below is a condensed or verbatim excerpt. docs/CONTENT-AUDIT.md maps each beat to its JSON path.
 * Authored here: scene labels, short headlines, and the rhythm of the beats. No company information.
 */
export const project = raw as unknown as ProjectData;
export const arch = archOf(project);

/** A headline + one-sentence caption pair, one per beat of a diagram scene. */
export interface Pair { head: L10n; cap: L10n }

export const copy = {
  startHint: { en: 'Click or press → to start', es: 'Clic o pulsa → para empezar' },
  storyLabel: { en: 'Project story', es: 'Historia del proyecto' },
  /** Title split in lines for the poster (joined with a space it equals `title` in the JSON). */
  titleLines: {
    en: ['Agentic Software', 'Delivery Platform'],
    es: ['Plataforma agéntica', 'de entrega de software'],
  } as L10n<string[]>,

  scene: {
    open: { en: 'Open', es: 'Inicio' },
    problem: { en: 'The problem', es: 'El problema' },
    idea: { en: 'The idea', es: 'La idea' },
    lifecycle: { en: 'The lifecycle', es: 'El ciclo de vida' },
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
    workCap: {
      en: 'Requirements · QA planning · development · adversarial review · CI repair',
      es: 'Requisitos · planificación de QA · desarrollo · revisión adversarial · reparación de CI',
    },
    decide: { en: ['Humans', 'decide.'], es: ['Las personas', 'deciden.'] } as L10n<string[]>,
    decideCap: { en: 'Human approval gates at every critical step.', es: 'Aprobación humana en cada paso crítico.' },
    four: { en: 'Four role-specific agents.', es: 'Cuatro agentes, uno por rol.' },
  },

  lifecycle: [
    {
      head: { en: 'A ready signal starts a run.', es: 'Una señal inicia la ejecución.' },
      cap: {
        en: 'A work item marked ready signals the orchestrator through a webhook.',
        es: 'Un ítem de trabajo marcado como listo avisa al orquestador mediante un webhook.',
      },
    },
    {
      head: { en: 'State survives restarts.', es: 'El estado sobrevive reinicios.' },
      cap: {
        en: 'Phase, pending work and execution lease are persisted, so runs resume exactly where they stopped.',
        es: 'Se persisten la fase, el trabajo pendiente y el lease, de modo que las ejecuciones retoman exactamente donde se detuvieron.',
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
        en: 'Review findings return to the dev agent as structured rework, with a bounded number of iterations before a person steps in.',
        es: 'Los hallazgos regresan al agente de desarrollo como retrabajo estructurado, con un número acotado de iteraciones antes de que intervenga una persona.',
      },
    },
    {
      head: { en: 'Pull request, CI watched.', es: 'Pull request y CI vigilado.' },
      cap: {
        en: 'The orchestrator publishes the pull request, then watches CI status and PR feedback.',
        es: 'El orquestador publica el pull request y luego vigila el estado del CI y el feedback del PR.',
      },
    },
    {
      head: { en: 'A person approves each gate.', es: 'Una persona aprueba cada puerta.' },
      cap: {
        en: 'Approvals and clarifications arrive from the portal or as chat cards; the run is parked until someone answers.',
        es: 'Las aprobaciones y aclaraciones llegan desde el portal o como tarjetas de chat; la ejecución queda en pausa hasta que alguien responde.',
      },
    },
  ] as Pair[],

  gateway: [
    {
      head: { en: 'One path for every model call.', es: 'Un solo camino al modelo.' },
      cap: {
        en: 'The gateway only provides safe, audited, routed model access; it knows nothing about work items or branches.',
        es: 'El gateway solo ofrece acceso al modelo seguro, auditado y enrutado; no sabe nada de ítems ni de ramas.',
      },
    },
    {
      head: { en: 'Scanned before it leaves.', es: 'Escaneado antes de salir.' },
      cap: {
        en: 'Cerberus scans the prompt in process and blocks secrets, credentials and personal or payment data. No extra network hop.',
        es: 'Cerberus escanea el prompt en proceso y bloquea secretos, credenciales y datos personales o de pago. Sin salto de red adicional.',
      },
    },
    {
      head: { en: 'Routed by role, with fallback.', es: 'Enrutado por rol, con fallback.' },
      cap: {
        en: 'A hosted primary, a hosted fallback and a self-hosted option, with bounded retries and circuit breaking.',
        es: 'Un proveedor principal, un fallback y una opción autoalojada, con reintentos acotados y circuit breaker.',
      },
    },
    {
      head: { en: 'The answer is scanned too.', es: 'La respuesta también se escanea.' },
      cap: {
        en: 'Responses are scanned on the way out, and every allowed or rejected call is audited.',
        es: 'Las respuestas se escanean al salir, y cada llamada permitida o rechazada queda auditada.',
      },
    },
  ] as Pair[],

  tools: [
    {
      head: { en: 'Tools live on the MCP server.', es: 'Herramientas en el servidor MCP.' },
      cap: {
        en: 'Permissions per agent role and branch rules are enforced server-side, and no generic mutation tool exists.',
        es: 'Los permisos por rol y las reglas de ramas se validan en el servidor, y no existe una herramienta genérica de mutación.',
      },
    },
    {
      head: { en: 'Isolated builds, episodic memory.', es: 'Builds aislados, memoria episódica.' },
      cap: {
        en: 'A sandboxed workspace clones, edits, builds and tests; vector memory is reached only through scoped tools.',
        es: 'Un workspace aislado clona, edita, compila y prueba; la memoria vectorial solo se alcanza mediante herramientas acotadas.',
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

  summary: {
    why: { en: 'The whole system, in four lines.', es: 'Todo el sistema, en cuatro líneas.' },
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
