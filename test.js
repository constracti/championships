let matches = [];
let teams = [];
let groups = [];
let zones = [];
let rounds = [];
let sports = [];

let t = document.getElementsByName("teams");
let gs = document.getElementsByName("grstructure");
let z = document.getElementsByName("zones");
let r = document.getElementsByName("rounds");
let s = document.getElementsByName("sports");
let sd = document.getElementsByName("start");
let ed = document.getElementsByName("end");

let init_teams = t[0].value.trim().split('\n');
let init_group_structure = gs[0].value.trim().toLowerCase();
let init_zone = z[0].value.trim().split('\n');
let init_number_of_rounds = r[0].value.trim().toLowerCase();
let init_sports = s[0].value.trim().split('\n');
const init_start_date = new Date(sd[0].value);
const init_end_date = new Date(ed[0].value);

let difference = (init_end_date.getTime() - init_start_date.getTime())/(1000*60*60*24);

for (let i = 0; i < init_teams.length; i++) {
    team =
    {
        id: i,
        name: init_teams[i]
    };
    teams.push(team);
}

for (let i = 0; i < init_sports.length; i++) {
    sport =
    {
        name: init_sports[i],
        points: (sh, sa) =>
        {
            let ph;
            let pa;
            if (sport.name === "football")
            {
                if (sh > sa) {
                    ph = 3;
                    pa = 0;
                }
                else if (sh < sa) {
                    ph = 0;
                    pa = 3;
                }
                else
                {
                    ph = 1;
                    pa = 1;
                }
            }
            //άλλα αθλήματα
            return [ph, pa];
        }
    };
    sports.push(sport);
}


for (let d = 0; d <= difference; d++)
{
    for (let i = 0; i < init_zone.length; i++)
    {
        zone =
        {
            id: i,
            name: init_zone[i]
        };
        for (let k = 0; k < sports.length; k++)
        {
            for (let j = 0; j < init_number_of_rounds; j++) {
                round =
                {
                    sport: sports[k],
                    id: 0,
                    date: new Date(init_start_date.getFullYear(), init_start_date.getMonth(), init_start_date.getDate() + d).toDateString(),
                    zone: zone.id,
                    rank: j,
                    available: true
                };
                rounds.push(round);
            }
        }
        zones.push(zone)
    }
}
for ( let i = 0; i < rounds.length; i++)
{
    rounds[i]["id"] = i;
}


if (init_group_structure === "default")
{
    for (let k = 0; k < sports.length; k++)
    {
        group =
        {
            sport: sports[k],
            teams: teams,
            structure: "default"
        };
        groups.push(group)
        for (let i = 0; i < group.teams.length - 1; i++) {
            for (let j = i; j < group.teams.length - 1; j++) {
                match =
                {
                    th: group.teams[i],
                    ta: group.teams[j + 1],
                    sh: 0,
                    sa: 0,
                    round: -1
                };
                matches.push(match);
            }
        }
    }
    for (let m = 0; m < matches.length; m++) {
        for (let r = 0; r < rounds.length; r++) {
            if (rounds[r].available === true)//αν υπάρχει κενό γήπεδο
            {
                let team1 = matches[m].th;
                let team2 = matches[m].ta;
                let scheduled = false;//αν την συγκεκριμένη ημέρα, στην συγκεκριμένη ζώνη και στο συγκεκριμένο rank της ζώνης έχει προγραμματιστεί να παίζει η ίδια ομάδα κάτι άλλο

                for (let rm = 0; rm < matches.length; rm++)
                {
                    if (matches[rm].round !== -1)
                    {
                        if (rounds[r].date === rounds[matches[rm].round].date && rounds[r].rank === rounds[matches[rm].round].rank && rounds[r].zone === rounds[matches[rm].round].zone && (matches[rm].th === team1 || matches[rm].ta === team1 || matches[rm].th === team2 || matches[rm].ta === team2)) {
                            scheduled = true;
                            break;
                        }
                    }
                    
                }
                if (!scheduled) {
                    matches[m].round = rounds[r].id;
                    rounds[r].available = false;
                    break;
                }
            }
        }
    }
    for (let m = 0; m < matches.length; m++) {
        if (matches[m].round === -1) {
            alert("No solution found for sport " + sports[k]);
            break;
        }
    } 
}

console.log(matches);
console.log(groups);
console.log(rounds);




