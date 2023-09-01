/**
 * @typedef court
 * @type {string} - trimmed words, unique, non-empty
 */

/**
 * @typedef sport
 * @type {object}
 * @property {string} name - trimmed word, unique, non-empty
 * @property {court[]} courts
 */

/**
 * @typedef zone
 * @type {object}
 * @property {number} rank - integer used for ordering
 * @property {?string} name - trimmed words, unique, non-empty
 */

/**
 * @typedef day
 * @type {object}
 * @property {Date} date - unique
 * @property {dzone[]} dzones
 */

/**
 * @typedef dzone
 * @type {object}
 * @property {day} day
 * @property {zone} zone
 * @property {round[]} rounds
 */

/**
 * @typedef round
 * @type {object}
 * @property {dzone} dzone
 * @property {number} rank - integer used for ordering
 * @property {object.<court, slot>} slots
 */

/**
 * @typedef team
 * @type {object}
 * @property {number} id - positive integer
 * @property {string} name - trimmed words, unique, non-empty
 */

/**
 * @typedef group
 * @type {object}
 * @property {string} id - trimmed word, unique, non-empty
 * @property {sport} sport
 * @property {int} team_matches - matches per team
 * @property {team[]} teams
 */

/**
 * @typedef knockout
 * @type {object}
 * @property {string} id - trimmed word, unique, non-empty
 * @property {sport} sport - trimmed word, non-empty
 * @property {knunion} home
 * @property {knunion} away
 */

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

/**
 * @typedef slot
 * @type {object}
 * @property {round} round
 * @property {court} court
 * @property {?match} match
 */

/**
 * @typedef match
 * @type {object}
 * @property {?slot} slot
 * @property {sport} sport
 * @property {team} team_home
 * @property {team} team_away
 * @property {?number} score_home
 * @property {?number} score_away
 */

/**
 * @typedef config
 * @type {object}
 * @property {court[]} courts
 * @property {sport[]} sports
 * @property {zone[]} zones
 * @property {day[]} days
 * @property {team[]} teams
 * @property {object<string, group>} groups
 * @property {object<string, knockout>} knockouts
 */

/**
 * @constant
 * @type {config}
 */
const config = {};


const points_fn_obj = {
	'Ποδόσφαιρο': (sh, sa) => {
		if (sh > sa)
			return [3, 0];
		else if (sh < sa)
			return [0, 3];
		else
			return [1, 1];
	},
	'Μπάσκετ': (sh, sa) => {
		if (sh > sa)
			return [2, 1];
		else if (sh < sa)
			return [1, 2];
		else
			throw 'ισοπαλία στο μπάσκετ;';
	},
	'Βόλεϊ': (sh, sa) => sh - sa, // TODO fix volley fn
	'Μπέιζμπολ': (sh, sa) => sh - sa, // TODO fix baseball fn
};
