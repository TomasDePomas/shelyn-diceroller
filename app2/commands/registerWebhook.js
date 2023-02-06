import { SlashCommandBuilder } from 'discord.js'
import path from 'node:path'
import { fileURLToPath } from 'url'
import fs from 'node:fs'

export default {
    data: new SlashCommandBuilder()
        .setName('webhook')
        .setDescription('Registers a webhook'),

    async execute (interaction) {
        await interaction.deferReply()
        try {
            const webhooks = await this.loadWebhooks()

            for (const webhook of webhooks) {
                if (await this.webhookIsRegistered(interaction.channel, webhook)) {
                    await this.updateWebhook(interaction.channel, webhook)
                } else {
                    await this.registerWebhook(interaction.channel, webhook)
                }
            }
            await interaction.editReply('Done')
            } catch (error) {
            console.log({ error })
            await interaction.editReply('Something went wrong...')
        }
    },
    async loadWebhooks () {
        const webhooks = []
        const __dirname = path.dirname(fileURLToPath(import.meta.url))
        const webhookPath = path.join(__dirname, '../webhooks')

        for (const file of fs.readdirSync(webhookPath)
            .filter(filename => filename.endsWith('.js'))) {
            if (file === 'index.js') {
                continue
            }
            const filePath = path.join(webhookPath, file)

            const { default: webhook } = await import(filePath)

            if (!webhook.name) {
                console.log(`[WARNING] The command at ${filePath} is missing a required "name" property.`)
                continue
            }
            webhooks.push(webhook)
        }
        return webhooks
    },
    async webhookIsRegistered (channel, webhook) {
        return !!(await channel.fetchWebhooks())
            .find(wh => wh.name === webhook.name)
    },
    async registerWebhook (channel, webhook) {
        await channel.createWebhook({
            name: webhook.name,
        })
        console.log(`Created webhook ${webhook.name}`)
    },
    async updateWebhook (channel, webhook) {
        const registeredHook = (await channel.fetchWebhooks())
            .find(wh => wh.name === webhook.name)

        await registeredHook.edit({
            name: webhook.name,
            channel: channel.id,
        })
        console.log(`Edited webhook ${webhook.name}`)
    },
}
