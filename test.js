document.addEventListener('DOMContentLoaded', function() {
	console.log('ready');

	const form = document.forms[0];

	const form_teams = form['teams'];
	// example input value for testing
	form_teams.value = [
		'Φωτοδότες',
		'Αγωνιστές',
		'Τροπαιοφόροι',
		'Πρόμαχοι',
	/*	'Σταθεροί',
		'Ακλόνητοι',
		'Υψιπέτες',
		'Πιστοί',
		'Ηρωικοί',
		'Ελπιδοφόροι',
		'Φωτοδόχοι',*/ //this name is very frustrating when you try to debug and you have 'Φωτοδό-' 2 times...
	].join('\n');

	const form_sports = form['sports'];
	// example input value for testing
	form_sports.value = [
		'Ποδόσφαιρο',
		'Μπάσκετ',
	/*	'Βόλεϊ',
		'Μπέισμπολ',*/
	].join('\n');

	const form_date_start = form['start'];
	// example input value for testing
	form_date_start.value = '2022-08-10';

	const form_date_stop = form['end'];
	// example input value for testing
	form_date_stop.value = '2022-08-22';

	const form_grstructure = form['grstructure'];
	// example input value for testing
	form_grstructure.value = 'default';

	const form_zones = form['zones'];
	// example input value for testing
	form_zones.value = [
		'Πρωινή',
		'Απογευματινή',
	].join('\n');

	const form_rounds = form['rounds'];
	// example input value for testing
	form_rounds.value = 2;

	// TODO define constants here -> Done.

	let matches = [];
	let teams = [];
	let groups = [];
	let zones = [];
	let rounds = [];
	let sports = [];

	let t = document.getElementsByName('teams'); //could optimize that with the above form consts...
	let gs = document.getElementsByName('grstructure');
	let z = document.getElementsByName('zones');
	let r = document.getElementsByName('rounds');
	let s = document.getElementsByName('sports');
	let sd = document.getElementsByName('start');
	let ed = document.getElementsByName('end');

	let init_teams = t[0].value.trim().split('\n');
	let init_group_structure = gs[0].value.trim().toLowerCase();
	let init_zone = z[0].value.trim().split('\n');
	let init_number_of_rounds = r[0].value.trim().toLowerCase();
	let init_sports = s[0].value.trim().split('\n');
	const init_start_date = new Date(sd[0].value);
	const init_end_date = new Date(ed[0].value);

	let difference = (init_end_date.getTime() - init_start_date.getTime()) / (1000 * 60 * 60 * 24);

	form.addEventListener('submit', function(event) {
		console.log('submit!');
		event.preventDefault();

		// TODO run algorith here -> Done.


		// TODO use tabs instead of spaces for indentation -> Done.
		console.log(init_teams);
		for (let i = 0; i < init_teams.length; i++) {
			team =
			{
				id: i,
				name: init_teams[i]
			};
			teams.push(team);
		}

		for (let i = 0; i < init_sports.length; i++) {
			sport =
			{
				name: init_sports[i],
				points: (sh, sa) => {
					let ph;
					let pa;
					if (sport.name === 'ποδόσφαιρο'.trim().toLowerCase()) {
						if (sh > sa) {
							ph = 3;
							pa = 0;
						}
						else if (sh < sa) {
							ph = 0;
							pa = 3;
						}
						else {
							ph = 1;
							pa = 1;
						}
					}
					//more sports
					return [ph, pa];
				}
			};
			sports.push(sport);
		}


		for (let d = 0; d <= difference; d++) {
			for (let i = 0; i < init_zone.length; i++) {
				zone =
				{
					id: i,
					name: init_zone[i]
				};
				for (let k = 0; k < sports.length; k++) {
					for (let j = 0; j < init_number_of_rounds; j++) {
						round =
						{
							sport: sports[k],
							id: 0,
							date: new Date(init_start_date.getFullYear(), init_start_date.getMonth(), init_start_date.getDate() + d).toDateString(),
							zone: zone.id,
							rank: j,
							available: true
						};
						rounds.push(round);
					}
				}
				zones.push(zone)
			}
		}
		for (let i = 0; i < rounds.length; i++) {
			rounds[i]['id'] = i;
		}


		if (init_group_structure === 'default') {
			for (let k = 0; k < sports.length; k++) {
				group =
				{
					sport: sports[k],
					teams: teams,
					structure: 'default'
				};
				groups.push(group)
				for (let i = 0; i < group.teams.length - 1; i++) {
					for (let j = i; j < group.teams.length - 1; j++) {
						match =
						{
							th: group.teams[i],
							ta: group.teams[j + 1],
							sh: 0,
							sa: 0,
							round: -1
						};
						matches.push(match);
					}
				}
			}
			for (let m = 0; m < matches.length; m++) {
				for (let r = 0; r < rounds.length; r++) {
					if (rounds[r].available === true)//if there is an empty court
					{
						let team1 = matches[m].th;
						let team2 = matches[m].ta;
						let scheduled = false;//If in this specific date, in a specific zone and rank a team is scheduled to play something else.

						for (let rm = 0; rm < matches.length; rm++) {
							if (matches[rm].round !== -1) {
								if (rounds[r].date === rounds[matches[rm].round].date && rounds[r].rank === rounds[matches[rm].round].rank && rounds[r].zone === rounds[matches[rm].round].zone && (matches[rm].th === team1 || matches[rm].ta === team1 || matches[rm].th === team2 || matches[rm].ta === team2)) {
									scheduled = true;
									break;
								}
							}
						}
						if (!scheduled) {
							matches[m].round = rounds[r].id;
							rounds[r].available = false;
							break;
						}
					}
				}
			}
			for (let m = 0; m < matches.length; m++) {//not finished
				if (matches[m].round === -1)
				{
					alert('No solution found, try to decrease the number of teams or extend the period of the schedule.\
						\n\nKeep in mind that for the time being the scheduling algorithm is nowhere near its final state and cannot find a good solution.');
					break;
				}
			}
		}

		console.log(matches);
		console.log(groups);
		console.log(rounds);
	});
});




