webviewApi.onMessage(async (data) => {
	data = data.message;
	
	if(data.PlatformIsWin){
		PlatformIsWin = true;
		delete data.PlatformIsWin;

	}else if(data.FromContentScript){
		const num = await createTerminal(data.buttonName);
		data.num = num;
		const terminal = await getTerminalByTabNum(data.num);
		
		historyLineData.push(data.command);

		data.command = data.command + '\n';
		if(!PlatformIsWin){
			await sleep(600);
			terminal.write(data.command);
		}
		webviewApi.postMessage(data);

	}else if(data.FromCloseTab){
		closeTab(data.num);
	}else if(data.FromCloseAllTerminalTab){
		closeAllTerminalTab();
	}else if(data.IsAlert){
		alert(data.message);
	}else{
		const terminal = await getTerminalByTabNum(data.num);
  		terminal.write(data.message);
	}
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


tabContainer.parentNode.style.height = '100%';
tabContainer.parentNode.parentNode.style.height = '100%';