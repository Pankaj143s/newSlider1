document.addEventListener('DOMContentLoaded', () => {
    const sliderSection = document.getElementById('horizontalSlider');
    const slidesContainer = sliderSection.querySelector('.slides');
    const slideElements = slidesContainer.querySelectorAll('.slide');
    const videoElem = document.getElementById('videoSlide');

    // We have 28 total slides => final slide index is 27
    const videoIndex = 27;

    let currentX = 0;
    let velocity = 0;
    const friction = 0.92;
    let animFrame = null;
    let videoTimer = null;
    let lockDistance = 0;

    /**
     * Recompute 'lockDistance' by measuring the final slide's offset
     * so we can center it in the viewport
     */
    function computeLockDistance() {
        const finalSlide = slideElements[videoIndex];
        const slideLeft = finalSlide.offsetLeft;
        const slideWidth = finalSlide.offsetWidth;
        const videoCenter = slideLeft + (slideWidth / 2);
        // To center the video slide
        const newLock = videoCenter - (window.innerWidth / 2);

        // If the slider was scrolled close to an old lockDistance, clamp
        if (currentX > newLock) {
            currentX = newLock;
        }
        slidesContainer.style.transform = `translateX(-${currentX}px)`;
        return newLock;
    }

    function updateLockDistance() {
        lockDistance = computeLockDistance();
    }

    /**
     * Instead of checking the slider's center, we'll see if ANY portion 
     * of the slider is in the viewport (rect overlaps the screen).
     */
    function isSliderActive() {
        const rect = sliderSection.getBoundingClientRect();
        // If the slider is at least partially on screen, we consider it "active."
        // If you prefer it only intercept when fully on screen, adjust logic.
        return (
            rect.bottom > 0 &&          // slider is below the top edge of viewport
            rect.top < window.innerHeight // slider is above the bottom edge
        );
    }

    function onWheel(e) {
        if (!isSliderActive()) return;  // If the slider isn't visible, do nothing

        const delta = e.deltaY * 0.3;

        // We'll intercept vertical scroll if:
        //  - scrolling down (delta>0) & not at lockDistance
        //  - scrolling up (delta<0) & not at 0
        // This prevents the page from scrolling while the slider is in range.
        const scrollingDownInRange = (delta > 0 && currentX < lockDistance);
        const scrollingUpInRange = (delta < 0 && currentX > 0);
        if (scrollingDownInRange || scrollingUpInRange) {
            e.preventDefault();
            velocity += delta;
            if (!animFrame) {
                animFrame = requestAnimationFrame(update);
            }
        }
    }

    function update() {
        currentX += velocity;
        velocity *= friction;

        // Clamp horizontal offset
        if (currentX < 0) {
            currentX = 0;
            velocity = 0;
        }
        if (currentX > lockDistance) {
            currentX = lockDistance;
            velocity = 0;
        }

        slidesContainer.style.transform = `translateX(-${currentX}px)`;

        // If near lockDistance, set a 3s timer to play video
        if (Math.abs(currentX - lockDistance) < 1) {
            if (!videoTimer) {
                videoTimer = setTimeout(() => {
                    videoElem.play();
                }, 3000);
            }
        } else {
            // If user scrolls back from the video, reset
            if (videoTimer) {
                clearTimeout(videoTimer);
                videoTimer = null;
                videoElem.pause();
            }
        }

        // Continue animating if velocity is not negligible
        if (Math.abs(velocity) > 0.2) {
            animFrame = requestAnimationFrame(update);
        } else {
            animFrame = null;
        }
    }

    // Recompute lockDistance on resize
    window.addEventListener('resize', updateLockDistance);

    // Compute lockDistance initially
    updateLockDistance();

    // Intercept wheel events
    window.addEventListener('wheel', onWheel, { passive: false });
});
