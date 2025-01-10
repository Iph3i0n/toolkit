import type { RenderContext } from "./render-context";
import * as Js from "@ipheion/js-model";

function parameters(context: RenderContext) {
  return {
    names: Object.keys(context.parameters),
    values: Object.keys(context.parameters).map((k) => context.parameters[k]),
  };
}

export default async function Evaluate(
  expression: string | boolean | undefined,
  context: RenderContext
) {
  if (!expression) return "";
  if (typeof expression !== "string") return expression;

  if (!expression.startsWith(":")) return expression;
  const p = parameters(context);

  return new Function(...p.names, "return " + expression.replace(":", ""))(
    ...p.values
  );
}

export async function EvaluateJsModel(
  expression: Js.Any,
  context: RenderContext
) {
  const p = parameters(context);

  return new Function(...p.names, "return " + expression.toString())(...p.values);
}

export async function EvaluateFor(expression: string, context: RenderContext) {
  const p = parameters(context);
  const [, subject] = expression.trim().split(/\s+/gm);

  const func = new Function(
    ...p.names,
    `
      const ___result = [];
      for (${expression}) {
        ___result.push(${subject});
      }

      return ___result;
    `
  );

  return {
    key: subject,
    data: func(...p.values),
  };
}
export async function EvaluateIf(expression: string, context: RenderContext) {
  const p = parameters(context);

  const func = new Function(
    ...p.names,
    `
      if (${expression}) {
        return true;
      }

      return false;
    `
  );

  return func(...p.values);
}
