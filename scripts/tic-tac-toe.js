class TicTacToe {
  constructor() {
    this.numSquares = NUM_SQUARES;
    this.currentPlayer = 'x';
    this.winner = false;
    this.selectedSquares = { x: [], o: [] };
  }

  init = () => {
    const board = document.querySelector('.board');
    board.classList.add('tic-tac-toe');
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
    this.winner = this.checkWin(e);
    if (!this.winner) {
      this.changePlayer();
    } else {
      this.handleWinner();
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
    const setsByNumber = WINS[e.target.id];
    const reducedSets = setsByNumber.reduce((acc, curr) => {
      const filteredSet = curr.filter(num => {
        return this.selectedSquares[this.currentPlayer].includes(num);
      })
      if (filteredSet.length === 3) {
        acc = curr;
      }
      return acc;
    }, []);
    return reducedSets.length;
  }

  changePlayer = () => {
    this.currentPlayer = this.currentPlayer === 'x' ? 'o' : 'x';
  }

  handleWinner = () => {
    const squares = document.querySelectorAll('.square')
    squares.forEach(square => (
      square.removeEventListener('click', this.onUserTurn)
    ))
  }
}
