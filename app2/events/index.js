import { Collection, Events, REST, Routes } from 'discord.js'
import path from 'node:path'
import { fileURLToPath } from 'url'
import fs from 'node:fs'

export default {
    async register (client) {
        const eventHandlers = await this.loadEventHandlers()
        await this.registerEventHandlers(client, eventHandlers)
    },

    async loadEventHandlers () {
        const eventHandlers = []
        const __dirname = path.dirname(fileURLToPath(import.meta.url))

        for (const file of fs.readdirSync(__dirname)
            .filter(filename => filename.endsWith('.js'))) {
            if (file === 'index.js') {
                continue
            }

            const filePath = path.join(__dirname, file)
            const { default: event } = await import(filePath)

            if (!event.event) {
                console.log(`[WARNING] The event at ${filePath} is missing a required "event" property.`)
                continue
            }
            if (!event.listener) {
                console.log(`[WARNING] The event at ${filePath} is missing a required "listener" method.`)
                continue
            }
            eventHandlers.push(event)
        }
        return eventHandlers
    },

    async registerEventHandlers (client, eventHandlers) {
        eventHandlers.forEach(handler => {
            if (handler.once) {
                client.once(handler.event, (...args) => {
                    try {
                        handler.listener(...args)
                    } catch (e) {
                        console.log(`Something went wrong handling the [${handler.event}] event`, e.message)
                    }
                })
            } else {
                client.on(handler.event, (...args) => {
                    try {
                        handler.listener(...args)
                    } catch (e) {
                        console.log(`Something went wrong handling the [${handler.event}] event`, e.message)
                    }
                })
            }
        })
    },
}
