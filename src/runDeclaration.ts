import { getDateString, cleanString } from './utils';

const getHeaderPt1 = (classname: string): string => `
/*
  ==============================================================================

  ${classname}View.cpp
  Created: ${getDateString()}
  Author:  CSS 2 JUCE

  ==============================================================================
*/

#include <JuceHeader.h>
#include <MyEditor.h>
#include "${classname}View.h"

//==============================================================================
${classname}View::${classname}View(MyEditor& e): editor(e)
{`;

const getAddAndMakeVisible = (classname: string): string => `
    addAndMakeVisible(m${classname});`;

const getHeaderPt2 = (classname: string): string => `
}

${classname}View::~${classname}View()
{
}

void ${classname}View::paint (juce::Graphics& g)
{
}

void ${classname}View::resized()
{
    `;

// Recursively looks through parent group nodes and returns the
// names in the order parent -> child
const getLevelNames = (node: SceneNode): Array<string> => {
    let levelNames = [];
    if ('parent' in node && node.parent.type === 'GROUP') {
        let parentNames = getLevelNames(node.parent);
        levelNames = [...parentNames, ...levelNames];
    }
    levelNames.push(cleanString(node.name));
    return levelNames;
};

const getNamespace = (levels: Array<string>): string => {
    const str = levels.join('::');
    return `using namespace GUI::Dimensions::${str}\n`;
};
const getSetChildBounds = (classname: string): string => `
    m${classname}View.setBounds((${classname}::Bounds * editor.mScaleFactor).toNearestInt());`;

const getHeaderPt3 = (classname: string): string => `
}
`;

const runDeclaration = (): void => {
    const selection = figma.currentPage.selection;

    const selectedLayer = selection[0];
    const name = cleanString(selectedLayer.name);
    const childrenNames = [];
    const levelNames = getLevelNames(selectedLayer);

    if ('children' in selectedLayer) {
        for (let i = 0; i < selectedLayer.children.length; i++) {
            const child = selectedLayer.children[i];
            const childName = cleanString(child.name);
            childrenNames.push(childName);
        }
    }

    let text = '';
    text += getHeaderPt1(name);
    for (const n of childrenNames) {
        text += getAddAndMakeVisible(n);
    }
    text += getHeaderPt2(name);
    text += getNamespace(levelNames);
    for (const n of childrenNames) {
        text += getSetChildBounds(n);
    }
    text += getHeaderPt3(name);

    figma.ui.postMessage({ type: 'output', data: text });
};

export default runDeclaration;
