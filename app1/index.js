require('dotenv/config')
const express = require('express')
const { InteractionType, InteractionResponseType } = require('discord-interactions')
const { VerifyDiscordRequest } = require('./utils.js')
const { ACT_COMMAND, ACT_HELP_COMMAND, ACT_AS_COMMAND, HasGuildCommands } = require('./commands.js')

const app = express()
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }))

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (str, newStr) {
        if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
            return this.replace(str, newStr)
        }
        return this.replace(new RegExp(str, 'g'), newStr)
    }
}
const characterNames = {}

function matchShift (diceRoll, pattern, fallback = null) {
    const matches = diceRoll.command.match(pattern)
    if (!matches || matches.length === 0) {
        return fallback
    }
    diceRoll.command = diceRoll.command.replace(matches[0], '').trim()

    const value = matches.length === 1 ? matches[0].trim() : matches[1].trim()

    if (typeof fallback === 'number') {
        return parseInt(value)
    }
    return value
}

class Roll {
    constructor () {
        this._amount = 1
        this._type = 20
        this._modifier = 0
        this._outcomes = []
    }

    get result () {
        return this._outcomes.reduce((total, outcome) => total + outcome, this._modifier)
    }

    get resultString () {
        if (this.isCrit) {
            return `__*${this.result}*__`
        }
        if (this.isCritFail) {
            return `~~_${this.result}_~~`
        }
        return this.result
    }

    get isCrit () {
        return this.result === (this._type * this._amount) + this._modifier
    }

    get isCritFail () {
        return this.result === 1 + this._modifier
    }

    get description () {
        const rolls = this._outcomes.join('+')
        if (!this._modifier) {
            return rolls + ' = ' + this.result
        }
        if (this._modifier > 0) {
            return rolls + '+' + this._modifier + ' = ' + this.result
        }
        return rolls + this._modifier + ' = ' + this.result
    }

    setAmount (amount) {
        this._amount = amount
    }

    setType (type) {
        this._type = type
    }

    addModifier (modifierString) {
        modifierString = modifierString.replaceAll(' ', '')
        this._modifier = parseInt(modifierString)
    }

    resolve () {
        this._outcomes = []
        for (let i = 0; i < this._amount; i++) {
            this._outcomes.push(Math.floor(Math.random() * this._type) + 1)
        }
    }

    toJson () {
        return JSON.stringify({
            amount: this._amount,
            isCrit: this.isCrit,
            isCritFail: this.isCritFail,
            type: this._type,
            modifier: this._modifier,
            outcomes: this._outcomes,
            result: this.result,
        }, null, '\t')
    }

    toString () {
        let diceString = `${this._amount}d${this._type}`
        if (!this._modifier) {
            return diceString
        }
        if (this._modifier > 0) {
            return diceString + '+' + this._modifier
        }
        return diceString + this._modifier
    }
}

function rollDice (diceRoll) {
    const baseRoll = diceRoll.command
    const description = matchShift(diceRoll, /^([^:]*:)/i, '')
    const amountOfRolls = matchShift(diceRoll, /^(\d)\W*[x*]/i, 1)

    let rolls = []
    let rolling = true
    let lastRoll
    while (rolling) {
        lastRoll = diceRoll.command.trim()
        let roll = new Roll()
        roll.setAmount(matchShift(diceRoll, /^(\d+)(?=d)/i, 1))
        roll.setType(matchShift(diceRoll, /^d(\d+)/i, 20))
        roll.addModifier(matchShift(diceRoll, /^([+-]\W*\d+)/i, '0'))
        rolls.push(roll)

        let remainder = diceRoll.command.trim()
        if (!remainder) {
            rolling = false
        }
        if (lastRoll === remainder) {
            return `( * * [Error](http://d# "unable to resolve ${baseRoll}")**)`
        }
    }

    let rollTexts = new Array(amountOfRolls).fill('')
        .map(i => {
            rolls.forEach(roll => {
                roll.resolve()
                console.log(roll.toJson())
            })

            return rolls.map(roll => {
                return `**[${roll.resultString}](http://${roll.toString()} "${roll.toString()} = ${roll.description}")**`
            }).join(' | ')
        })

    let rollText
    if (rollTexts.length === 1) {
        rollText = rollTexts[0]
    } else {
        rollText = rollTexts.map(text => `(${text})`).join('')
    }

    return `[${description}${rollText}]`
}

function addCharactername (user, content) {
    if (!user) {
        return content
    }
    if (characterNames[user.id]) {
        return `**${characterNames[user.id]}**: ${content}`
    }

    return `**[${user.username}](http://d# "Use act-as to set your character name")**: ${content}`
}

app.post('/interactions', async function (req, res) {
    const { type, data } = req.body

    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG })
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data

        switch (name) {
            case ACT_HELP_COMMAND.name:
                const examples = ['d20+3', 'int:+5', 'fireball:3d6+2', '2x d20 1d8']
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
                        content: 'A few examples of the **/act** possibilities: ' +
                            examples.map(command => `\n\t[${command}]\t| \t${rollDice({ command })}`).join('')
                        + '\n\nFor all posiblities check [the manual](https://github.com/TomasDePomas/shelyn-diceroller/blob/main/README.md)'
                    },
                })
            case ACT_AS_COMMAND.name:
                let userId = req.body?.member?.user?.id
                let characterName = req.body?.data?.options[0]?.value
                if (!userId || !characterName) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
                            content: 'I am sorry, I won\'t be able to remember that. I am having some issues',
                        },
                    })
                }
                characterNames[userId] = characterName
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
                        content: `**${characterName}**, I will try to remember that.`,
                    },
                })

            case ACT_COMMAND.name:
                let content = req.body.data.options[0].value
                const diceBlocks = [...content.matchAll(/\[([^\]]*)\]/mgi)]

                diceBlocks.forEach(block => {
                    content = content.replace(block[0], rollDice({ command: block[1] }))
                })
                content = addCharactername(req.body?.member?.user, content)
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
                        content,
                    },
                })
        }
    }
})
app.get('/status', async function (req, res) {
    await HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [ACT_COMMAND, ACT_HELP_COMMAND, ACT_AS_COMMAND])
    res.send('Shelyn is ready')
})
module.exports = app
