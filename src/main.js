import products from './data/products.json';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function setupNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '×' : '☰';
  });
}

function setupNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = form.querySelector('.form-message');
      if (message)
        message.textContent = 'Thanks for joining our little community.';
      form.reset();
    });
  });
}

function setupStore() {
  const grid = document.querySelector('#product-grid');
  if (!grid) return;
  const pagination = document.querySelector('#pagination');
  const resultCount = document.querySelector('#result-count');
  const pageStatus = document.querySelector('#page-status');
  const sortSelect = document.querySelector('#sort-products');
  const categoryButtons = [...document.querySelectorAll('.category-filter')];
  const perPage = 5;
  let currentPage = 1;
  let currentCategory = 'All';
  let currentSort = 'featured';

  function getVisibleProducts() {
    const visible = products.filter(
      (product) =>
        currentCategory === 'All' || product.category === currentCategory,
    );
    if (currentSort === 'name-asc')
      visible.sort((a, b) => a.name.localeCompare(b.name));
    if (currentSort === 'price-asc') visible.sort((a, b) => a.price - b.price);
    if (currentSort === 'price-desc') visible.sort((a, b) => b.price - a.price);
    return visible;
  }

  function renderPagination(pageCount) {
    const buttons = [
      `<button class="page-button arrow" data-page="${currentPage - 1}" aria-label="Previous page" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`,
      ...Array.from({ length: pageCount }, (_, index) => {
        const page = index + 1;
        return `<button class="page-button ${page === currentPage ? 'active' : ''}" data-page="${page}" aria-label="Page ${page}" aria-current="${page === currentPage ? 'page' : 'false'}">${page}</button>`;
      }),
      `<button class="page-button arrow" data-page="${currentPage + 1}" aria-label="Next page" ${currentPage === pageCount ? 'disabled' : ''}>Next</button>`,
    ];
    pagination.innerHTML = buttons.join('');
    pagination.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const requestedPage = Number(button.dataset.page);
        if (
          requestedPage < 1 ||
          requestedPage > pageCount ||
          requestedPage === currentPage
        )
          return;
        currentPage = requestedPage;
        renderProducts();
        document
          .querySelector('.store-toolbar')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function renderProducts() {
    const visible = getVisibleProducts();
    const pageCount = Math.max(1, Math.ceil(visible.length / perPage));
    currentPage = Math.min(currentPage, pageCount);
    const pageItems = visible.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage,
    );
    resultCount.textContent = `${visible.length} ${visible.length === 1 ? 'thoughtful find' : 'thoughtful finds'}`;
    pageStatus.textContent = `Page ${currentPage} of ${pageCount}`;
    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = pageItems.length
      ? pageItems
          .map(
            (product) => `
      <article class="product-card">
        <div class="product-image"><img src="${product.imageUrl}" alt="${product.name}" loading="lazy" width="360" height="340"><span class="product-category">${product.category}</span></div>
        <div class="product-info"><h3>${product.name}</h3><p>${product.description}</p><span class="product-price">${money.format(product.price)}</span></div>
      </article>`,
          )
          .join('')
      : '<p class="empty-message">Nothing here just yet. Try another category.</p>';
    renderPagination(pageCount);
  }

  categoryButtons.forEach((button) =>
    button.addEventListener('click', () => {
      currentCategory = button.dataset.category;
      currentPage = 1;
      categoryButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderProducts();
    }),
  );
  sortSelect?.addEventListener('change', () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    renderProducts();
  });
  renderProducts();
}

setupNavigation();
setupNewsletter();
setupStore();
