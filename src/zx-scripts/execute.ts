/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-param-reassign */
export function execute(title: string, fileContent: string, type = 'text/vnd.tiddlywiki', onStart: () => void, onOutput: (output: string) => void) {
  if (!('observables' in window)) return;
  let fileName = title.replaceAll(/[$/:]/g, '-');
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
      // case 'application/javascript':
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

export function executeOnTiddler(title: string, field: string = 'text') {
  if (!title) {
    return;
  }
  const tiddler = $tw.wiki.getTiddler(title);
  const type = tiddler?.fields.type || 'text/vnd.tiddlywiki';
  const fileContent = tiddler?.fields[field] as string || '';
  const stateTiddlerTitle = `$:/state/linonetwo/zx-script/output/${title}`;
  execute(title, fileContent, type, () => {
    $tw.wiki.setText(stateTiddlerTitle, 'text', undefined, '');
  }, output => {
    const previousText = $tw.wiki.getTiddlerText(stateTiddlerTitle);
    $tw.wiki.setText(
      stateTiddlerTitle,
      'text',
      undefined,
      `${previousText ?? ''}\n${output ?? ''}`,
    );
    $tw.wiki.setText(
      stateTiddlerTitle,
      'type',
      undefined,
      'text/vnd.tiddlywiki',
    );
  });
}

export function executeOnAnyContent(id: string, content: string, contentType: string = 'application/javascript') {
  if (!id) {
    return;
  }
  const stateTiddlerTitle = `$:/state/linonetwo/zx-script/output/${id}`;
  const title = `zx-tmp-${id}`;
  execute(title, content, contentType, () => {
    $tw.wiki.setText(stateTiddlerTitle, 'text', undefined, '');
  }, output => {
    const previousText = $tw.wiki.getTiddlerText(stateTiddlerTitle);
    $tw.wiki.setText(
      stateTiddlerTitle,
      'text',
      undefined,
      `${previousText ?? ''}\n${output ?? ''}`,
    );
    $tw.wiki.setText(
      stateTiddlerTitle,
      'type',
      undefined,
      'text/vnd.tiddlywiki',
    );
  });
}
