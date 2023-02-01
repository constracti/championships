# championships
An HTML-JS application to plan championships.

## version

0.1

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
    "Ποδόσφαιρο",
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

### sport

```js
/**
 * @typedef sport
 * @type {object}
 * @property {string} name - trimmed, unique, accepted values ["Ποδόσφαιρο", "Μπάσκετ"]
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
 */
```

### slot

```js
/**
 * @typedef slot
 * @type {object}
 * @property {round} round
 * @property {sport} sport
 */
```

### match

```js
/**
 * @typedef match
 * @type {object}
 * @property {?slot} slot
 * @property {team} team_home
 * @property {team} team_away
 * @property {?number} score_home
 * @property {?number} score_away
 */
```
