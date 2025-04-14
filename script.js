// Smooth one-section-at-a-time scrolling logic
const sections = document.querySelectorAll('.section');
let currentIndex = 0;
let isScrolling = false;

function scrollToSection(index) {
  if (index < 0 || index >= sections.length) return;

  isScrolling = true;
  sections[index].scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    currentIndex = index;
    isScrolling = false;
  }, 800);
}

window.addEventListener('wheel', (event) => {
  if (isScrolling) return;

  if (event.deltaY > 0) {
    scrollToSection(currentIndex + 1);
  } else if (event.deltaY < 0) {
    scrollToSection(currentIndex - 1);
  }
});