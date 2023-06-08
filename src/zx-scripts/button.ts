import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import type { IParseTreeNode, IWidgetInitialiseOptions } from 'tiddlywiki';

class ZXExecuteButtonWidget extends Widget {
  /**
   * Lifecycle method: call this.initialise and super
   */
  constructor(parseTreeNode: IParseTreeNode, options?: IWidgetInitialiseOptions) {
    super(parseTreeNode, options);
    this.initialise(parseTreeNode, options);
  }

  /**
   * Lifecycle method: Render this widget into the DOM
   */
  render(parent: Element, nextSibling: Element | null) {
    this.parentDomNode = parent;
    this.computeAttributes();
    const importButton = this.document.createElement('button');
    $tw.utils.addClass(importButton, 'tc-btn-invisible');
    importButton.innerHTML = `${
      $tw.wiki.getTiddlerText(
        '$:/plugins/linonetwo/zx-script/zx-icon',
      )
    }<span class="tc-btn-text tc-button-zx-script-caption">${
      $tw.wiki.getTiddlerText(
        '$:/plugins/linonetwo/zx-script/zx-button-caption',
      )
    }</span>`;
    importButton.onclick = this.onExecuteButtonClick.bind(this);
    importButton.title = 'ZX';
    importButton.ariaLabel = importButton.title;
    parent.insertBefore(importButton, nextSibling);
    this.domNodes.push(importButton);
  }

  /**
   * Event listener of button
   */
  async onExecuteButtonClick() {
    const title = this.getAttribute('title');
    if (!title) {
      return;
    }
    const type = this.getAttribute('type') || 'text/vnd.tiddlywiki';
    const stateTiddlerTitle = `$:/state/linonetwo/zx-script/output/${title}`;
    let fileName = title.replace(/[/$:]/g, '-');
    const fileContent = this.getAttribute('content', '');
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
        case 'application/javascript':
        default: {
          fileName += '.mjs';
          break;
        }
      }
    }

    $tw.wiki.setText(stateTiddlerTitle, 'text', undefined, '');
    window.observables.native
      .executeZxScript$({
        fileContent,
        fileName,
      })
      .subscribe(output => {
        const prevText = $tw.wiki.getTiddlerText(stateTiddlerTitle);
        $tw.wiki.setText(
          stateTiddlerTitle,
          'text',
          undefined,
          `${prevText ?? ''}\n${output ?? ''}`,
        );
        $tw.wiki.setText(
          stateTiddlerTitle,
          'type',
          undefined,
          'text/vnd.tiddlywiki',
        );
      });
  }
}

exports['execute-zx-script'] = ZXExecuteButtonWidget;
