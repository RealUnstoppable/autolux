#!/bin/bash
# Install dependencies
npm install --silent

# Run the tests
mkdir -p tests/tmp
cat << 'EOF2' > tests/tmp/utils.test_target.js
import { escapeHTML, submitDetailingRequest } from '../../js/utils.js';
export { escapeHTML, submitDetailingRequest };
EOF2
npm run test
EXIT_CODE=$?
rm -rf tests/tmp
return $EXIT_CODE 2>/dev/null || false
