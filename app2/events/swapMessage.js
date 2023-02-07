import { Events } from 'discord.js'
import messageSender from '../webhooks/messageSender.js'
import DiceRoller from '../utils/DiceRoller.js'

export default {
    event: Events.MessageCreate,
    listener: async (message) => {
        if (message.interaction || message.system || message.webhookId || !message.channel) {
            return
        }
        if (!await messageSender.hasWebhookForChannel(message.channel)) {
            return
        }
        const enhancedContent = DiceRoller.run(message.content)

        await message.delete()
        await messageSender.sendFrom(message.channel, message.author, enhancedContent)
    },
}
