// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

import runBounds from './runBounds';
import runHeader from './runHeader';
import runDeclaration from './runDeclaration';

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(400, 400);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    const selection = figma.currentPage.selection;

    if (selection.length == 0) {
        figma.ui.postMessage({ type: 'noselection' });
    } else if (msg.type === 'runBounds') {
        runBounds();
    } else if (selection.length > 1) {
        figma.ui.postMessage({ type: 'toomanyselections' });
    } else if (msg.type === 'runHeader') {
        runHeader();
    } else if (msg.type === 'runDeclaration') {
        runDeclaration();
    }
};
