/* eslint-disable no-param-reassign */
export function execute(title: string, fileContent: string, type = 'text/vnd.tiddlywiki', onStart: () => void, onOutput: (output: string) => void) {
  if (!('observables' in window)) return;
  let fileName = title.replace(/[/$:]/g, '-');
  // add mjs or md to the end
  if (
    !fileName.endsWith('.mjs') &&
    !fileName.endsWith('.js') &&
    !fileName.endsWith('.md')
  ) {
    switch (type) {
      // try fit everything that may have ```js block into md
      case 'text/vnd.tiddlywiki':
      case 'text/plain':
      case 'text/markdown':
      case 'text/x-markdown':
      case 'text/html': {
        fileName += '.md';
        break;
      }
      case 'text/x-shellscript': {
        fileContent = fileContent
          .split('\n')
          .map((line: string) => `await $\`${line.trim()}\`;`)
          .join('\n');
        fileName += '.mjs';
        break;
      }
      case 'application/typescript': {
        fileName += '.ts';
        break;
      }
      case 'application/javascript':
      default: {
        fileName += '.mjs';
        break;
      }
    }
  }

  onStart();
  window.observables.native
    .executeZxScript$({
      fileContent,
      fileName,
    })
    .subscribe(onOutput);
}
