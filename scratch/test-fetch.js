const fs = require('fs');

async function test() {
  const url = 'https://cetmed.cl/mediacion-familiar-y-su-aplicacion-en-contextos-institucionales/';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync('scratch/course_detail_test.html', text);
  console.log('Saved to scratch/course_detail_test.html');
}

test().catch(console.error);
