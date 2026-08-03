import { gsap } from 'gsap';

const DESKTOP_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const EDGE_TOLERANCE = 3;

export const initSectionScroll = () => {
  const sections = [...document.querySelectorAll('main > section')];
  const desktopPointer = window.matchMedia(DESKTOP_POINTER);
  const reducedMotion = window.matchMedia(REDUCED_MOTION);
  if (sections.length < 2) return;

  let scrollTween = null;

  const pageIsLocked = () => (
    document.body.classList.contains('page--locked')
    || document.body.classList.contains('page--loading')
  );

  const getCurrentSectionIndex = () => {
    const scrollPosition = window.scrollY + EDGE_TOLERANCE;
    let index = 0;

    sections.forEach((section, sectionIndex) => {
      if (section.offsetTop <= scrollPosition) index = sectionIndex;
    });

    return index;
  };

  const moveToSection = (section) => {
    const targetY = section.offsetTop;

    if (reducedMotion.matches) {
      window.scrollTo(0, targetY);
      return;
    }

    const scrollState = { y: window.scrollY };
    document.documentElement.classList.add('section-scroll--animating');

    scrollTween = gsap.to(scrollState, {
      y: targetY,
      duration: 0.82,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: () => window.scrollTo(0, scrollState.y),
      onComplete: () => {
        window.scrollTo(0, targetY);
        document.documentElement.classList.remove('section-scroll--animating');
        scrollTween = null;
      },
      onInterrupt: () => {
        document.documentElement.classList.remove('section-scroll--animating');
        scrollTween = null;
      },
    });
  };

  const handleWheel = (event) => {
    if (!desktopPointer.matches || pageIsLocked() || event.ctrlKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || Math.abs(event.deltaY) < 4) return;

    if (scrollTween) {
      event.preventDefault();
      return;
    }

    const direction = Math.sign(event.deltaY);
    const currentIndex = getCurrentSectionIndex();
    const currentSection = sections[currentIndex];
    const currentTop = currentSection.offsetTop;
    const currentBottom = currentTop + currentSection.offsetHeight;
    const canScrollInsideDown = window.scrollY < currentBottom - window.innerHeight - EDGE_TOLERANCE;
    const canScrollInsideUp = window.scrollY > currentTop + EDGE_TOLERANCE;

    if (direction > 0) {
      if (canScrollInsideDown || currentIndex === sections.length - 1) return;
      event.preventDefault();
      moveToSection(sections[currentIndex + 1]);
      return;
    }

    if (canScrollInsideUp || currentIndex === 0) return;
    event.preventDefault();
    moveToSection(sections[currentIndex - 1]);
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
};
