module.exports = {
  root: true,
  rules: {
    'dprint-integration/dprint': [
      'warn',
      // Global Config (will pass to the dprint formatter directly): Available at https://dprint.dev/config/
      {
        useDprintJson: true,
      },
      // Plugin Specific Config (will pass to the dprint plugins): Available at https://dprint.dev/plugins/
      {
        useDprintJson: true,
      },
    ],
    'prettier/prettier': 'off',
    '@typescript-eslint/method-signature-style': 'off',
    'import/order': 'off',
  },
  extends: [
    '@modern-js/eslint-config',
    'plugin:dprint-integration/recommended',
    'plugin:dprint-integration/disable-conflict',
  ],
  plugins: ['dprint-integration'],
};
