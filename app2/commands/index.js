import { Collection, Events, REST, Routes } from 'discord.js'
import path from 'node:path'
import { fileURLToPath } from 'url'
import fs from 'node:fs'

export default {
    async register (client) {
        const commands = await this.loadCommands()
        await this.addCommandsToClient(client, commands)
        this.registerListeners(client)
        await this.registerCommands(commands)
    },

    async loadCommands () {
        const commands = []
        const __dirname = path.dirname(fileURLToPath(import.meta.url))

        for (const file of fs.readdirSync(__dirname)
            .filter(filename => filename.endsWith('.js'))) {
            if (file === 'index.js') {
                continue
            }

            const filePath = path.join(__dirname, file)
            const { default: command } = await import(filePath)

            if (!command.data) {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`)
                continue
            }
            if (!command.execute) {
                console.log(`[WARNING] The command at ${filePath} is missing a required "execute" property.`)
                continue
            }
            commands.push(command)
        }
        return commands
    },

    async registerCommands (commands) {
        const rest = new REST({ version: '10' })
            .setToken(process.env.DISCORD_TOKEN)

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`)

            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
                { body: commands.map(command => command.data.toJSON()) },
            )

            console.log(`Successfully reloaded ${data.length} application (/) commands.`)
        } catch (error) {
            console.error(error)
        }
    },

    async addCommandsToClient (client, commands) {
        client.commands = new Collection()

        for (const command of commands) {
            await client.commands.set(command.data.name, command)
        }
    },

    registerListeners (client) {
        client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) {
                return
            }

            const command = interaction.client.commands.get(interaction.commandName)

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`)
                return
            }

            try {
                await command.execute(interaction)
            } catch (error) {
                console.error(error)
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                })
            }
        })
    },
}
