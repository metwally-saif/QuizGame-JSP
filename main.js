import './style.css'
import qs from "./questions.js";


let players = [];
let currentPlayerIndex = 0;
let currentQuestionIndex = 0;
let timer;
const timePerQuestion = 30;
let questions;
var answer = '';

function startGame() {
  const numPlayers = document.getElementById('numPlayers').value;

  if (numPlayers <= 0 || numPlayers > 4) {
    document.getElementById('invalidPlayersMessage').style.display = 'block';
    return;
  } else {
    document.getElementById('invalidPlayersMessage').style.display = 'none';
  }  

  // Generate player information dynamically
  let colors = ["green", "blue", "red", "white"];
  players = [];
  for (let i = 1; i <= numPlayers; i++) {
      players.push({ name: `Player ${i}`, color: `${colors[i - 1]}` , score: 0, answers:[] });
  }

  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('subject').style.display = 'block';
}

function selectSubject(subject) {
  loadQuestions(subject);
  document.getElementById('subject').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';
  startGameRound();
}

function goBack() {
  document.getElementById('subject').style.display = 'none';
  document.getElementById('setupScreen').style.display = 'block';
}

async function loadQuestions(sub) {
  switch (sub) {
    case 'html':
      questions = getRandomElements(qs.html, 10);
      return;

    case 'css':
      questions = getRandomElements(qs.css, 10);
      return;

    case 'js':
      questions = getRandomElements(qs.js, 10);
      return;

    default:
      console.error('Invalid subject:', sub);
      return [];
  }
}

function getRandomElements(array, numElements) {
  if (numElements >= array.length) {
    return array.slice();
  }

  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray.slice(0, numElements);
}

function startGameRound() {
  displayQuestion();
  displayPlayers();
  displayCurrentPlayerTurn();
  startTimer();
}

function displayQuestion() {
  const currentQuestion = questions[currentQuestionIndex]; // Adjust for other categories
  const questionContainer = document.getElementById("questionContainer");
  const optionsContainer = document.getElementById("options");

  // Display question text
  questionContainer.innerHTML = `<h3>${currentQuestion.question}</h3>`;

  // Display options
  optionsContainer.innerHTML = "";
  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.id = index;
    button.addEventListener("click", () => selectOption(index));
    optionsContainer.appendChild(button);
  });
}

function displayPlayers() {
  const playersContainer = document.getElementById("playersContainer");
  playersContainer.innerHTML = players.map(player => `<div class="player" style="color: ${player.color}">${player.name}</div>`).join("");
}

function displayCurrentPlayerTurn() {
  const currentPlayer = players[currentPlayerIndex];
  const currentPlayerNameElement = document.getElementById("currentPlayerName");
  currentPlayerNameElement.textContent = `It's ${currentPlayer.name}'s turn`;
  currentPlayerNameElement.style.color = currentPlayer.color;
}

function startTimer() {
  clearInterval(timer); // Clear any existing interval

  let secondsLeft = timePerQuestion;
  const timeLeftElement = document.getElementById("timeLeft");

  timer = setInterval(() => {
    timeLeftElement.textContent = secondsLeft;

    if (secondsLeft === 0) {
      answer = '';
      continueGame();
    }

    secondsLeft--;
  }, 1000);
}

function selectOption(optionIndex) {
  const selectedPlayer = players[currentPlayerIndex];
  const selectedButton = document.querySelector(`#options button:nth-child(${optionIndex + 1})`);

  // Highlight selected option with player color
  selectedButton.classList.add(selectedPlayer.color);
  answer = selectedButton.innerHTML;

  // Disable other options
  document.querySelectorAll("#options button").forEach(button => {
    if (button !== selectedButton) {
      button.disabled = true;
    }
  });

  // Enable continue button
  document.getElementById("continueBtn").disabled = false;
}

function endTurn() {
  clearInterval(timer);
  updateScores()
  resetOptions();
  nextPlayerTurn();
  startTimer();
  displayCurrentPlayerTurn();
  document.getElementById("continueBtn").disabled = true;
}

