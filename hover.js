 // hover.js - show product description in a floating tooltip when hovering a table row
(function () {
    function createTooltip() {
        const t = document.createElement('div');
        t.className = 'desc-tooltip';
        t.style.position = 'fixed';
        t.style.zIndex = 9999;
        t.style.display = 'none';
        document.body.appendChild(t);
        return t;
    }

    const tooltip = createTooltip();
    let activeRow = null;

    function showTooltip(text, rect) {
        if (!text) return;
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        // position to the right of the row, but inside viewport
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        const leftPreferred = rect.right + 8;
        const topPreferred = rect.top;
        let left = leftPreferred;
        if (left + tooltip.offsetWidth + 12 > vw) {
            left = Math.max(8, rect.left - tooltip.offsetWidth - 8);
        }
        let top = topPreferred;
        if (top + tooltip.offsetHeight + 12 > vh) top = Math.max(8, vh - tooltip.offsetHeight - 12);
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.classList.add('visible');
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
        tooltip.classList.remove('visible');
        tooltip.textContent = '';
    }

    function attach() {
        const tbody = document.querySelector('.product-table tbody');
        if (!tbody) return;

        tbody.addEventListener('pointerover', (e) => {
            const tr = e.target.closest('tr');
            if (!tr || tr === activeRow) return;
            activeRow = tr;
            const descCell = tr.querySelector('.product-description');
            if (descCell) {
                const rect = tr.getBoundingClientRect();
                showTooltip(descCell.textContent.trim(), rect);
            }
        });

        tbody.addEventListener('pointerout', (e) => {
            const fromTr = e.target.closest('tr');
            const toTr = e.relatedTarget ? e.relatedTarget.closest ? e.relatedTarget.closest('tr') : null : null;
            if (fromTr && fromTr !== toTr) {
                activeRow = null;
                hideTooltip();
            }
        });

        // If table is re-rendered (pagination), we still have delegation on tbody element.
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attach);
    } else {
        attach();
    }
})();
