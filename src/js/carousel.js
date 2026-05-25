// JavaScript for carousel functionality
const carouselInner = document.getElementById('carouselInner');
const container = document.getElementById('carouselContainer');
const indicators = document.querySelectorAll('.indicator-dot');
const actionButtons = document.querySelectorAll('.action-button');
const totalSlides = 4;
let currentIndex = 0;
let startX = 0;
let isSwiping = false;

// Function to update the carousel position and indicators
function updateCarousel() {
    const offset = -currentIndex * (100 / totalSlides);
    carouselInner.style.transform = `translateX(${offset}%)`;

    // Update indicators
    indicators.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        }
        else {
            dot.classList.remove('active');
        }
    });
}

// --- Swipe Logic ---
container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
});

container.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    // Prevent scrolling vertically during a horizontal swipe
    const currentX = e.touches[0].clientX;
    const diffX = startX - currentX;
    if (Math.abs(diffX) > 10) { // Small threshold to distinguish swipe from unintentional touch
        e.preventDefault(); 
    }
}, { passive: false }); // Need passive: false to use preventDefault()

container.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const swipeThreshold = 50; // Minimum distance for a swipe

    if (diffX > swipeThreshold) {
        // Swipe right (next slide)
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateCarousel();
        }
    }
    else if (diffX < -swipeThreshold) {
        // Swipe left (previous slide)
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }
    isSwiping = false;
});

// --- Indicator Click Logic ---
indicators.forEach((dot) => {
    dot.addEventListener('click', (e) => {
        currentIndex = parseInt(e.target.dataset.slide);
        updateCarousel();
    });
});

// action button
actionButtons.forEach((button, index) =>{
    if (index !== 3) {
        button.addEventListener('click', (e) => {
            // swipe to next slide
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
                updateCarousel();
            }
        });
    }
})

// Initialize carousel
updateCarousel();