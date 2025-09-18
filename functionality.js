// Highlight active navigation link on click
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', function () {
        document.querySelectorAll('.navbar a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Highlight active navigation link based on current URL
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        if (window.location.pathname.endsWith(link.getAttribute('href'))) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });



    // Scroll-to-top button
    const scrollBtn = document.createElement('button');
    scrollBtn.textContent = '↑ Top';
    scrollBtn.id = 'scrollToTopBtn';
    scrollBtn.style.position = 'fixed';
    scrollBtn.style.bottom = '30px';
    scrollBtn.style.right = '30px';
    scrollBtn.style.padding = '12px 18px';
    scrollBtn.style.background = 'gold';
    scrollBtn.style.color = '#222';
    scrollBtn.style.border = 'none';
    scrollBtn.style.borderRadius = '6px';
    scrollBtn.style.cursor = 'pointer';
    scrollBtn.style.display = 'none';
    scrollBtn.style.zIndex = '1000';
    document.body.appendChild(scrollBtn);

    window.addEventListener('scroll', () => {
        scrollBtn.style.display = window.scrollY > 200 ? 'block' : 'none';
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Form validation feedback
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            let valid = true;
            this.querySelectorAll('input[required], textarea[required]').forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = 'gold';
                }
            });
            if (!valid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        }
    });
});