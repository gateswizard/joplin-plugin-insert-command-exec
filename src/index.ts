import joplin from 'api';
import { SettingItemType, MenuItemLocation, ToolbarButtonLocation, ContentScriptType } from 'api/types';

const panels = joplin.views.panels;
let view;

const { spawn,execSync } = require('child_process');
const os = require('os');

const fs = joplin.plugins.require('fs-extra');

const treekill = require('tree-kill');

const homepath = typeof os.homedir === 'function' ? os.homedir() : homedir();

const ptyObject = {};

joplin.plugins.register({
    onStart: async function() {
        // Run your plugin code here
        await registerMyWorkDirectory();
        await setupWebviewDialog();
        await setupContentScriptMarkdownIt();
        await setupWebviewPanel();
        await tellPlatform();

    }
});

async function registerMyWorkDirectory() {
    // myWorkDirectory variable register
    await joplin.settings.registerSection('myCustomSection', {
        label: 'My Custom Section',
    });
        
    await joplin.settings.registerSettings({
        'myWorkDirectory': {
            value: '',
            type: SettingItemType.String,
            section: 'myCustomSection',
            public: true,
            label: 'work directory path',
        },
    });

    // setWorkDirectory button register
    const dialogs = joplin.views.dialogs;
    const handlePath = await dialogs.create('myDialogPath');

    await joplin.commands.register({
        name: 'setWorkDirectory',
        label: 'Set work directory',
        execute: async () => {
            const workpath = await workdir();
            await dialogs.setHtml(handlePath, `
            <p>Set work directory</p>
            <form name="work_directory">
            <input type="text" name="path" value="${workpath}" style="width: 192px;"/>
            </form>
            `);

            const resultPath = await joplin.views.dialogs.open(handlePath);
            if (resultPath.id === "ok"){
                const setdir = resultPath.formData.work_directory['path'];
                if (fs.existsSync(setdir)){
                    await joplin.settings.setValue('myWorkDirectory',setdir);
                }else{
                    alertOnJS(`"${setdir}" Directory not found.`);
                }
            }
        },
    });

    await joplin.views.menuItems.create('myMenuItemWorkDirectory', 'setWorkDirectory', MenuItemLocation.Tools);
}

async function setupWebviewDialog() {
    const dialogs = joplin.views.dialogs;
    const handle = await dialogs.create('myDialog1');
    await dialogs.setHtml(handle, `
    <p>Insert Command</p>

    <style>
        .divarg{
        display: flex;
        max-height: 200px;
        overflow-x: hidden;
        overflow-y: overlay;
        }

        /*scrollbar setting*/
        .divarg::-webkit-scrollbar {
            width: 7px;
        }
        ::-webkit-scrollbar-corner {
            background: none;
        }
        ::-webkit-scrollbar-track {
            border: none;
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(100, 100, 100, 0.3); 
            border-radius: 5px;
        }
        ::-webkit-scrollbar-track:hover {
            background: rgba(0, 0, 0, 0.1); 
            border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 100, 100, 0.7);
            border-radius: 5px;
        }

        .divcmd{
            display: flex;
            max-height: 200px;
            overflow-x: hidden;
            overflow-y: overlay;
        }

        /*scrollbar setting*/
        .divcmd::-webkit-scrollbar {
            width: 7px;
        }
        ::-webkit-scrollbar-corner {
            background: none;
        }
        ::-webkit-scrollbar-track {
            border: none;
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(100, 100, 100, 0.3); 
            border-radius: 5px;
        }
        ::-webkit-scrollbar-track:hover {
            background: rgba(0, 0, 0, 0.1); 
            border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 100, 100, 0.7);
            border-radius: 5px;
        }
    </style>

    <form name="Command">
        <input type="button" class="button" style="text-align: left; width: 110px;" value="Add Arguments" onclick="addArg()"/>
        <div class="divarg">
        <table id="arg"></table>
        </div>
        <input type="button" class="button" style="text-align: left; width: 110px;" value="Add Commands" onclick="addCmd()"/>
        <div class="divcmd">
        <table id="cmd"></table>
        </div>
    </form>
    `);
    await dialogs.addScript(handle, './dialog.js');

    await joplin.commands.register({
        name: 'insert_command',
        label: 'Insert Command',
        iconName: 'fa fa-terminal',
        execute: async () => {
            const result = await joplin.views.dialogs.open(handle);
            if (result.id === "ok"){
                result.formData.Command['fid'] = `${'f'+new Date().getTime()}`;
                await joplin.commands.execute("insertText", "```command\n" + JSON.stringify(result.formData.Command) + "\n```\n");
            }
            
        },
    });
    await joplin.views.toolbarButtons.create('myButton', 'insert_command', ToolbarButtonLocation.EditorToolbar);
}

