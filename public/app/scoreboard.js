console.log(team)
console.log(captain)
console.log(vice_captain)

$.get(`/s/t/${window.sessionStorage.user}`,(data)=>{
    console.log(data);
    window.sessionStorage.top=data[0].score;
    console.log(window.sessionStorage.top)
    $('#top_score').text(`${window.sessionStorage.top}`)

})
 
var score = 0.0;
var batsmanScores = new Map(); // Track batsman runs
var bowlerStats = new Map();   // Track bowler runs conceded
var teamTotal = 0;
var extrasTotal = 0;
var outPlayers = new Map(); // Track out players and their scores
var remainingPlayers = new Set([...team]); // Copy of selected team for tracking remaining players

$(async () => {
    $('#toss').text(main_data.info.toss.winner)
    $('#toss-choose').text(main_data.info.toss.decision)
    $('#bat-team').text(main_data.innings[0]['1st innings'].team)
    $('#field-team').text(main_data.innings[1]['2nd innings'].team)
    const inning1 = main_data.innings[0]['1st innings'].deliveries
    const inning2 = main_data.innings[1]['2nd innings'].deliveries
    
    // Initialize match status with yellow background
    updateMatchStatus('Match Starting', {
        teams: `${main_data.innings[0]['1st innings'].team} vs ${main_data.innings[1]['2nd innings'].team}`,
        toss: `${main_data.info.toss.winner} chose to ${main_data.info.toss.decision}`,
        score: '0/0',
        over: '0.0'
    });

    // Initialize team score display
    $('#team-score').html(`
        <div class="team-score-section yellow-section">
            <h3>0/0</h3>
            <small>Extras: 0</small>
        </div>
    `);
    
    // Initialize fantasy score
    $('#score').text('0.0');
    
    make(inning1, inning2);
    
    var a=window.sessionStorage.user;
    $.get(`/s/${a}`,(data)=>{
        let e=0;
        for(p of data){
            e++;
            $('#prev-score').append(`
            <div class="row">
                <div class="col-2">${e}</div>
                <div class="col-7">${p.match}</div>
                <div class="col-3">${p.currscore}</div>
            </div>
            `)
        }
    })
    //check();
})


const batpoint = {
    "50 run": 58,
    "100 run": 116
}

const bowlerpoint = {
    "caught": "25",
    "bowled": "33",
    "run out": "25",
    "lbw": "33",
    "retired hurt": "0",
    "stumped": "25",
    "caught and bowled": "40",
    "hit wicket": "25",
}

// var strike = 0;
// var nonStrinke = 0;

var mapp = new Map();

for (let item of team) {
    mapp.set(item, 0.0);
    //console.log(item)
}

// console.log(mapp)

// console.log(mapp.get(captain));
// mapp.set(captain, mapp.get(captain) + 1)
// console.log(mapp.get(captain));

function updateBatsmanScore(batsman, runs) {
    if (!batsmanScores.has(batsman)) {
        batsmanScores.set(batsman, 0);
    }
    batsmanScores.set(batsman, batsmanScores.get(batsman) + runs);
    return batsmanScores.get(batsman);
}

function updateBowlerStats(bowler, runs) {
    if (!bowlerStats.has(bowler)) {
        bowlerStats.set(bowler, 0);
    }
    bowlerStats.set(bowler, bowlerStats.get(bowler) + runs);
    return bowlerStats.get(bowler);
}

function updateTeamScore(runs, extras) {
    const runValue = parseFloat(runs) || 0;
    const extrasValue = parseFloat(extras) || 0;
    teamTotal += runValue + extrasValue;
    extrasTotal += extrasValue;
    
    // Update team score display with yellow background and fantasy points
    $('#team-score').html(`
        <div class="team-score-section yellow-section">
            <h3>${teamTotal}/${outPlayers.size}</h3>
            <small>Extras: ${extrasTotal}</small>
        </div>
    `);

    // Update fantasy score display
    $('#fantasy-score').html(`
        <div class="fantasy-score-section yellow-section">
            <h4>Fantasy Points</h4>
            <h3>${score.toFixed(1)}</h3>
        </div>
    `);
    
    return teamTotal;
}

