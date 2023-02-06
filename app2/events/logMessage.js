import { Events } from 'discord.js'

export default {
    event: Events.MessageCreate,
    listener: async (message) => {
        if (message.interaction || message.system || message.webhookId) {
            return
        }
        console.log(`[${message.author.username}]: "${message.content}"`)
    },
}
