module.exports = {
	default: function(context) { 
		return {
			plugin: function(markdownIt, _options) {
				const contentScriptId = context.contentScriptId;

				const defaultRender = markdownIt.renderer.rules.fence || function(tokens, idx, options, env, self) {
					return self.renderToken(tokens, idx, options, env, self);
				};
			
				markdownIt.renderer.rules.fence = function(tokens, idx, options, env, self) {
					const token = tokens[idx];
					if (token.info !== 'command') return defaultRender(tokens, idx, options, env, self);

					const text = token.content;
					
					obj = JSON.parse(text);

					var res = `<form id="${obj.fid}">`;

					for (var key in obj){
						if (key.startsWith("arg")){
							res += obj[key] + ':<br><input type="text" style="width:200px;" name="'+key+'" value="'+obj["value_"+key]+'"><br>'; //test found width auto +8px,real size: 208px;
						}
					}

					res += '<div style="padding:0px; max-width:208px;">';

					for (var key in obj){
						if (key.startsWith("name")){
							var re = new RegExp("\\${(arg.*?)}","ig");
							var cmd = obj["exec_"+key].replace(re,`\${${obj.fid}.$1.value}`).replace(/"/g, '&quot;');
							const postMessageWithResponseTest = `
								const data = new Object();
								data.FromContentScript = true;
								data.buttonName = '${obj[key]}';
								data.command = \`${cmd}\`;
								webviewApi.postMessage('${contentScriptId}', data);
								return false;
							`;
							res += `<button style="margin-right:5px; max-width:208px;" onclick="${postMessageWithResponseTest.replace(/\n/g, '')}">${obj[key]}</button>`;
						}
					}
					res += "</div></form>";

					console.log(res);
					
					return `
						<div style="padding:10px; border: 1px solid green; display:inline-block;">${res}</div>
					`;
				};
			},
			assets: function() {
				return [];
			},
		}
	},
}