/**
 * Seed script: loads original CETMED courses and news into the database.
 * Run once: node src/seed-data.js
 * Generated programmatically to import all 43 scraped courses.
 */
require('dotenv').config()
const { query, queryOne } = require('./db')

async function seed() {
  console.log('Seeding CETMED data...')

  // ── Categories ────────────────────────────────────────────────────────────
  const cats = [
    { nombre: 'Construcción',                slug: 'construccion',          icono: 'construction' },
    { nombre: 'Procesos Industriales',        slug: 'procesos-industriales', icono: 'factory' },
    { nombre: 'Salud',                        slug: 'salud',                 icono: 'medical_services' },
    { nombre: 'Ciencias y Técnicas Aplicadas',slug: 'ciencias-tecnicas',     icono: 'science' },
    { nombre: 'Computación e Informática',    slug: 'computacion',           icono: 'computer' },
    { nombre: 'Electricidad y Electrónica',   slug: 'electricidad',          icono: 'bolt' },
    { nombre: 'Servicio a las Personas',      slug: 'servicio-personas',     icono: 'people' },
  ]

  const catIds = {}
  for (const c of cats) {
    const row = await queryOne(
      `INSERT INTO categorias (nombre, slug, icono)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET nombre=$1, icono=$3
       RETURNING id`,
      [c.nombre, c.slug, c.icono]
    )
    catIds[c.slug] = row.id
    console.log(`  cat: ${c.nombre} → id ${catIds[c.slug]}`)
  }

  // ── Media (external URLs from cetmed.cl) ─────────────────────────────────
  const mediaList = [
  {
    "name": "trabajo-en-altura.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2026/02/trabajo-en-altura.jpg"
  },
  {
    "name": "andamioss.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2026/02/andamioss.jpg"
  },
  {
    "name": "trabajo-seguro.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2026/02/trabajo-seguro.jpg"
  },
  {
    "name": "inclusion.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2026/02/inclusion.jpg"
  },
  {
    "name": "auxilio-1.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2026/02/auxilio-1.jpg"
  },
  {
    "name": "sustancia-peligrosa.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2026/02/sustancia-peligrosa.jpg"
  },
  {
    "name": "extintores2.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2026/02/extintores2.jpg"
  },
  {
    "name": "bloqueo-LOTO.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2026/02/bloqueo-LOTO.png"
  },
  {
    "name": "CETMED50.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/10/CETMED50.png"
  },
  {
    "name": "excel-basico.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/primer-plano-manos-usando-computadora-portatil-pantalla-que-muestra-datos-analisis_53876-23014.jpg"
  },
  {
    "name": "electricista.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/electricista-masculino-trabaja-centralita-cable-conexion-electrica_169016-16570.jpg"
  },
  {
    "name": "curso_cuidadores.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/04/curso_cuidadores.jpg"
  },
  {
    "name": "primer-plano-manos-usando-computadora-portatil-pantalla-que-muestra-datos-analisis_53876-23014.jpg.avif",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/primer-plano-manos-usando-computadora-portatil-pantalla-que-muestra-datos-analisis_53876-23014.jpg.avif"
  },
  {
    "name": "electricista-masculino-trabaja-centralita-cable-conexion-electrica_169016-16570.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/electricista-masculino-trabaja-centralita-cable-conexion-electrica_169016-16570.jpg"
  },
  {
    "name": "nuevo-uniforme-carabineros-chile-900x600-1.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/10/nuevo-uniforme-carabineros-chile-900x600-1.jpg"
  },
  {
    "name": "libro-ingles-descansando-sobre-mesa-espacio-trabajo_23-2149429592.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/libro-ingles-descansando-sobre-mesa-espacio-trabajo_23-2149429592.jpg"
  },
  {
    "name": "woman-having-abdomen-massage-by-professional-osteopathy-therapist_1139-1123.jpg.avif",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/woman-having-abdomen-massage-by-professional-osteopathy-therapist_1139-1123.jpg.avif"
  },
  {
    "name": "dia-soleado_1098-15872.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/dia-soleado_1098-15872.jpg"
  },
  {
    "name": "CETMED98.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/11/CETMED98.png"
  },
  {
    "name": "CETMED86.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/11/CETMED86.png"
  },
  {
    "name": "CETMED101.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/11/CETMED101.png"
  },
  {
    "name": "CETMED79.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/11/CETMED79.png"
  },
  {
    "name": "CETMED131.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/12/CETMED131.png"
  },
  {
    "name": "CETMED27.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/09/CETMED27.png"
  },
  {
    "name": "Diseno-sin-titulo-16.webp",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/07/Diseno-sin-titulo-16.webp"
  },
  {
    "name": "CETMED62.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/10/CETMED62.png"
  },
  {
    "name": "CETMED95.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/11/CETMED95.png"
  },
  {
    "name": "CETMED104.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/11/CETMED104.png"
  },
  {
    "name": "CETMED114.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/12/CETMED114.png"
  },
  {
    "name": "CETMED121.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/12/CETMED121.png"
  },
  {
    "name": "CETMED125.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/12/CETMED125.png"
  },
  {
    "name": "CETMED128.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/12/CETMED128.png"
  },
  {
    "name": "CETMED130-1.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/12/CETMED130-1.png"
  },
  {
    "name": "CETMED43.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/10/CETMED43.png"
  },
  {
    "name": "CETMED129.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/12/CETMED129.png"
  },
  {
    "name": "CETMED18.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/09/CETMED18.png"
  },
  {
    "name": "CETMED61.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/11/CETMED61.png"
  },
  {
    "name": "CETMED56.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/10/CETMED56.png"
  },
  {
    "name": "141.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/07/141.png"
  },
  {
    "name": "131.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/08/131.png"
  },
  {
    "name": "image.png",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/05/image.png"
  },
  {
    "name": "images.jpeg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/images.jpeg"
  },
  {
    "name": "diferentes-personas-que-ocupan-logistica-almacen_23-21491282.jpg",
    "url": "https://old.cetmed.cl/wp-content/uploads/2025/03/diferentes-personas-que-ocupan-logistica-almacen_23-21491282.jpg"
  }
]

  const mediaIds = {}
  for (const m of mediaList) {
    const existing = await queryOne('SELECT id FROM media WHERE name=$1', [m.name])
    let id
    if (existing) {
      id = existing.id
    } else {
      const row = await queryOne(
        `INSERT INTO media (url, name, mime_type) VALUES ($1, $2, $3) RETURNING id`,
        [m.url, m.name, m.name.endsWith('.png') ? 'image/png' : 'image/jpeg']
      )
      id = row.id
    }
    mediaIds[m.name] = id
    console.log(`  media: ${m.name} → id ${id}`)
  }

  // ── Courses ───────────────────────────────────────────────────────────────
  const now = new Date().toISOString()
  const cursos = [
  {
    "titulo": "Procedimientos para trabajo en altura física",
    "slug": "procedimientos-para-trabajo-en-altura-fisica",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 88000,
    "horas": 16,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "construccion",
    "img_name": "trabajo-en-altura.jpg"
  },
  {
    "titulo": "Técnicas de seguridad en el montaje y desmontaje de andamios",
    "slug": "tecnicas-de-seguridad-en-el-montaje-y-desmontaje-deandamios",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 132000,
    "horas": 24,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "andamioss.jpg"
  },
  {
    "titulo": "Técnicas de trabajo seguro en espacios confinados",
    "slug": "tecnicas-de-trabajo-seguro-en-espacios-confinados",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 264000,
    "horas": 48,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "procesos-industriales",
    "img_name": "trabajo-seguro.jpg"
  },
  {
    "titulo": "Gestor de inclusión laboral",
    "slug": "gestor-de-inclusion-laboral",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 198000,
    "horas": 36,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "ciencias-tecnicas",
    "img_name": "inclusion.jpg"
  },
  {
    "titulo": "Técnicas de primeros auxilios básicos RCP Y DEA",
    "slug": "tecnicas-de-primeros-auxilios-basicos-rcp-y-dea",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 198000,
    "horas": 36,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "salud",
    "img_name": "auxilio-1.jpg"
  },
  {
    "titulo": "Manejo de sustancias peligrosas",
    "slug": "manejo-de-sustancias-peligrosas",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 88000,
    "horas": 16,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "procesos-industriales",
    "img_name": "sustancia-peligrosa.jpg"
  },
  {
    "titulo": "Manejo de extintores portátiles",
    "slug": "manejo-de-extintores-portatiles",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 108000,
    "horas": 16,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "procesos-industriales",
    "img_name": "extintores2.jpg"
  },
  {
    "titulo": "Aislamiento y bloqueo (LOTO)",
    "slug": "aislamiento-y-bloqueo-loto",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 88000,
    "horas": 12,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "procesos-industriales",
    "img_name": "bloqueo-LOTO.png"
  },
  {
    "titulo": "HIFU Vaginal y Técnicas de Diagnóstico Ginecológico",
    "slug": "hifu-vaginal-y-tecnicas-de-diagnostico-ginecologico",
    "descripcion": "El HIFU vaginal constituye una innovación en ginecología estética y funcional, permitiendo la regeneración tisular y el mejoramiento de la tonicidad del suelo pélvico femenino, mejorando la incontinencia urinaria, resequedad vaginal y los dolores o molestias en las relaciones sexuales. Complementariamente, también se abordará la correcta toma de exámenes ginecológicos (Papanicolaou, PCR para Virus Papiloma Humano, PCR para Infecciones de Transmisión Sexual, PCR para Candidiasis, flujo vaginal) se mantiene como estándar clínico esencial para la prevención y detección temprana de patologías. Este curso integra ambos enfoques, capacitando a matronas para la atención segura, ética y efectiva de mujeres en contextos clínicos y estéticos.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 380000,
    "horas": 30,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "salud",
    "img_name": "CETMED50.png"
  },
  {
    "titulo": "Excel a nivel básico",
    "slug": "servicio-de-masajes-integrales-2",
    "descripcion": "El uso de herramientas de planillas de cálculos en Microsoft Excel es en la actualidad un conocimiento elemental para aplicar en cualquier ámbito de análisis de productividad laboral, permitiendo a analistas, administrativos, asistentes de operaciones y a profesionales en general, un desempeño mucho más eficiente mejorando así sus niveles de empleabilidad. Por otra parte, las herramientas básicas de Microsoft Excel para la creación y manejo de planilla de cálculos, entrega las herramientas elementales de diseño y análisis que provee Microsoft Excel para poder crear diversos tipos de planillas de cálculo que incluyan datos, formato, así como también, fórmulas y funciones de nivel básico. Enfocado a mejorar y enriquecer el trabajo de análisis contables y productividad de la empresa.",
    "objetivo": "Aplicar las herramientas básicas de Microsoft Excel, editando y perfeccionando las planillas de cálculos a un nivel elemental y básico.",
    "contenidos": "[\"Si estas interesado en el curso, registrate en el siguiente formulario y nos pondremos en contacto cuando comience una nueva versión.\"]",
    "precio": 0,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "computacion",
    "img_name": "primer-plano-manos-usando-computadora-portatil-pantalla-que-muestra-datos-analisis_53876-23014.jpg.avif"
  },
  {
    "titulo": "Presencial – Instalaciones Eléctricas Domiciliarias Clase “D”",
    "slug": "instalaciones-electricas-domiciliarias-clase-d",
    "descripcion": "La licencia de instalador eléctrico de clase D, permite realizar instalaciones de alumbrado en baja tensión con un máximo de 10 kW de potencia total instalada, sin alimentadores; e instalaciones de calefacción y fuerza motriz en baja tensión, con un máximo de 5 kW de potencia total instalada, sin alimentadores.",
    "objetivo": "El objetivo del curso Instalaciones de Alumbrado en Baja Tensión Domiciliaria, busca crear el perfil de competencias laborales técnicas, para realizar en forma eficiente y segura las instalaciones de circuitos eléctricos domiciliarios de acuerdo a la normativa chilena vigente en el diseño, ejecución y mantención de instalaciones de alumbrado en baja tensión con un máximo de 10 kW de potencia total instalada, sin alimentadores. El contenido de este curso le Permite al participante, una vez realizada la etapa formativa optar, previa evaluación y certificación, a la licencia clase D que entrega SEC, estando capacitados para realizar instalaciones eléctricas de acuerdo a la normativa de la Superintendencia de electricidad y combustibles. Al finalizar este curso, el estudiantes obtendrá la preparación para rendir el examen de certificación de instalador eléctrico clase D, este le permitirá: proyectar, ejecutar, mantener y regularizar, ante la superintendencia de electricidad y combustibles (SEC).",
    "contenidos": "[\"Unidad 1: Introducción a las Normativas Eléctricas Vigentes y al Perfil de Competencia Instalador Eléctrico Clase D.\",\"Unidad 2: Fundamentos eléctricos e instrumentos de medición.\",\"Unidad 3: Riesgos Eléctricos\",\"Unidad 4: Circuitos eléctricos. Componentes de una instalación eléctrica domiciliaria\",\"Unidad 5: Tableros de distribución.\",\"Unidad 6: NCh 4/2003: Instalaciones de consumo en baja tensión.\",\"Unidad 7: Circuitos en Instalaciones Domiciliarias.\",\"Unidad 8: Proyecto Eléctrico.\",\"Unidad 9: NCh 2/84: Elaboración y presentación de proyectos (SEC) y NCh 10/84\",\"Unidad 10: Trámite para la puesta en servicio de una instalación interior.\"]",
    "precio": 0,
    "horas": 32,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "electricidad",
    "img_name": "electricista-masculino-trabaja-centralita-cable-conexion-electrica_169016-16570.jpg"
  },
  {
    "titulo": "Online – Curso orientaciones Socio Jurídicas en Familia y Discapacidad a Cuidadores",
    "slug": "online-curso-orientaciones-socio-juridicas-en-familia-y-discapacidad-a-cuidadores",
    "descripcion": "Este curso online entrega herramientas clave en el ámbito legal y familiar, abordando temas como mediación, credenciales de discapacidad y desafíos en la terapia ocupacional. ¡Actividad certificada y con enfoque práctico!",
    "objetivo": "Este curso está especialmente diseñado para madres, padres, cuidadores(as), profesionales y técnicos que acompañan a niños y niñas con discapacidad o condiciones de neurodivergencia. También es útil para quienes trabajan en áreas sociales, educativas o de salud y deseen fortalecer sus conocimientos sobre aspectos legales y recursos disponibles en el ámbito familiar y de la discapacidad.",
    "contenidos": "[]",
    "precio": 20000,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "curso_cuidadores.jpg"
  },
  {
    "titulo": "Mediación Familiar y su Aplicación en Contextos Institucionales",
    "slug": "mediacion-familiar-y-su-aplicacion-en-contextos-institucionales",
    "descripcion": "La mediación familiar constituye un pilar fundamental dentro de las políticas públicas orientadas a la resolución pacífica de conflictos, especialmente en el ámbito de las relaciones familiares. En el ejercicio policial, los funcionarios de Carabineros se enfrentan cotidianamente a situaciones de alta carga emocional vinculadas a conflictos intrafamiliares, separaciones, violencia o vulneración de derechos de niños, niñas y adolescentes. Esta capacitación busca fortalecer el rol preventivo y orientador de Carabineros, entregando herramientas conceptuales y prácticas que permitan comprender el proceso de mediación familiar como un mecanismo colaborativo y no adversarial, basado en el diálogo, la escucha activa y el respeto mutuo. Desde una mirada interdisciplinaria, se abordarán tanto los fundamentos psicosociales —relacionados con la contención, la comunicación efectiva y la intervención en crisis— como los aspectos jurídicos que enmarcan la mediación familiar en la Ley N°19.968 de Tribunales de Familia, la Ley N° 14.908 sobre pensión alimenticia y la Ley N° 21.302 del Servicio Nacional de Protección Especializada a la Niñez y Adolescencia (Mejor Niñez). De esta manera, la jornada formativa busca contribuir al fortalecimiento de la coordinación interinstitucional y al desarrollo de competencias que favorezcan una actuación policial más empática, informada y ajustada a los principios de protección",
    "objetivo": "Objetivo General Fortalecer las competencias de los funcionarios de Carabineros en la comprensión del proceso de mediación familiar y su relevancia como herramienta de resolución pacífica de conflictos en contextos de familia y protección de la niñez. Objetivos Especificos Reconocer los principios, etapas y alcances de la mediación familiar dentro del marco legal chileno. Comprender el rol de Carabineros en la derivación, prevención y orientación frente a conflictos familiares. Promover una mirada interdisciplinaria de la mediación, integrando aspectos psicosociales y jurídicos.",
    "contenidos": "[]",
    "precio": 0,
    "horas": 2,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "nuevo-uniforme-carabineros-chile-900x600-1.jpg"
  },
  {
    "titulo": "Ingles Elemental en la Empresa",
    "slug": "ingles-elemental-en-la-empresa",
    "descripcion": "Hoy día las personas y los profesionales de diversas áreas necesariamente debemos aprender un segundo Idioma ya que el mundo empresarial es dinámico y extremadamente competitivo. El solo hecho de pensar en los negocios, nos impulsa a capacitarnos en diversos ámbitos para sacar ventaja frente a nuestros competidores. Por ello, las empresas demandan trabajadores eficientes y multifacéticos ante los atractivos mercados que han roto todo tipo de barreras, y con ello el Idioma Universal, el INGLÉS. Entonces nos preguntamos ¿Por qué es importante el Idioma Inglés para empresas, para las Personas y para los diversos Profesionales? Las organizaciones o empresas buscan expandirse hacia nuevos mercados y fortalecer sus comunicaciones internacionales. Por esta razón, el inglés es crucial para que los responsables de una compañía no sólo logren satisfacer las exigencias de los socios y atender las necesidades de diversos clientes, sino a considerar algo aún más importante: la continua capacitación del personal. ¿Sabías que cerca de mil millones de personas hablan inglés en todo el mundo? El inglés se ha convertido en el idioma universal por excelencia, a tal punto de perfilarse como el idioma de los negocios y de las oportunidades laborales.",
    "objetivo": "Generar Habilidades comunicacionales y conocimientos fundamentales del Idioma Inglés en el área laboral debido a la apertura de Empresas por ejemplo de Minería en La República de Chile, y en este mundo globalizado se está exigiendo a todas las empresas que su personal maneje situaciones básicas del idioma Inglés, que le permita entablar una conversación simple con algún cliente, o manejo de Documentos en el idioma, así como procesos de interacción Hombre-Máquina, permitiendo así mejorar la calidad del servicio que se entrega y un perfil calificado para elevar la productividad del negocio.",
    "contenidos": "[\"Módulo I: Introducción al Inglés Elemental en las Empresas.\",\"Módulo II: Grammar Construction.\",\"Módulo III: English Communication Applied to Satisfy The Work of Chilean Company.\"]",
    "precio": 350000,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "libro-ingles-descansando-sobre-mesa-espacio-trabajo_23-2149429592.jpg"
  },
  {
    "titulo": "Servicio de Masajes Integrales",
    "slug": "servicio-de-masajes-integrales",
    "descripcion": "El objetivo de este curso es la enseñanza de diferentes técnicas avanzadas vinculadas directa o indirectamente al masaje. El conocimiento de técnicas manuales avanzadas mediante un programa teórico práctico y orientado a personas sin conocimientos previos en Anatomía y Fisiología. La masoterapia se puede definir como el uso de distintas técnicas de masaje con fines terapéuticos, esto es, para el tratamiento de enfermedades y lesiones: en este caso, es una técnica integrada dentro de la fisioterapia. En la actualidad se coincide en definir al masaje como “una combinación de movimientos técnicos manuales o maniobras realizadas armoniosa y metódicamente, con fines higiénico-preventivos o terapéuticos, que al ser aplicado con las manos permite valorar el estado de los tejidos tratados”; se emplea en medicina, kinesiología, estética, deporte, entre otros.",
    "objetivo": "Generar Habilidades, Destrezas y los conocimientos fundamentales en el oficio “MASOTERAPEUTA INTEGRAL”, con la finalidad de ejercer Labores mediante un programa teórico práctico y orientado a personas sin conocimientos previos en Anatomía y Fisiología, de diferentes técnicas avanzadas vinculadas directa o indirectamente al masaje.",
    "contenidos": "[]",
    "precio": 380000,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "woman-having-abdomen-massage-by-professional-osteopathy-therapist_1139-1123.jpg.avif"
  },
  {
    "titulo": "Sensibilización Ambiental en las Empresas",
    "slug": "sensibilizacion-ambiental-en-las-empresas",
    "descripcion": "La educación ambiental es una corriente de pensamiento y acción de alcance internacional, en la cual coexisten una multiplicidad de enfoques teóricos y metodológicos. Constituye en sí misma un proceso de aprendizaje que facilita la comprensión de las realidades del medioambiente y del proceso sociohistórico que ha conducido a su actual deterioro. De este modo, se manifiesta la necesidad de generar conciencia, sensibilidad y comprensión del medio ambiente y de los problemas asociados, como también de la presencia y función de la humanidad en este. Asimismo, promueve desarrollar valores sociales y un interés profundo por el medio ambiente, que mueva a participar activamente en su protección y mejoramiento.",
    "objetivo": "Este Curso de Sensibilización Medioambiental identifica los principales problemas medioambientales de nuestros días, así como sus causas y sus interrelaciones para un mejor conocimiento de la situación. Además, analiza la respuesta de la sociedad ante la degradación de nuestro entorno y del planeta y valora de una manera crítica cómo afecta a nuestra calidad de vida.",
    "contenidos": "[]",
    "precio": 150000,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "dia-soleado_1098-15872.jpg"
  },
  {
    "titulo": "Diplomado en Podologia Clinica Pie Diabetico",
    "slug": "diplomado-en-podologia-clinica-pie-diabetico",
    "descripcion": "El Diplomado en Podología Clínica del Pie Diabético busca responder a la necesidad creciente de contar con profesionales capacitados para la atención integral del pie diabético, una de las principales complicaciones crónicas de la diabetes mellitus. La prevención, detección temprana y manejo adecuado de lesiones en los pies constituyen un pilar fundamental en la mejora de la calidad de vida y la disminución de amputaciones evitables. El programa ofrece un enfoque clínico actualizado, basado en evidencia científica, que integra conocimientos anatómicos, fisiopatológicos, diagnósticos y terapéuticos, junto con herramientas prácticas para la atención segura del paciente diabético. Se articula con las políticas de salud pública chilenas y los lineamientos del Programa Nacional de Diabetes Mellitus, promoviendo la atención interdisciplinaria y el autocuidado del usuario.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 550000,
    "horas": 120,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "salud",
    "img_name": "CETMED98.png"
  },
  {
    "titulo": "Gestión del Tiempo y Organización Efectiva de los Equipos de Trabajo",
    "slug": "gestion-del-tiempo-y-organizacion-efectiva-de-los-equipos-de-trabajo",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 0,
    "horas": 32,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "CETMED86.png"
  },
  {
    "titulo": "Ley Karin: Derechos, Procedimientos y Alcances en Materia de Acoso y Violencia Laboral",
    "slug": "ley-karin-derechos-procedimientos-y-alcances-en-materia-de-acoso-y-violencia-laboral",
    "descripcion": "La Ley N.º 21.643, conocida como Ley Karin, promulgada en 2024, introduce modificaciones significativas al Código del Trabajo, la Ley del Estatuto Administrativo y otras normativas relacionadas con la prevención, investigación y sanción del acoso sexual, laboral y la violencia en el trabajo. Esta ley surge como respuesta a una creciente demanda social y judicial de protección efectiva frente a conductas abusivas y de violencia laboral, visibilizando el daño psicológico, social y productivo que generan en los entornos de trabajo. El curso busca proporcionar a trabajadores, empleadores, dirigentes sindicales y funcionarios públicos una comprensión integral de la Ley Karin, sus alcances jurídicos, mecanismos de denuncia, etapas del procedimiento, derechos de las víctimas y obligaciones de los empleadores. Además, entrega herramientas para reconocer situaciones de vulneración y promover ambientes laborales respetuosos, en coherencia con los principios de dignidad, igualdad y no discriminación.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 0,
    "horas": 4,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "ciencias-tecnicas",
    "img_name": "CETMED101.png"
  },
  {
    "titulo": "Síndrome de Burnout en el Trabajo Psicosocial: Cuidar sin desgastarse",
    "slug": "sindrome-de-burnout-en-el-trabajo-psicosocial-cuidar-sin-desgastarse",
    "descripcion": "Intervención Especializada, a través de la comprensión del Síndrome de Burnout, sus manifestaciones y factores de riesgo en el trabajo psicosocial, incorporando estrategias de autocuidado personal y colectivo mediante experiencias reflexivas y lúdicas que fortalezcan la salud mental y la cohesión del equipo.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 0,
    "horas": 3,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "salud",
    "img_name": "CETMED79.png"
  },
  {
    "titulo": "Seguridad en Faenas de Construcción",
    "slug": "seguridad-en-faenas-de-construccion",
    "descripcion": "Las faenas de construcción concentran algunos de los índices de accidentabilidad más altos del país, situación que se relaciona directamente con deficiencias en la identificación de peligros, control de riesgos, uso inadecuado de EPP, ausencia de procedimientos seguros de trabajo y desconocimiento de la normativa vigente exigida por la autoridad sanitaria y por los organismos administradores de la Ley 16.744. El marco regulatorio aplicable —principalmente el Decreto Supremo N° 594 del MINSAL, el DS N° 40 sobre prevención de riesgos, las obligaciones del empleador establecidas en la Ley 16.744, y los Protocolos del MINSAL— establece exigencias concretas para asegurar condiciones básicas de higiene y seguridad en obras civiles. El incumplimiento de estas normativas no solo incrementa los riesgos de accidentes graves y fatales, sino que también expone a empresas y mandantes a sanciones administrativas, detenciones de obra y responsabilidades civiles y penales. Este curso entrega al participante competencias técnico–operativas para desenvolverse correctamente en una faena, reconociendo peligros, evaluando riesgos, controlando desviaciones y aplicando medidas preventivas de acuerdo con el estándar normativo vigente en Chile.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 150000,
    "horas": 24,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "construccion",
    "img_name": "CETMED131.png"
  },
  {
    "titulo": "Cuidador Clínico del Adulto Mayor",
    "slug": "cuidador-clinico-del-adulto-mayor",
    "descripcion": "El progresivo envejecimiento de la población en Chile y Latinoamérica ha generado un aumento sostenido en la demanda de cuidadores capacitados para atender a personas mayores en situación de dependencia moderada y severa, incluyendo condiciones de postración. La formación de cuidadores clínicos se convierte en una necesidad prioritaria para asegurar un cuidado digno, seguro y humanizado. Este curso entrega conocimientos, habilidades y actitudes fundamentales para el manejo integral del adulto mayor dependiente, abarcando aspectos clínicos, preventivos y emocionales, bajo la guía de una profesional de enfermería",
    "objetivo": "Personas mayores de 18 años interesadas en desempeñarse en el cuidado clínico de adultos mayores en situación de dependencia. Técnicos en Enfermería de Nivel Medio o Superior (TENS) que deseen especializarse en el área geriátrica. Estudiantes de carreras de la salud (enfermería, kinesiología, trabajo social, terapia ocupacional, etc.) que quieran fortalecer sus competencias prácticas en el cuidado del adulto mayor dependiente. Familiares y cuidadores informales que busquen adquirir herramientas de manejo clínico básico y seguro. General/oficio (personas y cuidadores informales). Especialización (TENS y estudiantes de salud).",
    "contenidos": "[\"Sábados de 18:00 a 20:00 hrs (2 hrs. vivo online + 6 h autónomo aula virtual)\",\"Envejecimiento y dependencia; rol y ética; bioseguridad.\",\"Relatora: Enfermera APS.\",\"Sábados de 18:00 a 20:00 hrs (2 hrs. en vivo online + 6 hrs. autónomo aula virtual)\",\"Bases anatómicas; control y registro; reporte de cambios.\",\"Relatora: Enfermera APS.\",\"Sábados de 18:00 a 20:00 hrs (2 hrs. en vivo online + 8 hrs. autónomo aula virtual)\",\"Higiene en cama; confort; hidratación y nutrición adaptada.\",\"Relatora: Enfermera APS.\",\"Sábados de 18:00 a 20:00 hrs (2 hrs. vivo online + 8 hrs. autónomo aula virtual)\",\"Úlceras por presión; movilización/posicionamiento; incontinencia y sondas.\",\"Relatora: Enfermera APS.\",\"Sábados de 18:00 a 20:00 hrs (2 hrs. en vivo online + 6 hrs. autónomo aula virtual)\",\"Comunicación con deterioro cognitivo; apoyo a familia; autocuidado.\",\"Relatora: Enfermera Hospital /UCI.\",\"Sábados de 18:00 a 20:00 hrs (2 hrs. vivo online + 6 hrs autónomo aula virtual)\",\"Delirium vs demencia vs depresión; signos de alerta; contención y derivación.\",\"Relatora: Enfermera Hospital/UCI.\",\"Forma de evaluación prueba online con alternativas\",\"Plazo de entrega: según la disponibilidad del estudiante\",\"Certificación Digital\"]",
    "precio": 0,
    "horas": 60,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "salud",
    "img_name": "CETMED27.png"
  },
  {
    "titulo": "Curso Profesional Terapeuta Floral Sistema Bach",
    "slug": "curso-profesional-terapeuta-floral-sistema-bach-2",
    "descripcion": "El curso tiene como finalidad formar terapeutas florales capacitados en el uso profesional del sistema de esencias florales del Dr. Edward Bach, proporcionando una base sólida teórica, técnica y ética que permita aplicar esta herramienta terapéutica de forma efectiva, segura y respetuosa con la persona consultante.",
    "objetivo": "Objetivo del Curso Formar terapeutas florales competentes en el uso profesional del sistema de esencias florales de Bach, entregando herramientas teóricas, prácticas y éticas que les permitan acompañar procesos emocionales y promover el bienestar integral de las personas, mediante la aplicación segura, consciente y personalizada de las 38 esencias florales del sistema. Objetivo Específicos Comprender los fundamentos filosóficos, históricos y vibracionales del sistema floral desarrollado por el Dr. Edward Bach y su enfoque holístico de la salud. Conocer y diferenciar las 38 esencias florales originales de Bach, clasificándolas por grupos emocionales, indicaciones terapéuticas y su acción transformadora. Desarrollar habilidades prácticas para la elaboración de fórmulas personalizadas, aplicando correctamente los métodos de entrevista terapéutica floral, observación emocional y dosificación. Aplicar los métodos originales de preparación de esencias florales (solar y ebullición), comprendiendo su base energética y su uso dentro del marco del sistema. Identificar los límites éticos y profesionales del terapeuta floral, comprendiendo su rol dentro de la salud integrativa y su articulación responsable con otros profesionales. Integrar la terapia floral en contextos clínicos, educativos, comunitarios o de desarrollo personal, adaptando el enfoque terapéutico según las necesidades de cada consultante.",
    "contenidos": "[]",
    "precio": 250000,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "salud",
    "img_name": "Diseno-sin-titulo-16.webp"
  },
  {
    "titulo": "Auxiliar Paramédico de Farmacia",
    "slug": "auxiliar-paramedico-de-farmacia-con-mencion-especializacion-en-terapias-complementarias-de-sistema-floral-de-bach",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 208333,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "salud",
    "img_name": "CETMED62.png"
  },
  {
    "titulo": "Implantes Dérmicos Implanon y Técnicas de Inserción en Salud Ginecológica",
    "slug": "implantes-dermicos-implanon-y-tecnicas-de-insercion-en-salud-ginecologica",
    "descripcion": "El implante subdérmico Implanon es uno de los métodos anticonceptivos de mayor eficacia y seguridad disponibles en la actualidad, ampliamente utilizado a nivel mundial como estrategia de planificación familiar y salud reproductiva. Su correcta inserción, seguimiento y eventual retiro requieren formación específica en técnicas clínicas que aseguren la seguridad de la paciente y el cumplimiento de protocolos nacionales e internacionales de atención. El curso busca capacitar a matronas en la aplicación práctica del dispositivo, fortaleciendo competencias teóricas y técnicas en un entorno controlado y con respaldo clínico, respondiendo a la creciente demanda de formación certificada en procedimientos ginecológicos.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 360000,
    "horas": 40,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "salud",
    "img_name": "CETMED95.png"
  },
  {
    "titulo": "PROGRAMA INTEGRAL DE MARKETING",
    "slug": "programa-integral-de-marketing",
    "descripcion": "Este programa integral combina los conceptos fundamentales del marketing, el análisis estratégico y las técnicas de storytelling como recurso diferencial. En un contexto competitivo, dominar las 4P (Producto, Precio, Promoción y Plaza), junto al diagnóstico interno (fortalezas y debilidades) y externo (amenazas y oportunidades), permite diseñar propuestas de valor sólidas y sostenibles. El storytelling aporta el componente emocional, esencial para conectar con los consumidores de manera auténtica y recordable. Todo el contenido se basa en marcos teóricos de referencia y se complementa con ejemplos prácticos adaptados al mercado real.",
    "objetivo": "Emprendedores y profesionales independientes. Responsables de marketing y comunicación de PyMES. Equipos comerciales de empresas y organizaciones. Productores, artesanos o diseñadores que buscan posicionar su marca. Personas sin formación previa en marketing que necesitan herramientas prácticas y efectivas.",
    "contenidos": "[]",
    "precio": 367300,
    "horas": 20,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "CETMED104.png"
  },
  {
    "titulo": "Diseño y Elaboración de Proyectos para equipos Directivos",
    "slug": "diseno-y-elaboracion-de-proyectos-2",
    "descripcion": "Los equipos directivos cumplen un rol clave en la conducción estratégica de las instituciones, siendo responsables de orientar procesos, priorizar necesidades, gestionar recursos y asegurar la coherencia entre las acciones y los objetivos organizacionales. En este contexto, contar con herramientas sólidas para diseñar y elaborar proyectos de manera técnica, estructurada y orientada a resultados es fundamental para la correcta toma de decisiones. El diseño de proyectos constituye una herramienta de planificación que permite transformar problemas o necesidades institucionales en iniciativas concretas, viables y evaluables. Para ello, se trabaja a partir de un diagnóstico claro, la definición de un problema central, la identificación de sus causas y efectos, y la formulación de objetivos y alternativas de solución que respondan efectivamente a la realidad de la institución. Asimismo, se consideran los elementos esenciales para asegurar la viabilidad técnica, operativa y económica de un proyecto: la secuencia lógica de actividades, los recursos necesarios, la estimación de costos, la planificación temporal, y la alineación con directrices y prioridades institucionales. Este curso entrega una metodología clara, práctica y aplicable a contextos reales, que permitirá a las jefaturas, coordinaciones y equipos directivos formular proyectos pertinentes, coherentes y sostenibles, fortaleciendo la capacidad institucional para gestionar iniciativas de impacto, justificar requerimientos, optimizar recursos y presentar propuestas que faciliten su aprobación interna o externa.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 300000,
    "horas": 12,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "ciencias-tecnicas",
    "img_name": "CETMED114.png"
  },
  {
    "titulo": "Carpintería en Obra Gruesa y Terminaciones",
    "slug": "carpinteria-en-obra-gruesa-y-terminaciones",
    "descripcion": "La carpintería en construcción es un oficio crítico tanto en la etapa de obra gruesa —encofrados, cerchas, estructuras, techumbres— como en las terminaciones —puertas, marcos, molduras, revestimientos y acabados finos. Las obras requieren carpinteros con competencias técnicas certificables, debido a la creciente necesidad de cumplir estándares de calidad, plazos de entrega, normativas de seguridad estructural y especificaciones del mandante. Sin una formación adecuada, los errores en encofrados, nivelaciones, cortes y ensamblajes pueden provocar fallas estructurales, pérdida de materiales, deformaciones y retrasos significativos. Por su parte, en terminaciones, una mala ejecución afecta la estética final, la funcionalidad y la habitabilidad del proyecto. Este curso entrega una formación integral desde el manejo de herramientas manuales y eléctricas, pasando por carpintería estructural, hasta técnicas detalladas de terminaciones, permitiendo al participante desempeñarse con seguridad y precisión en ambos ámbitos. El diseño de proyectos constituye una herramienta de planificación que permite transformar problemas o necesidades institucionales en iniciativas concretas, viables y evaluables. Para ello, se trabaja a partir de un diagnóstico claro, la definición de un problema central, la identificación de sus causas y efectos, y la formulación de objetivos y alternativas de solución que respondan efectivamente a la realidad de la institución. Asimismo, se consideran los elementos esenciales para asegurar la viabilidad técnica, operativa y económica de un proyecto: la secuencia lógica de actividades, los recursos necesarios, la estimación de costos, la planificación temporal, y la alineación con directrices y prioridades institucionales. Este curso entrega una metodología clara, práctica y aplicable a contextos reales, que permitirá a las jefaturas, coordinaciones y equipos directivos formular proyectos pertinentes, coherentes y sostenibles, fortaleciendo la capacidad institucional para gestionar iniciativas de impacto, justificar requerimientos, optimizar recursos y presentar propuestas que faciliten su aprobación interna o externa.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 170000,
    "horas": 32,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "construccion",
    "img_name": "CETMED121.png"
  },
  {
    "titulo": "Albañilería Nivel Inicial y Avanzado",
    "slug": "albanileria-nivel-inicial-y-avanzado",
    "descripcion": "El oficio de albañilería continúa siendo uno de los pilares de la construcción civil en Chile, tanto en obra nueva como en mantención y remodelación. La carencia de albañiles calificados y la necesidad de responder a estándares de calidad, plazos y seguridad impulsan la demanda de formación especializada. Este curso aborda tanto el nivel inicial (fundamentos del oficio) como el nivel avanzado (técnicas de acabados, espesores, control de calidad, y supervisión del trabajo), aportando competencias técnicas robustas para que el participante opere con eficiencia en obra, reduzca errores, cumpla especificaciones y contribuya al cumplimiento de metas de productividad y calidad. Sin una formación adecuada, los errores en encofrados, nivelaciones, cortes y ensamblajes pueden provocar fallas estructurales, pérdida de materiales, deformaciones y retrasos significativos. Por su parte, en terminaciones, una mala ejecución afecta la estética final, la funcionalidad y la habitabilidad del proyecto. Este curso entrega una formación integral desde el manejo de herramientas manuales y eléctricas, pasando por carpintería estructural, hasta técnicas detalladas de terminaciones, permitiendo al participante desempeñarse con seguridad y precisión en ambos ámbitos. El diseño de proyectos constituye una herramienta de planificación que permite transformar problemas o necesidades institucionales en iniciativas concretas, viables y evaluables. Para ello, se trabaja a partir de un diagnóstico claro, la definición de un problema central, la identificación de sus causas y efectos, y la formulación de objetivos y alternativas de solución que respondan efectivamente a la realidad de la institución. Asimismo, se consideran los elementos esenciales para asegurar la viabilidad técnica, operativa y económica de un proyecto: la secuencia lógica de actividades, los recursos necesarios, la estimación de costos, la planificación temporal, y la alineación con directrices y prioridades institucionales. Este curso entrega una metodología clara, práctica y aplicable a contextos reales, que permitirá a las jefaturas, coordinaciones y equipos directivos formular proyectos pertinentes, coherentes y sostenibles, fortaleciendo la capacidad institucional para gestionar iniciativas de impacto, justificar requerimientos, optimizar recursos y presentar propuestas que faciliten su aprobación interna o externa.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 200000,
    "horas": 32,
    "modalidad": "E-Learning",
    "nivel": "Avanzado",
    "cat_slug": "construccion",
    "img_name": "CETMED125.png"
  },
  {
    "titulo": "Gasfitería Domiciliaria Nivel 1 (Introductorio – Sin SEC)",
    "slug": "gasfiteria-domiciliaria-nivel-1-introductorio-sin-sec",
    "descripcion": "La gasfitería domiciliaria constituye uno de los oficios esenciales en mantenimiento, ampliación y reparación de viviendas, siendo altamente demandado por constructoras, inmobiliarias, servicios de mantención y viviendas particulares. La carencia de gasfíteres formados técnicamente ha generado un aumento de trabajos mal ejecutados, riesgos de filtraciones, fugas, daños estructurales y fallas sanitarias graves. Este curso no tiene carácter habilitante para instalaciones de gas bajo normativa SEC, pero prepara al participante en competencias básicas de gasfitería orientadas a: Instalaciones de agua fría y caliente. Diagnóstico y reparación de fugas. Instalación de artefactos sanitarios. Instalación de llaves, válvulas y accesorios. Redes domiciliarias simples de distribución. Se construye sobre la normativa sanitaria (NCh 1198, NCh 2485, normas de artefactos) y sobre estándares técnicos utilizados en obras residenciales y comerciales. El curso es ideal para maestros que buscan formalizar su experiencia, ayudantes que quieren especializarse y empresas que necesitan fortalecer cuadrillas",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 170000,
    "horas": 28,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "construccion",
    "img_name": "CETMED128.png"
  },
  {
    "titulo": "Interpretación de Planos de Construcción y Electricidad",
    "slug": "instalaciones-sanitarias-basicas-agua-potable-y-alcantarillado-2",
    "descripcion": "El sector construcción enfrenta una alta demanda de mano de obra capacitada para interpretar correctamente planos de obra civil y sistemas eléctricos. La falta de competencias en lectura e interpretación de planos genera errores de ejecución, retrasos, sobrecostos y riesgos de seguridad. Este curso entrega conocimientos esenciales para que maestros, ayudantes, supervisores y técnicos comprendan símbolos, escalas, cortes, proyecciones, planos eléctricos y sanitarios básicos; logrando ejecutar tareas con precisión y alineación al proyecto. Constituye un estándar mínimo para integrarse a obras modernas y mejorar la empleabilidad en el rubro.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 120000,
    "horas": 24,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "construccion",
    "img_name": "CETMED130-1.png"
  },
  {
    "titulo": "Diseño y Elaboración de Proyectos",
    "slug": "diseno-y-elaboracion-de-proyectos",
    "descripcion": "El curso “Diseño y Elaboración de Proyectos” entrega conocimientos y herramientas prácticas para formular proyectos sociales, comunitarios o institucionales desde la identificación del problema hasta la elaboración del presupuesto y la presentación final. A través de un enfoque participativo y aplicado, los participantes desarrollarán las competencias necesarias para transformar ideas en propuestas concretas, sostenibles y coherentes con las necesidades del entorno.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 250000,
    "horas": 12,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "ciencias-tecnicas",
    "img_name": "CETMED43.png"
  },
  {
    "titulo": "Instalaciones Sanitarias Básicas (Agua Potable y Alcantarillado)",
    "slug": "instalaciones-sanitarias-basicas-agua-potable-y-alcantarillado",
    "descripcion": "Las instalaciones sanitarias son componentes críticos en obras residenciales, comerciales e industriales. Un error en la instalación de agua potable o alcantarillado genera filtraciones, retorno de olores, fallas estructurales, daño en paredes, contaminación cruzada y costos elevados de reparación. En Chile, la normativa como la NCh 1198, NCh 2485, NCh 398, y los estándares de OS5 de las empresas sanitarias exigen criterios de diseño, ejecución y revisión para garantizar la correcta operación de las redes domiciliarias. Sin embargo, gran parte de los maestros y técnicos adquieren el oficio empíricamente, sin formación formal ni comprensión normativa, lo que deriva en instalaciones deficientes o fuera de estándar. Este curso entrega al participante conocimientos sólidos para ejecutar instalaciones sanitarias básicas, comprender planos, realizar uniones seguras, garantizar presiones adecuadas, cumplir normativas y prevenir errores comunes en agua potable y evacuación de aguas servidas.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 180000,
    "horas": 28,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "construccion",
    "img_name": "CETMED129.png"
  },
  {
    "titulo": "Fundamentos y Prácticas de Barismo",
    "slug": "fundamentos-y-practicas-de-barismo",
    "descripcion": "Este curso ofrece una introducción estructurada a los principios del barismo, abordando la teoría y la práctica de la extracción, el uso correcto de la máquina espresso y la vaporización de leche. Está orientado a quienes desean iniciar una formación sólida en café o complementar su conocimiento con fundamentos técnicos y prácticos.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 250000,
    "horas": 2,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "CETMED18.png"
  },
  {
    "titulo": "Inglés Elemental en la Empresa",
    "slug": "ingles-elemental-en-la-empresa-2",
    "descripcion": "Hoy día las personas y los profesionales de diversas áreas necesariamente debemos aprender un segundo Idioma ya que el mundo empresarial es dinámico y extremadamente competitivo. El solo hecho de pensar en los negocios, nos impulsa a capacitarnos en diversos ámbitos para sacar ventaja frente a nuestros competidores. Por ello, las empresas demandan trabajadores eficientes y multifacéticos ante los atractivos mercados que han roto todo tipo de barreras, y con ello el Idioma Universal, el INGLÉS. Entonces nos preguntamos ¿Por qué es importante el Idioma Inglés para empresas, para las Personas y para los diversos Profesionales? Las organizaciones o empresas buscan expandirse hacia nuevos mercados y fortalecer sus comunicaciones internacionales. Por esta razón, el inglés es crucial para que los responsables de una compañía no sólo logren satisfacer las exigencias de los socios y atender las necesidades de diversos clientes, sino a considerar algo aún más importante: la continua capacitación del personal. ¿Sabías que cerca de mil millones de personas hablan inglés en todo el mundo? El inglés se ha convertido en el idioma universal por excelencia, a tal punto de perfilarse como el idioma de los negocios y de las oportunidades laborales.",
    "objetivo": "Generar Habilidades comunicacionales y conocimientos fundamentales del Idioma Inglés en el área laboral debido a la apertura de Empresas por ejemplo de Minería en La República de Chile, y en este mundo globalizado se está exigiendo a todas las empresas que su personal maneje situaciones básicas del idioma Inglés, que le permita entablar una conversación simple con algún cliente, o manejo de Documentos en el idioma, así como procesos de interacción Hombre-Máquina, permitiendo así mejorar la calidad del servicio que se entrega y un perfil calificado para elevar la productividad del negocio.",
    "contenidos": "[]",
    "precio": 0,
    "horas": 120,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "libro-ingles-descansando-sobre-mesa-espacio-trabajo_23-2149429592.jpg"
  },
  {
    "titulo": "Monitor en Operación Turística y Atención al Visitante",
    "slug": "monitor-en-operacion-turistica-y-atencion-al-visitante",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 350000,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "CETMED61.png"
  },
  {
    "titulo": "Monitor en Astronomía Turística del Valle del Elqui",
    "slug": "monitor-en-astronomia-turistica-del-valle-del-valle-del-elqui",
    "descripcion": "El Valle del Elqui es reconocido mundialmente por poseer uno de los cielos más limpios del planeta, lo que ha convertido a la región en un polo astronómico y turístico de relevancia internacional. Este curso busca fortalecer las competencias de los operadores turísticos en ejercicio, entregándoles conocimientos y herramientas prácticas en astronomía básica, observación nocturna y mediación cultural, con el fin de que puedan desempeñarse como Monitores en Astronomía Turística en un oficio altamente demandado y en coherencia con la identidad territorial.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 350000,
    "horas": 70,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "CETMED56.png"
  },
  {
    "titulo": "Investigación de Incidentes y Accidentes",
    "slug": "investigacion_incidentes_accidentes",
    "descripcion": "El curso tiene como finalidad desarrollar en los participantes las competencias necesarias para identificar, analizar y determinar las causas de incidentes y accidentes laborales, aplicando metodologias reconocidas, con el fin de implementar medidas correctivas y preventivas que mejoren la seguridad en el trabajo.",
    "objetivo": "Objetivo General: Desarrollar en los participantes las competencias necesarias para identificar, analizar y determinar las causas de incidentes y accidentes laborales, aplicando metodologias reconocidas, con el fin de implementar medidas correctivas y preventivas que mejoren la seguridad en el trabajo. Objetivos Específicos: Reconocer los conceptos fundamentales de incidente, accidente y casi accidente según normativa vigente. Identificar las obligaciones legales en materia de investigación de accidentes del trabajo y enfermedades profesionales. Aplicar metodologías de investigación de incidentes y accidentes (árbol de causas, modelo causal, método de los 5 por qué, entre otros). Elaborar informes de investigación claros y objetivos que permitan implementar medidas preventivas eficaces. Promover una cultura de seguridad basada en la prevención y el aprendizaje. organizacional.",
    "contenidos": "[\"Comprar Curso\"]",
    "precio": 200000,
    "horas": 32,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "141.png"
  },
  {
    "titulo": "Diplomado en Docencia para la Educación Superior Formación Basada en Competencias y Metodologías activas",
    "slug": "diplomado-en-docencia-para-la-educacion-superior-formacion-basada-en-competencias-y-metodologias-activas",
    "descripcion": "El Diplomado en Educación Superior Basado en Competencias tiene como propósito fortalecer las capacidades pedagógicas de profesionales y docentes que se desempeñan en instituciones de educación superior. Su diseño responde a los actuales desafíos educativos, promoviendo un enfoque centrado en el desarrollo de competencias que articula conocimientos, habilidades y actitudes necesarias para una formación integral de los estudiantes. El programa se imparte en modalidad a distancia, lo que favorece el auto-aprendizaje, la flexibilidad horaria y la autonomía, permitiendo a los participantes avanzar según sus propios ritmos y compatibilizar la formación con sus responsabilidades laborales y personales.",
    "objetivo": "Objetivo General Fortalecer las competencias pedagógicas y evaluativas de los participantes para el diseño, implementación y evaluación de procesos formativos en la educación superior bajo el enfoque de formación basada en competencias, mediante un proceso de aprendizaje a distancia, autónomo y asincrónico. Objetivos Específicos Comprender los principios, fundamentos y marco normativo de la educación superior y de la formación basada en competencias. Elaborar planes y programas formativos con resultados de aprendizaje claros y alineados a perfiles de egreso, aplicando el enfoque por competencias. Seleccionar y aplicar estrategias didácticas y recursos adaptados a la modalidad a distancia que promuevan el aprendizaje autónomo. Diseñar instrumentos y aplicar criterios de evaluación coherentes con el enfoque por competencias y la modalidad asincrónica. Desarrollar capacidades de reflexión crítica y mejora continua en la práctica docente, integrando la autogestión del aprendizaje como herramienta profesional.",
    "contenidos": "[\"Agrega el curso a tu carrito y realiza la compra para acceder inmediatamente al contenido.\"]",
    "precio": 300000,
    "horas": 40,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "131.png"
  },
  {
    "titulo": "E-learning – Elaboración de Informe Pericial",
    "slug": "e-learning-informe-pericial",
    "descripcion": "Este curso tiene por objetivo profundizar en el desarrollo de competencias técnicas y habilidades esenciales para la elaboración de informes sociales periciales. A través de una formación 100% online, los participantes conocerán los fundamentos metodológicos de la pericia social, técnicas de recolección de información, y los estándares profesionales que deben observarse al presentar un informe técnico e imparcial ante tribunales u otras autoridades competentes. Se revisarán contenidos teóricos clave junto a ejemplos prácticos de informes periciales en materias como cuidado personal, habilidades parentales, compensación económica y pensión de alimentos. El curso está orientado a profesionales del área del Trabajo Social y se desarrolla mediante una plataforma de autogestión con recursos digitales y evaluaciones en línea.",
    "objetivo": "Objetivo del Curso Profundizar el desarrollo de competencias básicas y habilidades esenciales para la elaboración de informes de peritaje social",
    "contenidos": "[\"Agrega el curso a tu carrito y realiza la compra para acceder inmediatamente al contenido.\"]",
    "precio": 20000,
    "horas": 32,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "ciencias-tecnicas",
    "img_name": "image.png"
  },
  {
    "titulo": "Inspector Educacional y Mediación Escolar",
    "slug": "inspector-educacional-y-mediacion-escolar",
    "descripcion": "Descripción no disponible.",
    "objetivo": "Adquirir competencias y habilidades prácticas en el área del curso.",
    "contenidos": "[]",
    "precio": 450000,
    "horas": 120,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "images.jpeg"
  },
  {
    "titulo": "A Distancia – Administración de Bodega y Gestión de Inventario",
    "slug": "a-distancia-administracion-de-bodega-y-gestion-de-inventario",
    "descripcion": "Este curso nace de la demanda constante de las empresas por capacitar a las personas que operan y administran bodegas e inventarios, logrando con ello mayor eficiencia en los recursos y costos involucrados en su administración. Además, es primordial que las empresas estén preparadas en la incorporación de nuevas tecnologías para el soporte óptimo e innovador de gestiones. Sin duda, la administración de las Bodegas es un elemento fundamental para las empresas de todo el mundo; sin importar si la empresa se encarga de ofrecer productos, insumos, materia prima o cualquier otro tipo de artefacto, la bodega es un elemento indispensable que no sólo debe contar con una logística adecuada, sino que desde el principio debe contar con una estructura que facilite las labores de almacenamiento.",
    "objetivo": "Objetivo General Conocer y aplicar conceptos generales en el manejo de inventario de bodega como son sus procedimientos, recepción de materiales, almacenamiento, control de stock etc. llevando a cabo los procedimientos correspondientes para el buen desempeño de su función. Objetivos Específicos Conocer y aplicar conceptos Básicos en los procesos de bodegaje Administrar el proceso de ingreso y recepción de materiales Conocer y operar los Instrumentos en la distribución y/o almacenamiento de materiales Conocer los procedimientos y formularios de entrega de materiales Conocer y aplicar los procedimientos involucrados en la gestión del stock",
    "contenidos": "[]",
    "precio": 150000,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "diferentes-personas-que-ocupan-logistica-almacen_23-21491282.jpg"
  },
  {
    "titulo": "E-Learning – Administración de Bodega y Gestión de Inventario",
    "slug": "e-learning-administracion-de-bodega-y-gestion-de-inventario",
    "descripcion": "Este curso nace de la demanda constante de las empresas por capacitar a las personas que operan y administran bodegas e inventarios, logrando con ello mayor eficiencia en los recursos y costos involucrados en su administración. Además, es primordial que las empresas estén preparadas en la incorporación de nuevas tecnologías para el soporte óptimo e innovador de gestiones. Sin duda, la administración de las Bodegas es un elemento fundamental para las empresas de todo el mundo; sin importar si la empresa se encarga de ofrecer productos, insumos, materia prima o cualquier otro tipo de artefacto, la bodega es un elemento indispensable que no sólo debe contar con una logística adecuada, sino que desde el principio debe contar con una estructura que facilite las labores de almacenamiento.",
    "objetivo": "Objetivo General Conocer y aplicar conceptos generales en el manejo de inventario de bodega como son sus procedimientos, recepción de materiales, almacenamiento, control de stock etc. llevando a cabo los procedimientos correspondientes para el buen desempeño de su función. Objetivos Específicos Conocer y aplicar conceptos Básicos en los procesos de bodegaje Administrar el proceso de ingreso y recepción de materiales Conocer y operar los Instrumentos en la distribución y/o almacenamiento de materiales Conocer los procedimientos y formularios de entrega de materiales Conocer y aplicar los procedimientos involucrados en la gestión del stock",
    "contenidos": "[]",
    "precio": 150000,
    "horas": null,
    "modalidad": "E-Learning",
    "nivel": "Básico",
    "cat_slug": "servicio-personas",
    "img_name": "diferentes-personas-que-ocupan-logistica-almacen_23-21491282.jpg"
  }
]

  for (const c of cursos) {
    const catId = catIds[c.cat_slug]
    const imgId = mediaIds[c.img_name]
    await query(
      `INSERT INTO cursos
         (titulo, slug, descripcion, objetivo, contenidos, precio, horas, modalidad, nivel,
          activo, published_at, imagen_id, categoria_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11,$12)
       ON CONFLICT (slug) DO UPDATE SET
         titulo=$1, descripcion=$3, objetivo=$4, contenidos=$5, precio=$6, horas=$7,
         modalidad=$8, nivel=$9, imagen_id=$11, categoria_id=$12, updated_at=NOW()`,
      [
        c.titulo, c.slug, c.descripcion, c.objetivo,
        c.contenidos, c.precio, c.horas ?? null, c.modalidad, c.nivel,
        now, imgId, catId,
      ]
    )
    console.log(`  curso: ${c.titulo}`)
  }

  // ── News articles ─────────────────────────────────────────────────────────
  const noticias = [
  {
    "titulo": "Técnicas de primeros auxilios básicos RCP y DEA: aprende a salvar vidas",
    "slug": "tecnicas-de-primeros-auxilios-basicos-rcp-y-dea",
    "resumen": "Conoce nuestro curso online de primeros auxilios básicos, RCP y uso del DEA. Capacítate para responder ante emergencias médicas con protocolos internacionales, sin importar tu sector laboral.",
    "contenido": "La capacitación en primeros auxilios es una necesidad transversal en todos los sectores de la economía. En CETMED ofrecemos el curso **Técnicas de Primeros Auxilios Básicos RCP y DEA**, diseñado para que cualquier persona pueda responder eficientemente ante una emergencia médica.\n\n## ¿Qué aprenderás?\n\nA lo largo de 36 horas de formación online asincrónica, el participante adquirirá competencias para:\n\n- Reconocer conceptos fundamentales de respuesta ante emergencias conforme a estándares internacionales.\n- Aplicar primeros auxilios ante fracturas, heridas y luxaciones mediante análisis de casos simulados.\n- Determinar intervenciones en emergencias médicas y protocolos ante intoxicaciones.\n- Comprender los principios de la reanimación cardiopulmonar (RCP) en contextos de emergencia extrahospitalaria.\n- Seleccionar protocolos de RCP adecuados según el grupo etario del paciente.\n- Identificar signos de obstrucción de vía aérea y aplicar las maniobras correspondientes.\n\n## ¿A quién va dirigido?\n\nEste curso está pensado para trabajadores de todos los sectores que deseen estar preparados para actuar ante una emergencia. No se requieren conocimientos previos en salud.\n\n## Modalidad y precio\n\n- **Modalidad:** Online / Asincrónico\n- **Duración:** 36 horas\n- **Precio:** $198.000 CLP\n- **Disponibilidad:** Matrícula permanente, sin límite de cupos\n\nPara más información, contáctanos en contacto@cetmed.cl o llámanos al +56 9 2778 1966.",
    "img_name": "auxilio-1.jpg",
    "published_at": "2026-02-15T10:00:00Z"
  },
  {
    "titulo": "Gestor de inclusión laboral: capacítate y marca la diferencia",
    "slug": "gestor-de-inclusion-laboral-capacitate",
    "resumen": "La Ley 21.015 obliga a empresas con 100 o más trabajadores a incorporar personas con discapacidad. Nuestro curso Gestor de Inclusión Laboral te entrega las herramientas para liderar este proceso.",
    "contenido": "La inclusión laboral no es solo una obligación legal: es una oportunidad de construir organizaciones más diversas, resilientes e innovadoras. Con la **Ley 21.015**, las empresas con 100 o más trabajadores deben reservar al menos el 1% de sus puestos para personas con discapacidad.\n\n## El rol del Gestor de Inclusión Laboral\n\nEl Gestor de Inclusión Laboral es el profesional responsable de diseñar e implementar políticas y planes de inclusión dentro de las organizaciones. Su trabajo impacta directamente en la cultura corporativa y en el cumplimiento normativo.\n\n## ¿Qué aprenderás en el curso?\n\nEn 36 horas de formación online, los participantes podrán:\n\n- Identificar conceptos clave sobre discapacidad e inclusión laboral alinearos con la normativa vigente.\n- Reconocer los estándares nacionales e internacionales aplicables a la gestión de inclusión.\n- Diseñar un plan de inclusión con enfoque de derechos y cumplimiento normativo.\n- Emplear lenguaje inclusivo al comunicarse con personas con discapacidad en entornos laborales.\n- Implementar ajustes razonables en el puesto de trabajo.\n\n## Datos del curso\n\n- **Modalidad:** Online / Asincrónico\n- **Duración:** 36 horas\n- **Precio:** $198.000 CLP (posibilidad de pago en 3 cuotas)\n- **Disponibilidad:** Matrícula permanente\n\nCETMED es un OTEC acreditado que garantiza formación de calidad conforme a la NCh 2728:2015 y los requisitos de SENCE.",
    "img_name": "inclusion.jpg",
    "published_at": "2026-02-10T10:00:00Z"
  },
  {
    "titulo": "Trabajo seguro en espacios confinados: normativa y prevención",
    "slug": "tecnicas-de-trabajo-seguro-en-espacios-confinados",
    "resumen": "Los espacios confinados representan uno de los mayores riesgos en industria y construcción. Conoce cómo capacitarse para trabajar de forma segura y cumplir con la normativa vigente.",
    "contenido": "Los accidentes en espacios confinados son frecuentemente fatales. Según estadísticas de la ACHS y del Instituto de Seguridad del Trabajo, este tipo de siniestros se encuentran entre los más graves del sector industrial y de la construcción en Chile.\n\n## ¿Qué es un espacio confinado?\n\nUn espacio confinado es cualquier lugar con acceso limitado, no diseñado para ocupación continua, con ventilación restringida y riesgo de acumulación de gases, vapores u otros peligros.\n\n## Contenido del curso\n\nNuestro programa de 48 horas aborda tres módulos fundamentales:\n\n**Módulo 1 – Riesgos y peligros:** Definiciones, marco legal aplicable, clasificación de espacios confinados e identificación de riesgos.\n\n**Módulo 2 – Planificación y prevención:** Equipos de protección personal, medidas preventivas, preparación ante emergencias y protocolos de la empresa.\n\n**Módulo 3 – Procedimientos de trabajo seguro:** Métodos de ejecución segura, supervisión y plan de respuesta ante incidentes.\n\n## ¿A quién va dirigido?\n\nTrabajadores de industria manufacturera, minería, construcción, saneamiento y cualquier sector donde existan espacios confinados en los procesos operativos.\n\n## Información del curso\n\n- **Modalidad:** Online / Asincrónico\n- **Duración:** 48 horas\n- **Precio:** $264.000 CLP\n- **Disponibilidad:** Matrícula permanente\n\nContáctanos en contacto@cetmed.cl o al +56 9 2778 1966.",
    "img_name": "trabajo-seguro.jpg",
    "published_at": "2026-02-05T10:00:00Z"
  },
  {
    "titulo": "Montaje y desmontaje seguro de andamios: todo lo que necesitas saber",
    "slug": "tecnicas-de-seguridad-montaje-desmontaje-andamios",
    "resumen": "El montaje y desmontaje de andamios es una actividad de alto riesgo en construcción y minería. Aprende los procedimientos correctos para trabajar de forma segura y conforme a la normativa.",
    "contenido": "El trabajo con andamios es una de las actividades con mayor riesgo de accidentes graves en los sectores de construcción y minería. Caídas, colapsos estructurales y accidentes por materiales son las principales causas de lesiones durante el armado y desarme de estas estructuras.\n\n## ¿Por qué capacitarse en andamios?\n\nLa normativa chilena exige que todo trabajador que opere andamios cuente con la capacitación adecuada. Además, conocer los procedimientos correctos reduce significativamente los índices de accidentabilidad en obra.\n\n## Contenido del curso\n\nEn 24 horas de formación online, el participante aprenderá:\n\n- Clasificación y tipos de andamios utilizados en la industria\n- Normativa vigente y estándares de seguridad aplicables\n- Procedimientos de arme y desarme seguro paso a paso\n- Equipos de protección personal requeridos\n- Análisis de Trabajo Seguro (AST) para operaciones con andamios\n- Identificación de riesgos y medidas de control\n\n## Ideal para\n\nTrabajadores de construcción, minería e industria que requieran operar, montar o supervisar el uso de andamios en sus faenas.\n\n## Información\n\n- **Modalidad:** E-Learning / Asincrónico\n- **Duración:** 24 horas\n- **Precio:** $132.000 CLP\n- **Matrícula:** Permanente, sin límite de cupos\n\nMás información en contacto@cetmed.cl o al +56 9 2778 1966.",
    "img_name": "andamioss.jpg",
    "published_at": "2026-01-28T10:00:00Z"
  }
]

  for (const n of noticias) {
    const imgId = mediaIds[n.img_name]
    await query(
      `INSERT INTO noticias (titulo, slug, resumen, contenido, published_at, imagen_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (slug) DO UPDATE SET
         titulo=$1, resumen=$3, contenido=$4, published_at=$5, imagen_id=$6, updated_at=NOW()`,
      [n.titulo, n.slug, n.resumen, n.contenido, n.published_at, imgId]
    )
    console.log(`  noticia: ${n.titulo}`)
  }

  console.log('\nDone! Seed completed successfully.')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
