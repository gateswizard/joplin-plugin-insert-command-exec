var argcount = 1;
var cmdcount = 1;   
      
function addArg() {
    var argtable = document.getElementById("arg");
    var newArgRow = argtable.insertRow(argtable.rows.length);
    newArgRow.id = "row" + argcount;
        
    var contentCell = newArgRow.insertCell(-1);
    contentCell.innerHTML = 'arg'+argcount+': <input type="button" class="button" value="del" onclick="delCmd(this)"><br>name：<input type="text" style="width:170px;" name="arg'+argcount+'"><br>default value: <input type="text" style="width:170px;" name="value_arg'+argcount+'">';
    contentCell = newArgRow.insertCell(-1);
                
    argcount++;
}

function addCmd() {
    var cmdtable = document.getElementById("cmd");
    var newCmdRow = cmdtable.insertRow(cmdtable.rows.length);
    newCmdRow.id = "row" + cmdcount;
        
    var contentCell = newCmdRow.insertCell(-1);
    contentCell.innerHTML = 'command'+cmdcount+' <input type="button" class="button" value="del" onclick="delCmd(this)"><br>name：<input type="text" style="width:170px;" name="name'+cmdcount+'"><br>command：<input type="text" style="width:170px;" name="exec_name'+cmdcount+'">';
    contentCell = newCmdRow.insertCell(-1);
                
    cmdcount++;
}
      
function delArg(obj) {
    var row = obj.parentNode.parentNode;
    row.parentNode.removeChild(row);
    argcount--;
}

function delCmd(obj) {
    var row = obj.parentNode.parentNode;
    row.parentNode.removeChild(row);
    cmdcount--;
}
