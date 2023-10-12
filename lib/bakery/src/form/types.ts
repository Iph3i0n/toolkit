export type FormElementValue = string | File | File[] | boolean | undefined;
export type FormValue = Record<string, FormElementValue>;

export type RequestMethod = "get" | "put" | "post" | "delete" | "patch";
export type SubmissionType =
  | "ajax-json"
  | "ajax-form-data"
  | "page-form-data"
  | "event-only";
