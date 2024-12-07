/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { executeOnAnyCode, executeOnTiddler } from './execute';

exports.name = 'zx-message';
exports.platforms = ['browser', 'node'];
exports.after = ['startup'];
exports.synchronous = true;
exports.startup = function() {
  $tw.rootWidget.addEventListener('tm-zx', function(event) {
    const title = event.paramObject?.title as string | undefined;
    if (title) {
      const field = event.paramObject?.field as string | undefined;
      executeOnTiddler(title, field);
      return false;
    }
    const id = event.paramObject?.id as string | undefined;
    const code = event.paramObject?.code as string | undefined;
    if (id && code) {
      let mimeType = event.paramObject?.mime as string | undefined || 'text/vnd.tiddlywiki';
      // language param take precedence
      const language = event.paramObject?.language as string | undefined;
      switch (language) {
        case 'markdown':
        case 'md': {
          mimeType = 'text/x-markdown';
          break;
        }
        case 'js':
        case 'javascript': {
          mimeType = 'application/javascript';
          break;
        }
        case 'ts':
        case 'typescript': {
          mimeType = 'application/typescript';
          break;
        }
        case 'bash':
        case 'zsh':
        case 'shell':
        case 'sh': {
          mimeType = 'text/x-shellscript';
          break;
        }
      }
      executeOnAnyCode(id, code, mimeType);
      return false;
    }
    return true;
  });
};
