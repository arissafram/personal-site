window.addEventListener('load', () => {
  const game = new TicTacToe();
  game.init();
});

class TicTacToe {
  constructor() {
    this.numSquares = 9;
    this.currentPlayer = 'x';
    this.winner = false;
    this.selectedSquares = {
      x: [],
      o: [],
    }
  }

  init() {
    const board = document.querySelector('.board');
    let i = 0;
    while (this.numSquares > i) {
      i++
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add('free');
      square.setAttribute('id', i);
      square.addEventListener('click', this.onUserTurn);
      board.append(square);
    }
  }

  onUserTurn = (e) => {
    this.selectSquare(e);
    this.checkWin(e);
    if (!this.winner) {
      this.changePlayer();
    } else {
      this.handleWinner()
    }
  }

  selectSquare = (e) => {
    if (e.target.classList.contains('free')) {
      this.selectedSquares[this.currentPlayer].push(parseFloat(e.target.id));
      e.target.innerText = this.currentPlayer;
      e.target.classList.remove('free');
    }
  }

  checkWin = (e) => {
    const wins = {
      1: [[1,2,3], [1,4,7], [1,5,9]],
      2: [[1,2,3], [2,5,8]],
      3: [[1,2,3], [3,5,7], [3,6,9]],
      4: [[1,4,7], [4,5,6]],
      5: [[4,5,6], [2,5,8]],
      6: [[3,6,9], [4,5,6]],
      7: [[1,4,7], [7,8,9], [3,5,7]],
      8: [[7,8,9], [2,5,8]],
      9: [[7,8,9], [1,5,9], [3,6,9]]
    }

    // get the list of sets by id
    const setsByNumber = wins[e.target.id];
    // console.log(this.selectedSquares)

    // iterate over that list, need to check three diff items
    let isWin = false;
    setsByNumber.forEach(set => {
      let counter = 0;
      set.forEach(num => {
        // on each item, i want to see if every number exists in the selectedSquares list
        if (this.selectedSquares[this.currentPlayer].includes(num)) {
          counter++
          if (counter === 3) {
            isWin = true;
          }
        }
      })
    })

    return isWin;
  }

  changePlayer = () => {
    this.currentPlayer = this.currentPlayer === 'x' ? 'o' : 'x';
  }
}
