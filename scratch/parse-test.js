const fs = require('fs');
const html = fs.readFileSync('scratch/course_detail_test.html', 'utf8');
const clean = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<svg[\s\S]*?<\/svg>/gi, '');
fs.writeFileSync('scratch/course_detail_test_clean.html', clean);
console.log('Cleaned HTML written to scratch/course_detail_test_clean.html');
