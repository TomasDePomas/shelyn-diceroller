const { DiscordRequest } = require('./utils.js')

async function HasGuildCommands (appId, guildId, commands) {
    if (guildId === '' || appId === '') return

    await removeOldCommands(appId, guildId)
    for (const command of commands) {
        await InstallGuildCommand(appId, guildId, command)
    }
}

async function removeOldCommands (appId, guildId) {
    const endpoint = `applications/${appId}/guilds/${guildId}/commands`
    try {
        const res = await DiscordRequest(endpoint, { method: 'GET' })
        if (res.data) {
            for (const installed of res.data) {
                await DeleteGuildCommand(appId, guildId, installed)
            }
        }
    } catch (err) {
        console.error(err)
    }
}

// Installs a command
async function InstallGuildCommand (appId, guildId, command) {
    console.log(`Installing "${command['name']}"`)
    const endpoint = `applications/${appId}/guilds/${guildId}/commands`
    try {
        const resp = await DiscordRequest(endpoint, { method: 'POST', data: command })
    } catch (err) {
        console.error(err)
    }
    console.log(`"${command['name']} installed"`)
}

// Deletes a command
async function DeleteGuildCommand (appId, guildId, command) {
    console.log(`Deleting "${command['name']}"`)
    const endpoint = `applications/${appId}/guilds/${guildId}/commands/${command.id}`
    try {
        await DiscordRequest(endpoint, { method: 'DELETE', data: command })
    } catch (err) {
        console.error(err)
    }
}

const ACT_COMMAND = {
    name: 'act',
    description: 'Enter a description of your action with dice roll blocks (for example: [d20 + 2], [2d4+2], [int:6])',
    type: 1,
    options: [{
        type: 3, name: 'action', required: true, description: 'Describe your action',
    }],
}

const ACT_AS_COMMAND = {
    name: 'act-as',
    description: 'Add the name of your character to your future acts',
    type: 1,
    options: [{
        type: 3, name: 'name', required: true, description: 'Enter your character names',
    }],
}

const ACT_HELP_COMMAND = {
    name: 'act-help', description: 'List the possibilities of the /act command', type: 1,
}
module.exports = {
    HasGuildCommands, InstallGuildCommand, DeleteGuildCommand, ACT_COMMAND, ACT_HELP_COMMAND, ACT_AS_COMMAND,
}
