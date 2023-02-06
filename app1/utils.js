require('dotenv/config')
const axios = require('axios')
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
    const res = await axios({
        url: `https://discord.com/api/v10/${endpoint}`,
        responseType: 'json',
        responseEncoding: 'utf8',
        headers: {
            'Accept-Encoding': '*',
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Shelyn dicreoller (https://github.com/TomasDePomas/shelyn-diceroller, 1.0.0)',
        },
        ...options,
    })
    if (res.status < 200 || res.status >= 300) {
        console.log(res.status)
        throw new Error(JSON.stringify(res.data))
    }
    return res
}

module.exports = {
    VerifyDiscordRequest,
    DiscordRequest,
}
