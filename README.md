# <div align='center'>joplin-plugin-insert-command-exec</div>
##### <div align='center'>English | [中文](README_CN.md)</div>
> Customize your commands and parameters through markdown, then graphical parameter input will be displayed. You can execute commands through graphical buttons, the command results will be displayed in the terminal in the Joplin interface.

## Usage

The default working path is the your home path, if you want to change it, you can do so by setting the "Set work directory" option. Setting the working path to the jopin synchronization path, you can keep commands available while synchronizing notes without the need for the copy tools.

Use the "Insert Command" button to add your custom commands, reference your parameters like "**${arg1}**".

![example.gif](example.gif)

## Implemented functions

#### joplin.views.menuItems
&#x2705; Add "Set work directory" option

#### joplin.views.toolbarButtons
&#x2705; Add "Open Panel" and "Close Panel" button

#### joplin.views.toolbarButtons
&#x2705; Add "Insert Command" button

#### joplin.views.panels
&#x2705; Interactive shell
> the default is powershell for windows and zsh for other platforms

&#x2705; Implement key: ctrl+c、up、down、left、right
> the up/down key is used to view history commands

&#x2705; Multiple labels with button names

## Notice
&#x2757; Check security before clicking on imported notes from others.

&#x2757; Make sure the syncing account is secure and the team members are trustworthy when syncing notes or tools.

## Reference
https://joplinapp.org/api/get_started/plugins/

https://joplinapp.org/api/references/plugin_api/classes/joplin.html

http://xtermjs.org
