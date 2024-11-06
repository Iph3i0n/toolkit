import { CancellationToken, TreeDataProvider, TreeItem } from "vscode";

export class CloudformationProvider implements TreeDataProvider<TreeItem> {
  getTreeItem(element: TreeItem) {
    return element;
  }

  async getChildren(element?: TreeItem | undefined) {
    return [];
  }

  getParent(element: TreeItem) {
    return undefined;
  }

  resolveTreeItem?(
    item: TreeItem,
    element: TreeItem,
    token: CancellationToken
  ) {
    return item;
  }
}
