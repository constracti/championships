function displayer(program) {

	// collect columns
	const col_str = (sport, court) => `${sport.name}: ${court}`;
	const col_dict = {};
	const col_list = [];
	sports.forEach(sport => {
		sport.courts.forEach(court => {
			col_key = col_str(sport, court);
			col_dict[col_key] = col_list.length;
			col_list.push({
				sport: sport,
				court: court,
			});
		});
	});

	// organize rounds
	// TODO constracti day list as global from parser; change round input format
	const dayobj_dict = {};
	const dayobj_list = [];
	rounds.forEach(round => {
		const dayobj_json = round.date.toJSON().slice(0, 10);
		if (!(dayobj_json in dayobj_dict)) {
			dayobj_dict[dayobj_json] = dayobj_list.length;
			dayobj_list.push({
				date: round.date,
				zoneobj_list: zones.map(zone => ({
					zone: zone,
					roundobj_list: [],
				})),
			});
		}
		const dayobj = dayobj_list[dayobj_dict[dayobj_json]];
		const zoneobj = dayobj.zoneobj_list[round.zone.rank];
		zoneobj.roundobj_list.push({
			round: round,
			colobj_list: col_list.map(col => ({
				sport: col.sport,
				court: col.court,
				match: null,
			})),
		});
	});

	// attach matches
	program.forEach(round => {
		const dayobj_json = round.date.toJSON().slice(0, 10);
		const dayobj = dayobj_list[dayobj_dict[dayobj_json]];
		const zoneobj = dayobj.zoneobj_list[round.zone.rank];
		const roundobj = zoneobj.roundobj_list[round.rank - 1];
		Object.values(round.slots).forEach(slot => {
			if (slot.match === null)
				return;
			const col_key = col_str(slot.match.sport, slot.court);
			const colobj = roundobj.colobj_list[col_dict[col_key]];
			colobj.match = slot.match;
		});
	});

	// create html
	const home = document.createElement('div');
	home.classList.add('day-list');
	document.body.appendChild(home);
	dayobj_list.forEach(dayobj => {
		const day_div = document.createElement('div');
		day_div.classList.add('day');
		home.appendChild(day_div);
		const day_h = document.createElement('div');
		day_h.classList.add('day-date');
		day_div.appendChild(day_h);
		day_h.innerHTML = dayobj.date.toLocaleDateString('el', {
			weekday: 'long',
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		});
		const zone_ul = document.createElement('div');
		zone_ul.classList.add('zone-list');
		day_div.appendChild(zone_ul);
		dayobj.zoneobj_list.forEach(zoneobj => {
			if (zoneobj.roundobj_list.length === 0)
				return;
			const zone_li = document.createElement('div');
			zone_li.classList.add('zone');
			zone_ul.appendChild(zone_li);
			if (zones.length !== 1 || zones[0].name !== null) {
				const zone_h = document.createElement('div');
				zone_h.classList.add('zone-name');
				zone_li.appendChild(zone_h);
				zone_h.innerHTML = zoneobj.zone.name;
			}
			const round_ul = document.createElement('div');
			round_ul.classList.add('round-list');
			zone_li.appendChild(round_ul);
			zoneobj.roundobj_list.forEach(roundobj => {
				const round_li = document.createElement('div');
				round_li.classList.add('round');
				round_ul.appendChild(round_li);
				const col_ul = document.createElement('div');
				col_ul.classList.add('cell-list');
				round_li.appendChild(col_ul);
				roundobj.colobj_list.forEach(colobj => {
					const col_li = document.createElement('div');
					col_li.classList.add('cell');
					col_ul.appendChild(col_li);
					const match = colobj.match;
					if (match !== null) {
						col_li.innerHTML = [
							'id' in match.team_home ? match.team_home.id : '?',
							'id' in match.team_away ? match.team_away.id : '?',
						].join('-');
					} else {
						col_li.innerHTML = '-';
					}
				});
			});
		});
	});

}
