// deno-lint-ignore-file no-explicit-any
import "./selection-polyfill.js";
import { CreateRef, LoadedEvent, ShouldRender } from "@ipheion/wholemeal";
import FormElement from ".";
import Slotted from "../../utils/toggleable-slot";
import { get_file } from "../../utils/html/file";
import { FileEvent, FileRequestedEvent } from "../events";

const BasicLineBreak = ["pre", "blockquote"];

export default abstract class RichText extends FormElement {
  readonly #editor_ref = CreateRef<HTMLDivElement>();
  readonly #selector_ref = CreateRef<HTMLSelectElement>();
  readonly #link_input_ref = CreateRef<HTMLInputElement>();
  readonly #language_input_ref = CreateRef<HTMLInputElement>();
  readonly #slot = Slotted();

  #loaded = false;

  get #editor() {
    const result = this.#editor_ref.current;
    if (!result) throw new Error("Attempting to get the before init");
    return result;
  }

  get #selector() {
    const result = this.#selector_ref.current;
    if (!result) throw new Error("Attempting to get the before init");
    return result;
  }

  get #link_input() {
    const result = this.#link_input_ref.current;
    if (!result) throw new Error("Attempting to get the before init");
    return result;
  }

  get #language_input() {
    const result = this.#language_input_ref.current;
    if (!result) throw new Error("Attempting to get the before init");
    return result;
  }

  #exec(command: string, value: any = undefined) {
    document.execCommand(command, false, value);
    this.value = this.#editor.innerHTML;
  }

  #query_state(command: string) {
    return document.queryCommandState(command);
  }

  #update_state() {
    this.#selector.value = this.Format;
    this.#link_input.value =
      this.CurrentAnchor?.getAttribute("href")?.trim() ?? "";
    this.#language_input.value =
      this.CurrentCode?.getAttribute("language")?.trim() ?? "";
    this.dispatchEvent(new ShouldRender());
    this.value = this.#editor.innerHTML;
  }

  get #selection(): Selection {
    return (this.root as any).getSelection();
  }

  InsertTextAtCaret(text: string) {
    this.#exec("insertHTML", text);
  }

  [LoadedEvent.ListenerKey]() {
    super[LoadedEvent.ListenerKey]();
    this.#editor.innerHTML = this.value?.toString() ?? "";
    this.#loaded = true;
  }

  $input(e: Event) {
    const selection = this.#selection;
    const range = selection.getRangeAt(0);
    if (!range) {
      this.value = this.#editor.innerHTML;
      return;
    }

    let target: Node | null = range.startContainer;
    if (!(target instanceof Node) || !(e as any).data) return;
    const child = target.firstChild;

    if (child && child.nodeType === child.TEXT_NODE) this.Format = "p";
    else if (this.#editor.innerHTML === "<br>") this.#editor.innerHTML = "";
    this.value = this.#editor.innerHTML;
  }

  $keydown(e: KeyboardEvent) {
    if (e.key === "Enter" && BasicLineBreak.includes(this.Format)) {
      e.preventDefault();
      this.InsertTextAtCaret("\n\n");
    }
  }

  $click() {
    this.#update_state();
  }

  $keyup(e: Event) {
    this.#update_state();
  }

  $focus() {
    this.#editor.focus();
  }

  $ValueChanged() {
    if (!this.#loaded) return;
    if (this.#editor.innerHTML !== this.value)
      this.#editor.innerHTML = this.value?.toString() ?? "";
  }

  async connectedCallback() {
    await super.connectedCallback();
    document.addEventListener("selectchange", () => this.#update_state());
  }

  get Format() {
    const options = this.FormatOptions.map((o) => o.value);
    try {
      const selection = this.#selection;
      const range = selection.getRangeAt(0);
      if (!range) return "p";

      let node: Node | null | undefined = range.startContainer;
      while (
        node &&
        (!(node instanceof HTMLElement) ||
          !options.find(
            (o) => o === (node as HTMLElement).tagName.toLowerCase()
          ))
      ) {
        node = node?.parentNode;
      }

      if (!node) return "p";
      return (node as HTMLElement).tagName.toLowerCase();
    } catch {
      return "p";
    }
  }

  set Format(tag: string) {
    this.#exec("formatBlock", `<${tag}>`);
    if (this.#editor.lastElementChild?.tagName !== "P") {
      const input = document.createElement("p");
      input.innerHTML = "&nbsp;";
      this.#editor.appendChild(input);
    }

    this.value = this.#editor.innerHTML;
  }

  #current_anchor: HTMLAnchorElement | undefined = undefined;

  get CurrentAnchor() {
    try {
      const selection = this.#selection;
      const range = selection.getRangeAt(0);
      if (!range) return this.#current_anchor;

      let start: Node | null = range.startContainer;
      if (start instanceof Text) start = start.parentElement;
      let end: Node | null = range.endContainer;
      if (end instanceof Text) end = end.parentElement;
      if (!(start instanceof HTMLElement)) {
        this.#current_anchor = undefined;
        return undefined;
      }

      if (start instanceof HTMLAnchorElement && start === end) {
        this.#current_anchor = start;
        return start;
      }
    } catch {
      this.#current_anchor = undefined;
      return undefined;
    }

    this.#current_anchor = undefined;
    return undefined;
  }

  #current_code: HTMLPreElement | undefined = undefined;

  get CurrentCode() {
    try {
      const selection = this.#selection;
      const range = selection.getRangeAt(0);
      if (!range) return this.#current_code;

      let start: Node | null = range.startContainer;
      if (start instanceof Text) start = start.parentElement;
      let end: Node | null = range.endContainer;
      if (end instanceof Text) end = end.parentElement;
      if (!(start instanceof HTMLElement)) {
        this.#current_code = undefined;
        return undefined;
      }

      if (start instanceof HTMLPreElement && start === end) {
        this.#current_code = start;
        return start;
      }
    } catch {
      this.#current_code = undefined;
      return undefined;
    }

    this.#current_code = undefined;
    return undefined;
  }

  get IsBold() {
    return this.#query_state("bold");
  }

  get IsItalic() {
    return this.#query_state("italic");
  }

  get IsStrikethrough() {
    return this.#query_state("strikethrough");
  }

  get IsUnderlined() {
    return this.#query_state("underline");
  }

  Stylify() {
    this.Format = this.#selector.value;
  }

  Urlify() {
    const anchor = this.CurrentAnchor;
    if (!anchor) return;
    anchor.href = this.#link_input.value;
    this.value = this.#editor.innerHTML;
  }

  LanguageIfy() {
    const code = this.CurrentCode;
    if (!code) return;
    code.setAttribute("language", this.#language_input.value);
    this.value = this.#editor.innerHTML;
  }

  Boldify() {
    this.#exec("bold", true);
  }

  Strikethroughify() {
    this.#exec("strikethrough", true);
  }

  Underlinify() {
    this.#exec("underline", true);
  }

  Ulify() {
    this.#exec("insertUnorderedList");
  }

  Olify() {
    this.#exec("insertOrderedList");
  }

  Lineify() {
    this.#exec("insertHorizontalRule");
  }

  Linkify() {
    this.#exec("createLink", " ");
    setTimeout(() => this.#update_state(), 0);
  }

  Unlinkify() {
    const anchor = this.CurrentAnchor;
    if (!anchor) return;
    const parent = anchor.parentElement;
    if (!parent) return;
    parent.replaceChild(
      document.createTextNode(anchor.textContent ?? ""),
      anchor
    );
  }

  async Image() {
    const range = this.#selection.getRangeAt(0);
    const target = range?.endContainer ?? this.#editor.childNodes[0];
    if (!target) return;

    const request_event = new FileRequestedEvent();
    this.dispatchEvent(request_event);

    const insert = (url: string) => {
      const image = document.createElement("img");
      image.src = url;
      target.insertBefore(image, target.firstChild);
      this.value = this.#editor.innerHTML;
    };

    if (request_event.URL) {
      return insert(await request_event.URL);
    }

    const file = await get_file();
    if (!file) return;

    const event = new FileEvent(file);
    this.dispatchEvent(event);
    if (event.URL) {
      return insert(await event.URL);
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      insert(reader.result?.toString() ?? "");
    });

    reader.readAsDataURL(file);
  }

  get FormatOptions() {
    return [
      { title: "Heading 1", value: "h1" },
      { title: "Heading 2", value: "h2" },
      { title: "Heading 3", value: "h3" },
      { title: "Heading 4", value: "h4" },
      { title: "Heading 5", value: "h5" },
      { title: "Heading 6", value: "h6" },
      { title: "Paragraph", value: "p" },
      { title: "Quote", value: "blockquote" },
      { title: "Code", value: "pre" },
    ];
  }

  get Slot() {
    return this.#slot;
  }

  get SelectorRef() {
    return this.#selector_ref;
  }

  get EditorRef() {
    return this.#editor_ref;
  }

  get LinkInputRef() {
    return this.#link_input_ref;
  }

  get LanguageInputRef() {
    return this.#language_input_ref;
  }
}
