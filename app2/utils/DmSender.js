import Singleton from './Singleton.js'

class DMSender extends Singleton {
    constructor () {
        super(DMSender)
    }

    async sendToUser (user, message) {
        const dmChannel = await user.createDM()
        await dmChannel.send(message)
    }
}

export default new DMSender()
