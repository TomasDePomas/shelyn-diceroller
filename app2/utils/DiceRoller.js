import { Roll } from './Roll.js'
import Singleton from './Singleton.js'
import { findPattern } from '../delimiters.js'

class DiceRoller extends Singleton {
    constructor () {
        super(DiceRoller)
    }

    run (baseText, delimiter = '[') {
        let text = baseText
        const diceBlocks = [...baseText.matchAll(findPattern(delimiter))]
        diceBlocks.forEach(block => {
            text = text.replace(block[0], this.rollDice({ command: block[1] }))
        })
        return text
    }

    rollDice (diceRoll) {
        const baseRoll = diceRoll.command
        const description = this.matchAndShift(diceRoll, /^([^:]*:)/i, '')
        const amountOfRolls = this.matchAndShift(diceRoll, /^(\d)\W*[x*]/i, 1)

        let rolls = []
        let rolling = true
        let lastRoll
        while (rolling) {
            lastRoll = diceRoll.command.trim()
            let roll = new Roll()
            roll.setAmount(this.matchAndShift(diceRoll, /^(\d+)(?=d)/i, 1))
            roll.setType(this.matchAndShift(diceRoll, /^d(\d+)/i, 20))
            roll.addModifier(this.matchAndShift(diceRoll, /^([+-]\W*\d+)/i, '0'))
            rolls.push(roll)

            let remainder = diceRoll.command.trim()
            if (!remainder) {
                rolling = false
            }
            if (lastRoll === remainder) {
                return `(** [Error](http://d# "unable to resolve ${baseRoll}")**)`
            }
        }

        let rollTexts = new Array(amountOfRolls).fill('')
            .map(i => {
                rolls.forEach(roll => {
                    roll.resolve()
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

    matchAndShift (diceRoll, pattern, fallback = null) {
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
}

export default new DiceRoller()
