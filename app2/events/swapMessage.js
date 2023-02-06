import { Events } from 'discord.js'
import sendMessage from '../webhooks/sendMessage.js'

export default {
    event: Events.MessageCreate,
    listener: async (message) => {
        if (message.interaction || message.system || message.webhookId) {
            return
        }
        await message.delete()
        await sendMessage.sendFrom(message.channel, message.author, `A bot sais: "${message.content}"`)
    },
}
