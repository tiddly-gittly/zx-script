/// <reference types="jasmine" />

import { convertShellScriptToZx } from './execute';

describe('shell script conversion', () => {
  it('initializes the PowerShell quote function before running commands on Windows', () => {
    expect(convertShellScriptToZx('adb shell settings put global force_fsg_nav_bar 1')).toBe(
      [
        `if (process.platform === 'win32') usePwsh();`,
        'await $`adb shell settings put global force_fsg_nav_bar 1`;',
      ].join('\n'),
    );
  });
});
