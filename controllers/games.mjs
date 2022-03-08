/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function initGamesController(db) {

  let player1Score = 0;
  let player2Score = 0;
  let result;

  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());
    const player1Card = cardDeck.pop();
    const player2Card = cardDeck.pop();
    const playerHand = [player1Card, player2Card];

    if (player1Card.rank > player2Card.rank) {
      result = 'Player 1 wins!!';
      player1Score += 1;
    } else if (player1Card.rank < player2Card.rank) {
      result = 'Player 2 wins!!';
      player2Score += 1;
    } else {
      result = 'Draw';
    }

    const newGame = {
      gameState: {
        cardDeck,
        playerHand,
        result,
        score: {
          player1: player1Score,
          player2: player2Score
        },
      },
    };

    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        result: game.gameState.result,
        score: game.gameState.score,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      // make changes to the object
      const player1Card = game.gameState.cardDeck.pop();
      const player2Card = game.gameState.cardDeck.pop();
      const playerHand = [player1Card, player2Card];

      if (player1Card.rank > player2Card.rank) {
        game.gameState.result = 'Player 1 wins!!';
        game.gameState.score.player1 += 1;
      } else if (player1Card.rank < player2Card.rank) {
        game.gameState.result = 'Player 2 wins!!';
        game.gameState.score.player2 += 1;
      } else {
        game.gameState.result = 'Draw';
      }

      // update the game with the new info
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          playerHand,
          result: game.gameState.result,
          score: {
            player1: game.gameState.score.player1,
            player2: game.gameState.score.player2
          },
        },

      });

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        result: game.gameState.result,
        score: game.gameState.score,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
  };
}
