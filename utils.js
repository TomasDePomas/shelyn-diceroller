require('dotenv/config')
const { verifyKey } = require('discord-interactions')

function VerifyDiscordRequest (clientKey) {
    return function (req, res, buf) {
        const signature = req.get('X-Signature-Ed25519')
        const timestamp = req.get('X-Signature-Timestamp')

        const isValidRequest = verifyKey(buf, signature, timestamp, clientKey)
        if (!isValidRequest) {
            res.status(401).send('Bad request signature')
            throw new Error('Bad request signature')
        }
    }
}

async function DiscordRequest (endpoint, options) {
    const { default: fetch } = await import('node-fetch')
    if (options.body) options.body = JSON.stringify(options.body)
    const res = await fetch(`https://discord.com/api/v10/${endpoint}`, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'Shelyn dicreoller (https://github.com/TomasDePomas/shelyn-diceroller, 1.0.0)',
        },
        ...options,
    })
    if (!res.ok) {
        const data = await res.json()
        console.log(res.status)
        throw new Error(JSON.stringify(data))
    }
    return res
}

module.exports = {
    VerifyDiscordRequest,
    DiscordRequest,
}
