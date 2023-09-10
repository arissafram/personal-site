class Puzzle {
  constructor() {
    this.totalImages = 9;
    this.imageDropId = '';
    this.currentImageEl = null;
    this.piecesContainer = null;
    this.imageDropContainer = null;

    this.offsetX = null;
    this.offsetY = null;

    this.onDragstart = this.onDragstart.bind(this);
    this.onDragover = this.onDragover.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  init = () => {
    const board = document.querySelector('.board');
    board.classList.add('puzzle');
    let i = 0;

    this.piecesContainer = document.createElement('div');
    this.piecesContainer.classList.add('pieces-container');
    board.appendChild(this.piecesContainer);

    while (this.totalImages > i) {
      i++
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.setAttribute('id', i);
      piece.setAttribute('draggable', true);
      piece.addEventListener('dragstart', this.onDragstart);
      piece.style.top = `${this.getRandomPositionString()}px`;
      piece.style.left = `${this.getRandomPositionString()}px`;
      piece.style.backgroundImage = `url('../arissa/assets/puzzle_${i}.jpg')`;
      this.piecesContainer.append(piece);
    }

    this.imageDropContainer = document.createElement('div');
    this.imageDropContainer.classList.add('image-drop-container');
    this.imageDropContainer.setAttribute('id', 'drop-container');
    this.imageDropContainer.addEventListener('drop', this.onDrop);
    this.imageDropContainer.addEventListener('dragover', this.onDragover);
    board.appendChild(this.imageDropContainer);
    let n = 0;
    while (this.totalImages > n) {
      n++
      const imageDrop = document.createElement('div');
      imageDrop.classList.add('image-drop');
      imageDrop.setAttribute('id', `${n}-drop`);
      imageDrop.addEventListener('dragenter', this.onDragEnter);
      this.imageDropContainer.append(imageDrop);
    }
  }


  onDragstart = (e) => {
    this.currentImageEl = e.target;

    this.offsetX = e.clientX - this.currentImageEl.getBoundingClientRect().left;
    this.offsetY = e.clientY - this.currentImageEl.getBoundingClientRect().top;
  }

  onDragover = (e) => {
    e.preventDefault();
    this.imageDropId = parseFloat(e.target.id).toString();
  };

  onDrop = (e) => {
    e.preventDefault();

    const newX = e.clientX - this.offsetX;
    const newY = e.clientY - this.offsetY;

    this.currentImageEl.style.left = `${newX}px`;
    this.currentImageEl.style.top = `${newY}px`;
    this.currentImageEl.style.position = 'absolute';

    if (this.currentImageEl.id === this.imageDropId) {
      this.currentImageEl.setAttribute('draggable', false);
      e.target.appendChild(this.currentImageEl);
      this.snapIntoPlace(e);
      this.checkWin();
    }
  }

  snapIntoPlace = () => {
    this.currentImageEl.style.left = '0px';
    this.currentImageEl.style.top = '0px';
  }

  getRandomPositionString = () => {
    const num = Math.floor(Math.random() * 300);
    return num.toString();
  }

  checkWin = () => {
    if (!this.piecesContainer.children.length) {
      this.imageDropContainer.classList.add('complete');
    }
  }
}
