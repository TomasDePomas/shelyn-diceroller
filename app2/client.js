import { Client, GatewayIntentBits } from 'discord.js'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })

const startClient = () => {
    client.login(process.env.DISCORD_TOKEN)
}

export {
    client,
    startClient,
}
