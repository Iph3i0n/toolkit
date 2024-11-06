import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("I have activated!");
  const disposable = vscode.commands.registerCommand(
    "localstack-explorer.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from localstack-explorer!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
