require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.DirectMessages,
  ],
});
const fs = require("node:fs");
const path = require("node:path");


client.once(Discord.Events.ClientReady, () => {
  console.log(
    "O bot " +
      client.user.tag +
      " (" +
      client.application.id +
      ") foi iniciado com sucesso!"
  );

  client.commands = [];
  const foldersPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(foldersPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require("./commands/" + file);
    if ("data" in command && "execute" in command) {
      client.commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  const rest = new Discord.REST().setToken(process.env.DISCORD_BOT_TOKEN);
  (async () => {
    try {
      console.log(
        `Started refreshing ${client.commands.length} application (/) commands.`
      );

      const data = await rest.put(
        Discord.Routes.applicationCommands(client.application.id),
        { body: client.commands }
      );

      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on(Discord.Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.find(commandData => commandData.name === interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await (require("./commands/" + command.name)).execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on(Discord.Events.GuildCreate, (guild) => {
  console.log(
    '[INFO] Adicionado ao servidor "' + guild.name + '" (' + guild.id + ")."
  );
});

client.login(process.env.DISCORD_BOT_TOKEN);
