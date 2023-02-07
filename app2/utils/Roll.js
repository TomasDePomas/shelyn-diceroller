export class Roll{
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
