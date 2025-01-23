import type { editor } from "monaco-editor";
import { FormElementValue, FormValue } from "./types";

export class MonacoLoadedEvent extends Event {
  readonly #instance: editor.IStandaloneCodeEditor;

  constructor(instance: editor.IStandaloneCodeEditor) {
    super("MonacoLoaded", { bubbles: true, composed: true });
    this.#instance = instance;
  }

  get Instance() {
    return this.#instance;
  }
}

export class SubmittedEvent extends Event {
  readonly #data: FormValue;

  constructor(data: FormValue) {
    super("Submitted", { bubbles: true, composed: true });
    this.#data = data;
  }

  get FormData() {
    return this.#data;
  }
}

export class AfterSubmitEvent extends Event {
  readonly #data: FormValue;
  readonly #response_json: unknown;

  constructor(data: FormValue, response_json?: unknown) {
    super("AfterSubmit", { bubbles: true, composed: true });
    this.#data = data;
    this.#response_json = response_json ?? {};
  }

  get FormData() {
    return this.#data;
  }

  get ResponseJson() {
    return this.#response_json;
  }
}

export class ValueChangedEvent extends Event {
  readonly #key: string;
  readonly #value: FormElementValue;

  constructor(key: string, value: FormElementValue) {
    super("ValueChanged", { bubbles: true, cancelable: false, composed: true });
    this.#key = key;
    this.#value = value;
  }

  get Value() {
    return this.#value;
  }

  get Name() {
    return this.#key;
  }
}

export class FileEvent extends Event {
  readonly #file: File;

  constructor(file: File) {
    super("FileAdded", { bubbles: true, cancelable: false, composed: true });
    this.#file = file;
  }

  URL: Promise<string> | string | undefined = undefined;

  get File() {
    return this.#file;
  }
}

export class FileRequestedEvent extends Event {
  constructor() {
    super("FileRequested", {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
  }

  URL: Promise<string> | string | undefined = undefined;
}