async function setupContentScriptMarkdownIt() {
    const contentScriptId = 'contentScriptMarkdownIt';

    await joplin.contentScripts.register(
        ContentScriptType.MarkdownItPlugin,
        contentScriptId,
        './contentScriptMarkdownIt.js'
    );
    await joplin.contentScripts.onMessage(contentScriptId,async (data:any) => {
        if(!data.command){
            await alertOnJS("Command can't be empty");
        }else{
            const isVisible = await panels.visible(view);

            if(!isVisible){
                await panels.show(view);
                await sleep(2000);
            }

            data.command = data.command.replace(/&quot;/g, '"');

            panels.postMessage(view, data);

        }
    });
}

async function setupWebviewPanel() {
    view = await panels.create('panel_1');
    await panels.setHtml(view, `
        <div class="buttonContainer">
            <div id="tabbar" class="tabbar"></div>
            <input type="button" value="+" style="height: 20px;" onclick="createTerminal();"/>
            <input type="button" value="close all" style="height: 20px;" onclick="closeAllTerminalTab();"/>
        </div>
        <div id="tabContainer" class="tabContainer"></div>
        `);

    await panels.addScript(view, './webview.js');
    await panels.addScript(view, './xterm.js');
    await panels.addScript(view, './xterm.css');
    await panels.addScript(view, './xterm-addon-fit.js');
    await panels.addScript(view, './tab.js');
    await panels.addScript(view, './terminal.js');
    
    panels.onMessage(view, (data:any) => {
        if(data.FromCreateTerminal){
            createPty(data);
        }else if(data.FromKillPty){
            killPty(getPtyByNum(data.num), data.num);
        }else{
            writePty(data);
        }
    });

    joplin.commands.register({
        name: 'closePanel',
        label: 'Close Panel',
        iconName: 'fas fa-minus',
        execute: async () => {
            await closeAllTerminalTab();
            await sleep(500);
            panels.hide(view);
        },
    });

    joplin.commands.register({
        name: 'openPanel',
        label: 'Open Panel',
        iconName: 'fas fa-window-maximize',
        execute: async () => {
            await panels.show(view);
        },
    });

    await joplin.views.toolbarButtons.create('closePanel', 'closePanel', ToolbarButtonLocation.NoteToolbar);
    await joplin.views.toolbarButtons.create('openPanel', 'openPanel', ToolbarButtonLocation.NoteToolbar);

}

async function createPty(data){
    const workpath = await workdir();

    let pty;

    if (process.platform === 'win32'){
        pty = await spawn('powershell.exe',['-NoExit','-NoLogo','-ExecutionPolicy','bypass','-Command','chcp 65001'],{cwd: workpath});

    }else{
        process.env.TERM = 'xterm';
        pty = await spawn('zsh',['-i'],{cwd: workpath, detached: true });
    }
    

    pty.stdout.on('data', (message) => {
        data.message = message;
        panels.postMessage(view, data);
    });
     
    pty.stderr.on('data', (message) => {
        data.message = message;
        panels.postMessage(view, data);
    });
     
    pty.on('close', (code,signal) => {
        // data.message = `close: code: ${code},signal: ${signal}\n`;
    });

    pty.on('exit', (code,signal) => {
        // data.message = `exit: code: ${code},signal: ${signal}\n`;
        delete ptyObject["pty"+data.num];
        closeTab(data);

    });

    ptyObject["pty"+data.num] = pty;
}

