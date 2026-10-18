const fs = require('fs');
console.log(fs.readFileSync('js/api.js', 'utf8').includes('submitDetailingRequestCore'));
