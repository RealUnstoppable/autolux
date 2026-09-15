#!/bin/bash
# Install dependencies
npm install --silent

# Run playwright tests
node run_utils_test.cjs
