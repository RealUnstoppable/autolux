#!/bin/bash
# Install dependencies
npm install --silent

# Run playwright tests wrapper
node run_utils_test.cjs
node run_tests.cjs
