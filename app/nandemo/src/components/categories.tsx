import { AddCategory, GetCategoryTree } from "api-client";
import { ValueChangedEvent } from "bakery";
import { GetCategoryTreeModel } from "models/category";
import { useCallback, useState } from "preact/hooks";
import { UseFetch } from "ui-utils/use-fetch";

const CategoryTreeItem = (props: {
  model: GetCategoryTreeModel;
  parent?: string;
}) => (
  <>
    <option value={props.model.id}>
      {props.parent ? `${props.parent}/${props.model.name}` : props.model.name}
    </option>
    {props.model.children.map((c) => (
      <CategoryTreeItem
        model={c}
        key={c.id}
        parent={[props.parent, props.model.name].filter((t) => t).join("/")}
      />
    ))}
  </>
);

export const CategorySelector = (props: { prefill?: number }) => {
  const [category_tree, , , refresh] = UseFetch(undefined, GetCategoryTree);
  const [creating, set_creating] = useState("");

  const creating_changed = useCallback(
    (e: ValueChangedEvent) => set_creating(e.Value as string),
    [set_creating]
  );

  const create_category = useCallback(async () => {
    let searching = category_tree;
    let path = creating;
    let parent: number | undefined = undefined;

    while (path?.trim()) {
      const [first] = path.split("/");
      const target = searching?.find((s) => s.name === first);
      if (!target) {
        const inserted = await AddCategory({ name: first.trim(), parent });
        parent = inserted.id;
        searching = [];
      } else {
        parent = target.id;
        searching = target.children;
      }

      path = path.replace(first, "");
      if (path.startsWith("/")) path = path.replace("/", "");
    }

    refresh();
  }, [creating, refresh, category_tree]);

  const keydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code !== "Enter") return;
      e.preventDefault();
      e.stopImmediatePropagation();
    },
    [create_category]
  );

  return (
    <>
      <l-col xs="10">
        <f-input
          name="create_category"
          onValueChanged={creating_changed}
          onKeyDown={keydown}
        >
          Create a Category
        </f-input>
      </l-col>
      <l-col xs="2">
        <f-button type="button" onClick={create_category}>
          +
        </f-button>
      </l-col>
      <l-col xs="12">
        <f-singleselect name="category" prefill={props.prefill?.toString()}>
          <span slot="label">Categories</span>
          {category_tree?.map((t) => (
            <CategoryTreeItem model={t} key={t.id} />
          ))}
        </f-singleselect>
      </l-col>
    </>
  );
};
