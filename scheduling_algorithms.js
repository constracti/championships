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
function ScheduleMatchesDefault(matches,rounds,slots){
	if (matches.length === 0){
		return slots;
	}
	else{		
		for (let r = 0; r < rounds.length; r++){//for every round
			for (let s=r*Object.keys(rounds[r].slots).length; s < r*Object.keys(rounds[r].slots).length + Object.keys(rounds[r].slots).length; s++){//for every slot in this round
				for (let m = 0; m < matches.length; m++){
					//RULES
					//if this slot is available and the court corresponds to the sport of the match and its not a knockout (1)
					if (slots[s].match === null && matches[m].sport.courts.includes(slots[s].court) && typeof (matches[m].team_home.name) !== 'undefined' && typeof (matches[m].team_away.name) !== 'undefined'){
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

						
						//prototype of rules for sorting the matches (TODO points in courts, for not always selecting first football)
						if (!scheduled){
							for (let ma=0; ma<matches.length; ma++){
								if (matches[m].points<0){
									matches[ma].points=0;
								}		
							}
							for (let sl=(r-r%rounds[r].count) * Object.keys(rounds[r].slots).length; sl < r*Object.keys(rounds[r].slots).length + rounds[r].count * Object.keys(rounds[r].slots).length; sl++){ //for every slot in a zone.
								if (sl>127){
									break;
								}
								if (slots[sl].match !== null){
									if (typeof slots[sl].match.team_home.name !== 'undefined' && slots[sl].match.team_away.name !== 'undefined'){
										if ((team1 === slots[sl].match.team_home.name || team2 === slots[sl].match.team_home.name) && (team1 === slots[sl].match.team_away.name || team2 === slots[sl].match.team_away.name)){
											if (matches[m].sport.name === slots[sl].match.sport.name){
												matches[m].points-=5;//we do not want the same pair of teams to play the same sport again next round if possible.
												
											}
											else{
												matches[m].points-=3;//we do not want the same pair of teams to another sport again next round if possible.
											}
										}
										else if(team1 === slots[sl].match.team_home.name || team2 === slots[sl].match.team_home.name || team1 === slots[sl].match.team_away.name || team2 === slots[sl].match.team_away.name){
											if (matches[m].sport.name === slots[sl].match.sport.name && slots[s].court === slots[sl].court && matches[m].sport.courts.length > 1){
												matches[m].points-=2;//we do not want a team to play the same sport in the same court (if sport.courts > 1) again next round if possible.
											}
											else if (matches[m].sport.name === slots[sl].match.sport.name){
												matches[m].points-=1;//we do not want a team to play the same sport again next round if possible.
											}
										}
									}
								}
							}
						}


						let threshold=0;

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
								
							let newslots=deepCopyObj(slots);
							let newrounds=deepCopyObj(rounds);
							newslots[s].match = matches[m];
							matches[m].slot=newslots[s];
							newrounds[r].slots[Object.keys(newrounds[r].slots)[s%Object.keys(newrounds[r].slots).length]].match=matches[m];
							let newMatches = matches.filter((element) => element !== matches[m]);
							
							
							newMatches.sort((a, b) => b.points - a.points);
							result=ScheduleMatchesDefault(newMatches,newrounds,newslots);

							if (result){
								return result;
							}
								
						}
					}
					else if (slots[s].match === null && matches[m].sport.courts.includes(slots[s].court) && typeof (matches[m].team_home.name) === 'undefined' && typeof (matches[m].team_away.name) === 'undefined'){
						let scheduled_k = false;
						if (matches[m].team_home.type === 'group' || matches[m].team_away.type === 'group'){
							let group_finished = true;
							
							for (let mg=0; mg<matches.length; mg++){
								if (matches[mg].sport.name === matches[m].sport.name && typeof (matches[mg].team_home.name) !== 'undefined' && typeof (matches[mg].team_away.name) !== 'undefined' && matches[mg].slot === null ){//if one of this sport group is not finished yet
									group_finished = false;
									break;
								}
							}
							if (group_finished){
								let too_early = false;
								for (let date=s; date<slots.length; date++){
									if (slots[date].match !== null){
										if (slots[date].match.sport.name === matches[m].sport.name){
											too_early = true;
											break;
										}	
									}
								}
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
			
									if (!scheduled_k){
										let newslots=deepCopyObj(slots);
										let newrounds=deepCopyObj(rounds);
										newslots[s].match = matches[m];
										matches[m].slot=newslots[s];
										newrounds[r].slots[Object.keys(newrounds[r].slots)[s%Object.keys(newrounds[r].slots).length]].match=matches[m];
										let newMatches = matches.filter((element) => element !== matches[m]);
										result=ScheduleMatchesDefault(newMatches,newrounds,newslots);
			
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
								if (typeof (matches[mg].team_home.name) === 'undefined' && typeof (matches[mg].team_away.name) === 'undefined' && matches[mg].slot === null ){//if one of this knockout games is not finished yet
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
							}
							if (knockout_finished){
								let too_early = false;
								for (let date=s; date<slots.length; date++){
									if (slots[date].match !== null && typeof (slots[date].match.team_home.name) === 'undefined' && typeof (slots[date].match.team_away.name) === 'undefined'){
										if (slots[date].match.id === matches[m].team_home.knockout.id || slots[date].match.id === matches[m].team_away.knockout.id){
											too_early = true;
											break;
										}
										if (matches[m].team_home.is_winner === true || matches[m].team_away.is_winner === true){
											if ((slots[date].match.team_home.is_winner === false && slots[date].match.team_home.knockout.id === matches[m].team_home.knockout.id) || (slots[date].match.team_away.is_winner === false && slots[date].match.team_away.knockout.id === matches[m].team_away.knockout.id)){
												too_early = true;//losers games if placed already must be earlier than winners games (3rd place game - final)
												break;
											}
										}
									}
								}
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
			
									if (!scheduled_k){
										let newslots=deepCopyObj(slots);
										let newrounds=deepCopyObj(rounds);
										newslots[s].match = matches[m];
										matches[m].slot=newslots[s];
										newrounds[r].slots[Object.keys(newrounds[r].slots)[s%Object.keys(newrounds[r].slots).length]].match=matches[m];
										let newMatches = matches.filter((element) => element !== matches[m]);
										result=ScheduleMatchesDefault(newMatches,newrounds,newslots);
			
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