window.addEventListener('load', () => {
  if (window.navigator.userAgent.match(/iPhone|iPad|android/gi)) {
    const dragAndDropPolyfill = document.createElement('script');
    dragAndDropPolyfill.setAttribute('id', 'DragDropTouch');
    dragAndDropPolyfill.setAttribute('src','https://bernardo-castilho.github.io/DragDropTouch/DragDropTouch.js');
    document.head.appendChild(dragAndDropPolyfill);
  }

  const puzzle = new Puzzle();
  puzzle.init();
});
