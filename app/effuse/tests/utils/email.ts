import { v4 as Guid } from "uuid";

export function CreateEmail() {
  return `${Guid()}@test.com`;
}
