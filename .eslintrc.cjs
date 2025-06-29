module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Минимальные правила для starter kit
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-undef': 'off', // TypeScript обрабатывает это
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    '*.cjs',
    'html/',
    'test-output/',
    'carousel-output/',
    'logs/',
    'tools/',
    'scripts/',
  ],
};
