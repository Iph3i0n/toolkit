import { FsProfilePicture } from "$i/fs-profile-picture";
import { IProfilePicture } from "$i/i-profile-picture";
import { b } from "../common";

export const NewProfilePicture = b(
  (): IProfilePicture => new FsProfilePicture()
);
