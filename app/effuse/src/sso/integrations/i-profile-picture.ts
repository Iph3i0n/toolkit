export interface IProfilePicture {
  SavePicture(user_id: string, mime: string, data: string): Promise<void>;
  GetPicture(user_id: string): Promise<[string, Buffer] | undefined>;
}
