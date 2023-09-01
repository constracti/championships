/**
 * @param {string} line
 * @returns {void}
 */
function parse_sport_line(line) {
	const sport_ma = line.match(/^\s*([^\s:,]+)\s*(:.*)?$/);
	if (sport_ma === null)
		throw new Error(`parse_sport_line ${line}: not valid sport line`);
	const sport_name = sport_ma[1];
	if (config.sports.filter(sport => sport.name === sport_name).length)
		throw new Error(`parse_sport_line ${line}: duplicate sport name ${sport_name}`);
	if (!(sport_name in points_fn_obj))
		throw new Error(`parse_sport_line ${line}: points_fn not found for sport ${sport_name}`);
	const sport_courts = [];
	if (sport_ma[2] !== undefined) {
		sport_ma[2].slice(1).split(',').forEach(court_name => {
			const court_ma = court_name.match(/^([^:,]*)$/);
			if (court_ma === null)
				throw new Error(`parse_sport_line ${line}: not valid sport courts`);
			court_name = court_ma[1].trim().replace(/\s+/g, ' ');
			if (court_name.length === 0)
				throw new Error(`parse_sport_line ${line}: empty sport court`);
			if (sport_courts.includes(court_name))
				throw new Error(`parse_sport_line ${line}: duplicate sport court ${court_name}`);
			sport_courts.push(court_name);
		});
	} else {
		sport_courts.push(sport_name);
	}
	sport_courts.forEach(court_name => {
		if (!config.courts.includes(court_name))
			config.courts.push(court_name);
	});
	config.sports.push({
		name: sport_name,
		courts: sport_courts,
	});
}

/**
 * @param {string} line
 * @returns {void}
 */
function parse_zone_line(line) {
	if (config.days.length > 0)
		throw new Error(`parse_zone_line ${row}: zone declaration after day`);
	const zone_ma = line.match(/^([^:,]*)$/);
	if (zone_ma === null)
		throw new Error(`parse_zone_line ${row}: not valid zone line`);
	const zone_name = zone_ma[1].trim().replace(/\s+/g, ' ');
	if (zone_name.length === 0)
		throw new Error(`parse_zone_line ${line}: empty zone name`);
	if (config.zones.filter(zone => zone.name === zone_name).length)
		throw new Error(`parse_zone_line ${row}: duplicate zone name ${zone_name}`);
	config.zones.push({
		rank: config.zones.length,
		name: zone_name,
	});
}

/**
 * @param {string} line
 * @returns {void}
 */
function parse_day_line(line) {
	if (config.zones.length === 0) {
		config.zones.push({
			rank: 0,
			name: null,
		});
	}
	const day_ma = line.match(/^\s*(\d{4}-\d{2}-\d{2})\s+(\d+(?:\s+\d+)*)\s*$/);
	if (day_ma === null)
		throw new Error(`parse_day_line ${line}: not valid day line`);
	const date = new Date(day_ma[1]);
	if (Number.isNaN(date.getFullYear()))
		throw new Error(`parse_day_line ${line}: not valid date`);
	if (config.days.filter(day => day.date.getTime() === date.getTime()).length)
		throw new Error(`parse_day_line ${line}: duplicate date`);
	const day_rounds = day_ma[2].split(/\s+/).map(rounds => parseInt(rounds));
	if (day_rounds.length !== config.zones.length)
		throw new Error(`parse_day_line ${line}: not valid day zones`);
	const day = {
		date: date,
		dzones: [],
	};
	day_rounds.forEach((rounds, zone) => {
		// Q: skip if rounds === 0?
		const dzone = {
			day: day,
			zone: config.zones[zone],
			rounds: [],
		};
		for (let rank = 0; rank < rounds; rank++) {
			dzone.rounds.push({
				dzone: dzone,
				rank: rank,
				slots: {},
			});
		}
		day.dzones.push(dzone);
	});
	config.days.push(day);
}

/**
 * @param {string} line
 * @returns {void}
 */
function parse_team_line(line) {
	const team_ma = line.match(/^([^:,]*)$/);
	if (team_ma === null)
		throw new Error(`parse_team_line ${line}: not valid team line`);
	const team_name = team_ma[1].trim().replace(/\s+/g, ' ');
	if (team_name.length === 0)
		throw new Error(`parse_team_line ${line}: empty team name`);
	if (config.teams.filter(team => team.name === team_name).length)
		throw new Error(`parse_team_line ${line}: duplicate team name ${team_name}`);
	config.teams.push({
		id: config.teams.length + 1,
		name: team_name,
	});
}

/**
 * @param {string} line
 * @returns {void}
 */
function parse_group_line(line) {
	const group_ma = line.match(/^\s*([^\s:,]+)\s+([^\s:,]+)\s+(\d+)\s*:(.*)$/);
	if (group_ma === null)
		throw new Error(`parse_group_line ${line}: not valid group line`);
	const group_id = group_ma[1];
	if (group_id in config.groups)
		throw new Error(`parse_group_line ${line}: duplicate group id ${group_id}`);
	const group_sport = config.sports.filter(sport => sport.name === group_ma[2])[0];
	if (group_sport === undefined)
		throw new Error(`parse_group_line ${line}: not valid group sport ${group_ma[2]}`);
	const group_team_matches = parseInt(group_ma[3]);
	if (group_team_matches <= 0)
		throw new Error(`parse_group_line ${line}: not valid group team matches ${group_team_matches}`);
	const group_teams = [];
	group_ma[4].split(',').forEach(team_expr => {
		const teams = [];
		const team_ma = team_expr.match(/^\s*(\d+)\s*$/);
		if (team_ma !== null) {
			const t = parseInt(team_ma[1]);
			teams.push(t);
		}
		const range_ma = team_expr.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
		if (range_ma !== null) {
			const t1 = parseInt(range_ma[1]);
			const t2 = parseInt(range_ma[2]);
			for (let t = t1; t <= t2; t++)
				teams.push(t);
		}
		if (teams.length === 0)
			throw new Error(`parse_group_line ${line}: not valid group teams`);
		teams.forEach(t => {
			if (t <= 0 || t > config.teams.length || group_teams.includes(t))
				throw new Error(`parse_group_line ${line}: not valid group teams`);
			group_teams.push(t);
		});
	});
	if (group_team_matches % 2 === 1 && group_teams.length % 2 === 1)
		throw new Error(`parse_group_line ${line}: not acceptable group team matches ${group_team_matches}`);
	const group = {
		id: group_id,
		sport: group_sport,
		team_matches: group_team_matches,
		teams: group_teams.map(t => config.teams[t - 1]),
	};
	config.groups[group.id] = group;
}

