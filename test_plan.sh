npm i acorn
node -e "require('acorn').parse(require('fs').readFileSync('./js/api.js', 'utf8'), { ecmaVersion: 2022, sourceType: 'module' })"
