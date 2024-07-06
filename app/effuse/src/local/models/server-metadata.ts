import { ASCII, Struct, UTF8, Buffer, Serialised } from "@ipheion/moulding-tin";

export const ServerMetadata = new Struct({
  name: new UTF8(),
  icon_mime: new ASCII(),
  icon: new Buffer(),
});

export type ServerMetadata = Serialised<typeof ServerMetadata>;
