#!/bin/bash

# Setup temporary directory for test target
mkdir -p tests/tmp

# Read js/utils.js and create a testable version by replacing the Firebase imports
cat js/utils.js | sed -e 's|https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js|../mocks/firestore.mock.js|g' \
                      -e "s|'./auth.js'|'../mocks/auth.mock.js'|g" > tests/tmp/utils.test_target.js

echo "Running tests..."
node --test tests/utils.test.js
EXIT_CODE=$?

echo "Cleaning up generated test target file..."
rm -rf tests/tmp

# Exit with the exit code from the tests
if [ $EXIT_CODE -ne 0 ]; then
  echo "Tests failed!"
  # In our bash context, we use return instead of exit to prevent closing the shell
  return $EXIT_CODE 2>/dev/null || false
fi
