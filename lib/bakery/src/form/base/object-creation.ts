export function With(subject: any, name: string, value: any): any {
  if (!subject) subject = {};

  if (!name) return subject;

  if (name.includes(".")) {
    let part = "";
    [part, name] = name.split(".");
    return {
      ...subject,
      [part]: With(subject[part], name, value),
    };
  }

  return {
    ...subject,
    [name]: value,
  };
}
