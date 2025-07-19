// main.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const kv = await Deno.openKv(); // встроенный KV в Deno


const TOKEN = Deno.env.get("BOT_TOKEN");
const SECRET_PATH = "/FlapsterMiner";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const GAME_URL = "https://flapsterminer1-41.vercel.app/";

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  if (pathname !== SECRET_PATH) {
    return new Response("FlapsterMinerBot is working.", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  
// --- 1. Handle Telegram webhook and store chat_id ---
serve(async (req) => {
  const update = await req.json();
  const chatId = update.message?.chat?.id || update.callback_query?.from?.id;

  if (chatId) {
    await kv.set(["users", chatId.toString()], { addedAt: Date.now() });
    console.log("User saved:", chatId);
  }

  return new Response("ok");
});

// --- 2. Send a message to all users every 10 seconds ---
const sendLoop = async () => {
  while (true) {
    console.log("⏱ Sending message to all users...");
    for await (const entry of kv.list({ prefix: ["users"] })) {
      const chatId = entry.key[1];
      try {
        const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "✅ Flapster Miner Reminder Test!",
          }),
        });

        const data = await res.json();
        if (!data.ok) {
          console.error("❌ Failed for", chatId, data);
        }
      } catch (err) {
        console.error("Error sending to", chatId, err);
      }
    }

    await new Promise((r) => setTimeout(r, 10000)); // Wait 10 seconds
  }
};

sendLoop(); // Start the loop

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
        video: "https://flapsterminer1-41.vercel.app/loadingmenuvideo.mp4",
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

    const webAppUrl = `${GAME_URL}?ref=${startParam}`;
    await fetch(`${TELEGRAM_API}/setChatMenuButton`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        menu_button: {
          type: "web_app",
          text: "Open",
          web_app: { url: GAME_URL }
        }
      })
    });
  }

  return new Response("OK", { status: 200 });
});
