import { FsProfilePicture } from "sso/integrations/fs-profile-picture";
import { IProfilePicture } from "sso/integrations/i-profile-picture";
import { b } from "../common";

export const NewProfilePicture = b(
  (): IProfilePicture => new FsProfilePicture()
);
