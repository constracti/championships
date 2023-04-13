

//Here is the scheduling for default structure. Working on making it a recursive function that every time a match is placed in a slot, it calls itself after it pops the match, to schedule the next one until all matches are placed in a slot.-> Done.
export function ScheduleMatchesDefault(matches,rounds,slots,sports)
{
	if (matches.length === 0)
	{
		return true;
	}
	else
	{		
		for (let r = 0; r < rounds.length; r++)//for every round
		{
			for (let s = 0; s < slots.length; s++)//for every slot* 
			{
				for (let m = 0; m < matches.length; m++)
				{
					//RULES
					//if there is an empty court (1)
					if (slots[s].available === true && slots[s].round.rank===rounds[r].rank)// *in this round
					{
						let team1 = matches[m].th.name;
						let team2 = matches[m].ta.name;
						let scheduled = false;
						
						//If in this specific date, in a specific zone and rank a team is scheduled to play something else (2)
						for (let sp = 0; sp < sports.length; sp++)
						{
							for (let j = 0; j < rounds[r][sports[sp].name].length; j++)
							{
								if (rounds[r][sports[sp].name][j].match !== null)
								{
									
									if (rounds[r][sports[sp].name][j].match.th.name === team1 || rounds[r][sports[sp].name][j].match.ta.name === team1 || rounds[r][sports[sp].name][j].match.th.name === team2 || rounds[r][sports[sp].name][j].match.ta.name === team2)
									{
										
										//console.log(rounds[r][sports[sp].name].length);
										scheduled = true;
										break;
									}
								}
							}
							if (scheduled)
							{
								break;
							}
						}

						//If this match is present in the same sport already (3)
						for (let sl = 0; sl < slots.length; sl++)
						{
							if (slots[sl].match !== null)
							{
								if ((slots[sl].match.th.name === team1 || slots[sl].match.ta.name === team1) && (slots[sl].match.th.name === team2 || slots[sl].match.ta.name === team2) && (slots[sl].match.sport.name === slots[s].sport.name))
								{
									scheduled = true;
									break;
								}
							}
						}

						//other rules we may need for sheduling (for example a round may not have the default amount of slots)
						//END of RULES


						if (!scheduled)
						{
							matches[m].sport=slots[s].sport;
							slots[s].match = matches[m];
							slots[s].available = false;
							slots[s].round[slots[s].sport.name].push(slots[s]);
							let newMatches = matches.filter((element) => element !== matches[m]);
							//console.log(slots[s].match);
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