import Singleton from '../utils/Singleton.js'

class MessageSender extends Singleton {
    constructor () {
        super(MessageSender)
        this.name = 'messageSender'
    }

    async sendFrom (channel, user, message, attachments = [], embeds = []) {
        const webhook = await this.getWebhook(channel)
        if (!webhook) {
            console.log('[WARNING] Attempting to send message in unregistered channel')
        }

        if (!message && attachments.length === 0) {
            return
        }

        const files = attachments.map(attachment => ({
            attachment: attachment.url,
            name: attachment.name,
        }))

        await webhook.send({
            content: message,
            username: user.username,
            avatarURL: user.avatarURL(),
            files,
            embeds,
        })
    }

    async getWebhook (channel) {
        return (await channel.fetchWebhooks()).find(wh => wh.name === this.name)
    }

    async hasWebhookForChannel (channel) {
        return !!(await this.getWebhook(channel))
    }
}

export default new MessageSender()
