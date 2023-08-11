require("dotenv").config();
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
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

  setInterval(() => {
    client.shard
      .fetchClientValues("guilds.cache.size")
      .then((results) => {
        client.user.setActivity(
          `${results.reduce((acc, guildCount) => acc + guildCount, 0)} guilds`,
          { type: Discord.ActivityType.Watching }
        );
      })
      .catch(console.error);
  }, 5000);
});

client.on(Discord.Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.find(
    (commandData) => commandData.name === interaction.commandName
  );
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await require("./commands/" + command.name).execute(interaction);
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

// web server
const express = require("express");
const cors = require("cors");
const app = express();
const database = require("./database");

app.use(cors());
app.set("view engine", "ejs");

app.listen(8080, () => {});

app.get("/api/download_mp4", async (req, res) => {
  try {
    let url =
      "https://www.youtube.com/watch?v=" +
      (await database.getURL(req.query.id, false)).videoID;
    console.log(url);
    console.log(await database.getURL(req.query.id, false));
    if (!ytdl.validateURL(url)) {
      return res.sendStatus(400);
    }
    const { videoDetails } = await ytdl.getInfo(url);
    let title = `${videoDetails.title} | ${videoDetails.author.name}`;
    await ytdl.getBasicInfo(
      url,
      {
        format: "mp4",
      },
      (err, info) => {
        title = info.player_response.videoDetails.title.replace(
          /[^\x00-\x7F]/g,
          ""
        );
      }
    );

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);
    ytdl(url, {
      format: "mp4",
    }).pipe(res);
  } catch (err) {
    console.error(err);
  }
});

app.get("/api/download_mp3", async (req, res, next) => {
  try {
    let url =
      "https://www.youtube.com/watch?v=" +
      (await database.getURL(req.query.id, true)).videoID;
    console.log(url);
    console.log(await database.getURL(req.query.id, true));
    if (
      !ytdl.validateURL(url) ||
      (await database.getURL(req.query.id, true)).error != null
    ) {
      return res.sendStatus(400);
    }
    const { videoDetails } = await ytdl.getInfo(url);
    let title = `${videoDetails.title} | ${videoDetails.author.name}`;

    await ytdl.getBasicInfo(
      url,
      {
        format: "mp4",
      },
      (err, info) => {
        if (err) throw err;
        title = info.player_response.videoDetails.title.replace(
          /[^\x00-\x7F]/g,
          ""
        );
      }
    );

    res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
    ytdl(url, {
      format: "mp3",
      filter: "audioonly",
    }).pipe(res);
  } catch (err) {
    console.error(err);
  }
});

app.get("/a265d7c96e5198da2e9336e524ca1e08.html", (req, res) => {
  res.render("./shrtfly_verification.ejs");
});
