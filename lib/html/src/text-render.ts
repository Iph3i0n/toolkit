export function Wrap(content: string, left: string, right = left) {
  return left + content + right;
}

export function HtmlEncode(str: string | boolean) {
  if (typeof str !== "string") return str.toString();

  const entities = Object.freeze([
    { regex: /&/g, entity: "&amp;" },
    { regex: />/g, entity: "&gt;" },
    { regex: /</g, entity: "&lt;" },
    { regex: /"/g, entity: "&quot;" },
  ]);

  let result = str;

  for (const v in entities) {
    result = result.replace(entities[v].regex, entities[v].entity);
  }

  return result;
}
