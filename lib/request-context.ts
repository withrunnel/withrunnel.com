import { headers } from "next/headers";

const UNKNOWN_IP = "unknown";

export function getClientIpFromHeaders(headersList: Headers): string {
  return (
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    UNKNOWN_IP
  );
}

export async function getRequestIp(): Promise<string> {
  return getClientIpFromHeaders(await headers());
}

export async function getRequestUserAgent(): Promise<string | null> {
  return (await headers()).get("user-agent");
}
