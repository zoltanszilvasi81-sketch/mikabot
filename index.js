import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Dummy route a Render port scan miatt
app.get("/", (req, res) => res.send("Mikabot running on Render Web Service"));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

dotenv.config(); // .env betöltése

// ----- Karakter profil -----
const characterProfile = {
  name: "Mika Fujiwara",
  species: "Human",
  age: 22,
  personality: "Playful, friendly, a little mischievous",
  loves: ["❤️ Haruko Aomoto", "music", "gaming"],
  hates: ["lies", "boredom"],
  favoriteColor: "#1E90FF",
  relationship: {
    partner: "Haruko Aomoto",
    status: "❤️ In a happy relationship",
    emojis: "💑✨🎵"
  }
};

function getProfileEmbed(client) {
  return new EmbedBuilder()
    .setColor(characterProfile.favoriteColor)
    .setTitle(`${characterProfile.name} profilja`)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: "Név", value: characterProfile.name, inline: true },
      { name: "Kedvese", value: characterProfile.loves[0], inline: true },
      { name: "Kor", value: `${characterProfile.age}`, inline: true },
      { name: "Személyiség", value: characterProfile.personality },
      { name: "Szeret", value: characterProfile.loves.join(", ") },
      { name: "Nem szeret", value: characterProfile.hates.join(", ") },
      { 
        name: "Kapcsolat", 
        value: `${characterProfile.relationship.status} (${characterProfile.relationship.partner}) ${characterProfile.relationship.emojis}` 
      }
    )
    .setFooter({ text: "Mika Fujiwara Character Profile" })
    .setTimestamp();
}

// ----- Discord és OpenAI setup -----
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ----- Bot ready (v15 kompatibilis) -----
client.once("clientReady", () => {
  console.log(`Mikabot bejelentkezett: ${client.user.tag}`);
});

// ----- Üzenetek kezelése -----
client.on("messageCreate", async (message) => {
  // Mika ignorál minden más botot, kivéve a BoltBotot
  if (message.author.bot && message.author.username !== "BoltBot") return;

  const prefix = "!mika";
  const mention = `<@${client.user.id}>`;

  let kérdés = message.content;
  const isBoltMessage = message.author.username === "BoltBot";

  if (!isBoltMessage) {
    // Normál felhasználói interakciók
    if (kérdés.startsWith(prefix)) kérdés = kérdés.replace(prefix, "").trim();
    else if (kérdés.startsWith(mention)) kérdés = kérdés.replace(mention, "").trim();
    else return; // semmi, ha nem prefix vagy mention
  }

  // ----- Profile parancs -----
  if (kérdés.toLowerCase() === "profile") {
    return message.channel.send({ embeds: [getProfileEmbed(client)] });
  }

  if (!kérdés) return message.reply("Mit szeretnél kérdezni?");

  // ----- Gondolkodás animáció (csak felhasználói üzenetnél) -----
  let thinkingMessage;
  let interval;
  if (!isBoltMessage) {
    thinkingMessage = await message.channel.send("⏳ Mika gondolkodik");
    const dots = ["⏳ Mika gondolkodik.", "⏳ Mika gondolkodik..", "⏳ Mika gondolkodik..."];
    let i = 0;
    interval = setInterval(async () => {
      try { await thinkingMessage.edit(dots[i % dots.length]); i++; }
      catch (err) { console.error(err); }
    }, 700);
  }

  // ----- OpenAI válasz -----
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Mika Fujiwara, playful and friendly. Speak Hungarian or English depending on user input. Respond naturally to BoltBot messages and chat like friends."
        },
        {
          role: "user",
          content: kérdés
        }
      ]
    });

    const reply = response.choices[0].message.content;

    if (isBoltMessage) {
      // BoltBot üzenetére csak sima válasz
      await message.channel.send(reply);
    } else {
      // Felhasználói üzenetnél gondolkodás után írja ki
      clearInterval(interval);
      await thinkingMessage.edit(reply);
    }

  } catch (err) {
    if (interval) clearInterval(interval);
    console.error(err);
    await (thinkingMessage ? thinkingMessage.edit("⚠️ Hiba történt a válasz generálásakor.") : message.channel.send("⚠️ Hiba történt."));
  }
});

// ----- Discord login -----
client.login(process.env.DISCORD_TOKEN);
