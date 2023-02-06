import { Events } from 'discord.js'

export default {
    event: Events.ClientReady,
    once: true,
    listener (client) {
        console.log(`Ready! Logged in as ${client.user.tag}`)
    },
}
