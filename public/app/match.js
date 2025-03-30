var main_data;
// const playercredit=require('/images/playercredit.json')
// const data=JSON.parse(data)
// const playerSearch=require('/images/player.json')
var credit = parseInt($('#credit').text())
var team = new Set();

$(() => {
    $.get('/m', (data) => {
        //console.log(data)
        const inning1 = data.innings[0]["1st innings"]["deliveries"];
        const inning2 = data.innings[1]["2nd innings"]["deliveries"];
        main_data = data;
        var players = solve(inning1, inning2);
        $('#first-team').text(data.info.teams[0])
        $('#second-team').text(data.info.teams[1])


        $.get('/m/mm', (data) => {
            playerdata = data;
            //console.log(data);
            const playersearch = playerdata.player;
            const playercredit = playerdata.credit;
            console.log(playercredit);

            //console.log(playersearch)

            while (players.player1.size < 11) {
                for (p of playersearch) {
                    if (!players.player1.has(p.Players)) {
                        players.player1.add(p.Players)
                    }
                    if (players.player1.size >= 11) { break; }
                }
            }
            while (players.player2.size < 11) {
                for (p of playersearch) {
                    if (!players.player2.has(p.Players) && !players.player1.has(p.Players)) {
                        players.player2.add(p.Players)
                    }
                    if (players.player2.size >= 11) { break; }
                }
            }
            //console.log(players.player1)
            $('#first-team-player').empty()
            for (p of players.player1) {
                console.log(playercredit[p])
                $('#first-team-player').append(`
                <li class="added_player" onclick=getname(this) data-name="${p}" data-credit="${playercredit[p]}">${p}<span class="float-end">${playercredit[p]}</span></li>
            `)
            }
            console.log('sdafasdf', players.player1.size)
            $('#second-team-player').empty()
            for (p of players.player2) {
                $('#second-team-player').append(`
            <li class="added_player" onclick=getname(this)  data-name="${p}" data-credit="${playercredit[p]}">${p}<span class="float-end">${playercredit[p]}</span></li>
            `)
            }

            afterdata();

        })
        // console.log(main_data)
    })


})



var v=0;
var captain="";
var vice_captain="";


function getname(name) {
    console.log(credit)
    console.log($(name).data('name'));
    console.log($(name).data('credit'));

    // If player is already selected, remove them
    if(team.has($(name).data('name'))) {
        team.delete($(name).data('name'));
        credit += parseFloat($(name).data('credit'));
        $('#credit').text(`${credit}`);
        
        // Remove from selected players list
        $(`#selected_player li[data-name="${$(name).data('name')}"]`).remove();
        
        // Reset player styling
        $(name).removeClass("captain vice-captain add_player_click selected");
        
        // Reset captain/vice-captain if needed
        if($(name).data('name') === captain) {
            captain = "";
            v = 0;
        } else if($(name).data('name') === vice_captain) {
            vice_captain = "";
            v = 1;
        }
        
        return;
    }

    if (team.size < 11 && credit >= 0) {
        if (credit - $(name).data('credit') < 0) {
            window.alert('Not enough credits')
        }
        else {
            if(!team.has($(name).data('name'))){
                if(v==0){
                    captain=$(name).data('name');
                    v++;
                    team.add($(name).data('name'));
                    credit -= $(name).data('credit');
                    $('#credit').text(`${credit}`)
                    $('#selected_player').append(`
                        <li class="team_members" data-name="${$(name).data('name')}" data-pos="captain">${$(name).data('name')} <span>(C)</span></li>
                    `);
                    $(name).removeClass("vice-captain add_player_click").addClass("captain selected");
                }
                else if(v==1){
                    v=-1;
                    vice_captain=$(name).data('name');
                    team.add($(name).data('name'));
                    credit -= $(name).data('credit');
                    $('#credit').text(`${credit}`)
                    $('#selected_player').append(`
                        <li class="team_members" data-name="${$(name).data('name')}" data-pos="vice-captain">${$(name).data('name')} <span>(VC)</span></li>
                    `);
                    $(name).removeClass("captain add_player_click").addClass("vice-captain selected");
                }
                else{
                    team.add($(name).data('name'));
                    credit -= $(name).data('credit');
                    $('#credit').text(`${credit}`)
                    $('#selected_player').append(`
                        <li class="team_members" data-name="${$(name).data('name')}" data-pos="member">${$(name).data('name')}</li>
                    `);
                    $(name).removeClass("captain vice-captain").addClass("add_player_click selected");
                    if(team.size==11){
                        window.alert('Team completed! Click Start Match when ready.')
                    }
                }
            }
        }
    } else if(team.size >= 11) {
        window.alert('Team is full! Remove players to make changes.')
    }
    console.log(team);
}

// $('.added_player').click(()=>{
//     console.log('added clicked')
//     $(this).toggleClass('active');
// });


async function afterdata() {
    console.log(main_data)
    $('#start-match').click(() => {
        if(team.size !== 11) {
            window.alert('Please select 11 players before starting the match!');
            return;
        }
        // Lock all selections when match starts
        $('.added_player').addClass('locked').removeClass('selected');
        $('.team_members').addClass('locked');
        
        $('#player').empty();
        $('#player-btn').empty();
        $('#player').load('/html/scoreboard.html');
    })
   

}



function solve(temp1, temp2) {

    let play1 = new Set();
    let play2 = new Set();

    for (let j = 0; j < temp1.length; j++) {

        let ball = Object.keys(temp1[j])[0];
        //console.log(ball)

        let b = {

            over: Object.keys(temp1[j])[0],

            score: temp1[j][ball]

        }
        //console.log(b)
        play1.add(b.score.batsman);
        play2.add(b.score.bowler)


    }

    for (let j = 0; j < temp2.length; j++) {

        let ball = Object.keys(temp2[j])[0];
        //console.log(ball)

        let b = {

            over: Object.keys(temp2[j])[0],

            score: temp2[j][ball]

        }
        //console.log(b)
        play2.add(b.score.batsman);
        play1.add(b.score.bowler)

    }

    return {
        "player1": play1,
        "player2": play2
    }
}
