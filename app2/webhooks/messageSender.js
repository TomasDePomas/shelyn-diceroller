import Singleton from '../utils/Singleton.js'

class MessageSender extends Singleton {
    constructor () {
        super(MessageSender)
        this.name = 'messageSender'
    }

    async sendFrom (channel, user, message) {
        const webhook = await this.getWebhook(channel)
        if (!webhook) {
            console.log('[WARNING] Attempting to send message in unregistered channel')
        }
        await webhook.send({
            content: message,
            username: user.username,
            avatarURL: user.avatarURL(),
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
