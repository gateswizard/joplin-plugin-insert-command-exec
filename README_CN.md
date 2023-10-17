# <div align='center'>joplin-plugin-insert-command-exec</div>
##### <div align='center'>[English](README.md) | 中文</div>
> 通过markdown自定义命令和参数，然后将显示图形化参数输入。您可以通过图形按钮执行命令，命令结果将在Joplin界面的终端中显示。

## 实现功能

#### joplin.views.menuItems（菜单项）
&#x2705;添加 "Set work directory" 选项

#### joplin.views.toolbarButtons（提示工具栏）
&#x2705; 添加 "Open Panel" and "Close Panel" 按钮

#### joplin.views.toolbarButtons（编辑工具栏）
&#x2705; 添加 "Insert Command" 按钮

#### joplin.views.panels（面板）
&#x2705; 交互式shell

> Windows默认为powershell，其他平台默认为zsh

&#x2705; 实现按键: ctrl+c、上、下、左、右
> 上下键用于查看历史命令

&#x2705; 带按钮名称的多标签

## 用法

默认的工作路径是你的家目录，如果你想改变它，可以通过设置"Set work directory"选项来实现。将工作路径设置为jopin同步路径，您可以在同步笔记时保持命令可用，而不需要复制工具。

使用"Insert Command"按钮添加自定义命令，引用你的参数像"**${arg1}**"。

![example.gif](example.gif)


## 注意
&#x2757; 在单击从其他人导入的笔记之前检查安全性。

&#x2757; 在同步笔记或工具时，请确保同步帐户是安全的，并且团队成员是可信的。

## 参考
https://joplinapp.org/api/get_started/plugins/

https://joplinapp.org/api/references/plugin_api/classes/joplin.html

http://xtermjs.org