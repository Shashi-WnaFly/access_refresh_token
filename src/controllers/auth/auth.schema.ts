import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().trim(),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/),
  name: z.string().min(3),
});
