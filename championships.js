//import * as scheduler from './scheduling_algorithms.js';
//import * as display from './match_handler.js';

document.addEventListener('DOMContentLoaded', function() {

	console.log('ready');

	const form = document.forms[0];

	// avoid copy-paste during testing
	try {
		fetch('https://raw.githubusercontent.com/constracti/championships/master/input.json').then(response => {
			if (!response.ok)
				throw new Error(`error ${response.status}`);
			return response.text();
		}).then(data => {
			form['config'].value = data;
		});
	} catch (error) {
		alert(error);
	}

	const points_fn_obj = {
		'ποδόσφαιρο': (sh, sa) => {
			if (sh > sa)
				return [3, 0];
			else if (sh < sa)
				return [0, 3];
			else
				return [1, 1];
		},
		'μπάσκετ': (sh, sa) => {
			if (sh > sa)
				return [2, 1];
			else if (sh < sa)
				return [1, 2];
			else
				throw 'ισοπαλία στο μπάσκετ;';
		},
	};

	const courts = {
		'ποδόσφαιρο': ["Ποδόσφαιρο Καινούργιο", "Ποδόσφαιρο Παλαιό"],
		'μπάσκετ': ["Μπάσκετ"],
	};

	form.addEventListener('submit', function(event) {

		try {
			console.log('submit');
			event.preventDefault();

			// parse config
			const config = JSON.parse(form['config'].value);
			console.log(config);

			// build teams
			const teams = config.teams.map(name => name.trim()).filter(name => name.length).map((name, id) => ({
				id: id,
				name: name,
			}));
			console.log('teams:\n' + teams.map(team => `${team.id}: ${team.name}`).join('\n'));
			// TODO assert teams name property is unique -> Done.
			teams.forEach(team => {
				if (teams.filter(t=>t.name===team.name).length>1)
					throw new Error(`Team names are not unique: ${team.name}`);
			});

			// build sports
			const sports = config.sports.map(name => name.trim()).filter(name => name.length).map((name, id) => ({
				id: id,
				name: name,
				points_fn: points_fn_obj[name],
				courts:courts[name],
			}));
			sports.forEach(sport => {
				if (!(sport.name.toLowerCase() in points_fn_obj))
					throw new Error(`points_fn not found for sport ${sport.name}`);
				if (!(sport.name.toLowerCase() in courts))
					throw new Error(`courts not found for sport ${sport.name}`);
				sport.points_fn = points_fn_obj[sport.name.toLowerCase()];
				sport.courts = courts[sport.name.toLowerCase()];
			});
			console.log('sports:\n' + sports.map(sport => `${sport.id}: ${sport.name}`).join('\n'));
			// TODO assert sports name property is unique -> Done.
			sports.forEach(sport => {
				if (sports.filter(s=>s.name===sport.name).length>1)
					throw new Error(`Sport names are not unique: ${sport.name}`);
			});

			// build zones
			const zones = config.zones.map(name => name.trim()).filter(name => name.length);
			console.log('zones:\n' + zones.join('\n'));
			// TODO assert zones name property is unique -> Done.
			zones.forEach(zone => {
				if (zones.filter(z=>z===zone).length>1)
					throw new Error(`Zone names are not unique: ${zone.name}`);
			});

			// produce rounds
			const rounds = [];
			config.rounds.forEach((line, i) => {
				line = line.trim().split(/\s+/);
				if (!line.length)
					return [];
				if (line.length != 3)
					throw new Error(`rounds line ${i}: not valid`);
				const date = new Date(line[0]);
				if (date.toString() === 'Invalid Date')
					throw new Error(`rounds line ${i}: not valid date`);
				const zone = zones.filter(zone => zone === line[1])[0];
				if (zone === undefined)
					throw new Error(`rounds line ${i}: not valid zone`);
				const count = parseInt(line[2]);
				if (count < 0)
					throw new Error(`rounds line ${i}: not valid number`);
				for (let c = 0; c < count; c++)
					rounds.push({
						date: date,
						zone: zone,
						rank: c,
						// TODO slots dictionary-> Done below. Every round has sport slots.
					});
			});
			for (let i =0; i<rounds.length; i++){
				for (let k = 0; k < sports.length; k++){
					rounds[i][sports[k].name]=[];
				}
			}
			
			console.log('rounds:\n' + rounds.map(round => `${round.date.toJSON().split('T')[0]} ${round.zone} ${round.rank}`).join('\n'));

			// produce slots
			// TODO support courts -> Done. (i suppose)
			const slots = rounds.map(round => {
				return sports.map(sport => {
					return sport.courts.map(court=>{
						return {
							round: round,
							sport: sport,
							court: court,
							match: null,
							available: true,
						};
					});
				}).flat();
			}).flat();
			console.log('slots: ' + slots.length);

			// produce matches
			// TODO matches arise from the league structure; assuming the default (single group) structure
			const matches = [];
			sports.forEach(sport => {
				teams.forEach(th => {
					teams.forEach(ta => {
						if (th.id >= ta.id)
							return;
						matches.push({
							sport: sport,
							slot: null,
							team_home: th,
							team_away: ta,
							score_home: null,
							score_away: null,
						});
					});
				});
			});
			console.log('matches: ' + matches.length);
			// TODO remove this statement and adapt following functions -> Done.

			ScheduleMatchesDefault(matches, rounds, slots, sports);
			Displayer(matches, rounds, slots, sports);

		} catch (error) {
			alert(error);
		}
	});
});
