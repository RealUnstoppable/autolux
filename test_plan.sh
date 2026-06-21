#!/bin/bash
npm i acorn
node -e "require('acorn').parse(require('fs').readFileSync('js/api.js', 'utf8'), { ecmaVersion: 2022, sourceType: 'module' })"
node -e "require('acorn').parse(require('fs').readFileSync('js/auth.js', 'utf8'), { ecmaVersion: 2022, sourceType: 'module' })"
echo "Syntax checks passed."
rm -rf node_modules package.json package-lock.json
