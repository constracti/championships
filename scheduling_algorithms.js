//Here is the scheduling for default structure. Working on making it a recursive function that every time a match is placed in a slot, it calls itself after it pops the match, to schedule the next one until all matches are placed in a slot.-> Done.
export function ScheduleMatchesDefault(matches,rounds,slots,sports)
{
	if (matches.length === 0)
	{
		console.log("end");
		return true;
	}
	else
	{
					
		for (let r = 0; r < rounds.length; r++)//for every round
		{
			for (let s = 0; s < slots.length; s++)//for every slot in this round
			{
				for (let m = 0; m < matches.length; m++)
				{
					if (slots[s].available === true)//if there is an empty court
					{
						let team1 = matches[m].th;
						let team2 = matches[m].ta;
						let scheduled = false;//If in this specific date, in a specific zone and rank a team is scheduled to play something else (1)

						for (let sp = 0; sp < sports.length; sp++)
						{
							for (let j = 0; j < rounds[r][sports[sp].name].length; j++)
							{
								if (rounds[r][sports[sp].name][j].match !== null)
								{
									if (rounds[r][sports[sp].name][j].match.th === team1 || rounds[r][sports[sp].name][j].match.ta === team1 || rounds[r][sports[sp].name][j].match.th === team2 || rounds[r][sports[sp].name][j].match.ta === team2)
									{
										scheduled = true;
										break;
									}
								}
								if (scheduled)
								{
									break;
								}
							}
						}
						if (!scheduled)
						{
							slots[s].match = matches[m];
							slots[s].available = false;
							let newMatches = matches.filter((element) => element !== matches[m]);
							console.log(newMatches.length);
							let result=ScheduleMatchesDefault(newMatches,rounds,slots,sports);
							if (result)
							{
								return result;
							}
								
						}
					}
					else
					{
						break;
					}
				}
			}
		}
	}
}

//other structure scheduling functions