import { ASCII, Struct, Buffer, Serialised } from "@ipheion/moulding-tin";

export const ProfilePicture = new Struct({
  mime: new ASCII(),
  data: new Buffer(),
});

export type ProfilePicture = Serialised<typeof ProfilePicture>;
