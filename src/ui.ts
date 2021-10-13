import './ui.css';
import * as JSZip from '../node_modules/jszip/dist/jszip';
import { TextFiles } from './runBounds';

/****** Document ********/
window.onload = function () {
    document.getElementById('nav-bounds').onclick = e => handleTabClick(e, 'Bounds');
    document.getElementById('nav-comp-h').onclick = e => handleTabClick(e, 'ComponentH');
    document.getElementById('nav-comp-cpp').onclick = e => handleTabClick(e, 'ComponentCpp');
    document.getElementById('runBounds').onclick = e => runBounds();
    document.getElementById('runHeader').onclick = e => runHeader();
    document.getElementById('runDeclaration').onclick = e => runDeclaration();
    document.getElementById('clear').onclick = e => clearTextarea();
    document.getElementById('save').onclick = e => saveToFile();
};
/****** Helpful *******/
function writeError(msg) {
    clearStatus();
    let ele = document.getElementById('errors');
    ele.textContent = msg;
}
function clearError() {
    let ele = document.getElementById('errors');
    ele.textContent = '';
}
function writeStatus(msg) {
    clearError();
    let ele = document.getElementById('status');
    ele.textContent = msg;
}
function clearStatus() {
    let ele = document.getElementById('status');
    ele.textContent = '';
}
function clearTextarea() {
    clearError();
    let ele = document.getElementById('text');
    ele.textContent = '';
}
function handleTabClick(evt, tabName) {
    var i, navcontent, navitems;
    navcontent = document.getElementsByClassName('navcontent');
    for (i = 0; i < navcontent.length; i++) {
        navcontent[i].style.display = 'none';
    }
    navitems = document.getElementsByClassName('navitems');
    for (i = 0; i < navitems.length; i++) {
        navitems[i].className = navitems[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}
function saveAs(text, filename) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/****** Main ******/
function runBounds() {
    clearTextarea();
    writeStatus('Generating. Please wait, this may take a few seconds...');
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        parent.postMessage({ pluginMessage: { type: 'runBounds' } }, '*');
    }, 50);
}

function runHeader() {
    clearTextarea();
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
    parent.postMessage({ pluginMessage: { type: 'runHeader' } }, '*');
}

function runDeclaration() {
    clearTextarea();
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
    parent.postMessage({ pluginMessage: { type: 'runDeclaration' } }, '*');
}

function saveToFile() {
    clearError();
    let ele = document.getElementById('text');
    const text = ele.textContent;
    if (text.length == 0) {
        writeError('No text to save!');
    } else {
        const filename = ele.getAttribute('_data') || 'CSS2JUCE.h';
        saveAs(text, filename);
    }
}

window.onmessage = event => {
    const { pluginMessage } = event.data;

    if (pluginMessage.type === 'output') {
        writeStatus('Finished!');
        const { payload } = pluginMessage;
        let ele = document.getElementById('text');
        ele.textContent = payload.text;
        ele.setAttribute('_data', payload.name);
        clearStatus();
    } else if (pluginMessage.type === 'zip') {
        const files: TextFiles = pluginMessage.payload;
        var zip = new JSZip();
        for (const file of files) {
            zip.file(file.name, file.body);
        }
        zip.generateAsync({ type: 'base64' }).then(base64 => {
            location.href = 'data:application/zip;base64,' + base64;

            clearTextarea();
        });
    } else if (pluginMessage.type === 'noselection') {
        clearStatus();
        writeError('Error: Nothing selected!');
    } else if (pluginMessage.type === 'toomanyselections') {
        clearStatus();
        writeError('Error: You must select only 1 layer!');
    }
};
