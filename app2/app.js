// DONE: Help command wat reageert in private
// DONE: Webhook die elk bericht in een kanaal ontvangt
// TODO: Events in eigen files zoals webhooks en commands
// TODO: Edit message event
// TODO: Roller in eigen file
// TODO: Config, welke kanalen, welke delimiter, character name, character avatar
// TODO: Elk bericht door de roller pompen
//   DONE bericht verwijderen
//   - opnieuw posten
//   - oorspronkelijk bericht in thread?
// TODO: Figure out a smart way to identify roles

import dotenv from 'dotenv'
import commands from './commands/index.js'
import events from './events/index.js'
import { client, startClient } from './client.js'

dotenv.config()

async function run () {
    await commands.register(client)
    await events.register(client)
    return startClient()
}

run()
