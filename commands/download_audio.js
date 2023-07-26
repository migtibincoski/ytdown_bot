const { SlashCommandBuilder, InteractionCollector } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("download_audio")
    .setDescription(
      "Send me the YouTube link and i'll give you the audio to download."
    )
    .addStringOption((option) =>
      option
        .setName("youtube_url")
        .setDescription("The YouTube video url to download the audio.")
        .setRequired(true)
    ),
  execute: async (interaction) => {
    await interaction.reply("URL:")
    await interaction.followUp(interaction.options.data.find(option =>
       option.name === "youtube_url").value)
  },
};
