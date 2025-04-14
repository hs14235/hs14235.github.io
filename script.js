// 🔥 Fade-in + Slide animation per section using IntersectionObserver
document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden'); // hide initially
  
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target); // animate only once
        }
      });
    }, { threshold: 0.3 });
  
    observer.observe(section);
  });
  
  // 🔥 Dynamic navbar highlighting (based on scroll)
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
  
  // 🔥 Scroll-down indicator hide on scroll
  const scrollIndicator = document.getElementById('scroll-indicator');
  
  window.addEventListener('scroll', () => {
    if (scrollY > 50) {
      scrollIndicator.style.opacity = 0;
    } else {
      scrollIndicator.style.opacity = 1;
    }
  });
  