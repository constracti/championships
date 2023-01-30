document.addEventListener('DOMContentLoaded', function() {
	console.log('ready');

	const form = document.forms[0];

	const form_teams = form.teams;
	// example input value for testing
	form_teams.value = [
		'Φωτοδότες',
		'Αγωνιστές',
		'Τροπαιοφόροι',
		'Πρόμαχοι',
	].join('\n');

	const form_sports = form.sports;
	// example input value for testing
	form_sports.value = [
		'Ποδόσφαιρο',
		'Μπάσκετ',
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

	// TODO define constants here -> Done.

	let teams = null;
	let sports = null;
	let matches = [];
	let groups = [];
	let zones = [];
	let rounds = [];

	let t = document.getElementsByName('teams'); //could optimize that with the above form consts...
	// TODO that's the point... use constants with descriptive names and access them as form elements
	let gs = document.getElementsByName('grstructure');
	let z = document.getElementsByName('zones');
	let r = document.getElementsByName('rounds');
	let s = document.getElementsByName('sports');
	let sd = document.getElementsByName('start');
	let ed = document.getElementsByName('end');

	// TODO even initializations should be done on the submit event; they are part of the algorith
	let init_group_structure = gs[0].value.trim().toLowerCase();
	let init_zone = z[0].value.trim().split('\n');
	let init_number_of_rounds = r[0].value.trim().toLowerCase();
	const init_start_date = new Date(sd[0].value);
	const init_end_date = new Date(ed[0].value);

	let difference = (init_end_date.getTime() - init_start_date.getTime()) / (1000 * 60 * 60 * 24);

	form.addEventListener('submit', function(event) {
		console.log('submit');
		event.preventDefault();

		// TODO run algorith here -> Done.

		teams = form_teams.value.split('\n').map(name => name.trim()).filter(name => name.length).map(function(name, id) {
			return {
				id: id,
				name: name,
			};
		});
		console.log('teams:\n' + teams.map(team => `${team.id}: ${team.name}`).join('\n'));
		//teams.forEach(team => console.log(`${team.id}: ${team.name}`));

		sports = form_sports.value.split('\n').map(name => name.trim().toLowerCase()).filter(name => name.length).map(function(name, id) {
			return {
				id: id,
				name: name,
				points_fn: points_fn_obj[name],
			};
		});
		console.log('sports:\n' + sports.map(sport => `${sport.id}: ${sport.name}`).join('\n'));

		// TODO try to code in a functional programming style as in teams and sports
		// produce rounds (aka "slots")
		for (let d = 0; d <= difference; d++) {
			for (let i = 0; i < init_zone.length; i++) {
				zone = // TODO variables not declared with a const/let/var keyword become global; in this case, const is prefered
				{
					id: i,
					name: init_zone[i] // TODO terminate last line of multiline object / list expressions with a comma for scalability
				};
				for (let k = 0; k < sports.length; k++) {
					for (let j = 0; j < init_number_of_rounds; j++) {
						round =
						{
							sport: sports[k],
							id: 0,
							date: new Date(init_start_date.getFullYear(), init_start_date.getMonth(), init_start_date.getDate() + d).toDateString(), // TODO see comments @ https://stackoverflow.com/a/34324394/6884847
							zone: zone.id, // IDEA you may reference the object; it's just a pointer!
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
				// TODO cleaner approach: (i = 0; i < length) (j = i + 1; j < length)
				for (let i = 0; i < group.teams.length - 1; i++) {
					for (let j = i; j < group.teams.length - 1; j++) {
						match = // TODO use null for unset values (sh, sa, round)
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

						for (let rm = 0; rm < matches.length; rm++) { // TODO more efficient match grouping
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
		// TODO output to console or html in a human-readable format, as in the excel printable tab
	});
});




