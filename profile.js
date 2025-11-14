import { EmbedBuilder } from "discord.js";

export const characterProfile = {
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

export function getProfileEmbed(client) {
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
