class Puzzle {
  constructor() {
    this.totalImages = 9;
    // this.imageDropId = '';
    // this.currentImageEl = null;
    // this.piecesContainer = null;
    // this.imageDropContainer = null;
    this.zIndex = 1;
    this.board = null;
    this.imageDropContainer = null;

    this.offsetX = null;
    this.offsetY = null;
  }

   init = () => {
    this.board = document.querySelector('.board');
    this.makeImageDropContainer();
    this.makePuzzlePieces();
    this.board.addEventListener('drop', this.onDrop);
    this.board.addEventListener('dragover', this.onDragover);
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
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.style.zIndex = 1;
      piece.setAttribute('id', i);
      piece.setAttribute('draggable', true);
      piece.addEventListener('dragstart', this.onDragstart);
      piece.addEventListener('drop', this.onDrop);
      piece.addEventListener('dragover', this.onDragover);
      piece.style.top = `${this.getRandomPositionString(false)}px`;
      piece.style.left = `${this.getRandomPositionString(true)}px`;
      piece.style.backgroundImage = `url('./public/puzzle_${i}.jpg')`;
      this.board.append(piece);
    }
  }

  onDragstart = (e) => {
    e.dataTransfer.setData('text/plain', '');
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

  // snapIntoPlace = () => {
  //   this.currentImageEl.style.left = '0px';
  //   this.currentImageEl.style.top = '0px';
  // }

  getRandomPositionString = (top) => {
    const num = Math.floor(Math.random() * (top ? 300 : 330));
    return num.toString();
  }

  // checkWin = () => {
  //   if (!this.piecesContainer.children.length) {
  //     this.imageDropContainer.classList.add('complete');
  //   }
  // }
}
