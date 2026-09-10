import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'public/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-undef': 'error',
    },
  },
];
