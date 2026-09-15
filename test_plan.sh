#!/bin/bash
# Install dependencies
npm install --silent

# Re-create tmp/utils.test_target.js since it's missing in some runs
mkdir -p tests/tmp
cat << 'INNER_EOF' > tests/tmp/utils.test_target.js
import { escapeHTML, submitDetailingRequest } from '../../js/utils.js';
export { escapeHTML, submitDetailingRequest };
INNER_EOF

# Run the tests
npm run test
# capture the exit code
exit_code=$?
return $exit_code 2>/dev/null || false
