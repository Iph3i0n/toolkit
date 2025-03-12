type NumberString = `${number}`;

type Target = "_blank" | "_self" | "_parent" | "_top";

type Keyboard =
  | "none"
  | "text"
  | "decimal"
  | "numeric"
  | "tel"
  | "search"
  | "email"
  | "url";

type ButtonType = "button" | "submit";

export type FormSubmittedEvent = Event & { FormData: unknown };

export type ValueChangedEvent = Event & { Value: unknown; Name: string };

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      "d-panel": HTMLAttributes & {
        colour?: string;
        bordered?: boolean;
        children?: ComponentChildren;
      };
      "d-listgroup": HTMLAttributes & {
        children?: ComponentChildren;
      };

      "l-header": HTMLAttributes & {
        logo: string;
        "logo-alt"?: string;
        bg?: string;
        flush?: boolean;

        children?: ComponentChildren;
      };
      "l-container": HTMLAttributes & {
        flush?: boolean;
        children?: ComponentChildren;
      };
      "l-row": HTMLAttributes & {
        cols?: NumberString;
        "no-padding"?: boolean;
        "no-gap"?: boolean;
        children?: ComponentChildren;
      };
      "l-col": HTMLAttributes & {
        xs: NumberString;
        sm?: NumberString;
        md?: NumberString;
        lg?: NumberString;
        xl?: NumberString;
        children?: ComponentChildren;
      };

      "f-group": HTMLAttributes & {
        children?: ComponentChildren;
      };
      "f-form": HTMLAttributes & {
        url?: string;
        method?: "get" | "put" | "post" | "delete" | "patch";
        submit?:
          | "ajax-json"
          | "ajax-form-data"
          | "page-form-data"
          | "event-only";
        "success-url"?: string;
        credentials?: RequestCredentials;

        children?: ComponentChildren;

        onSubmitted?: (e: FormSubmittedEvent) => void;
      };
      "f-input": HTMLAttributes & {
        type?: Keyboard;
        prefill?: string;
        disabled?: boolean;
        sensitive?: boolean;
        name: string;
        required?: boolean;
        validate?: string;

        onValueChanged?: (event: ValueChangedEvent) => void;

        children?: ComponentChildren;
      };
      "f-hidden": HTMLAttributes & {
        prefill?: string;
        name: string;
        required?: boolean;
        validate?: string;

        onValueChanged?: (event: ValueChangedEvent) => void;

        children?: ComponentChildren;
      };
      "f-multiselect": HTMLAttributes & {
        prefill?: string;
        disabled?: boolean;
        sensitive?: boolean;
        name: string;
        required?: boolean;
        validate?: string;

        onValueChanged?: (event: ValueChangedEvent) => void;

        children?: ComponentChildren;
      };
      "f-singleselect": HTMLAttributes & {
        prefill?: string;
        disabled?: boolean;
        sensitive?: boolean;
        name: string;
        required?: boolean;
        validate?: string;

        onValueChanged?: (event: ValueChangedEvent) => void;

        children?: ComponentChildren;
      };
      "f-richtext": HTMLAttributes & {
        type?: Keyboard;
        prefill?: string;
        disabled?: boolean;
        name: string;
        required?: boolean;
        validate?: string;

        onValueChanged?: (event: ValueChangedEvent) => void;

        children?: ComponentChildren;
      };
      "f-numeric": HTMLAttributes & {
        "decimal-places"?: NumberString;
        "no-negative"?: boolean;
        type?: string;
        prefill?: string;
        disabled?: boolean;
        sensitive?: boolean;
        name: string;
        required?: boolean;
        validate?: string;

        onValueChanged?: (event: ValueChangedEvent) => void;

        children?: ComponentChildren;
      };
      "f-toggle": HTMLAttributes & {
        prefill?: 'on' | 'off';
        disabled?: boolean;
        sensitive?: boolean;
        name: string;
        required?: boolean;
        validate?: string;

        onValueChanged?: (event: ValueChangedEvent) => void;

        children?: ComponentChildren;
      };

      "f-button": HTMLAttributes & {
        colour?: string;
        type?: ButtonType;
        href?: string;
        target?: Target;
        private?: boolean;
        spa?: boolean;
        replace?: boolean;

        children?: ComponentChildren;
      };

      "o-modal": HTMLAttributes & {
        trigger?: string;
        size?: "small" | "medium" | "large";
        path?: string;
        open?: boolean;
        colour?: string;

        onCloseRequested?: (e: Event) => void;
        onMatchChanged?: (e: Event) => void;

        children?: ComponentChildren;
      };

      "t-link": HTMLAttributes & {
        href?: string;
        target?: Target;
        private?: boolean;
        block?: boolean;
        spa?: boolean;
        replace?: boolean;

        children?: ComponentChildren;
      };
      "t-routeable": HTMLAttributes & {
        href?: string;
        target?: Target;
        private?: boolean;
        block?: boolean;
        spa?: boolean;
        replace?: boolean;

        "no-transform"?: boolean;

        children?: ComponentChildren;
      };
      "t-crumbs": HTMLAttributes & {
        divider?: string;

        children?: ComponentChildren;
      };
      "t-heading": HTMLAttributes & {
        level?: `h${1 | 2 | 3 | 4 | 5 | 6}`;

        children?: ComponentChildren;
      };
      "t-paragraph": HTMLAttributes & {
        large?: boolean;

        children?: ComponentChildren;
      };
      "t-richtext": HTMLAttributes & {
        use: { html: string };

        children?: ComponentChildren;
      };
      "t-icon": HTMLAttributes & {
        name: string;
        fill?: boolean;
        plain?: boolean;
        size?: string;
        colour?: string;
        text?: boolean;
        spin?: boolean;

        children?: ComponentChildren;
      };
    }
  }
}
