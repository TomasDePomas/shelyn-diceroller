// DONE: Help command wat reageert in private
// DONE: Webhook die elk bericht in een kanaal ontvangt
// DONE: Events in eigen files zoals webhooks en commands
// DONE: Ignore channels without webhook
// DONE: Roller in eigen file
// DONE: Elk bericht door de roller pompen
//   DONE bericht verwijderen
//   DONE opnieuw posten
// DONE: Message attachements

// TODO: Edit message?
// TODO: Figure out a smart way to identify rolls
// TODO: Config, welke kanalen, welke delimiter, character name, character avatar
// TODO: Config opslaan

import './utils/replaceAllPolyfill.js'
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
