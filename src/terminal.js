async function createTerminal(buttonName){
	var num = await createTerminalTab(buttonName);
	await createTerminalByTabNum(num);

	await createPtyApi(num);

	return num;
}


function getTerminalByTabNum(num){
	if("myxterm"+num in terminalObject){
		return terminalObject["myxterm"+num];
	}else{
		return null;
	}
}


async function createPtyApi(num){
    var data = new Object();
    data.num = num;
    data.FromCreateTerminal = true;
    await webviewApi.postMessage(data);
}
