const fs = require('fs');

async function run() {
  console.log('Generating new seed-data.js...');

  // 1. Load the scraped courses with details
  const coursesDetailed = JSON.parse(fs.readFileSync('scratch/courses_detailed.json', 'utf8'));

  // 2. Build unique media list
  const mediaMap = new Map();
  
  // Add some default ones if not already present
  const defaultMedia = [
    { name: 'trabajo-en-altura.jpg', url: 'https://cetmed.cl/wp-content/uploads/2026/02/trabajo-en-altura.jpg' },
    { name: 'andamioss.jpg', url: 'https://cetmed.cl/wp-content/uploads/2026/02/andamioss.jpg' },
    { name: 'trabajo-seguro.jpg', url: 'https://cetmed.cl/wp-content/uploads/2026/02/trabajo-seguro.jpg' },
    { name: 'inclusion.jpg', url: 'https://cetmed.cl/wp-content/uploads/2026/02/inclusion.jpg' },
    { name: 'auxilio-1.jpg', url: 'https://cetmed.cl/wp-content/uploads/2026/02/auxilio-1.jpg' },
    { name: 'sustancia-peligrosa.jpg', url: 'https://cetmed.cl/wp-content/uploads/2026/02/sustancia-peligrosa.jpg' },
    { name: 'extintores2.jpg', url: 'https://cetmed.cl/wp-content/uploads/2026/02/extintores2.jpg' },
    { name: 'bloqueo-LOTO.png', url: 'https://cetmed.cl/wp-content/uploads/2026/02/bloqueo-LOTO.png' },
    { name: 'CETMED50.png', url: 'https://cetmed.cl/wp-content/uploads/2025/10/CETMED50.png' },
    { name: 'excel-basico.jpg', url: 'https://cetmed.cl/wp-content/uploads/2025/03/primer-plano-manos-usando-computadora-portatil-pantalla-que-muestra-datos-analisis_53876-23014.jpg' },
    { name: 'electricista.jpg', url: 'https://cetmed.cl/wp-content/uploads/2025/03/electricista-masculino-trabaja-centralita-cable-conexion-electrica_169016-16570.jpg' },
    { name: 'curso_cuidadores.jpg', url: 'https://cetmed.cl/wp-content/uploads/2025/04/curso_cuidadores.jpg' },
  ];

  for (const m of defaultMedia) {
    mediaMap.set(m.name, m.url);
  }

  for (const c of coursesDetailed) {
    if (c.img_name && c.img_url) {
      mediaMap.set(c.img_name, c.img_url);
    }
  }

  const mediaList = Array.from(mediaMap.entries()).map(([name, url]) => ({ name, url }));

  // 3. Format courses list
  const coursesList = coursesDetailed.map(c => ({
    titulo: c.titulo,
    slug: c.slug,
    descripcion: c.descripcion,
    objetivo: c.objetivo,
    contenidos: JSON.stringify(c.contenidos),
    precio: c.precio,
    horas: c.horas,
    modalidad: c.modalidad,
    nivel: c.nivel,
    cat_slug: c.cat_slug,
    img_name: c.img_name
  }));

  // 4. Hardcoded noticias list (preserved from the original seed-data.js)
  const noticiasList = [
    {
      titulo: 'Técnicas de primeros auxilios básicos RCP y DEA: aprende a salvar vidas',
      slug: 'tecnicas-de-primeros-auxilios-basicos-rcp-y-dea',
      resumen: 'Conoce nuestro curso online de primeros auxilios básicos, RCP y uso del DEA. Capacítate para responder ante emergencias médicas con protocolos internacionales, sin importar tu sector laboral.',
      contenido: `La capacitación en primeros auxilios es una necesidad transversal en todos los sectores de la economía. En CETMED ofrecemos el curso **Técnicas de Primeros Auxilios Básicos RCP y DEA**, diseñado para que cualquier persona pueda responder eficientemente ante una emergencia médica.

## ¿Qué aprenderás?

A lo largo de 36 horas de formación online asincrónica, el participante adquirirá competencias para:

- Reconocer conceptos fundamentales de respuesta ante emergencias conforme a estándares internacionales.
- Aplicar primeros auxilios ante fracturas, heridas y luxaciones mediante análisis de casos simulados.
- Determinar intervenciones en emergencias médicas y protocolos ante intoxicaciones.
- Comprender los principios de la reanimación cardiopulmonar (RCP) en contextos de emergencia extrahospitalaria.
- Seleccionar protocolos de RCP adecuados según el grupo etario del paciente.
- Identificar signos de obstrucción de vía aérea y aplicar las maniobras correspondientes.

## ¿A quién va dirigido?

Este curso está pensado para trabajadores de todos los sectores que deseen estar preparados para actuar ante una emergencia. No se requieren conocimientos previos en salud.

## Modalidad y precio

- **Modalidad:** Online / Asincrónico
- **Duración:** 36 horas
- **Precio:** $198.000 CLP
- **Disponibilidad:** Matrícula permanente, sin límite de cupos

Para más información, contáctanos en contacto@cetmed.cl o llámanos al +56 9 2778 1966.`,
      img_name: 'auxilio-1.jpg',
      published_at: '2026-02-15T10:00:00Z',
    },
    {
      titulo: 'Gestor de inclusión laboral: capacítate y marca la diferencia',
      slug: 'gestor-de-inclusion-laboral-capacitate',
      resumen: 'La Ley 21.015 obliga a empresas con 100 o más trabajadores a incorporar personas con discapacidad. Nuestro curso Gestor de Inclusión Laboral te entrega las herramientas para liderar este proceso.',
      contenido: `La inclusión laboral no es solo una obligación legal: es una oportunidad de construir organizaciones más diversas, resilientes e innovadoras. Con la **Ley 21.015**, las empresas con 100 o más trabajadores deben reservar al menos el 1% de sus puestos para personas con discapacidad.

## El rol del Gestor de Inclusión Laboral

El Gestor de Inclusión Laboral es el profesional responsable de diseñar e implementar políticas y planes de inclusión dentro de las organizaciones. Su trabajo impacta directamente en la cultura corporativa y en el cumplimiento normativo.

## ¿Qué aprenderás en el curso?

En 36 horas de formación online, los participantes podrán:

- Identificar conceptos clave sobre discapacidad e inclusión laboral alinearos con la normativa vigente.
- Reconocer los estándares nacionales e internacionales aplicables a la gestión de inclusión.
- Diseñar un plan de inclusión con enfoque de derechos y cumplimiento normativo.
- Emplear lenguaje inclusivo al comunicarse con personas con discapacidad en entornos laborales.
- Implementar ajustes razonables en el puesto de trabajo.

## Datos del curso

- **Modalidad:** Online / Asincrónico
- **Duración:** 36 horas
- **Precio:** $198.000 CLP (posibilidad de pago en 3 cuotas)
- **Disponibilidad:** Matrícula permanente

CETMED es un OTEC acreditado que garantiza formación de calidad conforme a la NCh 2728:2015 y los requisitos de SENCE.`,
      img_name: 'inclusion.jpg',
      published_at: '2026-02-10T10:00:00Z',
    },
    {
      titulo: 'Trabajo seguro en espacios confinados: normativa y prevención',
      slug: 'tecnicas-de-trabajo-seguro-en-espacios-confinados',
      resumen: 'Los espacios confinados representan uno de los mayores riesgos en industria y construcción. Conoce cómo capacitarse para trabajar de forma segura y cumplir con la normativa vigente.',
      contenido: `Los accidentes en espacios confinados son frecuentemente fatales. Según estadísticas de la ACHS y del Instituto de Seguridad del Trabajo, este tipo de siniestros se encuentran entre los más graves del sector industrial y de la construcción en Chile.

## ¿Qué es un espacio confinado?

Un espacio confinado es cualquier lugar con acceso limitado, no diseñado para ocupación continua, con ventilación restringida y riesgo de acumulación de gases, vapores u otros peligros.

## Contenido del curso

Nuestro programa de 48 horas aborda tres módulos fundamentales:

**Módulo 1 – Riesgos y peligros:** Definiciones, marco legal aplicable, clasificación de espacios confinados e identificación de riesgos.

**Módulo 2 – Planificación y prevención:** Equipos de protección personal, medidas preventivas, preparación ante emergencias y protocolos de la empresa.

**Módulo 3 – Procedimientos de trabajo seguro:** Métodos de ejecución segura, supervisión y plan de respuesta ante incidentes.

## ¿A quién va dirigido?

Trabajadores de industria manufacturera, minería, construcción, saneamiento y cualquier sector donde existan espacios confinados en los procesos operativos.

## Información del curso

- **Modalidad:** Online / Asincrónico
- **Duración:** 48 horas
- **Precio:** $264.000 CLP
- **Disponibilidad:** Matrícula permanente

Contáctanos en contacto@cetmed.cl o al +56 9 2778 1966.`,
      img_name: 'trabajo-seguro.jpg',
      published_at: '2026-02-05T10:00:00Z',
    },
    {
      titulo: 'Montaje y desmontaje seguro de andamios: todo lo que necesitas saber',
      slug: 'tecnicas-de-seguridad-montaje-desmontaje-andamios',
      resumen: 'El montaje y desmontaje de andamios es una actividad de alto riesgo en construcción y minería. Aprende los procedimientos correctos para trabajar de forma segura y conforme a la normativa.',
      contenido: `El trabajo con andamios es una de las actividades con mayor riesgo de accidentes graves en los sectores de construcción y minería. Caídas, colapsos estructurales y accidentes por materiales son las principales causas de lesiones durante el armado y desarme de estas estructuras.

## ¿Por qué capacitarse en andamios?

La normativa chilena exige que todo trabajador que opere andamios cuente con la capacitación adecuada. Además, conocer los procedimientos correctos reduce significativamente los índices de accidentabilidad en obra.

## Contenido del curso

En 24 horas de formación online, el participante aprenderá:

- Clasificación y tipos de andamios utilizados en la industria
- Normativa vigente y estándares de seguridad aplicables
- Procedimientos de arme y desarme seguro paso a paso
- Equipos de protección personal requeridos
- Análisis de Trabajo Seguro (AST) para operaciones con andamios
- Identificación de riesgos y medidas de control

## Ideal para

Trabajadores de construcción, minería e industria que requieran operar, montar o supervisar el uso de andamios en sus faenas.

## Información

- **Modalidad:** E-Learning / Asincrónico
- **Duración:** 24 horas
- **Precio:** $132.000 CLP
- **Matrícula:** Permanente, sin límite de cupos

Más información en contacto@cetmed.cl o al +56 9 2778 1966.`,
      img_name: 'andamioss.jpg',
      published_at: '2026-01-28T10:00:00Z',
    }
  ];

  // 5. Build seed-data.js file contents
  const fileContent = `/**
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
      \`INSERT INTO categorias (nombre, slug, icono)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET nombre=$1, icono=$3
       RETURNING id\`,
      [c.nombre, c.slug, c.icono]
    )
    catIds[c.slug] = row.id
    console.log(\`  cat: \${c.nombre} → id \${catIds[c.slug]}\`)
  }

  // ── Media (external URLs from cetmed.cl) ─────────────────────────────────
  const mediaList = ${JSON.stringify(mediaList, null, 2)}

  const mediaIds = {}
  for (const m of mediaList) {
    const existing = await queryOne('SELECT id FROM media WHERE name=$1', [m.name])
    let id
    if (existing) {
      id = existing.id
    } else {
      const row = await queryOne(
        \`INSERT INTO media (url, name, mime_type) VALUES ($1, $2, $3) RETURNING id\`,
        [m.url, m.name, m.name.endsWith('.png') ? 'image/png' : 'image/jpeg']
      )
      id = row.id
    }
    mediaIds[m.name] = id
    console.log(\`  media: \${m.name} → id \${id}\`)
  }

  // ── Courses ───────────────────────────────────────────────────────────────
  const now = new Date().toISOString()
  const cursos = ${JSON.stringify(coursesList, null, 2)}

  for (const c of cursos) {
    const catId = catIds[c.cat_slug]
    const imgId = mediaIds[c.img_name]
    await query(
      \`INSERT INTO cursos
         (titulo, slug, descripcion, objetivo, contenidos, precio, horas, modalidad, nivel,
          activo, published_at, imagen_id, categoria_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11,$12)
       ON CONFLICT (slug) DO UPDATE SET
         titulo=$1, descripcion=$3, objetivo=$4, contenidos=$5, precio=$6, horas=$7,
         modalidad=$8, nivel=$9, imagen_id=$11, categoria_id=$12, updated_at=NOW()\`,
      [
        c.titulo, c.slug, c.descripcion, c.objetivo,
        c.contenidos, c.precio, c.horas ?? null, c.modalidad, c.nivel,
        now, imgId, catId,
      ]
    )
    console.log(\`  curso: \${c.titulo}\`)
  }

  // ── News articles ─────────────────────────────────────────────────────────
  const noticias = ${JSON.stringify(noticiasList, null, 2)}

  for (const n of noticias) {
    const imgId = mediaIds[n.img_name]
    await query(
      \`INSERT INTO noticias (titulo, slug, resumen, contenido, published_at, imagen_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (slug) DO UPDATE SET
         titulo=$1, resumen=$3, contenido=$4, published_at=$5, imagen_id=$6, updated_at=NOW()\`,
      [n.titulo, n.slug, n.resumen, n.contenido, n.published_at, imgId]
    )
    console.log(\`  noticia: \${n.titulo}\`)
  }

  console.log('\\nDone! Seed completed successfully.')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
`;

  fs.writeFileSync('backend/src/seed-data.js', fileContent);
  console.log('Successfully wrote generated data to backend/src/seed-data.js!');
}

run().catch(console.error);
