let terminalTabNum = 1;

function createTerminalTab(buttonName) {
    var tabbar = document.getElementById("tabbar");
    var tabContainer = document.getElementById("tabContainer");

    var mytab = document.createElement('div');
    mytab.id = "mytab"+terminalTabNum;
    mytab.className = "mytab";

    var subparagraph = document.createElement('p');
    subparagraph.innerHTML = buttonName;
    subparagraph.className = "mysubparagraph";
    subparagraph.onclick = new Function("terminalFocus("+terminalTabNum+")");

    var subbutton = document.createElement('input');
    subbutton.type = "button";
    subbutton.value = 'x';
    subbutton.className = "mysubbutton";
    subbutton.onclick = new Function("killPty("+terminalTabNum+")");

    var myxterm = document.createElement('div');
    myxterm.id = "myxterm" + terminalTabNum;
    myxterm.className = "myxterm";
    myxterm.style = "height: 100%; display: none;";
    myxterm.innerHTML = '<div id="terminal'+terminalTabNum+'" style="height: 100%"></div>';

    mytab.appendChild(subparagraph);
    mytab.appendChild(subbutton);
    tabbar.appendChild(mytab);

    tabContainer.appendChild(myxterm);

    showTerminalTab(terminalTabNum);

    tabbar.scrollLeft = tabbar.scrollWidth;

    return terminalTabNum++;
}

function terminalFocus(num){
    
    showTerminalTab(num);

    const terminal = getTerminalByTabNum(num);
    if(terminal === null){
        console.log("[!] error: Terminal doesn't exists.");
    }else{
        terminal.focus();
    }
}

function showTerminalTab(num){
    showTabColorByNum(num);
    showMyxtermByNum(num);

}

// x : js => killPty => ts => killPty => pty.exit => closeTab
// exit : pty.exit => closeTab
function closeTab(num){
    removeMyxtermByNum(num);
    removeTabByNum(num);
}

function showMyxtermByNum(num) {
    var divlist = document.getElementsByClassName('myxterm');
    for (var i = 0; i < divlist.length; i++) {
        divlist[i].style.setProperty('display','none');
    }
    var myxterm = document.getElementById('myxterm'+num);
    myxterm.style.setProperty('display','block');
}

function getCurentMyxtermId(){
    var divlist = document.getElementsByClassName('myxterm');
    for (var i = 0; i < divlist.length; i++) {
        if(divlist[i].style.getPropertyValue('display') === 'block'){
            return divlist[i].id;
        }
    }

    return null;

}

function removeMyxtermByNum(num){
    var container = document.getElementById('tabContainer');
    var myxterm = document.getElementById('myxterm'+num);

    var currentMyxtermId = getCurentMyxtermId();
    var myxtermId = myxterm.id;

    container.removeChild(myxterm);
    terminalObject[myxtermId].dispose();
    delete terminalObject[myxtermId];

    if(currentMyxtermId === myxtermId){
        //showLastMyxterm(); // Modify to "removeTabByNum" function for implementation.
    }
}

function showLastMyxterm(){
    var divlist = document.getElementsByClassName('myxterm');
    if(divlist.length > 0){
        divlist[divlist.length-1].style.setProperty('display','block');
    }
}

function showTabColorByNum(num) {
    var divlist = document.getElementsByClassName('mytab');
    for (var i = 0; i < divlist.length; i++) {
        divlist[i].style.setProperty('background-color','Gainsboro');

    }
    var mytab = document.getElementById('mytab'+num);
    mytab.style.setProperty('background-color','white');

}

function getCurentTabId(){
    var divlist = document.getElementsByClassName('mytab');
    for (var i = 0; i < divlist.length; i++) {
        if(divlist[i].style.getPropertyValue('background-color') === 'white'){
            return divlist[i].id;
        }
    }

    return null;
}

function removeTabByNum(num){
    var tabbar = document.getElementById('tabbar');
    var mytab = document.getElementById('mytab'+num);

    var currentTabId = getCurentTabId();
    var mytabId = mytab.id;

    tabbar.removeChild(mytab);

    if(currentTabId === mytabId){
        //showLastTab();

        // "removeMyxtermByNum 、removeTabByNum in showLastMyxterm、showLastTab"
        // Modify to "showTerminalTab" function by getting "num" for implementation.
        showLastTerminalTab();
    }else{
        var num = currentTabId.replace("mytab","");
        terminalFocus(num);
    }
}

function showLastTerminalTab(){
    var divlist = document.getElementsByClassName('mytab');
    if(divlist.length > 0){
        var num = divlist[divlist.length-1].id.replace("mytab","");
        terminalFocus(num);
        var tabbar = document.getElementById("tabbar");
        tabbar.scrollLeft = tabbar.scrollWidth;
    }
}

function showLastTab(){
    var divlist = document.getElementsByClassName('mytab');
    if(divlist.length > 0){
        divlist[divlist.length-1].style.setProperty('background-color','white');
    }
}

function killPty(num){
    var data = new Object();
    data.num = num;
    data.FromKillPty = true;
    webviewApi.postMessage(data);
}

function closeAllTerminalTab(){
    for(var i in terminalObject){
        if(i.indexOf("myxterm") === 0){
            var num = i.substring(7);
            killPty(num);
        }else{
            alert("Error closePanel");
        }
    }
    terminalTabNum = 1;
}