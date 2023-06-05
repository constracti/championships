const courts = [];
const sports = [];
const zones = [];
const rounds = [];
const teams = [];
const groups = {};
const knockouts = {};

document.addEventListener('DOMContentLoaded', function() {

	console.log('ready');

	const form = document.forms[0];

	// avoid copy-paste during testing
	try {
		fetch('https://raw.githubusercontent.com/constracti/championships/master/input.txt').then(response => {
			if (!response.ok)
				throw new Error(`error ${response.status}`);
			return response.text();
		}).then(data => {
			form['config'].value = data;
		});
	} catch (error) {
		error.alert();
	}

	form.addEventListener('submit', function(event) {

		try {
			console.log('submit');
			event.preventDefault();

			// parse config

			let parse_var = null;
			form['config'].value.split(/\n|\r\n|\r|\n\r/).forEach((line, i) => {
				const matchobj = line.trim().match(/^\[(.*)\]$/);
				if (matchobj !== null) {
					parse_var = matchobj[1];
					return;
				}
				if (line.trim().length === 0 || line.startsWith('#'))
					return;
				switch (parse_var.toLowerCase()) {
					case 'teams':
						teams.push({
							id: teams.length,
							name: line.trim(),
						});
						break;
					case 'sports':
						let [sport_name, sport_courts] = line.split(':', 2);
						sport_name = sport_name.trim();
						if (sport_courts !== undefined)
							sport_courts = Array.from(new Set(sport_courts.split(',').map(court_name => court_name.trim())));
						else
							sport_courts = [sport_name];
						sport_courts.forEach(court_name => {
							if (!courts.includes(court_name))
								courts.push(court_name);
						});
						if (!(sport_name in points_fn_obj))
							throw new Error(`points_fn not found for sport ${sport_name}`);
						sports.push({
							id: sports.length,
							name: sport_name,
							courts: sport_courts,
						});
						break;
					case 'zones':
						zones.push({
							rank: zones.length,
							name: line.trim(),
						});
						break;
					case 'rounds':
						const round_parts = line.trim().split(/\s+/);
						if (round_parts.length != 3)
							throw new Error(`line ${i+1} rounds: not valid`);
						const date = new Date(round_parts[0]);
						if (date.toString() === 'Invalid Date')
							throw new Error(`line ${i+1} rounds: not valid date`);
						const zone = zones.filter(zone => zone.name === round_parts[1])[0];
						if (zone === undefined)
							throw new Error(`line ${i+1} rounds: not valid zone`);
						const count = parseInt(round_parts[2]);
						if (count < 0)
							throw new Error(`line ${i+1} rounds: not valid number`);
						for (let c = 0; c < count; c++)
							rounds.push({
								date: date,
								zone: zone,
								rank: c + 1,
								slots: {},
							});
						break;
					case 'groups':
						const [group_parts, group_teams] = line.split(':', 2);
						const [group_id, group_sport, group_matches] = group_parts.split(/\s+/, 3);
						const group = {
							id: group_id.trim(),
							sport: sports.filter(sport => sport.name === group_sport.trim())[0], // TODO check for error
							has_revanche: parseInt(group_matches) > 1,
							teams: group_teams.split(',').map(team_id => teams[team_id - 1]), // TODO check for errors
						};
						groups[group.id] = group;
						break;
				}
			});

			// TODO constracti check rounds for duplicate dates

			produce();

		} catch (error) {
			error.alert();
		}
	});
});
