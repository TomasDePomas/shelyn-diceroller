import { Events } from 'discord.js'
import dmSender from '../utils/DmSender.js'
import { Users } from './../database.js'

const MESSAGE_SET_AVATAR = 'avatar'
const MESSAGE_SET_NAME = 'name'
const MESSAGE_UNSET_AVATAR = 'avatarless'
const MESSAGE_UNSET_NAME = 'nameless'
const MESSAGE_SET_DELIMITER = 'delimiter'
const MESSAGE_SET_GREEDY = 'greedy'
const MESSAGE_CURRENT_SETTINGS = 'settings'
const HELP_MESSAGE = `I can preform the following tasks:
    **${MESSAGE_SET_AVATAR}**: send me a file to swap out your avatar when talking in the chats I regulate
    **${MESSAGE_UNSET_AVATAR}**: unset your custom avatar
    **${MESSAGE_SET_NAME}**: tell me what name you want to be called when talking in the chats I regulate
    **${MESSAGE_UNSET_NAME}**: unset your custom character name
    **${MESSAGE_SET_DELIMITER}**: tell me which delimiter you wish to use when indicating dice rolls: [], {}, () or  ##, 
    **${MESSAGE_SET_GREEDY}**: tell me whether or not to replace all your messages or only the ones containing dice rolls (default: no)
    **${MESSAGE_CURRENT_SETTINGS}**: I will tell you your current configuration

You can tell me what to do by sending \`\`name Dave\`\` or \`\`delmiter #\`\` for example`
export default {
    event: Events.MessageCreate,
    listener: async (message) => {
        if (message.guild || message.author.bot) {
            return
        }
        const parts = message.content.trim().split(' ')
        const command = parts.shift()
        const input = parts.join(' ')
        let reply = HELP_MESSAGE
        let config = {}
        switch (command) {
            case MESSAGE_SET_AVATAR:
                if (!message.attachments.size) {
                    reply = 'Upload an image to update your in game avatar'
                } else {
                    config.avatarUrl = message.attachments.first().url
                    reply = 'Ok, will do'
                }
                break

            case MESSAGE_UNSET_AVATAR:
                config.avatarUrl = null
                reply = 'Ok, consider it forgotten'
                break;

            case MESSAGE_SET_NAME:
                if (!input) {
                    reply = 'You need to tell me what you wish to be called'
                    break
                }
                config.characterName = input
                reply = `Ok, you will now be known as **${input}**`
                break
            case MESSAGE_UNSET_NAME:
                config.characterName = null
                reply = `Ok, you will now be known as just **${message.author.username}**`
                break;

            case MESSAGE_SET_DELIMITER:
                config.delimiter = input
                if (input[0] === '[') {
                    reply = 'Ok, from now on you can use **[d20 + 4]** for rolls'
                } else if (input[0] === '{') {
                    reply = 'Ok, from now on you can use **{d20 + 4}** for rolls'
                } else if (input[0] === '(') {
                    reply = 'Ok, from now on you can use **(d20 + 4)** for rolls'
                } else if (input[0] === '#') {
                    reply = 'Ok, from now on you can use **#d20 + 4#** for rolls'
                } else {
                    delete config.delimiter
                    reply = 'Sorry, I don\'t know this delimiter'
                }
                break

            case MESSAGE_SET_GREEDY:
                if (input.toLowerCase() === 'yes') {
                    reply = 'Ok, from now on i will replace all your messages in chats I regulate'
                    config.greedy = true
                } else if (input.toLowerCase() === 'no') {
                    reply = 'Ok, from now on I will not replace messages without dice rolls'
                    config.greedy = false
                } else {
                    reply = 'Tell me [yes] or [no]'
                }
                break

            case MESSAGE_CURRENT_SETTINGS:
                reply = 'Your current settings are:\n'
                const user = await Users.findByPk(message.author.id)
                if (user.characterName) {
                    reply += `You will be called **${user.characterName}** in chats I regulate\n`
                } else {
                    reply += `You will be called **${message.author.username}** in chats I regulate\n`
                }

                if (user.avatarUrl) {
                    reply += `You do have a custom avatar in chats I regulate\n`
                } else {
                    reply += `You have your regular avatar in chats I regulate\n`
                }

                if (user.delimiter) {
                    switch (user.delimiter) {
                        case '[':
                            reply += 'You can use **[d20 + 4]** to roll dice in chats I regulate\n'
                            break
                        case '{':
                            reply += 'You can use **{d20 + 4}** to roll dice in chats I regulate\n'
                            break
                        case '(':
                            reply += 'You can use **(d20 + 4)** to roll dice in chats I regulate\n'
                            break
                        case '#':
                            reply += 'You can use **#d20 + 4#** to roll dice in chats I regulate\n'
                            break
                    }
                } else {
                    reply += `You can use **[d20]** to roll dice in chats I regulate\n`
                }

                if (user.greedy) {
                    reply += `I will replace all your messages in chats I regulate\n`
                } else {
                    reply += `I will leave messages without dice rolls alone\n`
                }
        }

        if (Object.keys(config).length) {
            await Users.upsert({
                id: message.author.id,
                ...config,
            })
        }

        await dmSender.sendToUser(message.author, reply)
    },
}