function updatePlayerStatus(batsman, bowler, wicket) {
    if (wicket) {
        if (remainingPlayers.has(batsman)) {
            remainingPlayers.delete(batsman);
            outPlayers.set(batsman, batsmanScores.get(batsman) || 0);
        }
    }
    updatePlayersList();
}

function updatePlayersList() {
    // Update the players list section
    let outPlayersHtml = '';
    let remainingPlayersHtml = '';

    outPlayers.forEach((score, player) => {
        let role = '';
        if (player === captain) role = ' (C)';
        else if (player === vice_captain) role = ' (VC)';
        outPlayersHtml += `
            <div class="player-row out-player">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="player-name">${player}${role}</span>
                        <span class="player-status">OUT</span>
                    </div>
                    <span class="player-score">${score}</span>
                </div>
            </div>
        `;
    });

    remainingPlayers.forEach(player => {
        let role = '';
        if (player === captain) role = ' (C)';
        else if (player === vice_captain) role = ' (VC)';
        let playerScore = batsmanScores.get(player) || 0;
        remainingPlayersHtml += `
            <div class="player-row active-player">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="player-name">${player}${role}</span>
                        <span class="player-status">Playing</span>
                    </div>
                    <span class="player-score">${playerScore}</span>
                </div>
            </div>
        `;
    });

    $('#players-status').html(`
        <div class="players-section yellow-section">
            <div class="section-out">
                <h5 class="section-title">Out Players</h5>
                ${outPlayersHtml}
            </div>
            <div class="section-remaining">
                <h5 class="section-title">Remaining Players</h5>
                ${remainingPlayersHtml}
            </div>
        </div>
    `);
}

function updateMatchStatus(status, details) {
    $('#match-status').html(`
        <div class="status-section yellow-section">
            <h4>${status}</h4>
            <div class="d-flex justify-content-between align-items-center">
                <span>${details.phase || ''}</span>
                <span>${details.teams}</span>
            </div>
            <div class="mt-2">
                ${details.toss ? `<h5>${details.toss}</h5>` : ''}
                ${details.score ? `<h4>Score: ${details.score}</h4>` : ''}
                ${details.over ? `<h5>Over: ${details.over}</h5>` : ''}
                ${details.lastAction ? `
                    <div class="ball-details">
                        <small>${details.lastAction}</small>
                    </div>
                ` : ''}
            </div>
        </div>
    `);
}

function updateScoreboard(b, batsmanTotal, bowlerTotal, teamTotalScore) {
    $('#scores').html(`
        <div class="scoreboard-section yellow-section">
            <div class="row mb-3">
                <div class="col-8"><h4>Team Score</h4></div>
                <div class="col-4">
                    <h4 class="float-end">${teamTotalScore}/${outPlayers.size}</h4>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-8">Extras</div>
                <div class="col-4">
                    <span class="float-end">${extrasTotal}</span>
                </div>
            </div>
            <div class="row mb-2 current-batsman">
                <div class="col-8">
                    <strong>Batsman</strong> 
                    ${b.score.batsman === captain ? ' (C)' : b.score.batsman === vice_captain ? ' (VC)' : ''}
                </div>
                <div class="col-4">
                    ${b.score.batsman} <span class="float-end">${batsmanTotal}</span>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-8">
                    <strong>Non-Striker</strong>
                    ${b.score.non_striker === captain ? ' (C)' : b.score.non_striker === vice_captain ? ' (VC)' : ''}
                </div>
                <div class="col-4">
                    ${b.score.non_striker} <span class="float-end">${batsmanScores.get(b.score.non_striker) || 0}</span>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-8">
                    <strong>Bowler</strong>
                    ${b.score.bowler === captain ? ' (C)' : b.score.bowler === vice_captain ? ' (VC)' : ''}
                </div>
                <div class="col-4">
                    ${b.score.bowler} <span class="float-end">${bowlerTotal}</span>
                </div>
            </div>
            <div class="current-over-details mt-3 p-2">
                <div class="row text-center">
                    <div class="col-3">
                        <strong>Over</strong>
                        <div>${b.over}</div>
                    </div>
                    <div class="col-3">
                        <strong>This Ball</strong>
                        <div>${b.score.runs.batsman}</div>
                    </div>
                    <div class="col-3">
                        <strong>Extras</strong>
                        <div>${b.score.runs.extras}</div>
                    </div>
                    <div class="col-3">
                        <strong>Total</strong>
                        <div>${b.score.runs.total}</div>
                    </div>
                </div>
            </div>
        </div>
    `);
}

