Error.prototype.alert = function() {
	alert(`${this.fileName}:${this.lineNumber}:${this.columnNumber} ${this.toString()}`);
};

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
		error.alert();
	}

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
	};

	form.addEventListener('submit', function(event) {

		try {
			console.log('submit');
			event.preventDefault();

			// parse config
			const config = JSON.parse(form['config'].value);
			console.log(config);

			// build teams
			const teams = config.teams.map((name, id) => ({
				id: id,
				name: name.trim(),
			}));
			// check teams for empty or duplicate name
			teams.forEach(team => {
				if (!team.name.length)
					throw new Error('empty team name');
				if (teams.filter(t => t.name === team.name).length !== 1)
					throw new Error(`duplicate team name: ${team.name}`);
			});
			console.log('teams: ' + teams.length + '\n' + teams.map(team => `${team.id}: ${team.name}`).join('\n'));

			// produce courts and build sports
			const courts = [];
			const sports = config.sports.map((line, id) => {
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
				return {
					id: id,
					name: sport_name,
					points_fn: points_fn_obj[sport_name],
					courts: sport_courts,
				};
			});
			// check courts for empty name
			courts.forEach(name => {
				if (!name.length)
					throw new Error('empty court name');
			});
			console.log('courts: ' + courts.length + '\n' + courts.join('\n'));
			// check sports for empty or duplicate name
			sports.forEach(sport => {
				if (!sport.name.length)
					throw new Error('empty sport name');
				if (sports.filter(s => s.name === sport.name).length !== 1)
					throw new Error(`duplicate sport name: ${sport.name}`);
			});
			console.log('sports: ' + sports.length + '\n' + sports.map(sport => `${sport.id}: ${sport.name} (${sport.courts.join(', ')})`).join('\n'));

			// build zones
			const zones = config.zones.map((name, id) => ({
				rank: id,
				name: name.trim(),
			}));
			// check zones for empty or duplicate name
			zones.forEach(zone => {
				if (!zone.name.length)
					throw new Error('empty zone name');
				if (zones.filter(z => z.name === zone.name).length !== 1)
					throw new Error(`duplicate zone name: ${zone.name}`);
			});
			console.log('zones: ' + zones.length + '\n' + zones.map(zone => zone.name).join('\n'));

			// produce rounds
			const rounds = [];
			config.rounds.forEach((line, i) => {
				line = line.trim().split(/\s+/);
				if (!line.length)
					return [];
				if (line.length != 3)
					throw new Error(`rounds line ${i+1}: not valid`);
				const date = new Date(line[0]);
				if (date.toString() === 'Invalid Date')
					throw new Error(`rounds line ${i+1}: not valid date`);
				const zone = zones.filter(zone => zone.name === line[1])[0];
				if (zone === undefined)
					throw new Error(`rounds line ${i+1}: not valid zone`);
				const count = parseInt(line[2]);
				if (count < 0)
					throw new Error(`rounds line ${i+1}: not valid number`);
				for (let c = 0; c < count; c++)
					rounds.push({
						date: date,
						zone: zone,
						rank: c + 1,
						slots: {},
					});
			});
			// TODO constracti check rounds for duplicate dates
			console.log('rounds: ' + rounds.length + '\n' + rounds.map(round => `${round.date.toJSON().split('T')[0]} ${round.zone.name} ${round.rank}`).join('\n'));

			// produce slots
			const slots = [];
			rounds.forEach(round => {
				courts.forEach(court => {
					const slot = {
						round: round,
						court: court,
						match: null,
					};
					round.slots[court.name] = slot;
					slots.push(slot);
				});
			});
			console.log('slots: ' + slots.length);

			// produce matches
			// TODO matches arise from the league structure; assuming the default (single group) structure
			const matches = [];
			
			//produce matches from groups
			Object.values(groups).forEach(gr => {
				gr.teams.forEach(ta => {
					if (th.id >= ta.id)
						return;
					matches.push({
						sport: sport,
						slot: null,
						team_home: th,
						team_away: ta,
						score_home: null,
						score_away: null,
						src: "group",
						arg: gr,
					});
					if (gr.has_revanche) {
						gr.teams.forEach(th => {
							gr.teams.forEach(ta => {
								if (th.id >= ta.id)
									return;
								matches.push({
									sport: sport,
									slot: null,
									team_home: ta,
									team_away: th,
									score_home: null,
									score_away: null,
									src: "group",
									arg: gr,
								});
							});
						});
					}
				});
			});



			//no groups=knockout
			Object.values(knockouts).forEach(kn => {
				let team_home;
				let team_away;
				if (kn.home_src===null) {
					//fixed teams eg baseball
					team_home=teams[kn.home_arg-1]
				}
				else {
					//find group or knockout
					Object.keys(groups).forEach(key => {
						if (key===kn.home_src) {
							team_home='${kn.home_src}${kn.home_arg}'
							return team_home
						}
					});
					if (!team_home) {
						Object.keys(knockouts).forEach(key => {
							if (key===kn.home_src) {
								team_home='${kn.home_src}${kn.home_arg}'
								return team_home
							}
						});
					}
				}

				if (kn.away_src===null) {
					//fixed teams eg baseball
					team_away=teams[kn.away_arg-1]
				}
				else {
					//find group or knockout
					Object.keys(groups).forEach(key => {
						if (key===kn.away_src) {
							team_away='${kn.away_src}${kn.away_arg}'
							return team_away
						}
					});
					if (!team_away) {
						Object.keys(knockouts).forEach(key => {
							if (key===kn.away_src) {
								team_away='${kn.away_src}${kn.away_arg}'
								return team_away
							}
						});
					}
				}

				matches.push({
					sport: kn.sport,
					slot: null,
					team_home: team_home,
					team_away: team_away,
					score_home: null,
					score_away: null,
					src: "knockout",
					arg: home_arg,
				});
			});
			


			console.log('matches: ' + matches.length);

			// TODO adapt scheduler and displayer to new data types

			// TODO scheduler should accept only two arguments: slots and matches
			ScheduleMatchesDefault(matches, rounds, slots, sports);

			// TODO display as table
			// TODO displayer should accept only three arguments: courts and slots - the first one is provided just for ordering purposes
			Displayer(matches, rounds, slots, sports);

		} catch (error) {
			error.alert();
		}
	});
});
