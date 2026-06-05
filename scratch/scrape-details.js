const fs = require('fs');
const path = require('path');

// Helper to decode basic HTML entities
function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ordm;/g, '°')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean HTML tags and return plain text
function cleanText(html) {
  if (!html) return '';
  // Replace br tags with newlines
  let txt = html.replace(/<br\s*\/?>/gi, '\n');
  // Replace paragraph tags with paragraph spacing
  txt = txt.replace(/<\/p>/gi, '\n\n');
  txt = txt.replace(/<\/li>/gi, '\n');
  // Strip all other tags
  txt = txt.replace(/<[^>]+>/g, '');
  // Decode entities and return
  return decodeHtml(txt).replace(/\n\s*\n+/g, '\n\n').trim();
}

// Helper to extract elementor text widget content following a title
function extractSectionContent(html, keywords) {
  // Search for the section title
  for (const keyword of keywords) {
    const titleRegex = new RegExp(`<h[1-6][^>]*>[\\s\\S]*?${keyword}[\\s\\S]*?<\/h[1-6]>`, 'i');
    const match = titleRegex.exec(html);
    if (match) {
      // Find the next elementor text editor or elementor widget container
      const searchStartIndex = match.index + match[0].length;
      const subHtml = html.substring(searchStartIndex, searchStartIndex + 5000);
      
      const containerRegex = /<div class="elementor-widget-container">([\s\S]*?)<\/div>/i;
      const containerMatch = containerRegex.exec(subHtml);
      if (containerMatch) {
        return containerMatch[1];
      }
    }
  }
  return '';
}

// Helper to extract content list (Syllabus/Temario)
function extractSyllabus(html) {
  // Try to find under "Contenidos del Curso" or "Temario"
  let contentHtml = extractSectionContent(html, ['Contenidos del Curso', 'Contenidos', 'Temario', 'Módulos', 'Modulos']);
  
  // If not found, let's search for the accordion item contents
  if (!contentHtml) {
    const accordionTitleRegex = /class="[^"]*accordion[^"]*"[\s\S]*?>[\s\S]*?Contenidos[\s\S]*?<\/summary>([\s\S]*?)<\/details>/i;
    const match = accordionTitleRegex.exec(html);
    if (match) {
      const containerRegex = /<div class="elementor-widget-container">([\s\S]*?)<\/div>/i;
      const containerMatch = containerRegex.exec(match[1]);
      contentHtml = containerMatch ? containerMatch[1] : match[1];
    }
  }
  
  if (!contentHtml) return [];

  // Parse list items or paragraphs from the content HTML
  const items = [];
  const liRegex = /<li>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = liRegex.exec(contentHtml)) !== null) {
    const txt = cleanText(match[1]);
    if (txt) items.push(txt);
  }

  // If no <li> tags found, split by <p> or <br> or strong headings
  if (items.length === 0) {
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((match = pRegex.exec(contentHtml)) !== null) {
      const txt = cleanText(match[1]);
      if (txt) {
        // If it looks like a module heading or item, add it
        items.push(txt);
      }
    }
  }

  if (items.length === 0) {
    // Fallback: split plain text by double newlines or bullet symbols
    const plain = cleanText(contentHtml);
    const lines = plain.split(/\n+/);
    for (const line of lines) {
      const trimmed = line.replace(/^[•\-\*–]\s*/, '').trim();
      if (trimmed) items.push(trimmed);
    }
  }

  return items;
}

