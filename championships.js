let matches = [];
let crts = {};

function deepCopy(obj){//simple deepCopy recursive function
	if (typeof obj !== 'object' || obj === null){
		return obj;
	}
	if (obj instanceof Date){
		return new Date(obj);
	}
	let copy;
	if (Array.isArray(obj)){
		copy = [];
		for (let i = 0; i < obj.length; i++){
			copy[i] = deepCopy(obj[i]);
		}
	}
	else {
		copy = {};
		for (let key in obj){
			if (obj.hasOwnProperty(key)){
				copy[key] = deepCopy(obj[key]);
			}
		}
	}
	return copy;
}


function pair_teams(remaining_games,group,matches){
	if (Object.values(remaining_games).every(value => value === 0)){
		return matches;
	}
	else {
		//debugger;
		for (let i=0; i<group.teams.length; i++){
			let gr_teams=[...group.teams];
			while(gr_teams.length>0 && !Object.values(remaining_games).every(value => value === 0)){
				randomj = Math.floor(Math.random() * gr_teams.length);
				let ta=gr_teams[randomj];
				let th=group.teams[i];
				if (remaining_games[ta.name] > 0 && remaining_games[th.name] > 0){
					let scheduled = false;
					matches.forEach(m => {
						if ((th.name === m.team_home.name || ta.name === m.team_home.name) && (th.name === m.team_away.name || ta.name === m.team_away.name) && (group.sport.name === m.sport.name)){
							scheduled = true;
						}
					});

					if (!scheduled && th.name!==ta.name){

						let newMatches=deepCopy(matches);
						newMatches.push({
							id: group.id,
							sport: group.sport,
							team_home: th,
							team_away: ta,
							score_home: null,
							score_away: null,
							points: 0,
						});
						let new_rem = {...remaining_games};
						new_rem[th.name]-=1;
						new_rem[ta.name]-=1;
						console.log('hi');
						result=pair_teams(new_rem,group,newMatches);
						if (result){
							return result;
						}
					}
				}
				gr_teams = gr_teams.filter((element) => element.name !== ta.name);
			}
		}
	}
}


function produce() {

	// produce courts {}

	courts.forEach(court => {
		crts[court] = 0;
	});

	// produce slots
	const slots = [];
	rounds.forEach(round => {
		courts.forEach(court => {
			const slot = {
				//round: round,//this may not be needed (recursive reasons)
				court: court,
				match: null,
			};
			round.slots[court] = slot;
			slots.push(slot);
		});
	});

	console.log('slots: ' + slots.length);
	console.log(rounds);
	console.log(slots);
	

	
	
	//produce matches from groups
	Object.values(groups).forEach(gr => {
		let total_matches = (gr.team_matches * gr.teams.length)/2;
		if (total_matches % ((gr.teams.length * (gr.teams.length - 1)) / 2) === 0){ //if the teams play against each other x times exactly. 
			for (let i = 0; i < gr.team_matches/(gr.teams.length-1); i++){
				gr.teams.forEach(th => {
					gr.teams.forEach(ta => {
						if (th.id >= ta.id)
							return;
						matches.push({
							id: gr.id,
							sport: gr.sport,
							//slot: null, finally no need for this!
							team_home: th,
							team_away: ta,
							score_home: null,
							score_away: null,
							points: 0,
						});
					});
				});
			}
		}
		else{//if teams do not play all games against each other but only specific amount of them in a group < all the possible games against all teams once.
			try{
				if (gr.team_matches * gr.teams.length % 2 === 0){
					let remaining_games = {};
					gr.teams.forEach(t => {
						remaining_games[t.name] = gr.team_matches;
						console.log(remaining_games,gr);
					});
					matches=pair_teams(remaining_games,gr,matches);
				}
				else{
					throw new Error(`cannot produce this number of games per team for this number of teams`);
				}
			}
			catch(error){
				error.alert(); 
			}
		}
	});

	//produce matches from knockouts
	Object.values(knockouts).forEach(kn => {
		matches.push({
			id: kn.id,
			sport: kn.sport,
			team_home: kn.home,
			team_away: kn.away,
			score_home: null,
			score_away: null,
			points: 0,
		});
	});
	


	console.log('matches: ' + matches.length);

	// TODO adapt scheduler and displayer to new data types -> Done.

	// TODO scheduler should accept only two arguments: slots and matches -> Done. i need rounds instead of slots
	let program=ScheduleMatchesDefault(matches, rounds);
	console.log(program);

	// TODO display as table
	// TODO displayer should accept only three arguments: courts and slots - the first one is provided just for ordering purposes -> Done, no need for courts.
	try{
		if (program)
		Displayer(program);
		else{
			throw new Error(`cannot produce the program with those parameters`);
		}
	}
	catch(error){
		error.alert(); 
	}
}