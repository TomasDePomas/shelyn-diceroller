import 'dotenv/config'
import express from 'express'
import {
    InteractionType, InteractionResponseType,
} from 'discord-interactions'
import { VerifyDiscordRequest } from './utils.js'
import {
    ACT_COMMAND, ACT_HELP_COMMAND, HasGuildCommands,
} from './commands.js'

// Create an express app
const app = express()
// Get port, or default to 3000
const PORT = process.env.PORT || 3000
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }))

// [text : nX aDt + m aDt + m aDt + m aDt + m]

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
        roll.setType(matchShift(diceRoll, /^d(\d+)/, 20))
        roll.addModifier(matchShift(diceRoll, /^([+-]\W*\d+)/, '0'))
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


// (**[19](http://d20  "16 +3")**)'
// (**[~~_int:5_~~](http://d20  "1 +5")**)'
// (**[fireball:12](http://d20 "2+5+3 +2")**)'
// (**[12|5](http://d20 "12 | 5")**)(**[__*20*__|2](http://d20 "20 | 2")**)'

app.post('/interactions', async function (req, res) {
    const { type, data } = req.body

    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG })
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data

        switch (name) {
            case ACT_HELP_COMMAND.name:
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
                        content: 'A few examples of the **/act** possibilities: ' + '\n\t[d20+3]\t\t\t\t\t| (**[19](http://d20  "16 +3")**)' + '\n\t[int:+5]\t\t\t\t\t | (**[~~_int:5_~~](http://d20  "1 +5")**)' + '\n\t[fireball:3d6+2]\t  | (**[fireball:12](http://d20 "2+5+3 +2")**)' + '\n\t[2x d20 1d8]\t\t    | (**[12|5](http://d20 "12 | 5")**)(**[__*20*__|2](http://d20 "20 | 2")**)',
                    },
                })

            case ACT_COMMAND.name:
                let content = req.body.data.options[0].value
                const diceBlocks = [...content.matchAll(/\[([^\]]*)\]/mgi)]

                diceBlocks.forEach(block => {
                    content = content.replace(block[0], rollDice({ command: block[1] }))
                })

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
                        content,
                    },
                })
        }
    }
})

app.listen(PORT, () => {
    console.log('Listening on port', PORT)
    HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [ACT_COMMAND, ACT_HELP_COMMAND])
})
