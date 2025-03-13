document.addEventListener('DOMContentLoaded', () => {
    const sliderSection = document.getElementById('horizontalSlider');
    const slidesContainer = sliderSection.querySelector('.slides');
    const slideElements = slidesContainer.querySelectorAll('.slide');
    const videoElem = document.getElementById('videoSlide');

    // We have 28 total slides => final slide index is 27 (the video)
    const videoIndex = 27;

    let currentX = 0;
    let velocity = 0;
    const friction = 0.92;
    let animFrame = null;
    let videoTimer = null;
    let lockDistance = 0;

    /**
     * Recompute the 'lockDistance' by measuring the final slide's offset
     * so we can center it in the viewport
     */
    function computeLockDistance() {
        const finalSlide = slideElements[videoIndex];
        const slideLeft = finalSlide.offsetLeft;
        const slideWidth = finalSlide.offsetWidth;
        // The center of the video slide, in container coordinates
        const videoCenter = slideLeft + (slideWidth / 2);
        // To center it in the viewport
        const newLock = videoCenter - (window.innerWidth / 2);

        // If the slider was previously scrolled close to an old lockDistance,
        // we clamp to ensure it doesn't go out of bounds
        if (currentX > newLock) {
            currentX = newLock;
        }
        slidesContainer.style.transform = `translateX(-${currentX}px)`;
        return newLock;
    }

    function updateLockDistance() {
        lockDistance = computeLockDistance();
    }

    function isSliderActive() {
        const rect = sliderSection.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        return (rect.top <= viewportCenter && rect.bottom >= viewportCenter);
    }

    function onWheel(e) {
        if (isSliderActive()) {
            const delta = e.deltaY * 0.3;
            // Only intercept vertical scroll if:
            //   - Scrolling down (delta>0) and not at lockDistance
            //   - Scrolling up (delta<0) and not at 0
            if ((delta > 0 && currentX < lockDistance) || (delta < 0 && currentX > 0)) {
                e.preventDefault();
                velocity += delta;
                if (!animFrame) {
                    animFrame = requestAnimationFrame(update);
                }
            }
        }
    }

    function update() {
        currentX += velocity;
        velocity *= friction;

        // Clamp
        if (currentX < 0) {
            currentX = 0;
            velocity = 0;
        }
        if (currentX > lockDistance) {
            currentX = lockDistance;
            velocity = 0;
        }

        slidesContainer.style.transform = `translateX(-${currentX}px)`;

        // If near lockDistance, set a 3-second timer to play video
        if (Math.abs(currentX - lockDistance) < 1) {
            if (!videoTimer) {
                videoTimer = setTimeout(() => {
                    videoElem.play();
                }, 3000);
            }
        } else {
            // If user scrolls back or isn't at lockDistance, pause video & clear timer
            if (videoTimer) {
                clearTimeout(videoTimer);
                videoTimer = null;
                videoElem.pause();
            }
        }

        if (Math.abs(velocity) > 0.2) {
            animFrame = requestAnimationFrame(update);
        } else {
            animFrame = null;
        }
    }

    // Recompute lockDistance after layout or resizing
    window.addEventListener('resize', updateLockDistance);

    // On initial load
    updateLockDistance();

    // Intercept wheel events
    window.addEventListener('wheel', onWheel, { passive: false });
});
