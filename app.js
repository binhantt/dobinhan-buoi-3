// API endpoint
const API_URL = 'https://api.escuelajs.co/api/v1/products';
// Helper functions used by rendering
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function svgPlaceholder(text, w = 120, h = 120) {
    const safe = escapeHtml(text || 'No image');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='%23f3f3f3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial, Helvetica, sans-serif' font-size='12'>${safe}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function renderProducts(items) {
    const tableBody = document.getElementById('productTableBody');
    if (!items || items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Không có sản phẩm</td></tr>';
        return;
    }

    tableBody.innerHTML = items
        .map((product , Index) => {
            const src = (product.images && Array.isArray(product.images) && product.images.length > 0)? product.images[0] : svgPlaceholder(product.title);
            console.log(src)
            const placeholder = svgPlaceholder(product.title);

            return `
                <tr>
                    <td>${product.id}</td>
                    <td>
                        <img src="${src}" alt="${escapeHtml(product.title)}" class="product-image" onerror="this.onerror=null;this.src='${placeholder}';" />
                    </td>
                    <td class="product-name">${escapeHtml(product.title)}</td>
                    <td class="product-price">$${product.price}</td>
                    <td class="product-description">${escapeHtml(product.description)}</td>
                </tr>
            `;
        })
        .join('');
}

// Hàm getAll - Lấy toàn bộ sản phẩm từ API và khởi tạo phân trang
async function getAll() {
    const loadingElement = document.getElementById('loading');

    try {
        loadingElement.style.display = 'block';

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const products = await response.json();

        loadingElement.style.display = 'none';

        // store all products globally so sorting can re-use them
        window.allProducts = products;

        // Apply sorter if present, then initialize pagination
        const perPage = parseInt(document.getElementById('perPageSelect')?.value, 10) || 10;
        const toUse = (typeof Sorter !== 'undefined' && Sorter) ? Sorter.apply(window.allProducts) : window.allProducts;

        if (typeof Pagination !== 'undefined' && Pagination) {
            Pagination.setup(toUse, renderProducts, {
                perPage,
                tableBodyId: 'productTableBody',
                paginationId: 'pagination',
                perPageSelectId: 'perPageSelect',
            });
        } else {
            renderProducts(toUse);
        }
    } catch (error) {
        loadingElement.style.display = 'none';
        console.error('Lỗi khi lấy dữ liệu:', error);
        const tableBody = document.getElementById('productTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="color: red; padding: 20px;">
                    <strong>Lỗi:</strong> ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

// Called by Sorter when toggled (sort.js will call window.onSortChanged())
window.onSortChanged = function () {
    try {
        const perPage = parseInt(document.getElementById('perPageSelect')?.value, 10) || 10;
        const items = (typeof Sorter !== 'undefined' && Sorter && Array.isArray(window.allProducts)) ? Sorter.apply(window.allProducts) : window.allProducts || [];
        if (typeof Pagination !== 'undefined' && Pagination) {
            Pagination.setup(items, renderProducts, {
                perPage,
                tableBodyId: 'productTableBody',
                paginationId: 'pagination',
                perPageSelectId: 'perPageSelect',
            });
        } else {
            renderProducts(items);
        }
    } catch (e) {
        console.error('Error applying sort:', e);
    }
};

// Auto-load products when page opens
window.addEventListener('load', () => {
    // only auto-load if user didn't navigate with ?noauto
    if (!location.search.includes('noauto')) getAll();
});
