import { Events } from 'discord.js'
import messageSender from '../webhooks/messageSender.js'
import DiceRoller from '../utils/DiceRoller.js'
import { Users } from './../database.js'

export default {
    event: Events.MessageCreate,
    listener: async (message) => {
        if (message.interaction || message.system || message.webhookId || !message.channel || !message.guild) {
            return
        }
        if (!await messageSender.hasWebhookForChannel(message.channel)) {
            return
        }
        const settings = await Users.findByPk(message.author.id)
        const enhancedContent = DiceRoller.run(message.content,  settings?.delimiter)

        if (settings.greedy || enhancedContent !== message.content) {
            await message.delete()

            const author = message.author

            if (settings.characterName) {
                author.username = settings.characterName
            }
            if (settings.avatarUrl) {
                author.avatarOverwrite = settings.avatarUrl
            }
            await messageSender.sendFrom(
                message.channel,
                message.author,
                enhancedContent,
                message.attachments,
                message.embeds,
            )
        }
    },
}
