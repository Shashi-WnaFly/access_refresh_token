import bcrypt from "bcryptjs";

export async function passwordHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

export async function compareHash(password: string, passHash: string) {
  return await bcrypt.compare(password, passHash);
}
