import * as scheduler from './scheduling_algorithms.js';
document.addEventListener('DOMContentLoaded', function ()
{
	
	
	console.log('ready');

	const form = document.forms[0];

	const form_teams = form.teams;
	// example input value for testing
	form_teams.value =
		[
			'Φωτοδότες',
			'Αγωνιστές',
			'Τροπαιοφόροι',
			'Πρόμαχοι',
		].join('\n');

	const form_sports = form.sports;
	// example input value for testing
	form_sports.value =
		[
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
	form_zones.value =
		[
			'Πρωινή',
			'Απογευματινή',
		].join('\n');

	const form_rounds = form['rounds'];
	// example input value for testing
	form_rounds.value = 2;

	const points_fn_obj =
	{
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
	let slots = [];


	// TODO even initializations should be done on the submit event; they are part of the algorith

	const init_start_date = new Date(form_date_start.value);
	const init_end_date = new Date(form_date_stop.value);

	let difference = (init_end_date.getTime() - init_start_date.getTime()) / (1000 * 60 * 60 * 24);

	form.addEventListener('submit', function (event)
	{
		console.log('submit');
		event.preventDefault();

		// TODO run algorith here -> Done.

		teams = form_teams.value.split('\n').map(name => name.trim()).filter(name => name.length).map(function (name, id)
		{
			return {
				id: id,
				name: name,
			};
		});
		console.log('teams:\n' + teams.map(team => `${team.id}: ${team.name}`).join('\n'));
		//teams.forEach(team => console.log(`${team.id}: ${team.name}`));

		sports = form_sports.value.split('\n').map(name => name.trim().toLowerCase()).filter(name => name.length).map(function (name, id)
		{
			return {
				id: id,
				name: name,
				points_fn: points_fn_obj[name],
			};
		});
		console.log('sports:\n' + sports.map(sport => `${sport.id}: ${sport.name}`).join('\n'));

		// TODO try to code in a functional programming style as in teams and sports -> Done?

		zones = form_zones.value.split('\n').map(zone => zone.trim()).filter(zone => zone.length).map(function (zone, index)
		{
			return {
				rank: index,
				name: zone,
			};
		});
		for (let d = 0; d <= difference; d++)
		{
			for (let i = 0; i < zones.length; i++)
			{
				for (let j = 0; j < form_rounds.value; j++)
				{
					let round =
					{
						rank: 0,
						date: new Date(init_start_date.getFullYear(), init_start_date.getMonth(), init_start_date.getDate() + d).toDateString(), // TODO see comments @ https://stackoverflow.com/a/34324394/6884847
						zone: zones[i], // IDEA you may reference the object; it's just a pointer! -> Done.
					};
					rounds.push(round);
				}
			}
		}
		for (let i = 0; i < rounds.length; i++)
		{
			rounds[i]['rank'] = i;
			
			for (let k = 0; k < sports.length; k++)
			{
				let slot =
				{
					sport: sports[k],
					round: rounds[i],
					available: true,
					match: null,
				};
				slots.push(slot);
			}
			
			for (let k = 0; k < sports.length; k++)
			{
				rounds[i][sports[k].name]=[];
				for (let j = 0; j < slots.length; j++)
				{
					if (slots[j].sport.name === sports[k].name && slots[j].round.rank===i)
					{
						rounds[i][sports[k].name].push(slots[j]);
					}	
				}
			}
		}


		if (form_grstructure.value === 'default')//all teams in one group 
		{
			for (let k = 0; k < sports.length; k++)
			{
				let group =
				{
					sport: sports[k],
					teams: teams,
					structure: 'default',
				};
				groups.push(group)
				// TODO cleaner approach: (i = 0; i < length) (j = i + 1; j < length)
				for (let i = 0; i < group.teams.length - 1; i++)
				{
					for (let j = i; j < group.teams.length - 1; j++)
					{
						let match = // TODO use null for unset values (sh, sa, round) -> Done.
						{
							th: group.teams[i],
							ta: group.teams[j + 1],
							sh: null,
							sa: null,
							//slot: null,
							sport: null, //xD
						};
						matches.push(match);
					}
				}

			}

			scheduler.ScheduleMatchesDefault(matches,rounds,slots,sports);
		}
		for (let m = 0; m < matches.length; m++) 
		{//not finished
			if (matches[m].round === -1) 
			{
				alert('No solution found, try to decrease the number of teams or extend the period of the schedule.\
					\n\nKeep in mind that for the time being the scheduling algorithm is nowhere near its final state and cannot find a good solution.');
				break;
			}
		}
		// TODO output to console or html in a human-readable format, as in the excel printable tab
		console.table(matches);
		console.table(groups);
		console.table(slots);
	});
});




