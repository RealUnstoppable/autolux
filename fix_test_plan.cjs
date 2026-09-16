const fs = require('fs');

const content = `#!/bin/bash
# Install dependencies
npm install --silent

# Run the tests
node run_utils_test.cjs
`;

fs.writeFileSync('test_plan.sh', content);
