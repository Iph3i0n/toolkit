import { AddTag, GetTagTree } from "api-client";
import { ValueChangedEvent } from "bakery";
import { GetTagTreeModel } from "models/tag";
import { useCallback, useState } from "preact/hooks";
import { UseFetch } from "ui-utils/use-fetch";

const TagTreeItem = (props: { model: GetTagTreeModel; parent?: string }) => (
  <>
    <option value={props.model.id}>
      {props.parent ? `${props.parent}/${props.model.name}` : props.model.name}
    </option>
    {props.model.children.map((c) => (
      <TagTreeItem
        model={c}
        key={c.id}
        parent={[props.parent, props.model.name].filter((t) => t).join("/")}
      />
    ))}
  </>
);

export const TagSelector = (props: {
  prefill?: Array<number>;
  no_create?: boolean;
  on_change?: (c: Array<number>) => void;
}) => {
  const [tag_tree, , , refresh] = UseFetch(undefined, GetTagTree);
  const [creating, set_creating] = useState("");

  const creating_changed = useCallback(
    (e: ValueChangedEvent) => set_creating(e.Value as string),
    [set_creating]
  );

  const create_tag = useCallback(async () => {
    let searching = tag_tree;
    let path = creating;
    let parent: number | undefined = undefined;

    while (path?.trim()) {
      const [first] = path.split("/");
      const target = searching?.find((s) => s.name === first);
      if (!target) {
        const inserted = await AddTag({ name: first.trim(), parent });
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
  }, [creating, refresh, tag_tree]);

  const keydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code !== "Enter") return;
      e.preventDefault();
      e.stopImmediatePropagation();
    },
    [create_tag]
  );

  return (
    <>
      {!props.no_create && (
        <l-col xs="12">
          <f-group>
            <f-input
              name="create_tag"
              onValueChanged={creating_changed}
              onKeyDown={keydown}
            >
              Create a Tag
            </f-input>
            <f-button type="button" onClick={create_tag}>
              +
            </f-button>
          </f-group>
        </l-col>
      )}
      <l-col xs="12">
        <f-multiselect
          name="tags"
          prefill={props.prefill?.join(",")}
          onValueChanged={(e) =>
            props.on_change
              ? props.on_change(
                  (e.Value as string)
                    ?.split(",")
                    .filter((r) => r.trim())
                    .map((r) => parseInt(r.trim()) ?? [])
                )
              : undefined
          }
        >
          <span slot="label">Tags</span>
          {tag_tree?.map((t) => (
            <TagTreeItem model={t} key={t.id} />
          ))}
        </f-multiselect>
      </l-col>
    </>
  );
};
