const vscode = require('vscode');


exports.activate = function(context) {
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.sayHello', function () {
        vscode.window.showInformationMessage('Kula : わかってる...');
    }));
};


exports.deactivate = function() {
};