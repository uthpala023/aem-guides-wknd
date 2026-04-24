(function (document, $) {
    "use strict";

    const SELECTOR = ".media-gallery-banner__media-type";

    function toggleFields(select) {
        const wrapper = select.closest(".coral-Form-fieldwrapper");
        const item = select.closest("coral-multifield-item") || (wrapper && wrapper.parentElement);

        if (!item) {
            return;
        }

        const imageGroup = item.querySelector(".media-gallery-banner__field-group--image");
        const videoGroup = item.querySelector(".media-gallery-banner__field-group--video");
        const isVideo = select.value === "video";

        if (imageGroup) {
            imageGroup.style.display = isVideo ? "none" : "";
        }

        if (videoGroup) {
            videoGroup.style.display = isVideo ? "" : "none";
        }
    }

    function bindSelect(select) {
        if (!select || select.dataset.mediaGalleryBound === "true") {
            return;
        }

        select.dataset.mediaGalleryBound = "true";
        toggleFields(select);
        select.addEventListener("change", function () {
            toggleFields(select);
        });
    }

    function bindAll(scope) {
        scope.querySelectorAll(SELECTOR).forEach(bindSelect);
    }

    $(document).on("foundation-contentloaded", function (event) {
        bindAll(event.target);
    });

    $(document).on("coral-collection:add", function (event) {
        bindAll(event.target);
    });
})(document, Granite.$);
