document.addEventListener('DOMContentLoaded', () => {
    // === Navigation Highlight ===
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        if (window.location.pathname.endsWith(link.getAttribute('href'))) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });

    // === Scroll-to-Top Button ===
    const scrollBtn = document.createElement('button');
    scrollBtn.textContent = '↑ Top';
    scrollBtn.id = 'scrollToTopBtn';
    Object.assign(scrollBtn.style, {
        position: 'fixed', bottom: '30px', right: '30px',
        padding: '12px 18px', background: 'gold', color: '#222',
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        display: 'none', zIndex: '1000'
    });
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        scrollBtn.style.display = window.scrollY > 200 ? 'block' : 'none';
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // === Form Validation (Real-Time + Inline Feedback) ===
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            let valid = true;
            this.querySelectorAll('input[required], textarea[required]').forEach(field => {
                const errorSpan = field.nextElementSibling;
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = 'red';
                    if (errorSpan && errorSpan.classList.contains('error-msg')) {
                        errorSpan.textContent = 'This field is required.';
                    }
                } else {
                    field.style.borderColor = 'gold';
                    if (errorSpan && errorSpan.classList.contains('error-msg')) {
                        errorSpan.textContent = '';
                    }
                }
            });
            if (!valid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });

        // Real-time validation
        form.querySelectorAll('input[required], textarea[required]').forEach(field => {
            field.addEventListener('input', () => {
                const errorSpan = field.nextElementSibling;
                if (field.value.trim()) {
                    field.style.borderColor = 'gold';
                    if (errorSpan && errorSpan.classList.contains('error-msg')) {
                        errorSpan.textContent = '';
                    }
                } else {
                    field.style.borderColor = 'red';
                    if (errorSpan && errorSpan.classList.contains('error-msg')) {
                        errorSpan.textContent = 'This field is required.';
                    }
                }
            });
        });
    });

    // === Cart System ===
    const CART_KEY = 'golden_kings_cart_v1';

    function loadCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? JSON.parse(raw) : { items: [], total: 0, count: 0 };
        } catch (e) {
            console.error('Failed to load cart:', e);
            return { items: [], total: 0, count: 0 };
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function showToast(message = 'Added to cart', duration = 1800) {
        const toast = document.createElement('div');
        toast.textContent = message;
        Object.assign(toast.style, {
            position: 'fixed', bottom: '28px', left: '50%',
            transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)',
            color: 'gold', padding: '10px 16px', borderRadius: '8px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)', zIndex: 2000,
            fontWeight: 600, fontFamily: 'Segoe UI, Arial, sans-serif',
            opacity: '0', transition: 'opacity 180ms ease, transform 180ms ease'
        });
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(-6px)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(0)';
            setTimeout(() => toast.remove(), 220);
        }, duration);
    }

    function updateCartSummaryUI() {
        const container = document.querySelector('.add-to-cart');
        const cart = loadCart();
        if (container) {
            container.innerHTML = `<a href="OrderScreen.html">Cart: ${cart.count} item${cart.count !== 1 ? 's' : ''} — Total: R${cart.total.toFixed(2)}</a>`;
        }
    }

    function addToCart(name, price) {
        const cart = loadCart();
        const existing = cart.items.find(i => i.name === name && i.price === price);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.items.push({ name, price, qty: 1 });
        }
        cart.count = cart.items.reduce((s, it) => s + it.qty, 0);
        cart.total = cart.items.reduce((s, it) => s + it.price * it.qty, 0);
        saveCart(cart);
        updateCartSummaryUI();
        showToast('Added to cart');
    }

    document.querySelectorAll('.products-gallery figure').forEach(fig => {
        fig.style.cursor = 'pointer';
        fig.addEventListener('click', () => {
            // safe extraction of name and price
            const name = fig.querySelector('figcaption strong')?.textContent?.trim() || '';
            const priceTextRaw = fig.querySelector('.price')?.textContent || '';
            const numericText = priceTextRaw ? priceTextRaw.replace(/[^0-9.,]/g, '').replace(',', '.') : '';
            const parsed = numericText ? parseFloat(numericText) : NaN;
            const price = Number.isFinite(parsed) ? parsed : 0;

            if (name) {
                addToCart(name, price);
                fig.style.transition = 'transform .18s ease';
                fig.style.transform = 'translateY(-6px) scale(1.03)';
                setTimeout(() => { fig.style.transform = ''; }, 180);
            }
        });
    });

    updateCartSummaryUI();

    // include actual id used in OrderScreen.html (#place-order)
    document.querySelectorAll('#placeOrderBtn, #place-order, .place-order, [data-place-order]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            localStorage.removeItem(CART_KEY);
            updateCartSummaryUI();
            alert('Order placed. Cart has been cleared.');
            if (!this.matches('button[type="submit"], input[type="submit"], a')) {
                e.preventDefault();
                location.reload();
            }
        });
    });

    // === Interactive Map (Leaflet.js) ===
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        const map = L.map('map').setView([-26.2041, 28.0473], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        L.marker([-26.2041, 28.0473]).addTo(map).bindPopup('Golden Kings HQ').openPopup();
    }

    // === Gallery Lightbox ===
    document.querySelectorAll('.gallery img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); display: flex; align-items: center;
                justify-content: center; z-index: 3000;
            `;
            const fullImg = document.createElement('img');
            fullImg.src = img.src;
            fullImg.alt = img.alt || 'Gallery Image';
            fullImg.style.maxWidth = '90%';
            fullImg.style.maxHeight = '90%';
            overlay.appendChild(fullImg);
            overlay.addEventListener('click', () => overlay.remove());
            document.body.appendChild(overlay);
        });
    });

    // === Search Filter ===
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            document.querySelectorAll('.products-gallery figure').forEach(fig => {
                const name = fig.querySelector('figcaption strong')?.textContent.toLowerCase();
                fig.style.display = name && name.includes(term) ? 'block' : 'none';
            });
        });
    }

        // === Contact Form Submission (AJAX) ===
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Thank you! Your enquiry has been sent successfully.');
                    this.reset();
                    this.querySelectorAll('input, textarea').forEach(field => {
                        field.style.borderColor = '';
                        const errorSpan = field.nextElementSibling;
                        if (errorSpan && errorSpan.classList.contains('error-msg')) {
                            errorSpan.textContent = '';
                        }
                    });
                } else {
                    alert('Oops! Something went wrong. Please try again later.');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Network error. Please check your connection and try again.');
            }
        });
    }
});
