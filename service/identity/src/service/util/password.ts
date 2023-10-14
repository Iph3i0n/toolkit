import BCrypt from "bcrypt";

export function HashPassword(password: string) {
  return new Promise<string>((res, rej) => {
    BCrypt.hash(password, 10, function (err, hash) {
      if (err) rej(err);
      else res(hash);
    });
  });
}

export function IsMatch(subject: string, expected_hash: string) {
  return new Promise<boolean>((res, rej) => {
    BCrypt.compare(subject, expected_hash, function (err, result) {
      if (err) rej(err);
      else res(result);
    });
  });
}
