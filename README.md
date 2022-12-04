# Sheylin diceroller

Adds inline dicerolls in discord

Commands:

- /act
- /act-help
- /act-as

## Act

The main command of this plugin. Allows you to describe your actions with one or more dice commands in your text

| Input                                                            | Output                                                      |                                         |
|------------------------------------------------------------------|-------------------------------------------------------------|-----------------------------------------|
| ``/act`` I try to jump over the fence [d20 + 3]                  | I try to jump over the fence [**19**]                       | Regular roll                            |
| ``/act`` Inteligence check [int:d20+5]                           | Inteligence check [**int:~~_5_~~**]                         | Crit fail                               |
| ``/act`` The dwarf hits you twice [2 * d20+1 2d6+4]              | The dwarf hits you twice [**(__*21*__\8)(14\12)**]          | Multi roll, multi dice and crit success |
| ``/act`` We search the room [+3] and dismantle any traps [d20+4] | We search the room [**5**] and dismantle any traps [**12**] | Multiple commands                       |

### Options:

A dice command is build from a few blocks:

- __A description (optional)__: This is any kind of text followed by ``:``, for example ``int:``, ``fireball:``
  or ``I do a mighty thing:``
- __A multiplier (optional)__: Amount of times the roll needs to be execuded followed by a``x`` or ``*``, for
  example ``2 * ``, ``5x`` , or ``4*``
- __One or multiple roll descriptions__:
    - __Dice and type__: Amount and type of dice you want to add together. The amount defaults to 1. For example ``2d4``
      , ``5d10`` or ``d20``
    - __Modifier (optional)__: Modifier to add to or subtract from the dice result, for example ``+4`` or ``-2``

Bonus fact:

- It is possible to do a roll with only a modifier, this defaults to a d20 +/- the modifier: ``[+3]`` or ``[-5]``

## Act-as
Each act command will be prepended with your discord username. By telling Shelyn your character name with /act-as all future commands will be prepended with that username 

## Act-help
Display a couple of example commands 