function getPtyByNum(num){
    if("pty"+num in ptyObject){
        return ptyObject["pty"+num];
    }else{
        return null;
    }
}

function writePty(data){
    const pty = getPtyByNum(data.num);
    if(pty === null){
        alertOnJS("Error getPty.");
    }else{
        if(data.command.charCodeAt(0) === 3){ // ctrl + c
            killLastSubProcess(pty);
        }else{
            pty.stdin.write(data.command);
        }
    }
}

function killPty(pty, num){
    // treekill(pty.pid,'SIGINT');
    treekill(pty.pid,'SIGKILL');
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function homedir() {
    var env = process.env;
    var home = env.HOME;
    var user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

    if (process.platform === 'win32') {
        return env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || null;
    }

    if (process.platform === 'darwin') {
        return home || (user ? '/Users/' + user : null);
    }

    if (process.platform === 'linux') {
        return home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : null));
    }

    return home || null;
}

async function workdir() {
    var workpath;
    const valuePath = await joplin.settings.value('myWorkDirectory');

    if (valuePath === ''){
        workpath = homepath;
    }else{
        workpath = valuePath;
    }

    return workpath;
}

function closeTab(data){
    data.FromCloseTab = true;
    panels.postMessage(view, data);
}

function closeAllTerminalTab(){
    var data = {
        FromCloseAllTerminalTab: true
    }
    panels.postMessage(view, data);
}

function killLastSubProcess(pty){
    const pid = pty.pid;
    let subProcNode = [];

    getSubProcPidToNode(pid);

    if(process.platform === "win32"){
        subProcNode.shift(); // remove first subprocess: conhost.exe
    }

    if(subProcNode.length > 0){
        process.kill(subProcNode[subProcNode.length - 1],'SIGINT');
    }else{
        if(process.platform !== "win32"){
            process.kill(pid,'SIGINT');
        }

        pty.stdin.write('\n');
    }


    function getSubProcPidToNode(pid){
        var subpidArray = execToGetSubPid(pid);
        for(var i in subpidArray){
            var subpid = subpidArray[i];
            subProcNode.push(subpid);
            getSubProcPidToNode(subpid);
        }
    }
}

function execToGetSubPid(pid){
    var subpidArray = [];
    switch (process.platform) {
    case 'win32':
        try{
            var lines = execSync(`wmic PROCESS where ParentProcessId=${pid} GET ProcessId /format:list`).toString().split('\n');
            lines.forEach(line => {
                let resArray = line.match(/\d+/g);
                if(resArray !== null && resArray.length === 1){
                    subpidArray.push(parseInt(resArray[0]));
                }
            });
        }catch{}
        
        break;
    case 'darwin':
        try{
            var lines = execSync(`pgrep -P ${pid}`).toString().split('\n');
            lines.forEach(line => {
                let resArray = line.match(/\d+/g);
                if(resArray !== null && resArray.length === 1){
                    subpidArray.push(parseInt(resArray[0]));
                }
            });
        }catch{}
        
        break;
    default: // Linux
        try{
            var lines = execSync(`ps -o pid --no-headers --ppid ${pid}`).toString().split('\n');
            lines.forEach(line => {
                let resArray = line.match(/\d+/g);
                if(resArray !== null && resArray.length === 1){
                    subpidArray.push(parseInt(resArray[0]));
                }
            });
        }catch{}
        
        break;
    }

    return subpidArray;
}

function alertOnJS(str) {
    var data = {
        IsAlert: true,
        message: str,
    }
    panels.postMessage(view, data);
}

function tellPlatform() {
    if(process.platform === "win32"){
        var data = {
            PlatformIsWin: true
        }
        panels.postMessage(view, data);
    }
}