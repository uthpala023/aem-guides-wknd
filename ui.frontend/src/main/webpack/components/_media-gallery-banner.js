(function () {
    "use strict";

    const rootSelector = "[data-cmp-is='media-gallery-banner']";
    const activeClass = "is-active";
    const playingClass = "is-playing";
    const initializedAttribute = "data-media-gallery-initialized";

    function pauseSlideVideo(slide) {
        const video = slide.querySelector("[data-video]");
        const preview = slide.querySelector("[data-video-preview]");

        if (video) {
            video.pause();
            video.currentTime = 0;
        }

        slide.classList.remove(playingClass);

        if (preview) {
            preview.hidden = false;
        }
    }

    function syncThumbVisibility(thumb) {
        if (!thumb) {
            return;
        }

        thumb.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
        });
    }

    function init(el) {
        if (!el || el.getAttribute(initializedAttribute) === "true") {
            return;
        }

        el.setAttribute(initializedAttribute, "true");

        const slides = Array.from(el.querySelectorAll(".cmp-media-gallery-banner__slide"));
        const thumbs = Array.from(el.querySelectorAll(".cmp-media-gallery-banner__thumb"));
        const prev = el.querySelector(".cmp-media-gallery-banner__prev");
        const next = el.querySelector(".cmp-media-gallery-banner__next");
        const interval = Number(el.dataset.interval || 0) * 1000;
        const transition = el.dataset.transition || "slide";
        let current = 0;
        let autoPlay;

        if (!slides.length) {
            return;
        }

        function show(index) {
            if (index < 0) {
                index = slides.length - 1;
            }

            if (index >= slides.length) {
                index = 0;
            }

            current = index;

            slides.forEach((slide, slideIndex) => {
                const isActive = slideIndex === current;
                slide.classList.toggle(activeClass, isActive);
                slide.setAttribute("aria-hidden", String(!isActive));

                if (!isActive) {
                    pauseSlideVideo(slide);
                }
            });

            thumbs.forEach((thumb, thumbIndex) => {
                const isActive = thumbIndex === current;
                thumb.classList.toggle(activeClass, isActive);
                thumb.setAttribute("aria-current", String(isActive));

                if (isActive) {
                    syncThumbVisibility(thumb);
                }
            });
        }

        function stopAutoPlay() {
            if (autoPlay) {
                window.clearInterval(autoPlay);
                autoPlay = undefined;
            }
        }

        function startAutoPlay() {
            stopAutoPlay();

            if (interval > 0) {
                autoPlay = window.setInterval(() => show(current + 1), interval);
            }
        }

        thumbs.forEach((thumb, index) => {
            thumb.addEventListener("click", () => {
                show(index);
                startAutoPlay();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                show(current - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(current + 1);
                startAutoPlay();
            });
        }

        el.querySelectorAll("[data-video-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                const slide = button.closest(".cmp-media-gallery-banner__slide");
                const video = slide && slide.querySelector("[data-video]");
                const preview = slide && slide.querySelector("[data-video-preview]");

                if (!slide || !video || !preview) {
                    return;
                }

                slide.classList.add(playingClass);
                preview.hidden = true;
                video.play();
                stopAutoPlay();
            });
        });

        el.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                show(current - 1);
                startAutoPlay();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                show(current + 1);
                startAutoPlay();
            }
        });

        el.addEventListener("mouseenter", stopAutoPlay);
        el.addEventListener("mouseleave", startAutoPlay);
        el.classList.add("is-ready");
        el.classList.toggle("cmp-media-gallery-banner--fade", transition === "fade");

        show(0);
        startAutoPlay();
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(rootSelector).forEach(init);
    });
})();
