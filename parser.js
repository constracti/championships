
const courts = [];
const sports = [];
const zones = [];
const rounds = [];
const teams = [];
const groups = {};
const knockouts = {};


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

		courts.length = 0;
		sports.length = 0;
		zones.length = 0;
		rounds.length = 0;
		teams.length = 0;
		for (let p in groups) {
			if (groups.hasOwnProperty(p))
				delete groups[p];
		}
		for (let p in knockouts) {
			if (knockouts.hasOwnProperty(p))
				delete knockouts[p];
		}

		try {
			// parse config

			let config_var = null;
			form['config'].value.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n').forEach((str, i) => {
				str = str.trim();
				if (str.length === 0 || str.startsWith('#'))
					return;
				const line_config_matchobj = str.match(/^\[(.*)\]$/);
				if (line_config_matchobj !== null) {
					config_var = line_config_matchobj[1].toLowerCase();
					return;
				}
				switch (config_var) {
					case 'sports':
						const sport_matchobj = str.match(/^\s*([^\s:,]+)\s*(:.*)?$/);
						if (sport_matchobj === null)
							throw new Error(`config ${i+1}: not valid sport`);
						const sport_name = sport_matchobj[1];
						if (sports.filter(sport => sport.name === sport_name).length)
							throw new Error(`config ${i+1}: duplicate sport name ${sport_name}`);
						if (!(sport_name in points_fn_obj))
							throw new Error(`config ${i+1}: points_fn not found for sport ${sport_name}`);
						const sport_courts = [];
						if (sport_matchobj[2] !== undefined) {
							sport_matchobj[2].slice(1).split(',').forEach(court_name => {
								const court_matchobj = court_name.match(/^([^:,]*)$/);
								if (court_matchobj === null)
									throw new Error(`config ${i+1}: not valid sport court`);
								court_name = court_matchobj[1].trim().replace(/\s+/g, ' ');
								if (court_name.length === 0)
									throw new Error(`config ${i+1}: empty sport court`);
								if (sport_courts.includes(court_name))
									throw new Error(`config ${i+1}: duplicate sport court ${court_name}`);
								sport_courts.push(court_name);
							});
						} else {
							sport_courts.push(sport_name);
						}
						sport_courts.forEach(court_name => {
							if (!courts.includes(court_name))
								courts.push(court_name);
						});
						sports.push({
							id: sports.length,
							name: sport_name,
							courts: sport_courts,
						});
						break;
					case 'zones':
						const zone_matchobj = str.match(/^\s*([^\s:,]+)\s*$/);
						if (zone_matchobj === null)
							throw new Error(`config ${i+1}: not valid zone`);
						const zone_name = zone_matchobj[1];
						if (zones.filter(zone => zone.name === zone_name).length)
							throw new Error(`config ${i+1}: duplicate zone name ${zone_name}`);
						zones.push({
							rank: zones.length,
							name: zone_matchobj[1],
						});
						break;
					case 'rounds':
						const round_matchobj = str.match(/^\s*(\d{4}-\d{2}-\d{2})\s+([^\s:,]+)\s+(\d+)\s*$/);
						if (round_matchobj === null)
							throw new Error(`config ${i+1}: not valid round`);
						const date = new Date(round_matchobj[1]);
						if (Number.isNaN(date.getFullYear()))
							throw new Error(`config ${i+1}: not valid round date`);
						const zone = zones.filter(zone => zone.name === round_matchobj[2])[0];
						if (zone === undefined)
							throw new Error(`config ${i+1}: not valid round zone`);
						const count = parseInt(round_matchobj[3]);
						if (count < 0)
							throw new Error(`config ${i+1}: not valid round count`);
						for (let c = 0; c < count; c++)
							rounds.push({
								date: date,
								zone: zone,
								rank: c + 1,
								slots: {},
								count: count, //sorry i need this so bad! Maybe its not its place here but it will do for now...
							});
						break;
					case 'teams':
						const team_matchobj = str.match(/^([^:,]*)$/);
						if (team_matchobj === null)
							throw new Error(`config ${i+1}: not valid team`);
						const team_name = team_matchobj[1].trim().replace(/\s+/g, ' ');
						if (team_name.length === 0)
							throw new Error(`config ${i+1}: empty team name`);
						if (teams.filter(team => team.name === team_name).length)
							throw new Error(`config ${i+1}: duplicate team name ${team_name}`);
						teams.push({
							id: teams.length + 1,
							name: team_name,
						});
						break;
					case 'groups':
						const group_matchobj = str.match(/^\s*([^\s:,]+)\s+([^\s:,]+)\s+(\d+)\s*:(.*)$/);
						if (group_matchobj === null)
							throw new Error(`config ${i+1}: not valid group`);
						const group_id = group_matchobj[1];
						if (group_id in groups)
							throw new Error(`config ${i+1}: duplicate group id ${group_id}`);
						const group_sport = sports.filter(sport => sport.name === group_matchobj[2])[0];
						if (group_sport === undefined)
							throw new Error(`config ${i+1}: not valid group sport`);
						const group_team_matches = parseInt(group_matchobj[3]);
						if (group_team_matches <= 0)
							throw new Error(`config ${i+1}: not valid group team matches`);
						const group_teams = [];
						group_matchobj[4].split(',').forEach(team_range => {
							const range_teams = [];
							const team_matchobj = team_range.match(/^\s*(\d+)\s*$/);
							if (team_matchobj !== null) {
								const t = parseInt(team_matchobj[1]);
								range_teams.push(t);
							}
							const range_matchobj = team_range.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
							if (range_matchobj !== null) {
								const t1 = parseInt(range_matchobj[1]);
								const t2 = parseInt(range_matchobj[2]);
								for (let t = t1; t <= t2; t++)
									range_teams.push(t);
							}
							if (range_teams.length === 0)
								throw new Error(`config ${i+1}: not valid group teams`);
							range_teams.forEach(t => {
								if (t <= 0 || t > teams.length || group_teams.includes(t))
									throw new Error(`config ${i+1}: not valid group teams`);
								group_teams.push(t);
							});
						});
						if (group_team_matches % 2 === 1 && group_teams.length % 2 === 1)
							throw new Error(`config ${i+1}: not acceptable group team matches`);
						const group = {
							id: group_id,
							sport: group_sport,
							team_matches: group_team_matches,
							teams: group_teams.map(t => teams[t - 1]),
						};
						groups[group.id] = group;
						break;
					case 'knockouts':
						const knockout_matchobj = str.match(/^\s*([^\s:,]+)\s+([^\s:,]+)\s+([^\s,]+)\s+([^\s,]+)\s*$/);
						if (knockout_matchobj === null)
							throw new Error(`config ${i+1}: not valid knockout`);
						const knockout_id = knockout_matchobj[1];
						if (knockout_id in knockouts)
							throw new Error(`config ${i+1}: duplicate knockout id ${knockout_id}`);
						const knockout_sport = sports.filter(sport => sport.name === knockout_matchobj[2])[0];
						if (knockout_sport === undefined)
							throw new Error(`config ${i+1}: not valid knockout sport`);
						function knockout_union(ha, str, sport) {
							let m;
							m = str.match(/^(\d+)$/);
							if (m !== null) {
								const t = parseInt(m[1]);
								if (t <= 0 || t > teams.length)
									throw new Error(`config ${i+1}: not valid knockout ${ha}`);
								return {
									type: 'fixed',
									team: teams[t - 1],
								};
							}
							m = str.match(/^([^\s:,]+):(\d+)$/);
							if (m !== null) {
								const group_id = m[1];
								if (!(group_id in groups) || groups[group_id].sport !== sport)
									throw new Error(`config ${i+1}: not valid knockout ${ha}`);
								const group_rank = parseInt(m[2]);
								if (group_rank <= 0 || group_rank > groups[group_id].teams.length)
									throw new Error(`config ${i+1}: not valid knockout ${ha}`);
								return {
									type: 'group',
									group: groups[group_id],
									rank: group_rank,
								};
							}
							m = str.match(/^([^\s:,]+):([WL])$/);
							if (m !== null) {
								const knockout_id = m[1];
								if (!(knockout_id in knockouts) || knockouts[knockout_id].sport !== sport)
									throw new Error(`config ${i+1}: not valid knockout ${ha}`);
								const knockout_is_winner = m[2] === 'W';
								return {
									type: 'knockout',
									knockout: knockouts[knockout_id],
									is_winner: knockout_is_winner,
								};
							}
							throw new Error(`config ${i+1}: not valid knockout ${ha}`);
						}
						const knockout = {
							id: knockout_id,
							sport: knockout_sport,
							home: knockout_union('home', knockout_matchobj[3], knockout_sport),
							away: knockout_union('away', knockout_matchobj[4], knockout_sport),
						};
						knockouts[knockout.id] = knockout;
				}
			});

			produce();

		} catch (error) {
			error.alert(); // TODO display textarea line numbers
		}
	});
});
