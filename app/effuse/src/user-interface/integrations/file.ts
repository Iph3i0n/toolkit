function ToBuffer(file: File) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      res(reader.result);
    });

    reader.readAsArrayBuffer(file);
  });
}

export async function TransformFile(file: File) {
  const buffer = await ToBuffer(file);
  const base64 = btoa(
    String.fromCharCode.apply(null, new Uint8Array(buffer as any) as any)
  );

  return { mime: file.type, base64 };
}
