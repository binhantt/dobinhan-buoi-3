// Simple pagination helper (global `Pagination` object)
const Pagination = (function () {
    let items = [];
    let perPage = 10;
    let currentPage = 1;
    let renderFn = null;
    let paginationContainer = null;
    let perPageSelect = null;

    function setup(data, renderer, options = {}) {
        items = Array.isArray(data) ? data : [];
        renderFn = renderer;
        perPage = options.perPage || 10;
        currentPage = 1;
        paginationContainer = document.getElementById(options.paginationId || 'pagination');
        perPageSelect = document.getElementById(options.perPageSelectId || 'perPageSelect');

        if (perPageSelect) {
            perPageSelect.value = perPage;
            perPageSelect.addEventListener('change', (e) => {
                setPerPage(parseInt(e.target.value, 10));
            });
        }

        renderPage(1);
    }

    function totalPages() {
        return Math.max(1, Math.ceil(items.length / perPage));
    }

    function renderPage(page = 1) {
        currentPage = Math.max(1, Math.min(totalPages(), page));
        const start = (currentPage - 1) * perPage;
        const slice = items.slice(start, start + perPage);
        if (typeof renderFn === 'function') renderFn(slice);
        renderControls();
    }

    function setPerPage(n) {
        perPage = Math.max(1, parseInt(n, 10) || 10);
        renderPage(1);
    }

    function goTo(page) {
        renderPage(page);
    }

    function renderControls() {
        if (!paginationContainer) return;
        const total = totalPages();
        let html = '';
        html += `<button class="page-btn" data-page="${Math.max(1, currentPage - 1)}">Prev</button>`;

        // show a window of pages (max 7)
        let start = Math.max(1, currentPage - 3);
        let end = Math.min(total, currentPage + 3);
        if (end - start < 6) {
            start = Math.max(1, end - 6);
            end = Math.min(total, start + 6);
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        html += `<button class="page-btn" data-page="${Math.min(total, currentPage + 1)}">Next</button>`;
        paginationContainer.innerHTML = html;

        paginationContainer.querySelectorAll('.page-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const p = parseInt(btn.getAttribute('data-page'), 10);
                goTo(p);
            });
        });
    }

    return {
        setup,
        setPerPage,
        goTo,
        totalPages: () => totalPages(),
        currentPage: () => currentPage,
    };
})();

    // Expose to window for scripts that check `window.Pagination`
    if (typeof window !== 'undefined') {
        window.Pagination = Pagination;
    }
