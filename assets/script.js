document.addEventListener('DOMContentLoaded', () => {
    const sliderSection = document.getElementById('horizontalSlider');
    const slidesContainer = sliderSection.querySelector('.slides');
    const videoElem = document.getElementById('videoSlide');

    const W = window.innerWidth;
    // Slide widths in pixels:
    const gapWidth = W * 0.09;          // gap slide: 9vw
    const letterWidth = W * 0.09;       // each letter: 9vw
    const spacerWidth = W * 0.25;       // spacer: 25vw
    const videoWidth = W * 0.09;        // video: 9vw

    // There are 25 letter slides.
    // Cumulative width before the video slide = gap + (25 letters) + spacer
    const cumulativeBeforeVideo = gapWidth + (25 * letterWidth) + spacerWidth;
    // That equals: (9vw) + (25*9vw = 225vw) + (25vw) = 9 + 225 + 25 = 259vw (in vw units)
    // Convert cumulativeBeforeVideo to pixels:
    const cumulativeBeforeVideoPx = (259 / 100) * W;

    // The video slide center offset = cumulativeBeforeVideoPx + half of videoWidth
    const videoCenterOffset = cumulativeBeforeVideoPx + (videoWidth / 2);
    // To center the video in a 100vw viewport, required translation is:
    const lockDistance = videoCenterOffset - (W / 2);

    let currentX = 0;
    let velocity = 0;
    const friction = 0.92;
    let animFrame = null;
    let videoTimer = null;

    // Check if slider is active: true if viewport center is between slider's top and bottom.
    function isSliderActive() {
        const rect = sliderSection.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
    }

    function onWheel(e) {
        if (isSliderActive()) {
            const delta = e.deltaY * 0.3;
            // Allow horizontal movement if scrolling down (delta positive) and currentX < lockDistance,
            // OR scrolling up (delta negative) and currentX > 0.
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
        if (currentX < 0) {
            currentX = 0;
            velocity = 0;
        }
        if (currentX > lockDistance) {
            currentX = lockDistance;
            velocity = 0;
        }
        slidesContainer.style.transform = `translateX(-${currentX}px)`;

        // When video slide is centered (currentX near lockDistance), start a 3-second timer to play the video.
        if (Math.abs(currentX - lockDistance) < 1) {
            if (!videoTimer) {
                videoTimer = setTimeout(() => {
                    videoElem.play();
                }, 3000);
            }
        } else {
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

    window.addEventListener('wheel', onWheel, { passive: false });
});
