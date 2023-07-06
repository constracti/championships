let result=null


function deepCopyObj(obj) {//for deep copy without recursion (because js had enough of it...)
	var copiedArr = [];
	for (var i = 0; i < obj.length; i++) {
		var original = obj[i];
		var copied = {};
		for (var property in original) {
			if (original.hasOwnProperty(property)) {
				var value = original[property];
				if (Array.isArray(value)) {
					copied[property] = value.map(function (item) {
						return Object.assign({}, item);
					});
				}
				else if (typeof value === 'object' && value !== null) {//date not included exactly (nothing changes)
					copied[property] = Object.assign({}, value);
				}
				else {
					copied[property] = value;
				}
			}
		}
		copiedArr.push(copied);
	}
	return copiedArr;
}


//Here is the scheduling for default structure. It is a recursive function that every time a match is placed in a slot, it calls itself after it pops the match, to schedule the next one until all matches are placed in a slot.
function ScheduleMatchesDefault(matches,rounds){
	if (matches.length === 0){
		return rounds;
	}
	else{
		//console.log(matches,slots,rounds);
		
		matches.sort((a, b) => b.points - a.points);
		crts = Object.fromEntries(
			Object.entries(crts).sort(([, a], [, b]) => b - a)
		);
		console.log(matches.length);
		//debugger;
		for (let r = 0; r < rounds.length; r++){//for every round
			for (let s of Object.keys(crts)){//for every slot (name of court sorted by need) in this round
				for (let m = 0; m < matches.length; m++){
					//RULES
					//if this slot is available and the court corresponds to the sport of the match and its not a knockout (1)
					//console.log(r,rounds[r].slots[s],matches[m].id,matches[m].team_home.name,matches[m].team_away.name,matches[m].points,rounds[r].date,rounds[r].rank,rounds[r].zone);
					if (rounds[r].slots[s].match === null && matches[m].sport.courts.includes(rounds[r].slots[s].court) && typeof (matches[m].team_home.name) !== 'undefined' && typeof (matches[m].team_away.name) !== 'undefined'){
						let team1 = matches[m].team_home.name;
						let team2 = matches[m].team_away.name;
						let scheduled = false;
						
						let used_slots=0;
						for (let sl=0; sl < Object.keys(rounds[r].slots).length; sl++){
							if (Object.values(rounds[r].slots)[sl].match !== null){
								used_slots+=1;
							}
						}
						
						//If in this specific date, in a specific zone and rank a team is scheduled to play something else (2)
						for (let sl=0; sl < Object.keys(rounds[r].slots).length; sl++){//for every slot in this round
							if (Object.values(rounds[r].slots)[sl].match !== null){//if this slot has an active match

									if (Object.values(rounds[r].slots)[sl].match.team_home.name === team1 || Object.values(rounds[r].slots)[sl].match.team_away.name === team1 || Object.values(rounds[r].slots)[sl].match.team_home.name === team2 || Object.values(rounds[r].slots)[sl].match.team_away.name === team2){
										scheduled = true;
										break;
									}
									if (used_slots * 2 >= teams.length - 1){ //only 1 or 0 teams available = cannot produce a match in that round
										scheduled = true;
										break;
									}
							}
						}
						too_late=false;
						for (let date=s; date>=0; date--){
							if (slots[date].match !== null){
								if (typeof (slots[date].match.team_home.name) === 'undefined' && typeof (slots[date].match.team_away.name) === 'undefined'){
									too_late = true;//we want group games earlier than already placed knockout games
									break;
								}
							}
						}
						
						
						//rules for sorting the matches
						//console.log('s',scheduled,'tl' ,too_late);
						if (!scheduled && !too_late){
							for (let ma=0; ma<matches.length; ma++){
								if (matches[m].points<0){
									matches[ma].points=0;
								}		
							}
							//console.log('allagi');
							for (let rnd=r; rnd>r-rounds[r].count; rnd--){
								if (rnd<0 || r === 0){
									break;
								}
								for (let sl of Object.keys(crts)){
									//console.log(rnd,sl);
									if (rounds[rnd].slots[sl].match !== null){
										if (typeof rounds[rnd].slots[sl].match.team_home.name !== 'undefined' && rounds[rnd].slots[sl].match.team_away.name !== 'undefined'){
											//console.log(team1,team2,rounds[rnd].slots[sl].match.team_home.name,rounds[rnd].slots[sl].match.team_away.name);
											if ((team1 === rounds[rnd].slots[sl].match.team_home.name || team2 === rounds[rnd].slots[sl].match.team_home.name) && (team1 === rounds[rnd].slots[sl].match.team_away.name || team2 === rounds[rnd].slots[sl].match.team_away.name)){
												
												if (matches[m].sport.name === rounds[rnd].slots[sl].match.sport.name){
													matches[m].points-=5;//we do not want the same pair of teams to play the same sport again next round if possible.
													
												}
												else{
													matches[m].points-=3;//we do not want the same pair of teams to another sport again next round if possible.
												}
											}
											else if(team1 === rounds[rnd].slots[sl].match.team_home.name || team2 === rounds[rnd].slots[sl].match.team_home.name || team1 === rounds[rnd].slots[sl].match.team_away.name || team2 === rounds[rnd].slots[sl].match.team_away.name){
												if (matches[m].sport.name === rounds[rnd].slots[sl].match.sport.name && rounds[r].slots[s].court === rounds[rnd].slots[sl].court && matches[m].sport.courts.length > 1){
													matches[m].points-=2;//we do not want a team to play the same sport in the same court (if sport.courts > 1) again next round if possible.
												}
												else if (matches[m].sport.name === rounds[rnd].slots[sl].match.sport.name){
													matches[m].points-=1;//we do not want a team to play the same sport again next round if possible.
												}
											}
											if (matches[m].sport.name === rounds[rnd].slots[sl].match.sport.name){
												matches[m].points-=0.5;//we want all sports to be played simultaneously by a team.
											}
											else{
												matches[m].points+=0.5;
											}
										}
									}
								}
							}
						}


						let threshold=-0.5;
						if (matches[m].points >= threshold && scheduled === false){
							for (let ma=0; ma<matches.length; ma++){
								if (typeof matches[ma].team_home.name !== 'undefined' && matches[ma].team_away.name !== 'undefined'){
									if ((matches[ma].team_home.name !== team1 && matches[ma].team_home.name !== team2) || (matches[ma].team_away.name !== team1 && matches[ma].team_away.name !== team2)){
										matches[ma].points+=0.5;//this team must be placed higher because they did not play this round
									}
									if (matches[ma].team_home.name === team1 || matches[ma].team_home.name === team2 || matches[ma].team_away.name === team1 || matches[ma].team_away.name === team2){
										matches[ma].points-=1;//this team must be placed lower because they played this round
									}
								}
							}
							//prototype rules for sorting the courts. TODOS: 1. some courts in the same sport are more valuable, 2. some courts do not have many matches in them making them less valuable.
							for (let c of Object.keys(crts)){
								if (!matches[m].sport.courts.includes(c)){
									crts[c]+=1;//all sports must be played simultaneously, so the sports that did not used in this round are more valuable for next round.
								}
							}

							
							
							let newrounds=deepCopy(rounds);
							newrounds[r].slots[s].match=matches[m];
							let newMatches = matches.filter((element) => element !== matches[m]);
							
							
							
							result=ScheduleMatchesDefault(newMatches,newrounds);

							if (result){
								return result;
							}
								
						}
					}
					else if (rounds[r].slots[s].match === null && matches[m].sport.courts.includes(rounds[r].slots[s].court) && typeof (matches[m].team_home.name) === 'undefined' && typeof (matches[m].team_away.name) === 'undefined'){
						let scheduled_k = false;
						if (matches[m].team_home.type === 'group' || matches[m].team_away.type === 'group'){
							let group_finished = true;
							
							for (let mg=0; mg<matches.length; mg++){
								if (typeof (matches[mg].team_home.name) !== 'undefined' && typeof (matches[mg].team_away.name) !== 'undefined' ){//if one of the groups is not finished yet
									group_finished = false;
									break;
								}
							}
							//console.log('gf',group_finished);
							if (group_finished){
								let too_early = false;
								let too_late = false;
								for (let rdate = r; rdate < rounds.length; rdate++){
									for (let sdate of Object.keys(rounds[rdate].slots)){
										if (rounds[rdate].slots[sdate].match !== null){
											if (typeof (rounds[rdate].slots[sdate].match.team_home.name) !== 'undefined' && typeof (rounds[rdate].slots[sdate].match.team_away.name) !== 'undefined'){
												too_early = true;
												break;
											}	
										}
									}
								}
								for (let rdate = r; rdate >= 0; rdate--){
									for (let sdate of Object.keys(rounds[rdate].slots)){
										if (rounds[rdate].slots[sdate].match !== null){
											if (rounds[rdate].slots[sdate].match.team_home.type === 'knockout' || rounds[rdate].slots[sdate].match.team_away.type === 'knockout'){
												too_late = true;//this is a group type kn game indicating that is less special than a knockout type kn game, thus it must be placed earlier
												//console.log(slots[date].match.id);
												break;
											}
										}
									}
								}
								//console.log('te', too_early,'tl', too_late);
								if (!too_early && !too_late){
									let team1_k='not defined';
									let team2_k='not defined';
									if (matches[m].team_home.type === 'fixed'){
										team1_k=matches[m].team_home.team.name;
									}
									if (matches[m].team_away.type === 'fixed'){
										team2_k=matches[m].team_away.team.name;
									}
									
									let used_slots=0;
									for (let sl=0; sl < Object.keys(rounds[r].slots).length; sl++){
										if (Object.values(rounds[r].slots)[sl].match !== null){
											used_slots+=1;
										}
									}
									for (let sl=0; sl < Object.keys(rounds[r].slots).length; sl++){//for every slot in this round
										if (Object.values(rounds[r].slots)[sl].match !== null){//if this slot has an active match
											if (Object.values(rounds[r].slots)[sl].match.team_home.name === team1_k || Object.values(rounds[r].slots)[sl].match.team_away.name === team1_k || Object.values(rounds[r].slots)[sl].match.team_home.name === team2_k || Object.values(rounds[r].slots)[sl].match.team_away.name === team2_k){
												scheduled_k = true;
												break;
											}
										}
										if (used_slots * 2 >= teams.length - 1){ //only 1 or 0 teams available = cannot produce a match in that round
											scheduled_k = true;
											break;
										}
									}
									//console.log('sk',scheduled_k);
									if (!scheduled_k){
										let newrounds=deepCopy(rounds);
										newrounds[r].slots[s].match=matches[m];
										let newMatches = matches.filter((element) => element !== matches[m]);
										result=ScheduleMatchesDefault(newMatches,newrounds);
			
										if (result)
										{
											return result;
										}
											
									}
								}
							}
						}
						else if (matches[m].team_home.type === 'knockout' && matches[m].team_away.type === 'knockout'){
							
							let knockout_finished = true;
							
							for (let mg=0; mg<matches.length; mg++){
								if (typeof (matches[mg].team_home.name) === 'undefined' && typeof (matches[mg].team_away.name) === 'undefined' ){//if one of this knockout games is not finished yet
									if (matches[mg].id === matches[m].team_home.knockout.id || matches[mg].id === matches[m].team_away.knockout.id){
										knockout_finished = false;
										break;
									}
									if (matches[m].team_home.is_winner === true || matches[m].team_away.is_winner === true){
										if (matches[mg].team_home.is_winner === false || matches[mg].team_away.is_winner === false){
											if (matches[mg].team_home.knockout.id === matches[m].team_home.knockout.id || matches[mg].team_home.knockout.id === matches[m].team_away.knockout.id){
												knockout_finished = false;//losers games must be placed before winners games are placed
												break;
											}
										}
									}
								}
								else if (typeof (matches[mg].team_home.name) !== 'undefined' && typeof (matches[mg].team_away.name) !== 'undefined' ){//if one of the groups is not finished yet
									knockout_finished = false;
									break;
								}
							}
							//console.log('kf', knockout_finished);
							if (knockout_finished){
								let too_early = false;
								for (let rdate = r; rdate < rounds.length; rdate++){
									for (let sdate of Object.keys(rounds[rdate].slots)){
										if (rounds[rdate].slots[sdate].match !== null && typeof (rounds[rdate].slots[sdate].match.team_home.name) === 'undefined' && typeof (rounds[rdate].slots[sdate].match.team_away.name) === 'undefined'){
											if (rounds[rdate].slots[sdate].match.id === matches[m].team_home.knockout.id || rounds[rdate].slots[sdate].match.id === matches[m].team_away.knockout.id){
												too_early = true;
												break;
											}
											if (matches[m].team_home.is_winner === true || matches[m].team_away.is_winner === true){
												if ((rounds[rdate].slots[sdate].match.team_home.is_winner === false && rounds[rdate].slots[sdate].match.team_home.knockout.id === matches[m].team_home.knockout.id) || (rounds[rdate].slots[sdate].match.team_away.is_winner === false && rounds[rdate].slots[sdate].match.team_away.knockout.id === matches[m].team_away.knockout.id)){
													too_early = true;//losers games if placed already must be earlier than winners games (3rd place game - final)
													break;
												}
											}
											if (rounds[rdate].slots[sdate].match.team_home.type === 'group' || rounds[rdate].slots[sdate].match.team_away.type === 'group'){
												too_early = true;//this is a knockout type kn game indicating that is more special than a group type kn game, thus it must be placed later
												break;
											}
										}
										else if (rounds[rdate].slots[sdate].match !== null){
											if (typeof (rounds[rdate].slots[sdate].match.team_home.name) !== 'undefined' && typeof (rounds[rdate].slots[sdate].match.team_away.name) !== 'undefined'){
												too_early = true;//we want knockouts later than already placed group games
												break;
											}
										}
									}
								}
								//console.log('te',too_early);
								if (!too_early){
									let team1_k='not defined';
									let team2_k='not defined';
									if (matches[m].team_home.type === 'fixed'){
										team1_k=matches[m].team_home.team.name;
									}
									if (matches[m].team_away.type === 'fixed'){
										team2_k=matches[m].team_away.team.name;
									}
								
									let used_slots=0;
									for (let sl=0; sl < Object.keys(rounds[r].slots).length; sl++){
										if (Object.values(rounds[r].slots)[sl].match !== null){
											used_slots+=1;
										}
									}
									for (let sl=0; sl < Object.keys(rounds[r].slots).length; sl++){//for every slot in this round
										if (Object.values(rounds[r].slots)[sl].match !== null){//if this slot has an active match
											if (Object.values(rounds[r].slots)[sl].match.team_home.name === team1_k || Object.values(rounds[r].slots)[sl].match.team_away.name === team1_k || Object.values(rounds[r].slots)[sl].match.team_home.name === team2_k || Object.values(rounds[r].slots)[sl].match.team_away.name === team2_k){
												scheduled_k = true;
												break;
											}
										}
										if (used_slots * 2 >= teams.length - 1){ //only 1 or 0 teams available = cannot produce a match in that round
											scheduled_k = true;
											break;
										}
									}
									//console.log('sk',scheduled_k);
									if (!scheduled_k){
										let newrounds=deepCopy(rounds);
										
										newrounds[r].slots[s].match=matches[m];
										let newMatches = matches.filter((element) => element !== matches[m]);
										result=ScheduleMatchesDefault(newMatches,newrounds);
			
										if (result)
										{
											return result;
										}
											
									}
								}
							}
						}
					}
				}
			}
		}
	}
}