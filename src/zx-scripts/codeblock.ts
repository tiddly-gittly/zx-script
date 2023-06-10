const BaseCodeBlockWidget = require('$:/core/modules/widgets/codeblock.js').codeblock;

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
      let fileName = 'tmp';
      let fileContent = this.getAttribute('code');
      switch (language) {
        case 'md': {
          fileName += '.md';
          break;
        }
        case 'js':
        case 'javascript': {
          fileName += '.mjs';
          break;
        }
        case 'ts':
        case 'typescript': {
          fileName += '.ts';
          break;
        }
        case 'bash':
        case 'zsh':
        case 'shell':
        case 'sh': {
          fileName += '.mjs';
          fileContent = fileContent
            .split('\n')
            .map((line: string) => `await $\`${line.trim()}\`;`)
            .join('\n');
          break;
        }
        default: {
          outputElement.innerText = `ZX don't execute ${language}`;
          return;
        }
      }

      outputElement.innerText = '';
      outputElement.style.display = 'flex';
      $tw.utils.addClass(outputElement, 'hljs');
      $tw.utils.addClass(outputElement, 'js');
      $tw.utils.addClass(outputElement, 'javascript');
      let prevText = '';
      window.observables.native
        .executeZxScript$({
          fileContent,
          fileName,
        })
        .subscribe((output) => {
          const fullText = `${prevText}${prevText ? '\n\n' : ''}${output ?? ''}`;
          prevText = fullText;
          // try render output as wikitext, so literal program or programmatically visualization is possible
          try {
            const renderedHTML = $tw.wiki.renderText('text/html', 'text/vnd.tiddlywiki', fullText);
            outputElement.innerHTML = renderedHTML;
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
