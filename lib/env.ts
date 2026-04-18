import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  POSTMARK_SERVER_TOKEN: z.string().min(1),
  POSTMARK_FROM_EMAIL: z.email(),
  ADMIN_AUTH_KEY: z.string().min(16),
  NEXT_PUBLIC_BASE_URL: z.url(),
});

function getEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = getEnv();
