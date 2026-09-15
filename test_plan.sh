#!/bin/bash
# Install dependencies
npm install --silent

# Run the tests
rm -rf tests/tmp
mkdir -p tests/tmp

# Prepare utils.test_target.js
cat js/utils.js > tests/tmp/utils.test_target.js
sed -i 's/from "\.\/auth\.js"/from "..\/..\/js\/auth.js"/' tests/tmp/utils.test_target.js
sed -i 's/from '\''.\/auth\.js'\''/from '\''..\/..\/js\/auth.js'\''/' tests/tmp/utils.test_target.js
sed -i 's/from "https:\/\/www\.gstatic\.com\/firebasejs\/11\.0\.1\/firebase-firestore\.js"/from "..\/..\/__mocks__\/firebase.js"/' tests/tmp/utils.test_target.js

# Prepare auth.test_target.js
cat js/auth.js > tests/tmp/auth.test_target.js
sed -i 's/from "https:\/\/www\.gstatic\.com\/firebasejs\/11\.0\.1\/firebase-firestore\.js"/from "..\/..\/__mocks__\/firebase.js"/' tests/tmp/auth.test_target.js
sed -i 's/from "https:\/\/www\.gstatic\.com\/firebasejs\/11\.0\.1\/firebase-auth\.js"/from "..\/..\/__mocks__\/firebase.js"/' tests/tmp/auth.test_target.js
sed -i 's/from "https:\/\/www\.gstatic\.com\/firebasejs\/11\.0\.1\/firebase-app\.js"/from "..\/..\/__mocks__\/firebase.js"/' tests/tmp/auth.test_target.js
sed -i 's/from '\''.\/utils\.js'\''/from '\''..\/..\/js\/utils.js'\''/' tests/tmp/auth.test_target.js
sed -i 's/from "\.\/utils\.js"/from "..\/..\/js\/utils.js"/' tests/tmp/auth.test_target.js

# We need to test the actual utils.test.js with node because it uses native node:test
node --experimental-vm-modules node_modules/jest/bin/jest.js js/auth.test.js

node run_utils_test.cjs
