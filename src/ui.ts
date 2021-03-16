import './ui.css';
/****** Document ********/
window.onload = function () {
    document.getElementById('nav-bounds').onclick = e => openCity(e, 'Bounds');
    document.getElementById('nav-comp-h').onclick = e => openCity(e, 'ComponentH');
    document.getElementById('nav-comp-cpp').onclick = e => openCity(e, 'ComponentCpp');
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
function openCity(evt, cityName) {
    var i, navcontent, navitems;
    navcontent = document.getElementsByClassName('navcontent');
    for (i = 0; i < navcontent.length; i++) {
        navcontent[i].style.display = 'none';
    }
    navitems = document.getElementsByClassName('navitems');
    for (i = 0; i < navitems.length; i++) {
        navitems[i].className = navitems[i].className.replace(' active', '');
    }
    document.getElementById(cityName).style.display = 'block';
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
    setTimeout(() => {
        parent.postMessage({ pluginMessage: { type: 'runBounds' } }, '*');
    }, 50);
}

function runHeader() {
    clearTextarea();
    parent.postMessage({ pluginMessage: { type: 'runHeader' } }, '*');
}

function runDeclaration() {
    clearTextarea();
    parent.postMessage({ pluginMessage: { type: 'runDeclaration' } }, '*');
}

function saveToFile() {
    clearError();
    let ele = document.getElementById('text');
    const text = ele.textContent;
    if (text.length == 0) {
        writeError('No text to save!');
    } else {
        saveAs(text, 'CSS2JUCE.h');
    }
}

window.onmessage = event => {
    const { pluginMessage } = event.data;

    if (pluginMessage.type === 'output') {
        writeStatus('Finished!');
        let ele = document.getElementById('text');
        ele.textContent = pluginMessage.data;
        clearStatus();
    } else if (pluginMessage.type === 'pong-runHeader') {
        console.log('recived: pong-runHeader');
    } else if (pluginMessage.type === 'pong-runDeclaration') {
        console.log('recived: pong-runDeclaration');
    } else if (pluginMessage.type === 'noselection') {
        clearStatus();
        writeError('Nothing selected!');
    }
};