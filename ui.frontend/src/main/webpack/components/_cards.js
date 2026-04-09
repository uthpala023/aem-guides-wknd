(function () {
    "use strict";

    const selectors = {
        self: '[data-cmp-is="cards"]',
        container: '[data-cmp-hook-cards="container"]',
        loading: '[data-cmp-hook-cards="loading"]',
        error: '[data-cmp-hook-cards="error"]'
    };

    const ENDPOINT = '/bin/cards';

    function Cards(element) {

        const hooks = {
            container: element.querySelector(selectors.container),
            loading: element.querySelector(selectors.loading),
            error: element.querySelector(selectors.error)
        };

        if (!hooks.container || element.dataset.cardsInitialized) {
            return;
        }

        element.dataset.cardsInitialized = "true";

        init();

        function init() {
            hideError();
            showLoading();
            fetchCards();
        }

        /* ---------- Loading ---------- */

        function showLoading() {
            if (!hooks.loading) return;
            hooks.loading.innerHTML = `
                <div class="cmp-cards__spinner"></div>
            `;
            hooks.loading.style.display = "block";
        }

        function hideLoading() {
            if (!hooks.loading) return;
            hooks.loading.style.display = "none";
            hooks.loading.innerHTML = "";
        }

        /* ---------- Error ---------- */

        function showError(message) {
            hideLoading();
            if (!hooks.error) return;

            hooks.error.innerHTML = `
                <p class="cmp-cards__error-text">${message}</p>
            `;
            hooks.error.style.display = "block";
        }

        function hideError() {
            if (!hooks.error) return;
            hooks.error.style.display = "none";
            hooks.error.innerHTML = "";
        }

        /* ---------- Fetch ---------- */

        function fetchCards() {
            fetch(ENDPOINT)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then(renderCards)
                .catch(() => showError("Unable to load cards."));
        }

        /* ---------- Render ---------- */

        function renderCards(cards) {
            hideLoading();
            hideError();

            if (!Array.isArray(cards) || cards.length === 0) {
                hooks.container.insertAdjacentHTML(
                    "beforeend",
                    `<p class="cmp-cards__empty">No cards available.</p>`
                );
                return;
            }

            const markup = `
                <div class="cmp-cards__grid">
                    ${cards.map(card => `
                        <article class="cmp-cards__card">

                            ${card.imageUrl ? `
                                <div class="cmp-cards__image-wrapper">
                                    ${card.imageUrl}
                                </div>
                            ` : ''}

                            <div class="cmp-cards__content">
                                <h3 class="cmp-cards__title">
                                    ${card.title || ''}
                                </h3>

                                <div class="cmp-cards__description">
                                    ${card.description || ''}
                                </div>

                                ${card.redirectPageUrl ? `
                                    <div class="cmp-cards__actions">
                                        ${card.redirectPageUrl}
                                            Learn More
                                        </a>
                                    </div>
                                ` : ''}
                            </div>

                        </article>
                    `).join("")}
                </div>
            `;

            hooks.container.insertAdjacentHTML("beforeend", markup);
        }
    }

    /* ---------- Init (HelloWorld style) ---------- */

    function initCards() {
        document
            .querySelectorAll(selectors.self)
            .forEach(el => new Cards(el));
    }

    if (document.readyState !== "loading") {
        initCards();
    } else {
        document.addEventListener("DOMContentLoaded", initCards);
    }

}());