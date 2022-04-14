const $guesses = $("#guesses");
const $total = $("#total");
const $start = $("#start");
const $stats = $("#stats");
const $alertMsg = $("#alert-msg")
const $timer = $('#timer');
let timeoutId;
let interId;
const gameTime = 59;
let timePassed = 0;
let timeRemaining = gameTime;
const $guessForm = $("#guess-form");
const $boggleBoard = $("#boggle-board")
$start.on("click", startFunction);
$guessForm.on("submit", handleSubmit);

const scoresArr = [];
const guessesArr = [];
let total = 0;

function startFunction() {
    //set timer to display score after 60 seconds
    $start.hide();
    $guessForm.show();
    interId = setInterval(function () {
        timeRemaining = gameTime - timePassed;
        timePassed = timePassed += 1;
        $timer.html(`${timerFunction(timeRemaining)}:00`);
      }, 1000)
    timeoutId = setTimeout(async function () {
        $timer.hide();
        $alertMsg.html(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Time's up!</strong> Game over!
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`);
        $guessForm.hide();
        finalScore();
        $stats.show();
        clearInterval(interId);
      }, 60000)
};

async function handleSubmit(evt) {
    evt.preventDefault();
    // Get input value
    let guess = $("#guess").val();
    $guessForm.trigger("reset");

    // Make an ajax request to send guess to server
    const res = await axios({
        url: '/check-validity',
        method: "GET",
        params: { guess: guess },
    });

    //display received result to user
    if (res.data.result === "not-word") {
        $alertMsg.html(`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> ${guess.toUpperCase()} is not a valid word.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);
    } else if (res.data.result === "not-on-board") {
        $alertMsg.html(`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> ${guess.toUpperCase()} is not on the board.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);
    } else {
        if (!guessesArr.includes(guess)) {
            scoresArr.push(guess.length);
            guessesArr.push(guess);
            displayScores(guess);
            $alertMsg.html(`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
            Your guess is correct!
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);
        }
        else {
            $alertMsg.html(`
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> Submitted word cannot be submitted again.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);
        }
    }
};

//display scores on UI
function displayScores(guess) {
    $guesses.show();
    let scoreTotal = scoresArr.reduce((a, b) => a + b, 0)
    $(`<p class="guessed-word">GUESS ${guessesArr.length}: ${guess.toUpperCase()}</p>`).appendTo($guesses);
    $total.text(`TOTAL SCORE: ${scoreTotal}`)
};

//Send post request for score record
async function finalScore() {
    let scoreTotal = scoresArr.reduce((a, b) => a + b, 0)
    const res = await axios.post("/total-score", { score: scoreTotal });
    if (res.data.highestScore) {
        $alertMsg.html(`
            <div class="alert alert-info alert-dismissible fade show" role="alert">
            <strong>Congrats!</strong> New highest score is now ${scoreTotal}.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`);
    }
}

function timerFunction(time) {
    let seconds = time % 60;
    return seconds;
  }
