# championships
An HTML-JS application to plan championships.

## version

0.3

## configuration

A configuration JSON string is provided through a `textarea` element in the following format:

```json
{
  "teams": [
    "Φωτοδότες",
    "Αγωνιστές",
    "Τροπαιοφόροι",
    "Πρόμαχοι"
  ],
  "sports": [
    "Ποδόσφαιρο: Π Ποδόσφαιρο, Κ Ποδόσφαιρο",
    "Μπάσκετ"
  ],
  "zones": [
    "Πρωί",
    "Απόγευμα"
  ],
  "rounds": [
    "2022-08-10 Απόγευμα 2",
    "2022-08-11 Πρωί 2",
    "2022-08-11 Απόγευμα 2",
    "2022-08-12 Πρωί 2",
    "2022-08-12 Απόγευμα 2",
    "2022-08-13 Πρωί 2",
    "2022-08-13 Απόγευμα 2",
    "2022-08-16 Πρωί 2",
    "2022-08-16 Απόγευμα 2",
    "2022-08-17 Πρωί 2",
    "2022-08-18 Πρωί 2",
    "2022-08-19 Πρωί 2",
    "2022-08-19 Απόγευμα 2",
    "2022-08-20 Απόγευμα 2",
    "2022-08-21 Απόγευμα 2"
  ]
}
```

## datatypes

Algorithm produces objects structured as documented below:

### team

```js
/**
 * @typedef team
 * @type {object}
 * @property {number} id - positive integer
 * @property {string} name - trimmed, unique, non-empty
 */
```

### court

```js
/**
 * @typedef court
 * @type {string} - trimmed, unique
 */
```

### sport

```js
/**
 * @typedef sport
 * @type {object}
 * @property {"Ποδόσφαιρο"|"Μπάσκετ"} name - trimmed, unique
 * @property {court[]} courts
 */
```

### group

```js
/**
 * @typedef group
 * @type {object}
 * @property {string} id - trimmed, unique, non-empty
 * @property {sport} sport
 * @property {team[]} teams
 * @property {boolean} has_revanche
 */
```

### knockout

```js
/**
 * @typedef knockout
 * @type {object}
 * @property {string} id - trimmed, unique, non-empty
 * @property {sport} sport
 * @property {string} home_src - trimmed, unique
 * @property {team|int|boolean} home_arg
 * @property {string} away_src - trimmed, unique
 * @property {team|int|boolean} away_arg
 */
```

### zone

```js
/**
 * @typedef zone
 * @type {object}
 * @property {number} rank - integer used for ordering
 * @property {string} name - trimmed, unique, non-empty
 */
```

### round

```js
/**
 * @typedef round
 * @type {object}
 * @property {Date} date
 * @property {zone} zone
 * @property {number} rank - positive integer used for ordering
 * @property {Object.<court, slot>} slots
 */
```

### slot

```js
/**
 * @typedef slot
 * @type {object}
 * @property {round} round
 * @property {court} court
 * @property {?match} match
 */
```

### match

```js
/**
 * @typedef match
 * @type {object}
 * @property {sport} sport
 * @property {?slot} slot
 * @property {team} team_home
 * @property {team} team_away
 * @property {?number} score_home
 * @property {?number} score_away
 */
```
