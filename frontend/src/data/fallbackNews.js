export const FALLBACK_NEWS = [
  {
    id: 'fallback-primeros-auxilios',
    attributes: {
      titulo: 'Técnicas de primeros auxilios básicos RCP y DEA: aprende a salvar vidas',
      slug: 'tecnicas-de-primeros-auxilios-basicos-rcp-y-dea',
      resumen: 'Conoce nuestro curso online de primeros auxilios básicos, RCP y uso del DEA. Capacítate para responder ante emergencias médicas con protocolos internacionales, sin importar tu sector laboral.',
      contenido: 'La capacitación en primeros auxilios es una necesidad transversal en todos los sectores de la economía. En CETMED ofrecemos el curso Técnicas de Primeros Auxilios Básicos RCP y DEA, diseñado para responder eficientemente ante una emergencia médica.\n\nA lo largo de 36 horas de formación online asincrónica, el participante adquiere competencias para reconocer emergencias, aplicar primeros auxilios, comprender principios de RCP y usar protocolos adecuados según el caso.\n\nEste curso está pensado para trabajadores de todos los sectores que deseen estar preparados para actuar ante una emergencia. No se requieren conocimientos previos en salud.',
      publishedAt: '2026-02-15T10:00:00Z',
      imagen: { data: { attributes: { url: '/images/news/primeros-auxilios-rcp-dea.jpg' } } },
    },
  },
  {
    id: 'fallback-inclusion-laboral',
    attributes: {
      titulo: 'Gestor de inclusión laboral: capacítate y marca la diferencia',
      slug: 'gestor-de-inclusion-laboral-capacitate',
      resumen: 'La Ley 21.015 obliga a empresas con 100 o más trabajadores a incorporar personas con discapacidad. Nuestro curso Gestor de Inclusión Laboral te entrega las herramientas para liderar este proceso.',
      contenido: 'La inclusión laboral no es solo una obligación legal: es una oportunidad de construir organizaciones más diversas, resilientes e innovadoras.\n\nEl Gestor de Inclusión Laboral es el profesional responsable de diseñar e implementar políticas y planes de inclusión dentro de las organizaciones. Su trabajo impacta directamente en la cultura corporativa y en el cumplimiento normativo.\n\nEn esta capacitación, los participantes aprenden conceptos clave sobre discapacidad, normativa vigente, lenguaje inclusivo, ajustes razonables y diseño de planes de inclusión.',
      publishedAt: '2026-02-10T10:00:00Z',
      imagen: { data: { attributes: { url: '/images/news/gestor-inclusion-laboral.jpg' } } },
    },
  },
  {
    id: 'fallback-espacios-confinados',
    attributes: {
      titulo: 'Trabajo seguro en espacios confinados: normativa y prevención',
      slug: 'tecnicas-de-trabajo-seguro-en-espacios-confinados',
      resumen: 'Los espacios confinados representan uno de los mayores riesgos en industria y construcción. Conoce cómo capacitarse para trabajar de forma segura y cumplir con la normativa vigente.',
      contenido: 'Los accidentes en espacios confinados son frecuentemente graves. Un espacio confinado es cualquier lugar con acceso limitado, no diseñado para ocupación continua, con ventilación restringida y riesgo de acumulación de gases, vapores u otros peligros.\n\nNuestro programa aborda identificación de riesgos, marco legal aplicable, equipos de protección personal, planificación preventiva, preparación ante emergencias y procedimientos de trabajo seguro.\n\nEstá dirigido a trabajadores de industria, minería, construcción, saneamiento y otros sectores donde existan espacios confinados en los procesos operativos.',
      publishedAt: '2026-02-05T10:00:00Z',
      imagen: { data: { attributes: { url: '/images/news/trabajo-seguro-espacios-confinados.jpg' } } },
    },
  },
  {
    id: 'fallback-andamios',
    attributes: {
      titulo: 'Montaje y desmontaje seguro de andamios: todo lo que necesitas saber',
      slug: 'tecnicas-de-seguridad-montaje-desmontaje-andamios',
      resumen: 'El montaje y desmontaje de andamios es una actividad de alto riesgo en construcción y minería. Aprende los procedimientos correctos para trabajar de forma segura y conforme a la normativa.',
      contenido: 'El trabajo con andamios es una de las actividades con mayor riesgo de accidentes graves en construcción y minería. Caídas, colapsos estructurales y accidentes por materiales son las principales causas de lesiones durante el armado y desarme.\n\nEn esta formación, el participante aprende tipos de andamios, normativa vigente, procedimientos de arme y desarme seguro, uso de equipos de protección personal, análisis de trabajo seguro e identificación de riesgos.\n\nEs ideal para trabajadores que requieran operar, montar o supervisar el uso de andamios en sus faenas.',
      publishedAt: '2026-01-28T10:00:00Z',
      imagen: { data: { attributes: { url: '/images/news/seguridad-andamios.jpg' } } },
    },
  },
]

export function findFallbackNews(slug) {
  return FALLBACK_NEWS.find(news => news.attributes.slug === slug) || null
}
