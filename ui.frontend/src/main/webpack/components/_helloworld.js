(function() {
    "use strict";

    const selectors = {
        self: '[data-cmp-is="cards"]',
        container: '.cmp-cards__container'
    };

    function Cards(config) {

        function init(config) {
            if (!config.element) return;
            if (config.element.dataset.cardsInit === "true") return;

            config.element.dataset.cardsInit = "true";
            const container = config.element.querySelector(selectors.container);
            if (!container) return;

            showLoading(container);
            fetchCards(container);
        }

        function showLoading(container) {
            container.innerHTML = `
                <div class="cmp-cards__loading">
                    <div class="cmp-cards__spinner"></div>
                    <p>Loading cards...</p>
                </div>
            `;
        }

        function fetchCards(container) {
            fetch("/bin/cards")
                .then(resp => {
                    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
                    return resp.json();
                })
                .then(data => renderCards(container, data))
                .catch(err => showError(container, err));
        }

        function renderCards(container, cards) {
            container.innerHTML = '';

            if (!Array.isArray(cards) || cards.length === 0) {
                container.innerHTML = '<p class="cmp-cards__empty">No cards available at this time.</p>';
                return;
            }

            const grid = document.createElement('div');
            grid.className = 'cmp-cards__grid';

            cards.forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.className = 'cmp-cards__card';

                // Image
                if (card.imageUrl) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'cmp-cards__image-container';
                    const img = document.createElement('img');
                    img.className = 'cmp-cards__image';
                    img.src = card.imageUrl;
                    img.alt = card.title || 'Card image';
                    img.loading = 'lazy';
                    img.onerror = () => {
                        img.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'cmp-cards__image-placeholder';
                        placeholder.textContent = 'Image not available';
                        imgContainer.appendChild(placeholder);
                    };
                    imgContainer.appendChild(img);
                    cardEl.appendChild(imgContainer);
                }

                // Content
                const content = document.createElement('div');
                content.className = 'cmp-cards__content';

                const title = document.createElement('h3');
                title.className = 'cmp-cards__title';
                title.textContent = card.title || 'Untitled Card';
                content.appendChild(title);

                const desc = document.createElement('div');
                desc.className = 'cmp-cards__description';
                desc.innerHTML = card.description || 'No description available';
                content.appendChild(desc);

                // Link
                if (card.redirectPageUrl) {
                    const actions = document.createElement('div');
                    actions.className = 'cmp-cards__actions';

                    const link = document.createElement('a');
                    link.className = 'cmp-cards__link';
                    link.href = card.redirectPageUrl;
                    link.textContent = 'Learn More';
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';

                    actions.appendChild(link);
                    content.appendChild(actions);
                }

                cardEl.appendChild(content);
                grid.appendChild(cardEl);
            });

            container.appendChild(grid);
        }

        function showError(container, error) {
            container.innerHTML = `
                <div class="cmp-cards__error">
                    <h3>Oops! Something went wrong</h3>
                    <p>We couldn't load the cards. Please try again later.</p>
                    <details>
                        <summary>Technical Details</summary>
                        <code>${error.message}</code>
                    </details>
                </div>
            `;
        }

        init(config);
    }

    function initCardsComponents() {
        document.querySelectorAll(selectors.self).forEach(el => new Cards({ element: el }));
    }

    if (document.readyState === 'complete' || document.readyState !== 'loading') {
        initCardsComponents();
    } else {
        document.addEventListener('DOMContentLoaded', initCardsComponents);
    }

    // Optional: handle dynamically added components
    if (window.MutationObserver) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches && node.matches(selectors.self)) {
                        new Cards({ element: node });
                    }
                    if (node.querySelectorAll) {
                        node.querySelectorAll(selectors.self).forEach(el => new Cards({ element: el }));
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

}());