export function Displayer(matches, rounds, slots, sports, groups){//other parameters are not used right now but in the future they might be
	let title = document.createElement("div");
	let titleSpan = document.createElement("span");
	titleSpan.innerHTML = "<h2>Schedule<h2>";
	title.appendChild(titleSpan);
	document.body.appendChild(title);

	for (let i = 0; i < slots.length; i++){
		if (slots[i].match !== null){
			let match = document.createElement("div");

			match.className = "match";
			let slot = document.createElement("div");
			let slotSpan = document.createElement("span");
			slotSpan.innerHTML = `<b>Round:</b> ${slots[i].round.rank} <b>Date:</b> ${slots[i].round.date}, <b>Zone:</b> ${slots[i].round.zone.name} ${slots[i].round.zrank}, <b>Sport:</b> ${slots[i].sport.name} |  ` ;

			let team1 = document.createElement("div");
			let team1Span = document.createElement("span");
			team1Span.innerHTML = slots[i].match.th.name;
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
			team2Span.innerHTML = slots[i].match.ta.name;

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