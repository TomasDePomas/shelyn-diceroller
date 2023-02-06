import { SlashCommandBuilder } from 'discord.js'
import sendMessage from '../webhooks/sendMessage.js'

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Tells you what is possible'),

    async execute (interaction) {
        await interaction.deferReply()
        try {
            const dmChannel = await interaction.user.createDM()
            dmChannel.send('Hallo, let me tell you how this works')
        } catch (error) {
            console.log({ error })
        }
        await interaction.deleteReply()
    },
}