function resetOptions() {
  document.querySelectorAll("#options button").forEach(button => {
    button.disabled = false;
    button.classList.remove(...players.map(player => player.color));
  });
}

function updateScores() {
  const currentQuestion = questions[currentQuestionIndex]; // Adjust for other categories
  const selectedPlayer = players[currentPlayerIndex];
  selectedPlayer.answers.push(answer)

  if (answer == currentQuestion.correctAnswer) {
    selectedPlayer.score += 10;
  }
}

function nextPlayerTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
}

function continueGame() {
  if (currentPlayerIndex != players.length -1) {
    endTurn()
    return
  }
  endTurn();
  currentQuestionIndex++;
  currentPlayerIndex = 0;

  if (currentQuestionIndex < questions.length) {
    displayQuestion();
    resetOptions();
    displayCurrentPlayerTurn();
    startTimer();
    document.getElementById("continueBtn").disabled = true;
  } else {
    endGame();
  }
}

function endGame() {
  clearInterval(timer);
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("endGameScreen").style.display = "block";
  console.log(players)

  // Determine winners
  const maxScore = Math.max(...players.map(player => player.score));
  const winners = players.filter(player => player.score === maxScore);

  // Display winners
  const winnersContainer = document.getElementById("winners");
  if (winners.length === 1) {
    winnersContainer.innerHTML = `<p>${winners[0].name} is the winner with ${winners[0].score} points!</p>`;
  } else {
    winnersContainer.innerHTML = `<p>It's a tie! Winners with ${maxScore} points:</p>`;
    winners.forEach(winner => {
      winnersContainer.innerHTML += `<p>${winner.name}</p>`;
    });
  }

  // Display ordered list of all players' positions and points
  const playersList = players
    .sort((a, b) => b.score - a.score)
    .map((player, index) => `<li>${player.name}: ${player.score} points</li>`)
    .join("");
  
  winnersContainer.innerHTML += `<ol>${playersList}</ol>`;
}

function startNewGame() {
  // Reset game state
  document.getElementById("setupScreen").style.display = "block";
  document.getElementById("endGameScreen").style.display = "none";
  currentQuestionIndex = 0;
  currentPlayerIndex = 0;
  players.forEach(player => {
    player.score = 0;
    player.selectedButtonId = null;
  });

}

function reviewAnswers() {
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("endGameScreen").style.display = "none";
  document.getElementById("reviewScreen").style.display = "block";

  const reviewContainer = document.getElementById("reviewContainer");
  reviewContainer.innerHTML = "";

  questions.forEach((question, questionIndex) => {
    reviewContainer.innerHTML += `<h3>Question ${questionIndex + 1}: ${question.question}</h3><h4>Correct Answer: ${question.correctAnswer}</h4>`;
    console.log(questionIndex)
      players.forEach((player, playerIndex) => {
        console.log(player)
        const playerAnswer = player.answers[questionIndex];
  
        const answerDiv = document.createElement("div");
        answerDiv.classList.add(`${player.color}`);

  
        answerDiv.innerHTML = `Player ${playerIndex + 1}'s Answer: ${playerAnswer}`;
        reviewContainer.appendChild(answerDiv);
      });

  });
}



document.getElementById('startNewGame').addEventListener('click', startGame);
document.getElementById('selectHTML').addEventListener('click', () => selectSubject('html'));
document.getElementById('selectCSS').addEventListener('click', () => selectSubject('css'));
document.getElementById('selectJS').addEventListener('click',  () => selectSubject('js'));
document.getElementById('goBack').addEventListener('click', goBack);
document.getElementById('continueBtn').addEventListener('click', continueGame);
document.getElementById('startNewGameBtn').addEventListener('click', startNewGame);
document.getElementById('reviewAnswersBtn').addEventListener('click', reviewAnswers);
document.getElementById('backToGameBtn').addEventListener('click', startNewGame);

