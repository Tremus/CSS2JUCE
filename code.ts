// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(400, 400);

const now = new Date().toString();

const HEADER_START = `/*
 * This file was generated by CSS 2 JUCE.
 * Do not modify this file, as your changes will likely be overwritten!
 *
 * Author: Tré Dudman
 * Github: https://github.com/Tremus
 * Repo: https://github.com/Tremus/CSS2JUCE
 * Last Compiled At: ${now}
 */

#pragma onces
#include <JuceHeader.h>

namespace GUI
{
namespace Dimensions
{
`;

const HEADER_END = `
} // end namespace Dimensions

} // end namespace GUI`;

class Rectangle {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    children: Array<Rectangle>;

    constructor(_name: string, _x: number, _y: number, _width: number, _height: number) {
        // remove spaces and non alphanumeric characters from names
        let n = _name.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '_');
        // prepends a _ if the name begins with a number
        if (/^[0-9]/.test(n)) {
            n = '_' + n;
        }

        this.name = n;
        this.x = _x;
        this.y = _y;
        this.width = _width;
        this.height = _height;
        this.children = [];
    }

    // recursively translates x/y position
    translateChildren(): void {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            // recursion
            child.translateChildren();
            // This must come after calling child.translateChildren()
            // That way children will start from 0, rather than the parents
            // deducting 0 from their children
            child.x -= this.x;
            child.y -= this.y;
        }
    }
    toString(): string {
        let text = '';
        text += `namespace ${this.name}\n`;
        text += '{\n';
        text += `const juce::Rectangle<float> Bounds { ${this.x}, ${this.y}, ${this.width}, ${this.height} };\n`;

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            text += child.toString();
        }

        text += `} // end namespace ${this.name}\n`;

        return text;
    }
}

const parseToRectangle = (node: SceneNode): Rectangle => {
    const rect = new Rectangle(node.name, node.x, node.y, node.width, node.height);

    if ('children' in node) {
        // console.log(`${node.name} has ${node.children.length} children`);
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            const nextRect = parseToRectangle(child);
            rect.children.push(nextRect);
        }
    }
    return rect;
};

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.

    if (msg.type === 'run') {
        const selection = figma.currentPage.selection;
        // console.log(selection);

        if (selection.length == 0) {
            figma.ui.postMessage({ type: 'noselection' });
        } else {
            let text = '';
            text += HEADER_START;
            for (let [idx, listItem] of selection.entries()) {
                let rect = parseToRectangle(listItem);
                rect.translateChildren();

                text += rect.toString();
            }
            text += HEADER_END;

            figma.ui.postMessage({ type: 'output', data: text });
        }
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