// Parse course details
async function scrapeCourse(course) {
  console.log(`Scraping: ${course.title} (${course.href})`);
  try {
    const res = await fetch(course.href);
    if (!res.ok) {
      console.error(`Failed to fetch course detail page: ${course.href} (${res.status})`);
      return null;
    }
    const html = await res.text();

    // 1. Description
    let descHtml = extractSectionContent(html, ['Presentación del Curso', 'Presentación', 'Descripción del Curso', 'Descripcion']);
    if (!descHtml) {
      // Fallback: try to grab the first elementor-widget-text-editor
      const firstTextWidgetRegex = /<div class="elementor-widget-text-editor[^>]*>([\s\S]*?)<\/div>/i;
      const match = firstTextWidgetRegex.exec(html);
      descHtml = match ? match[1] : '';
    }
    const descripcion = cleanText(descHtml);

    // 2. Objective
    let objHtml = extractSectionContent(html, ['Objetivo del Curso', 'Objetivo General', 'Objetivo', 'Objetivos']);
    const objetivo = cleanText(objHtml) || 'Adquirir competencias y habilidades prácticas en el área del curso.';

    // 3. Syllabus / Contenidos
    const contenidos = extractSyllabus(html);

    // 4. Hours / Duración
    let horas = null;
    // Search for "Duración" in icon boxes or text
    const durationRegex = /Duración[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i;
    const durMatch = durationRegex.exec(html);
    const durationText = durMatch ? cleanText(durMatch[1]) : '';
    
    // Find hours in the text
    const hoursMatch = /(\d+)\s*(?:horas|hrs|h\b)/i.exec(durationText || html);
    if (hoursMatch) {
      horas = parseInt(hoursMatch[1], 10);
    }

    // 5. Price
    let precio = 0;
    // Look for price box or text "$198.000"
    const priceRegex = /\$\s*(\d{1,3})(?:\.(\d{3}))+/g;
    let priceMatch;
    let pricesFound = [];
    while ((priceMatch = priceRegex.exec(html)) !== null) {
      const rawPrice = priceMatch[0].replace(/\D/g, '');
      pricesFound.push(parseInt(rawPrice, 10));
    }
    // Filter out common low numbers (like Sence/Tax codes) and take the maximum or first reasonable price
    const validPrices = pricesFound.filter(p => p > 5000 && p < 1000000);
    if (validPrices.length > 0) {
      precio = validPrices[0]; // Take the first valid price
    } else if (html.toLowerCase().includes('gratuito') || html.toLowerCase().includes('gratis')) {
      precio = 0;
    }

    // 6. Modality
    let modalidad = 'Presencial';
    const classes = course.classes || '';
    if (classes.includes('category-e-learning') || html.toLowerCase().includes('e-learning') || html.toLowerCase().includes('online')) {
      modalidad = 'E-Learning';
    } else if (classes.includes('category-b-learning') || html.toLowerCase().includes('b-learning') || html.toLowerCase().includes('semi-presencial')) {
      modalidad = 'B-Learning';
    } else if (classes.includes('category-a-distancia') || html.toLowerCase().includes('a distancia')) {
      modalidad = 'A Distancia';
    } else if (course.badge) {
      if (['E-Learning', 'Online'].includes(course.badge)) modalidad = 'E-Learning';
      else if (['B-Learning', 'Semi-presencial'].includes(course.badge)) modalidad = 'B-Learning';
    }

    // 7. Level
    let nivel = 'Básico';
    if (html.toLowerCase().includes('avanzado')) {
      nivel = 'Avanzado';
    } else if (html.toLowerCase().includes('intermedio')) {
      nivel = 'Intermedio';
    } else if (html.toLowerCase().includes('básico-intermedio') || html.toLowerCase().includes('basico-intermedio')) {
      nivel = 'Básico-Intermedio';
    }

    // 8. Category slug mapping
    let cat_slug = 'servicio-personas';
    if (classes.includes('category-construccion')) cat_slug = 'construccion';
    else if (classes.includes('category-procesos-industriales')) cat_slug = 'procesos-industriales';
    else if (classes.includes('category-salud')) cat_slug = 'salud';
    else if (classes.includes('category-ciencias-y-tecnicas-aplicadas')) cat_slug = 'ciencias-tecnicas';
    else if (classes.includes('category-computacion-e-informatica')) cat_slug = 'computacion';
    else if (classes.includes('category-electricidad-y-electronica')) cat_slug = 'electricidad';
    else if (classes.includes('category-servicio-a-las-personas')) cat_slug = 'servicio-personas';
    else {
      // Try mapping by badge text
      const badge = course.badge ? course.badge.toLowerCase() : '';
      if (badge.includes('construc')) cat_slug = 'construccion';
      else if (badge.includes('procesos') || badge.includes('industrial')) cat_slug = 'procesos-industriales';
      else if (badge.includes('salud')) cat_slug = 'salud';
      else if (badge.includes('ciencia') || badge.includes('tecnic')) cat_slug = 'ciencias-tecnicas';
      else if (badge.includes('computac') || badge.includes('informa')) cat_slug = 'computacion';
      else if (badge.includes('electr')) cat_slug = 'electricidad';
      else if (badge.includes('servicio') || badge.includes('persona')) cat_slug = 'servicio-personas';
    }

    // 9. Clean image name and construct high-res original URL
    const imgSrc = course.imgSrc || '';
    const imgFilename = imgSrc.substring(imgSrc.lastIndexOf('/') + 1);
    // Remove thumbnail suffixes like -768x512 or -150x150
    const imgNameCleaned = imgFilename.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/, '$1');
    const imgUrlCleaned = imgSrc.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/, '$1');

    return {
      titulo: decodeHtml(course.title),
      slug: course.href.replace('https://cetmed.cl/', '').replace(/\//g, ''),
      descripcion: descripcion || 'Descripción no disponible.',
      objetivo: objetivo,
      contenidos: contenidos,
      precio: precio,
      horas: horas,
      modalidad: modalidad,
      nivel: nivel,
      cat_slug: cat_slug,
      img_name: imgNameCleaned,
      img_url: imgUrlCleaned
    };
  } catch (err) {
    console.error(`Error scraping ${course.title}:`, err.message);
    return null;
  }
}

async function run() {
  const rawData = fs.readFileSync('scratch/courses_extracted.json', 'utf8');
  const extractedCourses = JSON.parse(rawData);
  console.log(`Loaded ${extractedCourses.length} courses to scrape.`);

  const detailedCourses = [];
  for (let i = 0; i < extractedCourses.length; i++) {
    const detailed = await scrapeCourse(extractedCourses[i]);
    if (detailed) {
      detailedCourses.push(detailed);
    }
    // Small delay between fetches to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  fs.writeFileSync('scratch/courses_detailed.json', JSON.stringify(detailedCourses, null, 2));
  console.log(`Scraping completed! Saved ${detailedCourses.length} detailed courses to scratch/courses_detailed.json`);
}

run().catch(console.error);
