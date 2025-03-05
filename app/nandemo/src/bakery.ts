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

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      "d-panel": HTMLAttributes & {
        colour?: string;
        bordered?: boolean;
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

        onCloseRequested?: (e: Event) => void;
        onMatchChanged?: (e: Event) => void;

        children?: ComponentChildren;
      };
    }
  }
}
