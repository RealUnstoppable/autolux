#!/bin/bash

# Ensure playwright is installed
if ! npm list -g playwright > /dev/null 2>&1; then
    echo "Installing playwright globally..."
    npm install -g playwright
    npx playwright install chromium
fi

# Run playwright tests
NODE_PATH=$(npm root -g) node run_tests.js
exit_code=$?
[ $exit_code -ne 0 ] && false