function make(temp1, temp2) {
    let j = 0;
    
    // Initialize empty scoreboard
    updateScoreboard(
        { over: '0.0', score: { batsman: '-', bowler: '-', non_striker: '-', runs: { batsman: 0, extras: 0, total: 0 } } },
        0, 0, 0
    );
    
    // Update status to show first innings is starting
    updateMatchStatus('First Innings', {
        phase: 'Match In Progress',
        teams: `${main_data.innings[0]['1st innings'].team} Batting`,
        score: '0/0',
        over: '0.0',
        lastAction: 'First innings about to begin'
    });
    
    const aa = setInterval(() => {
        let ball = Object.keys(temp1[j])[0];
        let b = {
            over: Object.keys(temp1[j])[0],
            score: temp1[j][ball]
        }

        // Parse values safely
        const batsmanRuns = parseFloat(b.score.runs.batsman) || 0;
        const extrasRuns = parseFloat(b.score.runs.extras) || 0;
        const totalRuns = parseFloat(b.score.runs.total) || 0;

        // Update all stats
        const batsmanTotal = updateBatsmanScore(b.score.batsman, batsmanRuns);
        const bowlerTotal = updateBowlerStats(b.score.bowler, totalRuns);
        const teamTotalScore = updateTeamScore(batsmanRuns, extrasRuns);
        
        // Update scoreboard with animation class
        $('#scores').addClass('score-update').html(`
            <div class="scoreboard-section yellow-section">
                <div class="row mb-3">
                    <div class="col-8"><h4>Team Score</h4></div>
                    <div class="col-4">
                        <h4 class="float-end">${teamTotalScore}/${outPlayers.size}</h4>
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-8">Extras</div>
                    <div class="col-4">
                        <span class="float-end">${extrasTotal}</span>
                    </div>
                </div>
                <div class="row mb-2 current-batsman">
                    <div class="col-8">
                        <strong>Batsman</strong> 
                        ${b.score.batsman === captain ? ' (C)' : b.score.batsman === vice_captain ? ' (VC)' : ''}
                    </div>
                    <div class="col-4">
                        ${b.score.batsman} <span class="float-end">${batsmanTotal}</span>
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-8">
                        <strong>Non-Striker</strong>
                        ${b.score.non_striker === captain ? ' (C)' : b.score.non_striker === vice_captain ? ' (VC)' : ''}
                    </div>
                    <div class="col-4">
                        ${b.score.non_striker} <span class="float-end">${batsmanScores.get(b.score.non_striker) || 0}</span>
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-8">
                        <strong>Bowler</strong>
                        ${b.score.bowler === captain ? ' (C)' : b.score.bowler === vice_captain ? ' (VC)' : ''}
                    </div>
                    <div class="col-4">
                        ${b.score.bowler} <span class="float-end">${bowlerTotal}</span>
                    </div>
                </div>
                <div class="current-over-details mt-3 p-2">
                    <div class="row text-center">
                        <div class="col-3">
                            <strong>Over</strong>
                            <div>${b.over}</div>
                        </div>
                        <div class="col-3">
                            <strong>This Ball</strong>
                            <div>${batsmanRuns}</div>
                        </div>
                        <div class="col-3">
                            <strong>Extras</strong>
                            <div>${extrasRuns}</div>
                        </div>
                        <div class="col-3">
                            <strong>Total</strong>
                            <div>${totalRuns}</div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Remove animation class after update
        setTimeout(() => {
            $('#scores').removeClass('score-update');
        }, 1000);
        
        // Update match status
        let lastAction = b.score.wicket 
            ? `${b.score.bowler} takes wicket of ${b.score.batsman}`
            : `${b.score.batsman} scores ${batsmanRuns} runs${extrasRuns > 0 ? ` + ${extrasRuns} extras` : ''}`;
            
        updateMatchStatus('First Innings', {
            phase: 'Match In Progress',
            teams: `${main_data.innings[0]['1st innings'].team} Batting`,
            score: `${teamTotalScore}/${outPlayers.size}`,
            over: b.over,
            lastAction: lastAction
        });

        // Update notification with proper spelling
        $('#notification').text(b.score.wicket 
            ? `${b.score.bowler} takes wicket of ${b.score.batsman}`
            : `${b.score.batsman} scores ${batsmanRuns} runs`
        );

        // Handle wickets
        if (b.score.wicket) {
            updatePlayerStatus(b.score.batsman, b.score.bowler, true);
            
            if (team.has(b.score.bowler)) {
                const wicketType = b.score.wicket.kind;
                const wicketPoints = parseFloat(bowlerpoint[wicketType]) || 0;
                score += wicketPoints;
                
                if (b.score.bowler === captain) {
                    score += wicketPoints;
                }
                if (b.score.bowler === vice_captain) {
                    score += 0.5 * wicketPoints;
                }
            }
        }

        // Update fantasy points
        if (team.has(b.score.batsman)) {
            let currentScore = mapp.get(b.score.batsman);
            mapp.set(b.score.batsman, currentScore + batsmanRuns);
            let newScore = mapp.get(b.score.batsman);

            if (currentScore < 50 && newScore >= 50) {
                score = score - currentScore + 58;
                if (b.score.batsman === captain) {
                    score = score - currentScore + 58;
                }
                if (b.score.batsman === vice_captain) {
                    score = score - (currentScore * 0.5) + (58 * 0.5);
                }
            } else if (currentScore < 100 && newScore >= 100) {
                score = score - currentScore + 116;
                if (b.score.batsman === captain) {
                    score = score - currentScore + 116;
                }
                if (b.score.batsman === vice_captain) {
                    score = score - (currentScore * 0.5) + (116 * 0.5);
                }
            } else {
                score += batsmanRuns;
                if (b.score.batsman === captain) {
                    score += batsmanRuns;
                }
                if (b.score.batsman === vice_captain) {
                    score += 0.5 * batsmanRuns;
                }
            }
        }

        // Update fantasy score display
        $('#score').text(score.toFixed(1));
        $('#fantasy-score').html(`
            <div class="fantasy-score-section yellow-section">
                <h4>Fantasy Points</h4>
                <h3>${score.toFixed(1)}</h3>
            </div>
        `);

        if (j >= (temp1.length - 1)) {
            clearInterval(aa);
            window.alert('Second innings starting...');
            updateMatchStatus('Innings Break', {
                phase: 'First Innings Complete',
                teams: `${main_data.innings[0]['1st innings'].team} vs ${main_data.innings[1]['2nd innings'].team}`,
                score: `${teamTotalScore}/${outPlayers.size}`,
                lastAction: `${main_data.innings[1]['2nd innings'].team} to bat next`
            });
            setTimeout(() => solve(temp2), 5000);
        } else {
            j++;
        }
    }, 5000);
}

// Fix spelling in notification messages
function updateNotification(message) {
    $('#notification').text(message);
}

// Improve fantasy points calculation
function updateFantasyPoints(player, points, isWicket = false) {
    if (team.has(player)) {
        if (isWicket) {
            score += points;
            if (player === captain) {
                score += points;
            }
            if (player === vice_captain) {
                score += 0.5 * points;
            }
        } else {
            let currentScore = mapp.get(player);
            let newScore = currentScore + points;
            mapp.set(player, newScore);

            if (currentScore < 50 && newScore >= 50) {
                score = score - currentScore + 58;
                if (player === captain) {
                    score = score - currentScore + 58;
                }
                if (player === vice_captain) {
                    score = score - (currentScore * 0.5) + (58 * 0.5);
                }
            } else if (currentScore < 100 && newScore >= 100) {
                score = score - currentScore + 116;
                if (player === captain) {
                    score = score - currentScore + 116;
                }
                if (player === vice_captain) {
                    score = score - (currentScore * 0.5) + (116 * 0.5);
                }
            } else {
                score += points;
                if (player === captain) {
                    score += points;
                }
                if (player === vice_captain) {
                    score += 0.5 * points;
                }
            }
        }
        // Update fantasy score display
        $('#score').text(score.toFixed(1));
        $('#fantasy-score').html(`
            <div class="fantasy-score-section yellow-section">
                <h4>Fantasy Points</h4>
                <h3>${score.toFixed(1)}</h3>
            </div>
        `);
    }
}

// Update the solve function to remove duplicate scoreboard update
function solve(temp) {
    $('#bat-team').text(main_data.innings[1]['2nd innings'].team);
    $('#field-team').text(main_data.innings[0]['1st innings'].team);
    
    // Reset stats for second innings
    batsmanScores.clear();
    bowlerStats.clear();
    teamTotal = 0;
    extrasTotal = 0;
    outPlayers.clear();
    remainingPlayers = new Set([...team]);
    
    let j = 0;
    
    // Initialize empty scoreboard for second innings
    updateScoreboard(
        { over: '0.0', score: { batsman: '-', bowler: '-', non_striker: '-', runs: { batsman: 0, extras: 0, total: 0 } } },
        0, 0, 0
    );
    
    // Update status to show second innings is starting
    updateMatchStatus('Second Innings', {
        phase: 'Match In Progress',
        teams: `${main_data.innings[1]['2nd innings'].team} Batting`,
        score: '0/0',
        over: '0.0',
        lastAction: 'Second innings about to begin'
    });
    
    const aa = setInterval(() => {
        let ball = Object.keys(temp[j])[0];
        let b = {
            over: Object.keys(temp[j])[0],
            score: temp[j][ball]
        };

        // Update batsman and bowler stats
        const batsmanTotal = updateBatsmanScore(b.score.batsman, parseFloat(b.score.runs.batsman) || 0);
        const bowlerTotal = updateBowlerStats(b.score.bowler, parseFloat(b.score.runs.total) || 0);
        const teamTotalScore = updateTeamScore(b.score.runs.batsman, b.score.runs.extras);

        // Update scoreboard
        updateScoreboard(b, batsmanTotal, bowlerTotal, teamTotalScore);

        // Update match status
        let lastAction = b.score.wicket 
            ? `${b.score.bowler} takes wicket of ${b.score.batsman}`
            : `${b.score.batsman} scores ${b.score.runs.batsman} runs${b.score.runs.extras > 0 ? ` + ${b.score.runs.extras} extras` : ''}`;
            
        updateMatchStatus('Second Innings', {
            phase: 'Match In Progress',
            teams: `${main_data.innings[1]['2nd innings'].team} Batting`,
            score: `${teamTotalScore}/${outPlayers.size}`,
            over: b.over,
            lastAction: lastAction
        });

        // Update notification
        updateNotification(b.score.wicket 
            ? `${b.score.bowler} takes wicket of ${b.score.batsman}`
            : `${b.score.batsman} hits ${b.score.runs.batsman} runs`
        );

        // Update fantasy points for batsman
        if (team.has(b.score.batsman)) {
            updateFantasyPoints(b.score.batsman, parseFloat(b.score.runs.batsman) || 0);
        }

        // Update fantasy points for wickets
        if (b.score.wicket && team.has(b.score.bowler)) {
            const wicketType = b.score.wicket.kind;
            const wicketPoints = parseFloat(bowlerpoint[wicketType]) || 0;
            updateFantasyPoints(b.score.bowler, wicketPoints, true);
            updatePlayerStatus(b.score.batsman, b.score.bowler, true);
        }

        if (j >= (temp.length - 1)) {
            clearInterval(aa);
            window.alert('Match over!');
            updateMatchStatus('Match Complete', {
                phase: 'Final Result',
                teams: `${main_data.innings[0]['1st innings'].team} vs ${main_data.innings[1]['2nd innings'].team}`,
                score: `${teamTotalScore}/${outPlayers.size}`,
                lastAction: `Final Fantasy Points: ${score.toFixed(1)}`
            });

            // Update final scores
            const top = parseFloat(window.sessionStorage.top) || 0;
            const total = top + score;
            const userId = window.sessionStorage.user;
            const matchName = `${$('#first-team').text()} vs ${$('#second-team').text()}`;

            // Save match data
            $.post('/s/t', { total, user: userId }, (data) => {
                console.log('Updated total score:', data);
            });

            $.post('/s', {
                match: matchName,
                curr: score,
                user: userId
            }, (data) => {
                console.log('Match data saved:', data);
            });
        } else {
            j++;
        }
    }, 5000);
}

// Update CSS for better visibility and animations
const style = document.createElement('style');
style.textContent = `
    .yellow-section {
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }
    .team-score-section {
        background-color: #fff3cd;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
        margin-bottom: 15px;
        border: 1px solid #ffeeba;
    }
    .fantasy-score-section {
        background-color: #fff3cd;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
        margin-bottom: 15px;
        border: 1px solid #ffeeba;
    }
    .fantasy-score-section h3 {
        color: #856404;
        font-size: 24px;
        margin: 10px 0;
    }
    .fantasy-score-section h4 {
        color: #666;
        margin-bottom: 5px;
    }
    .ball-details {
        margin-top: 10px;
        padding: 8px;
        background-color: rgba(255,255,255,0.6);
        border-radius: 3px;
        font-size: 14px;
        border: 1px solid rgba(0,0,0,0.1);
    }
    .team-score-section h3 {
        color: #856404;
        margin-bottom: 5px;
    }
    .team-score-section small {
        color: #666;
    }
    .status-section {
        transition: all 0.3s ease;
    }
    .scoreboard-section {
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
        padding: 20px;
        border-radius: 5px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }
    .scoreboard-section h4 {
        color: #856404;
        margin: 0;
    }
    .current-batsman {
        background-color: rgba(255,255,255,0.4);
        padding: 5px;
        border-radius: 3px;
        transition: background-color 0.3s ease;
    }
    .current-over-details {
        background-color: rgba(255,255,255,0.4);
        border-radius: 5px;
        border: 1px solid rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }
    .current-over-details strong {
        color: #856404;
        font-size: 0.9em;
    }
    .current-over-details div {
        font-size: 1.2em;
        font-weight: bold;
        margin-top: 5px;
    }
    .score-update {
        animation: highlight 1s ease-in-out;
    }
    @keyframes highlight {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); background-color: #fff9e6; }
        100% { transform: scale(1); }
    }
    .notification {
        padding: 10px;
        background-color: #fff3cd;
        border-radius: 5px;
        margin: 10px 0;
        text-align: center;
        animation: slideIn 0.5s ease-out;
    }
    @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .player-row {
        padding: 8px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        transition: background-color 0.3s ease;
    }
    .player-row:hover {
        background-color: rgba(255,255,255,0.4);
    }
    .out-player {
        color: #dc3545;
    }
    .active-player {
        color: #28a745;
    }
    .value-change {
        animation: pulse 0.5s ease-in-out;
    }
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    .players-section {
        padding: 15px;
        margin-bottom: 20px;
    }
    .section-title {
        color: #856404;
        font-weight: bold;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ffeeba;
    }
    .player-row {
        padding: 8px;
        margin: 5px 0;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    .out-player {
        background-color: rgba(220, 53, 69, 0.1);
        color: #dc3545;
    }
    .active-player {
        background-color: rgba(40, 167, 69, 0.1);
        color: #28a745;
    }
    .player-name {
        font-weight: bold;
        margin-right: 8px;
    }
    .player-status {
        font-size: 0.8em;
        padding: 2px 6px;
        border-radius: 3px;
    }
    .out-player .player-status {
        background-color: rgba(220, 53, 69, 0.2);
    }
    .active-player .player-status {
        background-color: rgba(40, 167, 69, 0.2);
    }
    .player-score {
        font-weight: bold;
        font-size: 1.1em;
    }
    .out-player:hover {
        background-color: rgba(220, 53, 69, 0.15);
    }
    .active-player:hover {
        background-color: rgba(40, 167, 69, 0.15);
    }
`;
document.head.appendChild(style);

// Initialize fantasy score section in the HTML
$(document).ready(() => {
    $('#fantasy-score').html(`
        <div class="fantasy-score-section yellow-section">
            <h4>Fantasy Points</h4>
            <h3>0.0</h3>
        </div>
    `);
});

