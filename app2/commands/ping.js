import { SlashCommandBuilder } from 'discord.js'
import sendMessage from '../webhooks/sendMessage.js'

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong... but it is you...??!'),

    async execute (interaction) {
        await interaction.deferReply()
        try {
            await sendMessage.sendFrom(interaction.channel, interaction.user, 'HALLO PONG!')
            await interaction.deleteReply()
        } catch (error) {
            console.log({ error })
        }
    },
}
