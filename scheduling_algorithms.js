// TODO cptlagou prevent deadlock

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
function ScheduleMatchesDefault(matches,days){
	let arr=[];
	round_counting=0;
	let incomplete=0;
	if (matches.length === 0){
		for (let d = 0; d < days.length; d++){//for every day
			for (let dz = 0; dz< days[d].dzones.length; dz++){//for every zone of the day
				arr=[...config.teams];
				for (let r = 0; r < days[d].dzones[dz].rounds.length; r++){//for every round of that zone of that day
					round_counting+=1;
					for(let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){
						if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match!==null){
							if (typeof (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name)!== 'undefined' && typeof (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name)!== 'undefined'){
								if (!arr.includes(Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name)){
									arr=arr.filter(team => team !== (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name));
								}//for all the teams playing in a round
								if (!arr.includes(Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name)){
									arr=arr.filter(team => team !== (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name));
								}
							}	
						}	
					}
				}
				if (arr.length!=0){
					incomplete+=1;
				}
			}
		}
		if (incomplete<=round_counting-9){
			return days;
		}
		else{
			console.log('incomplete',incomplete);
			return false;
		}
		
	}
	else{
		
		matches.sort((a, b) => b.points - a.points);
		crts = Object.fromEntries(
			Object.entries(crts).sort(([, a], [, b]) => b - a)
		);
		console.log(matches.length);
		//debugger;
		//console.log(days)
		for (let d = 0; d < days.length; d++){//for every day
			for (let dz = 0; dz< days[d].dzones.length; dz++){//for every zone of the day
				for (let r = 0; r < days[d].dzones[dz].rounds.length; r++){//for every round of that zone of that day
					for (let s of Object.keys(crts)){//for every slot (name of court sorted by need) in this round
						for (let m = 0; m < matches.length; m++){
							//RULES
							//if this slot is available and the court corresponds to the sport of the match and its not a knockout (1)
							//console.log(d,days[d].dzones[dz].rounds[r].slots[s],matches[m].id,matches[m].team_home.name,matches[m].team_away.name,matches[m].points,matches[m].sequence,days[d].date,days[d].dzones[dz].rounds[r].rank,days[d].dzones[dz].rounds[r].zone);
							
							if (days[d].dzones[dz].rounds[r].slots[s].match === null && matches[m].sport.courts.includes(days[d].dzones[dz].rounds[r].slots[s].court) && typeof (matches[m].team_home.name) !== 'undefined' && typeof (matches[m].team_away.name) !== 'undefined'){
								//console.log(matches[m].id,matches[m].team_home.name,matches[m].team_away.name,matches[m].points,matches[m].sequence,'GROUP GAME')
								let team1 = matches[m].team_home.name;
								let team2 = matches[m].team_away.name;
								let scheduled = false;
								
								let used_slots=0;
								for (let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){
									if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match !== null){
										used_slots+=1;
									}
								}
								
								//If in this specific date, in a specific zone and rank a team is scheduled to play something else (2)
								for (let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){//for every slot in this round
									if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match !== null){//if this slot has an active match

											if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name === team1 || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name === team1 || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name === team2 || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name === team2){
												scheduled = true;
												break;
											}
											if (used_slots * 2 >= config.teams.length - 1){ //only 1 or 0 teams available = cannot produce a match in that round
												scheduled = true;
												break;
											}
									}
								}
								if (days[d].dzones[dz].rounds.length<2 && matches[m].sport.name==="Μπέιζμπολ"){
									scheduled = true;
								}
								let too_late=false;
								/*for (let date=d; date>=0; date--){
									for (let dzl = 0; dzl< days[date].dzones.length; dzl++){//for every zone of the day
										for (let rl = 0; rl < days[date].dzones[dzl].rounds.length; rl++){//for every round of that zone of that day
											for (let st of Object.keys(crts)){//for every slot in this round
												if (days[date].dzones[dzl].rounds[rl].slots[st].match !== null){
													if (typeof (days[date].dzones[dzl].rounds[rl].slots[st].match.team_home.name) === 'undefined' && typeof (days[date].dzones[dzl].rounds[rl].slots[st].match.team_away.name) === 'undefined'){
														too_late = true;//we want group games earlier than already placed knockout games
														break;
													}
												}
											}
											if(too_late){
												break;
											}
										}
										if(too_late){
											break;
										}
									}
									if(too_late){
										break;
									}
								}*/
								let too_early=false;

								let gr_id=matches[m].id;
								for (let ma=0; ma<matches.length; ma++){
									if (matches[ma].id === gr_id){
										if (config.groups[gr_id].team_matches % (config.groups[gr_id].teams.length-1) === 0 &&  config.groups[gr_id].team_matches / (config.groups[gr_id].teams.length-1) !== 1){
											if (matches[m].sequence>matches[ma].sequence){
												too_early = true;//if there is at least a not placed match of previous phase
												//console.log('otinanai');
												break;
											}
										}
									}	
								}

								for (let rd = d; rd < days.length; rd++){//for every day
									let start_dz=0;
									let start_r=0;
									if (rd===d){
										start_dz=dz;
										start_r=r;
									}
									for (let rdz = start_dz; rdz< days[rd].dzones.length; rdz++){//for every zone of the day
										for (let rr = start_r; rr < days[rd].dzones[rdz].rounds.length; rr++){//for every round of that zone of that day
											for (let sdate of Object.keys(days[rd].dzones[rdz].rounds[rr].slots)){
												if (days[rd].dzones[rdz].rounds[rr].slots[sdate].match !== null){
													if (typeof (days[rd].dzones[rdz].rounds[rr].slots[sdate].match.team_home.name) !== 'undefined' && typeof (days[rd].dzones[rdz].rounds[rr].slots[sdate].match.team_away.name) !== 'undefined'){
														if (days[rd].dzones[rdz].rounds[rr].slots[sdate].match.id === gr_id){
															if (config.groups[gr_id].team_matches % (config.groups[gr_id].teams.length-1) === 0 &&  config.groups[gr_id].team_matches / (config.groups[gr_id].teams.length-1) !== 1){
																if (matches[m].sequence>days[rd].dzones[rdz].rounds[rr].slots[sdate].match.sequence){
																	too_early = true;//if all first phase matches of a group are placed but we are trying to place a 2nd phase game before all 1st phase games are finished
																	//console.log('προσπάθησα να βάλω το ματσ :',matches[m],'την μέρα',days[d],'αλλά υπάρχει το ματσ:',days[rd].dzones[rdz].rounds[rr].slots[sdate].match);
																	break;
																}
															}
														}
													}	
												}
											}
											if(too_early){
												break;
											}
										}
										if(too_early){
											break;
										}
									}
									if(too_early){
										break;
									}
								}


								
								
								
								//rules for sorting the matches
								//console.log('s',scheduled,'tl' ,too_late,'te',too_early,'GROUP GAME');
								if (!scheduled && !too_late && !too_early){
									for (let ma=0; ma<matches.length; ma++){//maybe this will be deleted
										if (matches[m].points<0){
											//matches[ma].points=0;
										}		
									}
									let prev_round=r-1
									let next_round=r+1
									if (prev_round>=0 && r !== 0){//for previous round
										for (let sl of Object.keys(crts)){
											if (days[d].dzones[dz].rounds[prev_round].slots[sl].match !== null){
												if (typeof days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_home.name !== 'undefined' && days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_away.name !== 'undefined'){
													if ((team1 === days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_home.name || team2 === days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_home.name) && (team1 === days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_away.name || team2 === days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_away.name)){
														
														if (matches[m].sport.name === days[d].dzones[dz].rounds[prev_round].slots[sl].match.sport.name){
															scheduled=true;
															//matches[m].points-=15;//we do not want the same pair of teams to play the same sport again next round if possible.
															//console.log('points-1 because same pair same sport');
															
														}
														else{
															scheduled=true;
															//matches[m].points-=12;//we do not want the same pair of teams to another sport again next round if possible.
															//console.log('points-1 because same pair another sport');
														}
													}
													else if(team1 === days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_home.name || team2 === days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_home.name || team1 === days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_away.name || team2 === days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_away.name){
														if (matches[m].sport.name === days[d].dzones[dz].rounds[prev_round].slots[sl].match.sport.name && days[d].dzones[dz].rounds[r].slots[s].court === days[d].dzones[dz].rounds[prev_round].slots[sl].court && matches[m].sport.courts.length > 1){
															scheduled=true;
															//matches[m].points-=11;//we do not want a team to play the same sport in the same court (if sport.courts > 1) again next round if possible.
															//console.log('points-1 because same court in same sport');
														}
														else if (matches[m].sport.name === days[d].dzones[dz].rounds[prev_round].slots[sl].match.sport.name){
															scheduled=true;
															//matches[m].points-=15;//we do not want a team to play the same sport again next round if possible.
															//console.log('points-10 because same sport');
														}
													}
													if (matches[m].sport.name === days[d].dzones[dz].rounds[prev_round].slots[sl].match.sport.name){
														//matches[m].points-=1;//we want all sports to be played simultaneously by a team.
														//console.log('points-1 in same sport games');
													}
													else{
														//matches[m].points+=0.5;//1/(sports.length-1);
														//console.log('points+0.5 in different sport games');
													}
												}
												if (days[d].dzones[dz].rounds[prev_round].slots[sl].match.sport.name=== "Μπέιζμπολ" || (matches[m].sport.name==="Μπέιζμπολ" && days[d].dzones[dz].rounds[prev_round].slots[sl].court.includes("Π Ποδόσφαιρο"))){
													if (days[d].dzones[dz].rounds[r].slots[s].court.includes("Π Ποδόσφαιρο")){
														scheduled=true;
													}	
												}
											}
										}
									}
									if (next_round<days[d].dzones[dz].rounds.length){//for next round
										for (let sl of Object.keys(crts)){
											if (days[d].dzones[dz].rounds[next_round].slots[sl].match !== null){
												if (typeof days[d].dzones[dz].rounds[next_round].slots[sl].match.team_home.name !== 'undefined' && days[d].dzones[dz].rounds[next_round].slots[sl].match.team_away.name !== 'undefined'){
													//console.log(team1,team2,days[d].dzones[dz].rounds[next_round].slots[sl].match.team_home.name,days[d].dzones[dz].rounds[next_round].slots[sl].match.team_away.name);
													if ((team1 === days[d].dzones[dz].rounds[next_round].slots[sl].match.team_home.name || team2 === days[d].dzones[dz].rounds[next_round].slots[sl].match.team_home.name) && (team1 === days[d].dzones[dz].rounds[next_round].slots[sl].match.team_away.name || team2 === days[d].dzones[dz].rounds[next_round].slots[sl].match.team_away.name)){
														
														if (matches[m].sport.name === days[d].dzones[dz].rounds[next_round].slots[sl].match.sport.name){
															scheduled=true;
															//matches[m].points-=15;//we do not want the same pair of teams to play the same sport again next round if possible.
															//console.log('points-1 because same pair same sport');
															
														}
														else{
															scheduled=true;
															//matches[m].points-=12;//we do not want the same pair of teams to another sport again next round if possible.
															//console.log('points-1 because same pair another sport');
														}
													}
													else if(team1 === days[d].dzones[dz].rounds[next_round].slots[sl].match.team_home.name || team2 === days[d].dzones[dz].rounds[next_round].slots[sl].match.team_home.name || team1 === days[d].dzones[dz].rounds[next_round].slots[sl].match.team_away.name || team2 === days[d].dzones[dz].rounds[next_round].slots[sl].match.team_away.name){
														if (matches[m].sport.name === days[d].dzones[dz].rounds[next_round].slots[sl].match.sport.name && days[d].dzones[dz].rounds[r].slots[s].court === days[d].dzones[dz].rounds[next_round].slots[sl].court && matches[m].sport.courts.length > 1){
															scheduled=true;
															//matches[m].points-=11;//we do not want a team to play the same sport in the same court (if sport.courts > 1) again next round if possible.
															//console.log('points-1 because same court in same sport');
														}
														else if (matches[m].sport.name === days[d].dzones[dz].rounds[next_round].slots[sl].match.sport.name){
															scheduled=true;
															//matches[m].points-=15;//we do not want a team to play the same sport again next round if possible.
															//console.log('points-10 because same sport');
														}
													}
													if (matches[m].sport.name === days[d].dzones[dz].rounds[next_round].slots[sl].match.sport.name){
														//matches[m].points-=1;//we want all sports to be played simultaneously by a team.
														//console.log('points-1 in same sport games');
													}
													else{
														//matches[m].points+=0.5;//1/(sports.length-1);
														//console.log('points+0.5 in different sport games');
													}
												}
												if (days[d].dzones[dz].rounds[next_round].slots[sl].match.sport.name=== "Μπέιζμπολ" || (matches[m].sport.name==="Μπέιζμπολ" && days[d].dzones[dz].rounds[next_round].slots[sl].court.includes("Π Ποδόσφαιρο"))){
													if (days[d].dzones[dz].rounds[r].slots[s].court.includes("Π Ποδόσφαιρο")){
														scheduled=true;
													}	
												}
											}
										}
									}
									for (let dz_whole = 0; dz_whole< days[d].dzones.length; dz_whole++){//for the whole day
										for (let r_whole = 0; r_whole < days[d].dzones[dz_whole].rounds.length; r_whole++){
											for (let sl of Object.keys(crts)){
												if (days[d].dzones[dz_whole].rounds[r_whole].slots[sl].match !== null){
													if (typeof days[d].dzones[dz_whole].rounds[r_whole].slots[sl].match.team_home.name !== 'undefined' && days[d].dzones[dz_whole].rounds[r_whole].slots[sl].match.team_away.name !== 'undefined'){
														if ((team1 === days[d].dzones[dz_whole].rounds[r_whole].slots[sl].match.team_home.name || team2 === days[d].dzones[dz_whole].rounds[r_whole].slots[sl].match.team_home.name) && (team1 === days[d].dzones[dz_whole].rounds[r_whole].slots[sl].match.team_away.name || team2 === days[d].dzones[dz_whole].rounds[r_whole].slots[sl].match.team_away.name)){
																
															if (matches[m].sport.name === days[d].dzones[dz_whole].rounds[r_whole].slots[sl].match.sport.name){
																scheduled=true;
																//matches[m].points-=14;//we do not want the same pair of teams to play the same sport again all day.
																//console.log('points-14 because same pair same sport same day');
																
															}
														}
													}
												}
											}
										}
									}
								}

								//console.log('Points right now: ',matches[m].points);
								let threshold=0;
								if (matches[m].points >= threshold && !scheduled && !too_late && !too_early){
									for (let ma=0; ma<matches.length; ma++){//above points optimized for input23g
										if (typeof matches[ma].team_home.name !== 'undefined' && matches[ma].team_away.name !== 'undefined'){
											if ((matches[ma].team_home.name !== team1 && matches[ma].team_home.name !== team2) || (matches[ma].team_away.name !== team1 && matches[ma].team_away.name !== team2)){
												matches[ma].points+=0.1;//this team must be placed higher because they did not play this round
												//console.log(matches[ma],'points+0.5 because they did not played');
											}
											if (matches[ma].team_home.name === team1 || matches[ma].team_home.name === team2 || matches[ma].team_away.name === team1 || matches[ma].team_away.name === team2){
												matches[ma].points-=3.5;//this team must be placed lower because they played this round
												//console.log(matches[ma],'points-1 because they played');
											}
										}
									}
									//prototype rules for sorting the courts. TODOS: 1. some courts in the same sport are more valuable, 2. some courts do not have many matches in them making them less valuable.
									for (let c of Object.keys(crts)){
										if (!matches[m].sport.courts.includes(c)){
											crts[c]+=1;//all sports must be played simultaneously, so the sports that did not used in this round are more valuable for next round.
											if (c.includes("Ποδόσφαιρο")){
												crts[c]+=50 //TODO this must be lower and for the courts that will host the more matches, now it is for testing purposes.
											}
										}
									}

									
									
									let newdays=deepCopy(days);
									newdays[d].dzones[dz].rounds[r].slots[s].match=matches[m];
									let newMatches = matches.filter((element) => element !== matches[m]);
									//console.log('Match: ',matches[m],' placed.',matches,crts);
									
									
									result=ScheduleMatchesDefault(newMatches,newdays);

									if (result){
										return result;
									}
										
								}
								else if (matches[m].points < threshold){
									matches[m].points=0;
									//console.log('reset points');
								}
							}
							else if (days[d].dzones[dz].rounds[r].slots[s].match === null && matches[m].sport.courts.includes(days[d].dzones[dz].rounds[r].slots[s].court) && typeof (matches[m].team_home.name) === 'undefined' && typeof (matches[m].team_away.name) === 'undefined'){
								//console.log(matches[m].id,matches[m].team_home.name,matches[m].team_away.name,matches[m].points,matches[m].sequence,'KN GAME')
								let scheduled_k = false;
								if (matches[m].team_home.type === 'group' || matches[m].team_away.type === 'group' || (matches[m].team_home.type === 'knockout' && matches[m].team_away.type === 'knockout' && matches[m].sport.name==="Μπέιζμπολ")){
									let group_finished = true;
									
									for (let mg=0; mg<matches.length; mg++){
										if (typeof (matches[mg].team_home.name) !== 'undefined' && typeof (matches[mg].team_away.name) !== 'undefined' && matches[mg].sport.name === matches[m].sport.name){//if one of the groups (same sport) is not finished yet
											group_finished = false;
											break;
										}
									}
									//console.log('gf',group_finished);
									if (group_finished){
										let too_early = false;
										let too_late = false;
										for (let ddate = d; ddate < days.length; ddate++){//for every day from d
											let start_dz=0;
											let start_r=0;
											if (ddate===d){
												start_dz=dz;
												start_r=r;
											}
											for (let ddz = start_dz; ddz< days[ddate].dzones.length; ddz++){//for every zone of the day
												for (let drr = start_r; drr < days[ddate].dzones[ddz].rounds.length; drr++){//for every round of that zone of that day
													for (let sdate of Object.keys(days[ddate].dzones[ddz].rounds[drr].slots)){
														if (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match !== null){
															if (typeof (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_home.name) !== 'undefined' && typeof (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_away.name) !== 'undefined' && days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.sport.name === matches[m].sport.name){
																too_early = true;//if there is a group game from the same sport after the match we want to place that means that we are too early to place it
																break;
															}	
														}
													}
													if(too_early){
														break;
													}
												}
												if(too_early){
													break;
												}
											}
											if(too_early){
												break;
											}
										}
										for (let ddate = d; ddate >= 0; ddate--){//for every previous day from d
											let max_dz=days[ddate].dzones.length;
											if (ddate===d){
												max_dz=dz;
											}
											for (let ddz = 0; ddz< max_dz; ddz++){//for every zone of the day
												let max_r=days[ddate].dzones[ddz].rounds.length;
												if (ddate===d){
													max_r=r;
												}
												for (let drr = 0; drr < max_r; drr++){//for every round of that zone of that day
													//console.log(r,max_r,max_dz,dz,ddate,d);
													if (days[ddate].dzones[ddz].rounds[drr]){
														for (let sdate of Object.keys(days[ddate].dzones[ddz].rounds[drr].slots)){
															if (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match !== null){
																if ((days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_home.type === 'knockout' || days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_away.type === 'knockout') && days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.sport.name!=="Μπέιζμπολ"){
																	too_late = true;//this is a group type kn game indicating that is less special than a knockout type kn game, thus it must be placed earlier
																	//console.log(days[ddate].dzones[ddz]);
																	break;
																}	
															}
														}
														if(too_late){
															break;
														}
													}
												}
												if(too_late){
													break;
												}
											}
											if(too_late){
												break;
											}
										}
										//console.log('te', too_early,'tl', too_late,'FOR GROUP KN');
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
											for (let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){
												if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match !== null){
													used_slots+=1;
												}
											}
											for (let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){//for every slot in this round
												if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match !== null){//if this slot has an active match
													if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name === team1_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name === team1_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name === team2_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name === team2_k){
														scheduled_k = true;
														break;
													}
												}
												if (used_slots * 2 >= config.teams.length - 1){ //only 1 or 0 teams available = cannot produce a match in that round
													scheduled_k = true;
													break;
												}

											}/*
											let prev_round=r-1
											let next_round=r+1
											if (prev_round>=0 && r !== 0){//for previous round
												for (let sl of Object.keys(crts)){
													if (days[d].dzones[dz].rounds[prev_round].slots[sl].match !== null && typeof (days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_home.name) !== 'undefined' && typeof (days[d].dzones[dz].rounds[prev_round].slots[sl].match.team_home.name) !== 'undefined'){
														if (days[d].dzones[dz].rounds[prev_round].slots[sl].match.sport.name=== "Μπέιζμπολ" || (matches[m].sport.name==="Μπέιζμπολ" && days[d].dzones[dz].rounds[prev_round].slots[sl].court.includes("Π Ποδόσφαιρο"))){
															if (days[d].dzones[dz].rounds[r].slots[s].court.includes("Π Ποδόσφαιρο")){
																scheduled_k=true;
															}	
														}
													}
												}
											}
											if (next_round<days[d].dzones[dz].rounds.length){//for next round
												for (let sl of Object.keys(crts)){
													if (days[d].dzones[dz].rounds[next_round].slots[sl].match !== null){
														if (days[d].dzones[dz].rounds[next_round].slots[sl].match.sport.name=== "Μπέιζμπολ"){
															if (days[d].dzones[dz].rounds[r].slots[s].court.includes("Π Ποδόσφαιρο")){
																scheduled_k=true;
															}	
														}
													}
												}
											}*/
											

											//console.log('sk',scheduled_k,'FOR GROUP KN');
											if (!scheduled_k){
												let newdays=deepCopy(days);
												newdays[d].dzones[dz].rounds[r].slots[s].match=matches[m];
												let newMatches = matches.filter((element) => element !== matches[m]);
												result=ScheduleMatchesDefault(newMatches,newdays);
					
												if (result)
												{
													return result;
												}
													
											}
										}
									}
								}
								else if (matches[m].team_home.type === 'knockout' && matches[m].team_away.type === 'knockout' && matches[m].sport.name!=="Μπέιζμπολ"){
									
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
									//console.log('kf', knockout_finished,'FOR KNOCKOUT');
									if (knockout_finished){
										let too_early = false;
										for (let ddate = d; ddate < days.length; ddate++){//for every day from d
											let start_dz=0;
											let start_r=0;
											if (ddate===d){
												start_dz=dz;
												start_r=r;
											}
											for (let ddz = start_dz; ddz< days[ddate].dzones.length; ddz++){//for every zone of the day
												for (let drr = start_r; drr < days[ddate].dzones[ddz].rounds.length; drr++){//for every round of that zone of that day
													for (let sdate of Object.keys(days[ddate].dzones[ddz].rounds[drr].slots)){
														if (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match !== null && typeof (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_home.name) === 'undefined' && typeof (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_away.name) === 'undefined'){
															if (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.id === matches[m].team_home.knockout.id || days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.id === matches[m].team_away.knockout.id){
																too_early = true;
																break;
															}
															if (matches[m].team_home.is_winner === true || matches[m].team_away.is_winner === true){
																if ((days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_home.is_winner === false && days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_home.knockout.id === matches[m].team_home.knockout.id) || (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_away.is_winner === false && days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_away.knockout.id === matches[m].team_away.knockout.id)){
																	too_early = true;//losers games if placed already must be earlier than winners games (3rd place game - final)
																	break;
																}
															}
															if (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_home.type === 'group' || days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_away.type === 'group'){
																too_early = true;//this is a knockout type kn game indicating that is more special than a group type kn game, thus it must be placed later
																break;
															}
														}
														else if (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match !== null){
															if (typeof (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_home.name) !== 'undefined' && typeof (days[ddate].dzones[ddz].rounds[drr].slots[sdate].match.team_away.name) !== 'undefined'){
																too_early = true;//we want knockouts later than already placed group games
																break;
															}
														}
													}
													if (too_early){
														break;
													}
												}
												if (too_early){
													break;
												}
											}
											if (too_early){
												break;
											}
										}
										//console.log('te',too_early,'FOR KNOCKOUT');
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
											for (let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){
												if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match !== null){
													used_slots+=1;
												}
											}
											for (let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){//for every slot in this round
												if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match !== null){//if this slot has an active match
													if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name === team1_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name === team1_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name === team2_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name === team2_k){
														scheduled_k = true;
														break;
													}
												}
												if (used_slots * 2 >= config.teams.length - 1){ //only 1 or 0 teams available = cannot produce a match in that round
													scheduled_k = true;
													break;
												}
											}/*
											let prev_round=r-1
											let next_round=r+1
											if (prev_round>=0 && r !== 0){//for previous round
												for (let sl of Object.keys(crts)){
													if (days[d].dzones[dz].rounds[prev_round].slots[sl].match !== null){
														if (days[d].dzones[dz].rounds[prev_round].slots[sl].match.sport.name=== "Μπέιζμπολ"){
															if (days[d].dzones[dz].rounds[r].slots[s].court.includes("Π Ποδόσφαιρο")){
																scheduled_k=true;
															}	
														}
													}
												}
											}
											if (next_round<days[d].dzones[dz].rounds.length){//for next round
												for (let sl of Object.keys(crts)){
													if (days[d].dzones[dz].rounds[next_round].slots[sl].match !== null){
														if (days[d].dzones[dz].rounds[next_round].slots[sl].match.sport.name=== "Μπέιζμπολ"){
															if (days[d].dzones[dz].rounds[r].slots[s].court.includes("Π Ποδόσφαιρο")){
																scheduled_k=true;
															}	
														}
													}
												}
											}*/
											//console.log('sk',scheduled_k,'FOR KNOCKOUT');
											if (!scheduled_k){
												let newdays=deepCopy(days);
												
												newdays[d].dzones[dz].rounds[r].slots[s].match=matches[m];
												let newMatches = matches.filter((element) => element !== matches[m]);
												result=ScheduleMatchesDefault(newMatches,newdays);
					
												if (result)
												{
													return result;
												}
													
											}
										}
									}
								}
								else if(matches[m].team_home.type === 'fixed' && matches[m].team_away.type === 'fixed'){
									team1_k=matches[m].team_home.team.name;
									team2_k=matches[m].team_away.team.name;
								
									let used_slots=0;
									for (let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){
										if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match !== null){
											used_slots+=1;
										}
									}
									for (let sl=0; sl < Object.keys(days[d].dzones[dz].rounds[r].slots).length; sl++){//for every slot in this round
										if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match !== null){//if this slot has an active match
											if (Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name === team1_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name === team1_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_home.name === team2_k || Object.values(days[d].dzones[dz].rounds[r].slots)[sl].match.team_away.name === team2_k){
												scheduled_k = true;
												break;
											}
										}
										if (used_slots * 2 >= config.teams.length - 1){ //only 1 or 0 teams available = cannot produce a match in that round
											scheduled_k = true;
											break;
										}
									}/*
									let prev_round=r-1
									let next_round=r+1
									if (prev_round>=0 && r !== 0){//for previous round
										for (let sl of Object.keys(crts)){
											if (days[d].dzones[dz].rounds[prev_round].slots[sl].match !== null){
												if (days[d].dzones[dz].rounds[prev_round].slots[sl].match.sport.name=== "Μπέιζμπολ"){
													if (days[d].dzones[dz].rounds[r].slots[s].court.includes("Π Ποδόσφαιρο")){
														scheduled_k=true;
													}	
												}
											}
										}
									}
									if (next_round<days[d].dzones[dz].rounds.length){//for next round
										for (let sl of Object.keys(crts)){
											if (days[d].dzones[dz].rounds[next_round].slots[sl].match !== null){
												if (days[d].dzones[dz].rounds[next_round].slots[sl].match.sport.name=== "Μπέιζμπολ"){
													if (days[d].dzones[dz].rounds[r].slots[s].court.includes("Π Ποδόσφαιρο")){
														scheduled_k=true;
													}	
												}
											}
										}
									}*/
									//console.log('sk',scheduled_k,'FOR FIXED');
									if (!scheduled_k){
										let newdays=deepCopy(days);
										
										newdays[d].dzones[dz].rounds[r].slots[s].match=matches[m];
										let newMatches = matches.filter((element) => element !== matches[m]);
										result=ScheduleMatchesDefault(newMatches,newdays);
			
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
