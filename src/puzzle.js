class Puzzle {
  constructor() {
    this.currentImageEl = null;
    this.imageDropId = '';
    this.totalImages = 9;
    this.offsetX = null;
    this.offsetY = null;
    this.zIndex = 1;

    window.addEventListener('resize', this.movePiecesIntoView)
  }

   init = () => {
    const body = document.querySelector('body');
    this.board = document.querySelector('.board');
    body.addEventListener('drop', this.onDrop);
    body.addEventListener('dragover', this.onDragover);

    this.makeImageDropContainer();
    this.makePuzzlePieces();
  }

  makeImageDropContainer = () => {
    this.imageDropContainer = document.createElement('div');
    this.imageDropContainer.classList.add('image-drop-container');
    this.imageDropContainer.setAttribute('id', 'drop-container');

    let i = 0;
    while (this.totalImages > i) {
      i++
      const imageDrop = document.createElement('div');
      imageDrop.classList.add('image-drop');
      imageDrop.setAttribute('id', `${i}-drop`);
      imageDrop.addEventListener('dragenter', this.onDragEnter);
      this.imageDropContainer.append(imageDrop);
    }

    this.board.appendChild(this.imageDropContainer);
  }

  makePuzzlePieces = () => {
    let i = 0;
    while (this.totalImages > i) {
      i++
      const piece = document.createElement('button');
      piece.classList.add('piece');
      piece.style.zIndex = 1;
      piece.setAttribute('id', i);
      piece.setAttribute('draggable', true);

      piece.addEventListener('dragstart', this.onDragstart);
      piece.addEventListener('drop', this.onDrop);
      piece.addEventListener('dragover', this.onDragover);
      piece.addEventListener('keydown', this.onKeyboardMove);
      piece.addEventListener('focus', () => this.currentImageEl = e.target);
      piece.addEventListener('blur', () => this.currentImageEl = null);

      piece.style.top = `${this.getRandomPositionString(true)}px`;
      piece.style.left = `${this.getRandomPositionString(false)}px`;
      piece.style.backgroundImage = `url('./public/puzzle_${i}.jpg')`;

      this.board.append(piece);
    }
  }

  onDragstart = (e) => {
    this.currentImageEl = e.target;
    this.offsetX = e.clientX - e.target.getBoundingClientRect().left;
    this.offsetY = e.clientY - e.target.getBoundingClientRect().top;
  }

  onDragover = (e) => {
    e.preventDefault();
    this.imageDropId = parseFloat(e.target.id).toString();
  };

  onDrop = (e) => {
    e.preventDefault();
    const x = e.clientX - this.offsetX - this.board.getBoundingClientRect().left;
    const y = e.clientY - this.offsetY - this.board.getBoundingClientRect().top;

    this.currentImageEl.style.left = `${x}px`;
    this.currentImageEl.style.top = `${y}px`;

    this.zIndex += 1;
    this.currentImageEl.style.zIndex = this.zIndex;

    if (!e.target.classList.contains('piece')) {
      if (this.currentImageEl.id === this.imageDropId) {
        this.currentImageEl.setAttribute('draggable', false);
        this.currentImageEl.style.zIndex = 0;
        e.target.appendChild(this.currentImageEl);
        this.snapIntoPlace(e);
        this.checkWin();
      }
    }
  }

  snapIntoPlace = () => {
    this.currentImageEl.style.left = '0px';
    this.currentImageEl.style.top = '0px';
  }

  getRandomPositionString = (isHeight) => {
    const boardHeight = parseFloat(getComputedStyle(this.board).height) - 50;
    const boardWidth = parseFloat(getComputedStyle(this.board).width);
    const num = Math.floor(Math.random() * (isHeight ? boardHeight : boardWidth));
    return num.toString();
  }

  movePiecesIntoView = () => {
    const pieces = document.querySelectorAll('.piece')
    pieces.forEach(piece => {
      const currentX = piece.getBoundingClientRect().left
      if (currentX > window.innerWidth) {
        piece.style.left = `${this.getRandomPositionString(false)}px`;
      }
    })
  }

  onKeyboardMove = (e) => {
    if ([37, 38, 39, 40].includes(e.which)) {
      console.log('on keyboard move', e.which)
      this.currentImageEl = e.target;

      const x = parseFloat(this.currentImageEl.style.left);
      const y = parseFloat(this.currentImageEl.style.top);

      switch(e.which) {
        case 37:
          this.currentImageEl.style.left = `${x - 5}px`;
          break;
        case 38:
          this.currentImageEl.style.top = `${y - 5}px`;
          break;
        case 39:
          this.currentImageEl.style.left = `${x + 5}px`;
          break;
        case 40:
          this.currentImageEl.style.top = `${y + 5}px`;
          break;
      }
    }
  }
}
