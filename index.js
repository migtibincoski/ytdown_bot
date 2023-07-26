require("dotenv").config()
const manager = new (require('discord.js')).ShardingManager('./bot.js', { token: process.env.DISCORD_BOT_TOKEN });
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();