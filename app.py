from boggle import Boggle
from flask import Flask, render_template, session, request, jsonify
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = "sec_ret$0987"
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

debug = DebugToolbarExtension(app)

boggle_game = Boggle()

@app.route('/')
def home():
    """Display board"""
    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get("highscore", 0)
    played = session.get("played", 0)
    return render_template("home.html", board=board, highscore=highscore, played=played)

@app.route("/check-validity")
def check_validity():
    """Check validity of word"""
    guess = request.args["guess"]
    board = session["board"]
    response = boggle_game.check_valid_word(board, guess)
    return jsonify({'result': response})

@app.route("/total-score", methods=["POST"])
def post_score():
    """Track of how many times user played and the highest score"""
    score = request.json["score"]
    highscore = session.get("highscore", 0)
    played = session.get("played", 0)
    session['played'] = played + 1
    session['highscore'] = max(score, highscore)
    return jsonify(highestScore = score > highscore)