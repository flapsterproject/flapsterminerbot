// main.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const kv = await Deno.openKv(); // встроенный KV в Deno


const TOKEN = Deno.env.get("BOT_TOKEN");
const SECRET_PATH = "/FlapsterMinerBot";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const GAME_URL = "https://flapsterminer1-42.vercel.app/";

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  if (pathname !== SECRET_PATH) {
    return new Response("FlapsterMinerBot is working.", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  
  const update = await req.json();
  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text;

  if (text?.startsWith("/start")) {
    const parts = text.split(" ");
    const startParam = parts.length > 1 ? parts[1] : "";

    if (startParam) {
      await kv.set(["ref", chatId], startParam);
    }

    const launchUrl = `https://t.me/FlapsterMiner_bot?startapp=${startParam}`;
    const caption = [
      "👋 Join Flapster Miner and start earning! ⛏️💎",
      "",
      "💸 Mine and get USDT every second.",
      "",
      "⚒️ Upgrade your pickaxe — boost your income.Each upgrade means more profit!",
      "",
      "📈 Grow, level up, reach the top.Only the most active rise to the leaderboard!",
      "",
      "🐤 Start now and become the ultimate miner!"
    ].join("\n");

    await fetch(`${TELEGRAM_API}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        video: "https://flapsterminer1-42.vercel.app/loadingmenuvideo.mp4",
        caption,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Start⛏️", url: launchUrl }],
            [{ text: "Join Community📢", url: "https://t.me/FlapsterMiner" }],
            [{ text: "Join Chat 💬", url: "https://t.me/FlapsterMinerChat" }]
          ]
        }
      })
    });

  
  }

  return new Response("OK", { status: 200 });
});
