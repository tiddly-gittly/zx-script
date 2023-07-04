import { Widget } from 'tiddlywiki';
import { execute } from './execute';

const BaseCodeBlockWidget = require('$:/core/modules/widgets/codeblock.js').codeblock;

const ZX_SCRIPT_OUTPUT_ID = 'zx-script-output-id';
// Hijack core codeblock widget render()
BaseCodeBlockWidget.prototype.render = function(parent: Element, nextSibling: Element | null) {
  this.parentDomNode = parent;
  this.computeAttributes();
  this.execute();
  const codeElement = this.document.createElement('code');
  const preElement = this.document.createElement('pre');
  codeElement.appendChild(this.document.createTextNode(this.getAttribute('code')));
  preElement.appendChild(codeElement);

  const language = this.getAttribute('language');
  const outputElement = this.document.createElement('article');
  outputElement.style.display = 'none';
  $tw.utils.addClass(outputElement, 'zx-script-output');
  if (['md', 'js', 'javascript', 'ts', 'typescript', 'bash', 'shell', 'sh', 'zsh'].includes(language)) {
    const executeButtonElement = this.document.createElement('button');
    executeButtonElement.innerText = 'ZX';
    executeButtonElement.className = 'code-block-zx-script-execution-button';
    executeButtonElement.addEventListener('click', () => {
      const title = `tmp.${language}`;
      const fileContent = this.getAttribute('code');
      let type = 'text/vnd.tiddlywiki';
      switch (language) {
        case 'markdown':
        case 'md': {
          type = 'text/x-markdown';
          break;
        }
        case 'js':
        case 'javascript': {
          type = 'application/javascript';
          break;
        }
        case 'ts':
        case 'typescript': {
          type = 'application/typescript';
          break;
        }
        case 'bash':
        case 'zsh':
        case 'shell':
        case 'sh': {
          type = 'text/x-shellscript';
          break;
        }
        default: {
          outputElement.innerText = `ZX don't execute ${language}`;
          return;
        }
      }

      const outputID = Math.random().toString(36).slice(2);
      let prevText = '';
      execute(title, fileContent, type, () => {
        outputElement.innerText = '';
        outputElement.style.display = 'flex';
        $tw.utils.addClass(outputElement, 'hljs');
        $tw.utils.addClass(outputElement, 'js');
        $tw.utils.addClass(outputElement, 'javascript');
        prevText = '';
      }, (output) => {
        const fullText = `${prevText}${prevText ? '\n\n' : ''}${output ?? ''}`;
        prevText = fullText;
        // try render output as wikitext, so literal program or programmatically visualization is possible
        try {
          // clear previous output widget
          this.children = this.children.filter((child: Widget) => child.getVariable(ZX_SCRIPT_OUTPUT_ID, { allowSelfAssigned: true }) !== outputID);
          // clear content manually, otherwise it will append new content to the end
          outputElement.innerText = '';
          // create a new output widget
          const astNode = $tw.wiki.parseText('text/vnd.tiddlywiki', fullText).tree;
          const newWidgetNode = this.makeChildWidget({ type: 'tiddler', children: astNode });
          newWidgetNode.setVariable(ZX_SCRIPT_OUTPUT_ID, outputID);
          newWidgetNode.render(outputElement, null);
          this.children.push(newWidgetNode);
        } catch (error) {
          console.error(error);
          outputElement.innerText = fullText;
        }
      });
    });

    parent.insertBefore(executeButtonElement, nextSibling);
  }

  parent.insertBefore(preElement, nextSibling);
  parent.insertBefore(outputElement, nextSibling);
  this.domNodes.push(preElement);
  this.domNodes.push(outputElement);
  if (this.postRender) {
    this.postRender();
  }
};
