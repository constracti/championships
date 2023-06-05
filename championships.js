const matches = [];

function produce() {

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

	
	
	//produce matches from groups
	Object.values(groups).forEach(gr => {
		gr.teams.forEach(th => {
			gr.teams.forEach(ta => {
				if (th.id >= ta.id)
					return;
				matches.push({
					sport: gr.sport,
					slot: null,
					team_home: th,
					team_away: ta,
					score_home: null,
					score_away: null,
					src: "group",
					arg: gr,
				});
			});
		});
		if (gr.has_revanche) {
			gr.teams.forEach(th => {
				gr.teams.forEach(ta => {
					if (th.id >= ta.id)
						return;
					matches.push({
						sport: gr.sport,
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
			arg: home_src,
		});
	});
	


	console.log('matches: ' + matches.length);

	// TODO adapt scheduler and displayer to new data types

	// TODO scheduler should accept only two arguments: slots and matches
	ScheduleMatchesDefault(matches, rounds, slots, sports);

	// TODO display as table
	// TODO displayer should accept only three arguments: courts and slots - the first one is provided just for ordering purposes
	Displayer(matches, rounds, slots, sports);

}