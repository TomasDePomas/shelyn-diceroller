import { Client, GatewayIntentBits, Partials } from 'discord.js'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
})

const startClient = () => {
    client.login(process.env.DISCORD_TOKEN)
}

export {
    client,
    startClient,
}
