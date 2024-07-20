import { LocalClient } from "user-interface/integrations/local";
import { SsoClient } from "user-interface/integrations/sso";

declare global {
  export const Router: {
    Push(url: string): void;
    Replace(url: string): void;
  };
}

let sso: SsoClient | undefined = undefined;

export function UseSso() {
  if (!sso) throw new Error("Must initialise SSO before usage");
  return sso;
}

export function SetSso(input: SsoClient | undefined) {
  sso = input;
}

const clients: Record<string, LocalClient> = {};

export async function UseLocal(server_id: string) {
  if (!sso) throw new Error("Must initialise SSO before usage");
  if (!clients[server_id]) {
    const profile = await sso.GetProfile();
    const server = profile.Servers.find((s) => s.Id === server_id);
    if (!server) throw new Error("Could not find server " + server_id);

    clients[server_id] = await sso.GetLocalClient(server_id, server.Url);
  }

  return clients[server_id];
}
