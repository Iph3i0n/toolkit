import * as vscode from "vscode";
import { CloudformationProvider } from "./tree/cloudformation-provider";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.createTreeView("CloudformationStacks", {
    treeDataProvider: new CloudformationProvider(),
  });
}

export function deactivate() {}
