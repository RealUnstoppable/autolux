#!/bin/bash
# Install dependencies
npm install --silent
npx playwright install
node run_tests.cjs
node run_utils_test.cjs
