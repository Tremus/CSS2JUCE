import { getDateString, cleanString } from './utils';

const getHeaderPt1 = (classname: string): string => `/*
  ==============================================================================

    ${classname}View.h
    Created: ${getDateString()}
    Author:  CSS 2 JUCE

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include <Utils.h>`;

const getIncludeHeader = (classname: string): string => `
#include "${classname}View.h"`;

const getHeaderPt2 = (classname: string): string => `

//==============================================================================
/*
*/
class ${classname}View : public juce::Component
{
public:
    ${classname}View(MyEditor& e);
    ~${classname}View() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    MyEditor& editor;
`;
const getChildProperty = (classname: string): string => `
    ${classname}View m${classname}View { editor };`;

const getHeaderPt3 = (classname: string): string => `

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (${classname}View);
};
`;

const runHeader = (): void => {
    const selection = figma.currentPage.selection;

    const selectedLayer = selection[0];

    const name = cleanString(selectedLayer.name);
    const childrenNames = [];

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
        text += getIncludeHeader(n);
    }
    text += getHeaderPt2(name);
    for (const n of childrenNames) {
        text += getChildProperty(n);
    }
    text += getHeaderPt3(name);

    figma.ui.postMessage({ type: 'output', payload: { name: `${name}View.h`, text } });
};

export default runHeader;
