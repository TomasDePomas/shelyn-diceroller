export default {
    name: 'sendMessage',
    sendFrom: async (channel, user, message) => {
        const webhook = (await channel.fetchWebhooks()).find(wh => wh.name === 'sendMessage')

        await webhook.send({
            content: message,
            username: user.username,
            avatarURL: user.avatarURL(),
        })
    },
}
g
