# championships
An HTML-JS application to plan championships.

## version

1.2

## configuration

A configuration string is provided through a `textarea` element.

A word in square brackets defines the type of the following lines.

#### examples

`[sports]`

`[teams]`

Full realistic examples are given in text files named `input*.txt`.

Detailed syntax is explained in the subsections below.

### sports

A sport line contains the sport name (a single word), optionally followed by a court list definition.

A court list definition consists of a colon (`:`) and a comma (`,`) separated list of courts.

Sports with the same name are not allowed.

If no court list definition is provided, a court named by the sport will be considered.

#### examples

`Soccer: Old Soccer Court, New Soccer Court`

`Volleyball`

`Baseball: Old Soccer Court`

### zones

A zone line contains the zone name.

Zones are ranked according to their declaration order.

If no zones are provided, a single zone will be considered. The zone name will be set to `null`.

After a day line, zones can't be added.

#### examples

`Morning`

`Afternoon`

### days

A day line contains a date (given in the format `YYYY-mm-dd`) and a list of integers indicating the number of rounds per zone.

The length of the integer list should match the number of the zones.

Days with the same date are not allowed.

#### examples

```
2023-08-10 3
```

```
2023-08-10 1 2
2023-08-11 2 0
```

### teams

A team line contains the team name.

#### note

Teams are numbered starting from `1`.

### groups

A group line contains the group code, the sport name, a positive integer indicating the number of matches each team will play and a collection of teams.

The group code is a single word. Groups with the same code are not allowed.

A collection of teams consists of a colon (`:`) and a comma (`,`) separated list of integers or integer ranges.

An integer range is formed by two integers separated by a dash (`-`).

In case the number of teams in the group is odd, the number of matches each team will play must be even.

#### examples

```
sg  Soccer     8: 1-5
```

```
vg1 Volleyball 4: 1, 4-5, 7, 10
vg2 Volleyball 4: 2-3, 6, 8-9
```

```
bg  Baseball   1: 2-5
```

### knockouts

A knockout line contains the knockout code, the sport name and two expressions describing the selection algorithm of each opponent.

The knockout code is a single word. Knockouts with the same code are not allowed.

An expression may take one of the following three forms:

+ a single integer: The team with this index is selected.
+ a group code and an integer separated by a color (`:`): The team with the corresponding ranking within the group is selected.
+ a knockout code and one of the uppercase letters `W` or `L`: Winner or loser of the corresponding knockout match is selected.

#### examples

```
pf  Soccer    pg:1  pg:2
```

```
vq1 Volleyball vg1:1 vg2:4
vq2 Volleyball vg1:2 vg2:3
vq3 Volleyball vg1:3 vg2:2
vq4 Volleyball vg1:4 vg2:1
vs1 Volleyball vq1:W vq3:W
vs2 Volleyball vq2:W vq4:W
vfw Volleyball vs1:W vs2:W
vfl Volleyball vs1:L vs2:L
```

```
bs1 Baseball       1  bg:2
bs2 Baseball    bg:1  bg:3
bf  Baseball   bs1:W bs2:W
```
