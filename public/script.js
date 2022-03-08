// login
const loginDiv = document.createElement('div');
document.body.appendChild(loginDiv);

const emailDiv = document.createElement('div');
loginDiv.appendChild(emailDiv);
const emailLabel = document.createElement('label');
emailLabel.setAttribute('for', 'email');
emailLabel.textContent = 'email: ';
emailDiv.appendChild(emailLabel);
const emailInput = document.createElement('input');
emailInput.setAttribute('id', 'email');
emailDiv.appendChild(emailInput);

const passwordDiv = document.createElement('div');
loginDiv.appendChild(passwordDiv);
const passwordLabel = document.createElement('label');
passwordLabel.setAttribute('for', 'password');
passwordLabel.textContent = 'password: ';
passwordDiv.appendChild(passwordLabel);
const passwordInput = document.createElement('input');
passwordInput.setAttribute('id', 'password');
passwordInput.setAttribute('type', 'password')
passwordDiv.appendChild(passwordInput);

const loginBtn = document.createElement('button');
loginBtn.setAttribute('type', 'submit');
loginBtn.textContent = 'log in';
loginDiv.appendChild(loginBtn);

const userDiv = document.createElement('div');

// game elements

const gameContainer = document.querySelector('#game-container');
const cardDiv = document.createElement('div');
const buttonDiv = document.createElement('div');
const dealBtn = document.createElement('button');
const refreshBtn = document.createElement('button');
dealBtn.innerText = 'Deal';
refreshBtn.innerText = 'Refresh';
dealBtn.style.margin = '50px';
refreshBtn.style.margin = '50px';
const startGameBtn = document.createElement('button');

const playerOneCards = document.createElement('div');
const playerTwoCards = document.createElement('div');
playerOneCards.style.display = 'inline-block';
playerTwoCards.style.display = 'inline-block';
playerOneCards.style.margin = '50px';
playerTwoCards.style.margin = '50px';
cardDiv.appendChild(playerOneCards);
cardDiv.appendChild(playerTwoCards);

const resultDiv = document.createElement('div');
const player1Result = document.createElement('div');
const player2Result = document.createElement('div');
player1Result.style.display = 'inline-block';
player2Result.style.display = 'inline-block';
player1Result.style.margin = '50px';
player2Result.style.margin = '50px';
resultDiv.appendChild(player1Result);
resultDiv.appendChild(player2Result)

// login button functionality
loginBtn.addEventListener('click', () => {
  axios
    .post('/login', {
      email: document.querySelector('#email').value,
      password: document.querySelector('#password').value,
    })
    .then((response) => {
      console.log(response.data);
      loginDiv.remove();

      const dashboardDiv = document.createElement('div');
      gameContainer.appendChild(dashboardDiv);
      dashboardDiv.appendChild(userDiv);

      // create game btn

      axios
        .get('/user')
        .then((response1) => {
          console.log(response1.data);
          userDiv.innerText = `Logged in as: ${response1.data.user.email}`;
          // manipulate DOM, set up create game button
          startGameBtn.addEventListener('click', createGame);
          startGameBtn.innerText = 'Start Game';
          gameContainer.appendChild(startGameBtn);

        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
});

// global value that holds info about the current hand.
let currentGame = null; 


// DOM manipulation function that displays the player's current hand.
const runGame = function ({ playerHand, result, score }) {
  // manipulate DOM

  player1Result.innerHTML = `${result}<br>player 1: ${score.player1}<br>player 2: ${score.player2}`;

  playerOneCards.innerText = `
    ${playerHand[0].name}
    of
    ${playerHand[0].suit}
  `;

  playerTwoCards.innerText = `
    ${playerHand[1].name}
    of
    ${playerHand[1].suit}
  `;
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const createGame = function () {
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;
      gameContainer.appendChild(resultDiv);
      gameContainer.appendChild(cardDiv);
      // display it out to the user
      runGame(currentGame);

      // for this current game, create a button that will allow the user to
      // manipulate the deck that is on the DB.
      // Create a button for it.

      dealBtn.addEventListener('click', dealCards);
      buttonDiv.appendChild(dealBtn);
      buttonDiv.appendChild(refreshBtn);
      gameContainer.appendChild(buttonDiv);
      startGameBtn.remove();
  
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};


