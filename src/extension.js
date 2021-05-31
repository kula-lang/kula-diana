const vscode = require('vscode');


exports.activate = function(context) {
    console.log("扩展激活");
    // 注册命令
    context.subscriptions.push(vscode.commands.registerCommand('extension.sayHello', function () {
        vscode.window.showInformationMessage('Hello Kula!');
    }));
};


exports.deactivate = function() {
    console.log("扩展释放")
};