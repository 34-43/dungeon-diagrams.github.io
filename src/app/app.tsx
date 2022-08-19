import { h } from 'preact';
import { Puzzle, EditablePuzzle } from './puzzle-model.js';
import { PuzzleSolver } from './puzzle-view.js';
import { PuzzleEditor } from './puzzle-editor.js';
import * as PuzzleString from './puzzle-string.js';
import { parseQuery } from './html-utils.js';
import { SettingsButton } from './settings.js';

/*
 idea for a router: use 404.html to serve the main app.
 then we can have urls like:
 /puzzle/1/Tenaxxus-Gullet
 /puzzle/1#?state=..xx+.t.m,..m.x|
 /puzzle/?r=424121&c=312512&t=0,5&m=4,5,5,0#?state=.x+.t.|
*/

const dailyPuzzles: string[] = [
`Example Dungeon
.424121
3.....t
1......
2......
5......
1.....M
2m.....
`,
`Tenaxxus's Gullet
.44262347
7.....m..
3........
4.🏆......
1........
7........
1m.......
6........
3..m....m
`,
`The Twin Cities of the Dead
.13153435
5........
2..t.t...
2........
3........
6🧟.......
0........
6........
1....🧟.🧟.
`,
`The Gardens of Hell
.14363144
6😈......😈
0........
4........
1.......😈
5😈.......
3........
3....🏆...
4😈.......
`,
`The House Penumbral
.04073432
6m.m.....
2.......t
3........
1........
5........
1........
4........
1......m.
`,
`The Maze of the Minotaur
.72613261
0m.......
7........
3.🐂.🎁....
3........
3........
5........
2........
5........
`,
`The Halls of the Golemancer
.53246415
6.....🤖..
3.......🤖
3..t..🤖..
3.......🤖
5.....🤖..
3.......🤖
4........
3........
`,
`The Tomb of the Broken God
.13326241
1.t..m...
4........
1........
6........
2.......👹
2........
5........
1.....m..
`,
`The Hive of Great Sorrow
.36054063
6..🐛..🐛..
2🐛......🐛
4........
3....🐛...
2........
4........
2🐛......🐛
4........
`,
`The Lair of the Elemental King
.52125423
4.......m
1........
4..🤴.....
2........
6........
2........
3...👑....
2........
`,
`Example Puzzle 1
⬜️2️⃣5️⃣3️⃣3️⃣2️⃣3️⃣3️⃣2️⃣
1️⃣🟫⬜️⬜️⬜️⬜️⬜️⬜️⬜️
4️⃣⬜️⬜️🟥🟥🟥⬜️🟥⬜️
2️⃣⬜️🟥⬜️⬜️⬜️⬜️🟥⬜️
2️⃣⬜️🟥⬜️👑⬜️🟥🐀⬜️
3️⃣⬜️🟥⬜️⬜️⬜️🟥🟥⬜️
4️⃣⬜️🟥🟥🟥🟥🐍⬜️⬜️
2️⃣⬜️⬜️⬜️⬜️⬜️🟥⬜️🟫
5️⃣🟫🟫🟫🟫⬜️⬜️⬜️🟫
`,
`Example Puzzle 2
.25332332
1#.......
4..###.#.
2.#....#.
2.#.t.#m.
3.#...##.
4.####🐍..
2.....#.#
5####...#
`,
`Example Puzzle 3
⬜️0️⃣7️⃣1️⃣3️⃣6️⃣2️⃣2️⃣2️⃣
1️⃣🪱⬜️🐊⬜️⬜️⬜️⬜️⬜️
3️⃣⬜️⬜️⬜️⬜️⬜️⬜️💎⬜️
2️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
6️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
4️⃣⬜️⬜️⬜️🦖⬜️⬜️⬜️⬜️
3️⃣⬜️⬜️⬜️⬜️⬜️💎⬜️⬜️
1️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
3️⃣🐢⬜️🦏⬜️⬜️⬜️⬜️⬜️
`
];

/*
We can link to an individual puzzle:
href="?puzzle_id=4"
or to a partial solution:
href="?puzzle=(shareable string)"
*/

export function App(query?: string) {
    query ||= document.location.search
    const params = parseQuery(query);
    const puzzleString = params.puzzle as string;
    const puzzleID = params.puzzle_id as number;
    let puzzle;
    if (puzzleString) {
        puzzle = PuzzleString.parse(puzzleString);
    }
    else if (puzzleID || puzzleID === 0) {
        puzzle = PuzzleString.parse(dailyPuzzles[puzzleID]);
    }
    if (puzzle) {
        puzzle = puzzle.solvableCopy();
        Object.assign(globalThis, {puzzle: puzzle});
        return (
            <div id="app" className="app">
                <h1><a href=".">Daily Dungeons and Diagrams</a></h1>
                <PuzzleSolver puzzle={puzzle} />
                <SettingsButton />
            </div>
        );
    }
    else if (params.mode === 'edit') {
        puzzle = new EditablePuzzle({name:"Untitled Dungeon", colTargets:[0,0,0,0,0,0,0,0], rowTargets:[0,0,0,0,0,0,0,0], tiles: []});
        Object.assign(globalThis, {puzzle: puzzle});
        return (
            <div id="app" className="app">
                <h1><a href=".">Daily Dungeons and Diagrams</a></h1>
                <PuzzleEditor puzzle={puzzle} />
                <SettingsButton />
            </div>
        )
    }
    else {
        const navLinks = [];
        for (const puzzleString of dailyPuzzles) {
            const puzzle = PuzzleString.parse(puzzleString);
            puzzle.unsolve();
            navLinks.push(<li className="puzzle-list">
                <a href={PuzzleString.toURI(puzzle)}>{puzzle.name}</a>
                <pre className="puzzle-preview">{PuzzleString.toEmoji(puzzle)}</pre>
            </li>)
        }
        return (
            <div id="app" className="app">
                <h1>Daily Dungeons and Diagrams</h1>
                <ul>
                    {navLinks}
                </ul>
                <ul>
                    <li><a href="?mode=edit">Create New Dungeon</a></li>
                </ul>
                <Menu />
                <SettingsButton />
            </div>
        )
    }
}

function Menu() {
    return (
        <nav className='menu'>
            <ul>
                <li><a href="https://github.com/dungeon-diagrams/dungeon-diagrams.github.io">Source Code</a></li>
                <li><a href="https://github.com/dungeon-diagrams/dungeon-diagrams.github.io/issues">Feedback</a></li>
            </ul>
        </nav>
    )
}
