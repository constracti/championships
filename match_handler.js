function Displayer(slots){
	let title = document.createElement("div");
	let titleSpan = document.createElement("span");
	titleSpan.innerHTML = "<h2>Schedule<h2>";
	title.appendChild(titleSpan);
	document.body.appendChild(title);
	let m=0;

	for (let i = 0; i < slots.length; i++){
		if (slots[i].match !== null){
			let match = document.createElement("div");
			m+=1

			match.className = "match";
			let slot = document.createElement("div");
			let slotSpan = document.createElement("span");
			slotSpan.innerHTML = `<b>Match:</b> ${m} <b>Id:</b> ${slots[i].match.id} <b>Date:</b> ${slots[i].round.date.toJSON().split('T')[0]}, <b>Zone:</b> ${slots[i].round.zone.name} ${slots[i].round.rank}, <b>Sport:</b> ${slots[i].match.sport.name}, <b>Court:</b> ${slots[i].court} |  ` ;

			let team1 = document.createElement("div");
			let team1Span = document.createElement("span");
			if (typeof (slots[i].match.team_home.name) !== 'undefined'){
				team1Span.innerHTML = slots[i].match.team_home.name;
			}
			else if (slots[i].match.team_home.type === 'fixed'){
				team1Span.innerHTML = slots[i].match.team_home.team.name;
			}
			else if (slots[i].match.team_home.type === 'group'){
				team1Span.innerHTML = `${slots[i].match.team_home.group.id}, rank: ${slots[i].match.team_home.rank}`;
			}
			else {
				team1Span.innerHTML = `${slots[i].match.team_home.knockout.id},  ${slots[i].match.team_home.is_winner ? 'W' : 'L'}`;
			}
			let score1 = document.createElement("div");
			let score1Input = document.createElement("input");
			score1Input.type = "number";
			score1Input.id = "team1Score";
			score1Input.value = "0";

			let vs = document.createElement("div");
			let vsSpan = document.createElement("span");
			vsSpan.innerHTML = "-";

			let score2 = document.createElement("div");
			let score2Input = document.createElement("input");
			score2Input.type = "number";
			score2Input.id = "team2Score";
			score2Input.value = "0";

			let team2 = document.createElement("div");
			let team2Span = document.createElement("span");
			if (typeof (slots[i].match.team_away.name) !== 'undefined'){
				team2Span.innerHTML = slots[i].match.team_away.name;
			}
			else if (slots[i].match.team_away.type === 'fixed'){
				team2Span.innerHTML = slots[i].match.team_away.team.name;
			}
			else if (slots[i].match.team_away.type === 'group'){
				team2Span.innerHTML = `${slots[i].match.team_away.group.id}, rank: ${slots[i].match.team_away.rank}`;
			}
			else {
				team2Span.innerHTML = `${slots[i].match.team_away.knockout.id},  ${slots[i].match.team_away.is_winner ? 'W' : 'L'}`;
			}

			slot.appendChild(slotSpan);
			team1.appendChild(team1Span);
			score1.appendChild(score1Input);
			score2.appendChild(score2Input);
			team2.appendChild(team2Span);

			match.appendChild(slot);
			match.appendChild(team1);
			match.appendChild(score1);
			match.appendChild(vs);
			match.appendChild(score2);
			match.appendChild(team2);

			
			document.body.appendChild(match);
		}	
	}
}