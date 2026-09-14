export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    "^https://www.gstatic.com/firebasejs/(.*)$": "<rootDir>/__mocks__/firebase.js"
  }
};
