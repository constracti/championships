# championships
An HTML-JS application to plan championships.

## version

0.4

## configuration

A configuration string is provided through a `textarea` element in the following format:

```ini
[sports]
Ποδόσφαιρο: Π Ποδόσφαιρο, Κ Ποδόσφαιρο
Μπάσκετ

[zones]
Πρωί
Απόγευμα

[rounds]
2023-08-10 Απόγευμα 2
2023-08-11 Πρωί     2
2023-08-11 Απόγευμα 2
2023-08-12 Πρωί     2
2023-08-13 Απόγευμα 2
2023-08-14 Πρωί     2
2023-08-15 Απόγευμα 2
2023-08-16 Πρωί     2
2023-08-16 Απόγευμα 2
2023-08-17 Πρωί     2
2023-08-18 Πρωί     2
2023-08-18 Απόγευμα 2
2023-08-19 Πρωί     2
2023-08-19 Απόγευμα 2
2023-08-21 Απόγευμα 2
2023-08-22 Πρωί     2

[teams]
Φωτοδότες
Αγωνιστές
Πρόμαχοι
Τροπαιοφόροι

[groups]
pg  Ποδόσφαιρο 6: 1-4
kg  Μπάσκετ    3: 1-5

[knockouts]
p-s1 Ποδόσφαιρο   pg:1   pg:4
p-s2 Ποδόσφαιρο   pg:2   pg:3
p-F  Ποδόσφαιρο p-s1:W p-s2:W
p-f  Ποδόσφαιρο p-s1:L p-s2:L
k-F  Μπάσκετ      kg:1   kg:2
```

## datatypes

Algorithm produces objects structured as documented below:

### court

```js
/**
 * @typedef court
 * @type {string} - trimmed words, unique, non-empty
 */
```

### sport

```js
/**
 * @typedef sport
 * @type {object}
 * @property {string} name - trimmed word, unique, non-empty
 * @property {court[]} courts
 */
```

### zone

```js
/**
 * @typedef zone
 * @type {object}
 * @property {number} rank - integer used for ordering
 * @property {string} name - trimmed word, unique, non-empty
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

### team

```js
/**
 * @typedef team
 * @type {object}
 * @property {number} id - positive integer
 * @property {string} name - trimmed words, unique, non-empty
 */
```

### group

```js
/**
 * @typedef group
 * @type {object}
 * @property {string} id - trimmed word, unique, non-empty
 * @property {sport} sport
 * @property {int} team_matches - matches per team
 * @property {team[]} teams
 */
```

### knockout

```js
/**
 * @typedef knockout
 * @type {object}
 * @property {string} id - trimmed word, unique, non-empty
 * @property {sport} sport - trimmed word, non-empty
 * @property {knunion} home
 * @property {knunion} away
 */
```

### knunion

```js
/**
 * @typedef knunion
 * @type {object}
 * @property {string} type
 * @property {?team} team - if type === 'fixed'
 * @property {?group} group - if type === 'group'
 * @property {?int} rank - if type === 'group'
 * @property {?knockout} knockout - if type === 'knockout'
 * @property {?boolean} is_winner - if type === 'knockout'
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
