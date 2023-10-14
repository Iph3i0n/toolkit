import Jwt from "jsonwebtoken";

const PrivateKey = process.env.PRIVATE_KEY ?? "secret";

if (PrivateKey === "secret")
  console.warn("No private key set so using the default one.");

export function Encode(data: unknown, expires: number) {
  return Jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * expires,
      data,
    },
    "secret"
  );
}

export function Decode(jwt: string): unknown {
  const decoded: any = Jwt.verify(jwt, PrivateKey);
  return decoded.data;
}
