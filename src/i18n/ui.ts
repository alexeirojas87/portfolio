export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const en = {
  'site.name': 'Alexei Rojas Quiroga',
  'site.role': 'Senior .NET backend engineer',
  'site.description':
    'Portfolio of distributed .NET systems and AI platform engineering: architecture, flows and decisions.',
  'nav.projects': 'Projects',
  'nav.about': 'About',
  'nav.primary': 'Primary',
  'nav.skip': 'Skip to content',
  'lang.switch': 'Language',
  'lang.en': 'English',
  'lang.es': 'Español',
  'footer.note': 'Mockup build with sample data.',
  'footer.contact': 'Contact',

  'hero.eyebrow':
    'Senior .NET backend engineer · distributed systems · AI platforms',
  'hero.title':
    'I build distributed systems — here is how they work inside.',
  'hero.lead':
    'Twelve years of .NET services that handle payments, live odds and real-time messaging, and now the gateways and agents that put LLMs into production safely. Every project below comes with a diagram you can play.',
  'hero.title.a': 'I build distributed systems',
  'hero.title.b': 'here is how they work inside.',
  'hero.cta.projects': 'See the systems',
  'hero.cta.about': 'About me',
  'hero.trace': 'trace',
  'hero.caption': 'Live view of a real architecture: {title}',

  'home.personal.label': 'Personal',
  'home.corporate.label':
    'Client work',
  'home.personal.title': 'Personal projects',
  'home.corporate.title':
    'Client projects',
  'home.systems': '{n} systems',
  'home.corporate.note':
    'Systems I built for employers, presented company-agnostic: the architecture is shown, names and code are withheld.',
  'home.personal.note': 'Built on my own time, with public repositories and live demos where available.',

  'home.work.eyebrow': 'Selected work',
  'home.work.title': 'Systems I have built',
  'home.capabilities': 'What I work with',
  'hero.now': 'Now showing',
  'hero.dot': 'Show {title}',
  'detail.what': 'What it does',
  'detail.built': 'What I built',
  'detail.prev': 'Previous project',
  'detail.next': 'Next project',
  'card.open': 'View architecture →',
  'card.diagram.alt': 'Architecture preview with {nodes} components and {flows} flows.',

  'status.live': 'Live',
  'status.production': 'In production',
  'status.in-progress': 'In progress',
  'status.prototype': 'Prototype',

  'detail.back': 'All projects',
  'detail.role': 'Role',
  'detail.year': 'Year',
  'detail.links': 'Links',
  'detail.link.live': 'Live site',
  'detail.link.github': 'GitHub',
  'detail.summary': 'Summary',
  'detail.problem': 'The problem',
  'detail.architecture': 'Architecture',
  'detail.stack': 'Tech stack',
  'detail.highlights': 'Highlights',
  'detail.decisions': 'Key decisions and why',
  'detail.video': 'Walkthrough',
  'detail.video.soon': 'Walkthrough video coming soon',
  'detail.corporate.note': 'Presented company-agnostic: architecture and decisions only.',
  'detail.category.personal': 'Personal project',
  'detail.category.corporate': 'Corporate project',

  'stack.language': 'Languages',
  'stack.backend': 'Backend',
  'stack.frontend': 'Frontend',
  'stack.data': 'Data',
  'stack.messaging': 'Messaging',
  'stack.cloud': 'Cloud',
  'stack.devops': 'DevOps',
  'stack.ai': 'AI',
  'stack.testing': 'Testing',
  'stack.other': 'Other',

  'diagram.label': 'Architecture diagram',
  'diagram.eyebrow': 'Architecture · {nodes} nodes · {flows} flows',
  'diagram.flows': 'Flows',
  'diagram.play': 'Play',
  'diagram.pause': 'Pause',
  'diagram.prev': 'Previous step',
  'diagram.next': 'Next step',
  'diagram.restart': 'Restart',
  'diagram.step': 'Step {n} of {total}',
  'diagram.reduced': 'Reduced motion is on: the active path is highlighted without animation.',
  'diagram.legend.sync': 'Synchronous',
  'diagram.legend.async': 'Async / loop',
  'diagram.legend.active': 'Active',
  'diagram.legend.done': 'Completed',
  'diagram.scroll': 'Scroll sideways to see the full diagram',
  'diagram.alt': 'Diagram of {nodes} components: {names}.',
  'diagram.legend.title': 'Legend',
  'diagram.boundary': 'What I built',
  'kindclass.compute': 'Service / compute',
  'kindclass.data': 'Data store',
  'kindclass.queue': 'Queue / messaging',
  'kindclass.ai': 'AI',
  'kindclass.client': 'Client',
  'kindclass.external': 'External system',
  'diagram.steps': 'How it flows, step by step',
  'diagram.hint': 'Click a step to jump to it. Hover a component to trace its connections.',

  'about.title': 'About me',
  'about.eyebrow': 'Profile',
  'about.lead':
    'I build distributed .NET systems: microservices, real-time processing and payment gateways, with 12+ years in production.',
  'about.summary.1':
    'I own backend architecture and end-to-end delivery, from service design to Azure deployment and CI/CD. My daily stack is C# and .NET up to .NET 10, SQL Server and T-SQL, Redis, Kafka and RabbitMQ.',
  'about.summary.2':
    'Recently I brought AI into production through .NET LLM gateways with rate limiting, retries, provider health monitoring and auditing.',
  'about.capabilities': 'Capabilities',
  'about.cap.backend': 'Backend & Architecture',
  'about.cap.data': 'Data & Messaging',
  'about.cap.cloud': 'Cloud & Delivery',
  'about.cap.ai': 'AI Integration',
  'about.career': 'Career arc',
  'about.research': 'Applied research',
  'about.education': 'Education',
  'about.languages': 'Languages',
  'about.contact': 'Contact',
  'about.education.degree': 'Computer Science Engineer',
  'about.education.training.1': 'Training in Japan: PBX interface development',
  'about.education.training.2': 'Training in China: vIMS network operations',
  'about.lang.es': 'Spanish: native',
  'about.lang.en': 'English: B2',
  'about.research.1': 'Vector database evaluation',
  'about.research.2': 'LLM evaluation harness',
  'about.research.3': 'Agent context orchestration',
  'about.research.4': 'Prompt compression benchmark',
  'about.career.1.when': '2013 – 2020',
  'about.career.1.what': 'Telecom software: real-time processing, IP protocol libraries and legacy modernization.',
  'about.career.2.when': '2020 – present',
  'about.career.2.what': 'Distributed microservices for high-traffic, real-time platforms.',
  'about.career.3.when': '2021 – 2023',
  'about.career.3.what': 'Crypto payment gateway.',
  'about.career.4.when': '2024 – present',
  'about.career.4.what': 'AI platform engineering: LLM gateways, agent orchestration and MCP.',
  'about.email': 'Email',

  '404.title': 'Page not found',
  '404.body': 'That page does not exist.',
} as const;

