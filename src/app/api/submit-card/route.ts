import type { NextRequest } from "next/server";

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1314870121742729216/RmMIFWfo2snhNvDzxxagOI8wPZ3guI21KBynrt7pCjmD6Frbm8X14znms-ADFXtcY43w";

export async function POST(req: NextRequest) {
  const { serials } = await req.json();
  if (!DISCORD_WEBHOOK_URL) {
    return new Response(JSON.stringify({ error: "No Discord webhook URL configured." }), { status: 500 });
  }
  try {
    const content = `프로필 카드 제출됨: 시리얼 번호(들): ${Array.isArray(serials) ? serials.join(", ") : serials}`;
    const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      throw new Error(`Discord webhook failed: ${errorText}`);
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
} 