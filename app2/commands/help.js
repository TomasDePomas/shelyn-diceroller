import { SlashCommandBuilder } from 'discord.js'
import messageSender from '../webhooks/messageSender.js'
import { Users } from '../database.js'
import DiceRoller from '../utils/DiceRoller.js'

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Tells you what is possible in a message only visible to you'),

    async execute (interaction) {
        try {
            const examples = ['d20+3', 'int:+5', 'fireball:3d6+2', '2x d20 1d8']
            const settings = await Users.findByPk(interaction.user.id)
            let reply = 'A few examples of the possibilities: '

            switch (settings.delimiter) {
                case '{':
                    reply += examples.map(command => `\n\t{${command}}\t| \t${DiceRoller.rollDice({ command })}`).join('')
                    break
                case '(':
                    reply += examples.map(command => `\n\t(${command})\t| \t${DiceRoller.rollDice({ command })}`).join('')
                    break
                case '#':
                    reply += examples.map(command => `\n\t#${command}#\t| \t${DiceRoller.rollDice({ command })}`).join('')
                    break
                default:
                case '[':
                    reply += examples.map(command => `\n\t[${command}]\t| \t${DiceRoller.rollDice({ command })}`).join('')
                    break
            }

            reply += '\n\nFor all posiblities check [the manual](https://github.com/TomasDePomas/shelyn-diceroller/blob/main/README.md)'
            reply += '\n\nTo configure my behavior, send me a DM'
            interaction.reply({ content: reply, ephemeral: true })
        } catch (error) {
            console.log({ error })
        }
    },
}
