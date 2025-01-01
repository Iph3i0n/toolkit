import type { RenderContext } from "./render-context";

export default async function Evaluate(
  expression: string | boolean | undefined,
  context: RenderContext
) {
  if (!expression) return "";
  if (typeof expression !== "string") return expression;

  if (!expression.startsWith(":")) return expression;

  return new Function(
    ...Object.keys(context.parameters),
    "return " + expression.replace(":", "")
  )(...Object.keys(context.parameters).map((k) => context.parameters[k]));
}
