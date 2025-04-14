document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden'); // hide initially
  
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target); 
        }
      });xz
    }, { threshold: 0.3 });
  
    observer.observe(section);
  });
  
  const navLinks = document.querySelectorAll('nav a');
  
  function highlightCurrentSection() {
    const fromTop = window.scrollY + window.innerHeight / 2;
  
    document.querySelectorAll('section').forEach(section => {
      const id = section.getAttribute('id');
      const link = document.querySelector(`nav a[href="#${id}"]`);
      if (!link) return;
  
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
  
      if (fromTop >= sectionTop && fromTop < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', highlightCurrentSection);
  window.addEventListener('load', highlightCurrentSection);
  
  const scrollIndicator = document.getElementById('scroll-indicator');
  
  window.addEventListener('scroll', () => {
    if (scrollY > 50) {
      scrollIndicator.style.opacity = 0;
    } else {
      scrollIndicator.style.opacity = 1;
    }
  });
  // Smooth one-section-at-a-time scroll behavior
let isScrolling = false;
const sections = document.querySelectorAll('.section');
let currentSection = 0;

function scrollToSection(index) {
  if (index < 0 || index >= sections.length) return;

  isScrolling = true;
  sections[index].scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    isScrolling = false;
    currentSection = index;
  }, 1000); // Delay prevents rapid scroll jumps
}

window.addEventListener('wheel', (e) => {
  if (isScrolling) return;

  if (e.deltaY > 0) {
    scrollToSection(currentSection + 1);
  } else {
    scrollToSection(currentSection - 1);
  }
});
