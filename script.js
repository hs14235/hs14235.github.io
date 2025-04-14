const faders = document.querySelectorAll('.fade-in');

function revealOnScroll() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;

  faders.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;

    if (sectionTop < windowHeight - 50) {
      section.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