/**
 * @param {string} line
 * @returns {void}
 */
function parse_knockout_line(line) {
	const knockout_ma = line.match(/^\s*([^\s:,]+)\s+([^\s:,]+)\s+([^\s,]+)\s+([^\s,]+)\s*$/);
	if (knockout_ma === null)
		throw new Error(`parse_knockout_line ${line}: not valid knockout line`);
	const knockout_id = knockout_ma[1];
	if (knockout_id in config.knockouts)
		throw new Error(`parse_knockout_line ${line}: duplicate knockout id ${knockout_id}`);
	const knockout_sport = config.sports.filter(sport => sport.name === knockout_ma[2])[0];
	if (knockout_sport === undefined)
		throw new Error(`parse_knockout_line ${line}: not valid knockout sport ${knockout_ma[2]}`);
	function knockout_union(ha, str) {
		let ma;
		ma = str.match(/^(\d+)$/);
		if (ma !== null) {
			const t = parseInt(ma[1]);
			if (t <= 0 || t > config.teams.length)
				throw new Error(`parse_knockout_line ${line}: not valid knockout ${ha}`);
			return {
				type: 'fixed',
				team: config.teams[t - 1],
			};
		}
		ma = str.match(/^([^\s:,]+):(\d+)$/);
		if (ma !== null) {
			const group_id = ma[1];
			if (!(group_id in config.groups) || config.groups[group_id].sport !== knockout_sport)
				throw new Error(`parse_knockout_line ${line}: not valid knockout ${ha}`);
			const group_rank = parseInt(ma[2]);
			if (group_rank <= 0 || group_rank > config.groups[group_id].teams.length)
				throw new Error(`parse_knockout_line ${line}: not valid knockout ${ha}`);
			return {
				type: 'group',
				group: config.groups[group_id],
				rank: group_rank,
			};
		}
		ma = str.match(/^([^\s:,]+):([WL])$/);
		if (ma !== null) {
			const knockout_id = ma[1];
			if (!(knockout_id in config.knockouts) || config.knockouts[knockout_id].sport !== knockout_sport)
				throw new Error(`parse_knockout_line ${line}: not valid knockout ${ha}`);
			const knockout_is_winner = ma[2] === 'W';
			return {
				type: 'knockout',
				knockout: config.knockouts[knockout_id],
				is_winner: knockout_is_winner,
			};
		}
		throw new Error(`parse_knockout_line ${line}: not valid knockout ${ha}`);
	}
	const knockout = {
		id: knockout_id,
		sport: knockout_sport,
		home: knockout_union('home', knockout_ma[3], knockout_sport),
		away: knockout_union('away', knockout_ma[4], knockout_sport),
	};
	config.knockouts[knockout.id] = knockout;
}


document.addEventListener('DOMContentLoaded', () => {

	console.log('ready');

	const form = document.forms[0];

	// avoid copy-paste during testing
	document.getElementById('save').addEventListener('click', event => {
		const value = form['config'].value;
		if (value.length)
			localStorage.setItem('config', value);
		else
			localStorage.removeItem('config');
	});
	document.getElementById('load').addEventListener('click', event => {
		const value = localStorage.getItem('config');
		if (value !== null)
			form['config'].value = value;
		else
			form['config'].value = '';
	});
	document.getElementById('load').dispatchEvent(new Event('click'));

	form.addEventListener('submit', event => {

		console.log('submit');
		event.preventDefault();

		// initialize config
		config.courts = [];
		config.sports = [];
		config.zones = [];
		config.days = [];
		config.teams = [];
		config.groups = {};
		config.knockouts = {};

		try {

			// parse config
			let config_var = null;
			form['config'].value.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n').forEach((line, i) => {
				if (line.length === 0 || line.startsWith('#'))
					return;
				const line_config_matchobj = line.match(/^\[(.*)\]$/);
				if (line_config_matchobj !== null) {
					config_var = line_config_matchobj[1].toLowerCase();
					return;
				}
				switch (config_var) {
					case 'sports':
						return parse_sport_line(line);
					case 'zones':
						return parse_zone_line(line);
					case 'days':
						return parse_day_line(line);
					case 'teams':
						return parse_team_line(line);
					case 'groups':
						return parse_group_line(line);
					case 'knockouts':
						return parse_knockout_line(line);
				}
			});

			// sort days
			config.days.sort((day1, day2) => day1.date.getTime() - day2.date.getTime());

			// create slots
			config.days.forEach(day => {
				day.dzones.forEach(dzone => {
					dzone.rounds.forEach(round => {
						config.courts.forEach(court => {
							slot = {
								round: round,
								court: court,
								match: null,
							};
							round.slots[court] = slot;
						});
					});
				});
			});

			document.dispatchEvent(new Event('championships_config_parsed'));

		} catch (error) {
			alert(error.toString());
		}
	});
});
