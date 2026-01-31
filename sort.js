// Simple Sorter module. Exposes `Sorter` and a helper `toggleSort(key)` which updates state and calls
// `window.onSortChanged()` if present.
const Sorter = (function () {
    let sortKey = null; // 'price' or 'title'
    let sortDir = 1; // 1 = asc, -1 = desc

    function toggle(key) {
        if (sortKey === key) {
            sortDir = -sortDir;
        } else {
            sortKey = key;
            sortDir = 1;
        }
        return { sortKey, sortDir };
    }

    function set(key, dir) {
        sortKey = key;
        sortDir = dir === -1 ? -1 : 1;
        return { sortKey, sortDir };
    }

    function apply(items) {
        if (!Array.isArray(items) || !sortKey) return items;
        const copy = items.slice();
        if (sortKey === 'price') {
            copy.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)) * sortDir);
        } else if (sortKey === 'title' || sortKey === 'name') {
            copy.sort((a, b) => {
                const A = String(a.title || '').toLowerCase();
                const B = String(b.title || '').toLowerCase();
                return A.localeCompare(B) * sortDir;
            });
        }
        return copy;
    }

    function getState() {
        return { sortKey, sortDir };
    }

    return { toggle, set, apply, getState };
})();

// UI helper: called from buttons in the header
function toggleSort(key) {
    const state = Sorter.toggle(key);
    updateSortButtonsUI();
    if (typeof window.onSortChanged === 'function') {
        window.onSortChanged(state);
    }
}

function updateSortButtonsUI() {
    const s = Sorter.getState();
    // update buttons with ids sort-title and sort-price
    const titleBtn = document.getElementById('sort-title');
    const priceBtn = document.getElementById('sort-price');

    if (titleBtn) {
        titleBtn.classList.toggle('active', s.sortKey === 'title');
        titleBtn.setAttribute('data-dir', s.sortKey === 'title' ? (s.sortDir === 1 ? 'asc' : 'desc') : '');
    }
    if (priceBtn) {
        priceBtn.classList.toggle('active', s.sortKey === 'price');
        priceBtn.setAttribute('data-dir', s.sortKey === 'price' ? (s.sortDir === 1 ? 'asc' : 'desc') : '');
    }
}

// Expose to window for simple usage
if (typeof window !== 'undefined') {
    window.Sorter = Sorter;
    window.toggleSort = toggleSort;
    window.updateSortButtonsUI = updateSortButtonsUI;
}
