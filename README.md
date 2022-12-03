# Sheylin diceroller

Adds inline dicerolls in discord

## Usage

Some examples:

| Input                                           | Output                                             |                                         |
|-------------------------------------------------|----------------------------------------------------|-----------------------------------------|
| ``/act`` I try to jump over the fence [d20 + 3]     | I try to jump over the fence [**19**]              | Regular roll                            |
| ``/act`` Inteligence check [int:d20+5]              | Inteligence check [**int:~~_5_~~**]                | Crit fail                               |
| ``/act`` The dwarf hits you twice [2 * d20+1 2d6+4] | The dwarf hits you twice [**(__*21*__\8)(14\12)**] | Multi roll, multi dice and crit success |