export type UiKey = keyof typeof en;

const es: Record<UiKey, string> = {
  'site.name': 'Alexei Rojas Quiroga',
  'site.role': 'Ingeniero backend y de plataformas de IA',
  'site.description':
    'Portafolio de sistemas distribuidos en .NET e ingeniería de plataformas de IA: arquitectura, flujos y decisiones.',
  'nav.projects': 'Proyectos',
  'nav.about': 'Sobre mí',
  'nav.primary': 'Principal',
  'nav.skip': 'Saltar al contenido',
  'lang.switch': 'Idioma',
  'lang.en': 'English',
  'lang.es': 'Español',
  'footer.note': 'Maqueta con datos de ejemplo.',
  'footer.contact': 'Contacto',

  'hero.eyebrow':
    'Ingeniero backend .NET senior · sistemas distribuidos · plataformas de IA',
  'hero.title':
    'Construyo sistemas distribuidos: así funcionan por dentro.',
  'hero.lead':
    'Doce años de servicios .NET que manejan pagos, cuotas en vivo y mensajería en tiempo real, y ahora los gateways y agentes que llevan los LLM a producción con seguridad. Cada proyecto incluye un diagrama que puedes reproducir.',
  'hero.title.a': 'Construyo sistemas distribuidos',
  'hero.title.b': 'así funcionan por dentro.',
  'hero.cta.projects': 'Ver los sistemas',
  'hero.cta.about': 'Sobre mí',
  'hero.trace': 'traza',
  'hero.caption': 'Vista en vivo de una arquitectura real: {title}',

  'home.personal.label': 'Personal',
  'home.corporate.label':
    'Trabajo para clientes',
  'home.personal.title': 'Proyectos personales',
  'home.corporate.title':
    'Proyectos para clientes',
  'home.systems': '{n} sistemas',
  'home.corporate.note':
    'Sistemas que construí para empleadores, presentados sin referencias a la empresa: se muestra la arquitectura, se omiten nombres y código.',
  'home.personal.note':
    'Construidos en mi tiempo libre, con repositorios públicos y demos en vivo cuando existen.',

  'home.work.eyebrow': 'Trabajo seleccionado',
  'home.work.title': 'Sistemas que he construido',
  'home.capabilities': 'Con qué trabajo',
  'hero.now': 'Mostrando',
  'hero.dot': 'Mostrar {title}',
  'detail.what': 'Qué hace',
  'detail.built': 'Qué construí',
  'detail.prev': 'Proyecto anterior',
  'detail.next': 'Proyecto siguiente',
  'card.open': 'Ver arquitectura →',
  'card.diagram.alt': 'Vista previa de arquitectura con {nodes} componentes y {flows} flujos.',

  'status.live': 'En vivo',
  'status.production': 'En producción',
  'status.in-progress': 'En desarrollo',
  'status.prototype': 'Prototipo',

  'detail.back': 'Todos los proyectos',
  'detail.role': 'Rol',
  'detail.year': 'Año',
  'detail.links': 'Enlaces',
  'detail.link.live': 'Sitio en vivo',
  'detail.link.github': 'GitHub',
  'detail.summary': 'Resumen',
  'detail.problem': 'El problema',
  'detail.architecture': 'Arquitectura',
  'detail.stack': 'Stack tecnológico',
  'detail.highlights': 'Aspectos destacados',
  'detail.decisions': 'Decisiones clave y por qué',
  'detail.video': 'Recorrido',
  'detail.video.soon': 'Video del recorrido próximamente',
  'detail.corporate.note': 'Presentado sin referencias a la empresa: solo arquitectura y decisiones.',
  'detail.category.personal': 'Proyecto personal',
  'detail.category.corporate': 'Proyecto corporativo',

  'stack.language': 'Lenguajes',
  'stack.backend': 'Backend',
  'stack.frontend': 'Frontend',
  'stack.data': 'Datos',
  'stack.messaging': 'Mensajería',
  'stack.cloud': 'Nube',
  'stack.devops': 'DevOps',
  'stack.ai': 'IA',
  'stack.testing': 'Pruebas',
  'stack.other': 'Otros',

  'diagram.label': 'Diagrama de arquitectura',
  'diagram.eyebrow': 'Arquitectura · {nodes} nodos · {flows} flujos',
  'diagram.flows': 'Flujos',
  'diagram.play': 'Reproducir',
  'diagram.pause': 'Pausar',
  'diagram.prev': 'Paso anterior',
  'diagram.next': 'Paso siguiente',
  'diagram.restart': 'Reiniciar',
  'diagram.step': 'Paso {n} de {total}',
  'diagram.reduced': 'Movimiento reducido activo: se resalta la ruta activa sin animación.',
  'diagram.legend.sync': 'Síncrono',
  'diagram.legend.async': 'Asíncrono / bucle',
  'diagram.legend.active': 'Activo',
  'diagram.legend.done': 'Completado',
  'diagram.scroll': 'Desplázate hacia los lados para ver todo el diagrama',
  'diagram.alt': 'Diagrama de {nodes} componentes: {names}.',
  'diagram.legend.title': 'Leyenda',
  'diagram.boundary': 'Lo que construí',
  'kindclass.compute': 'Servicio / cómputo',
  'kindclass.data': 'Almacén de datos',
  'kindclass.queue': 'Cola / mensajería',
  'kindclass.ai': 'IA',
  'kindclass.client': 'Cliente',
  'kindclass.external': 'Sistema externo',
  'diagram.steps': 'Cómo fluye, paso a paso',
  'diagram.hint': 'Haz clic en un paso para saltar a él. Pasa el cursor sobre un componente para ver sus conexiones.',

  'about.title': 'Sobre mí',
  'about.eyebrow': 'Perfil',
  'about.lead':
    'Construyo sistemas distribuidos en .NET: microservicios, procesamiento en tiempo real y pasarelas de pago, con más de 12 años en producción.',
  'about.summary.1':
    'Soy responsable de la arquitectura backend y de la entrega de extremo a extremo, desde el diseño de servicios hasta el despliegue en Azure y CI/CD. Mi stack diario es C# y .NET hasta .NET 10, SQL Server y T-SQL, Redis, Kafka y RabbitMQ.',
  'about.summary.2':
    'Recientemente llevé la IA a producción mediante gateways de LLM en .NET con límites de tasa, reintentos, monitoreo de salud de proveedores y auditoría.',
  'about.capabilities': 'Capacidades',
  'about.cap.backend': 'Backend y arquitectura',
  'about.cap.data': 'Datos y mensajería',
  'about.cap.cloud': 'Nube y entrega',
  'about.cap.ai': 'Integración de IA',
  'about.career': 'Trayectoria',
  'about.research': 'Investigación aplicada',
  'about.education': 'Formación',
  'about.languages': 'Idiomas',
  'about.contact': 'Contacto',
  'about.education.degree': 'Ingeniero en Ciencias de la Computación',
  'about.education.training.1': 'Capacitación en Japón: desarrollo de interfaces PBX',
  'about.education.training.2': 'Capacitación en China: operación de redes vIMS',
  'about.lang.es': 'Español: nativo',
  'about.lang.en': 'Inglés: B2',
  'about.research.1': 'Evaluación de bases de datos vectoriales',
  'about.research.2': 'Arnés de evaluación de LLM',
  'about.research.3': 'Orquestación de contexto de agentes',
  'about.research.4': 'Benchmark de compresión de prompts',
  'about.career.1.when': '2013 – 2020',
  'about.career.1.what':
    'Software de telecomunicaciones: procesamiento en tiempo real, librerías de protocolos IP y modernización de sistemas legados.',
  'about.career.2.when': '2020 – actualidad',
  'about.career.2.what': 'Microservicios distribuidos para plataformas de alto tráfico en tiempo real.',
  'about.career.3.when': '2021 – 2023',
  'about.career.3.what': 'Pasarela de pagos con criptomonedas.',
  'about.career.4.when': '2024 – actualidad',
  'about.career.4.what': 'Ingeniería de plataformas de IA: gateways de LLM, orquestación de agentes y MCP.',
  'about.email': 'Correo',

  '404.title': 'Página no encontrada',
  '404.body': 'Esa página no existe.',
};

export const ui: Record<Locale, Record<UiKey, string>> = { en, es };

export function isLocale(v: string | undefined): v is Locale {
  return v === 'en' || v === 'es';
}

export function useTranslations(locale: Locale) {
  return (key: UiKey, vars?: Record<string, string | number>): string => {
    let s = ui[locale][key] ?? ui[defaultLocale][key];
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}

/** Path for a locale-agnostic route (e.g. "/about", "/projects/x"). */
export function localePath(locale: Locale, path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return p;
  return p === '/' ? '/es/' : `/es${p}`;
}

/** Strip any locale prefix and return the locale-agnostic path. */
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/es(\/.*)?$/);
  return m ? (m[1] ?? '/') : pathname;
}
