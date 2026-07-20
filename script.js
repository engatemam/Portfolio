// --- Force Scroll to Top on Refresh ---
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};
if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname + window.location.search);
}

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Navbar Scroll Effect (Transparent to Black)
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Row Slider (Horizontal Scrolling)
    const sliders = document.querySelectorAll('.row-slider');

    sliders.forEach(slider => {
        const leftBtn = slider.querySelector('.left-btn');
        const rightBtn = slider.querySelector('.right-btn');
        const rowPosters = slider.querySelector('.row-posters');

        // Scroll amount based on container width
        const scrollAmount = window.innerWidth * 0.7;

        leftBtn.addEventListener('click', () => {
            rowPosters.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        rightBtn.addEventListener('click', () => {
            rowPosters.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    });

    // 3. Scroll Spy (Highlight active nav link)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // ScrollSpy logic intentionally removed to prevent sticky active states
            }
        });
    }, observerOptions);

    sections.forEach(sec => {
        observer.observe(sec);
    });

    // 4. Mouse Wheel Horizontal Scroll for Certificates
    const certGrid = document.querySelector('.cert-detailed-grid');
    if (certGrid) {
        certGrid.addEventListener('wheel', (evt) => {
            const maxScrollLeft = certGrid.scrollWidth - certGrid.clientWidth;
            
            // If at the boundary, allow default page vertical scroll
            if ((evt.deltaY < 0 && certGrid.scrollLeft <= 0) || 
                (evt.deltaY > 0 && certGrid.scrollLeft >= maxScrollLeft - 1)) {
                return; 
            }
            
            evt.preventDefault();
            certGrid.scrollBy({
                left: evt.deltaY * 1.5,
                behavior: 'auto'
            });
        }, { passive: false });
    }

});

// 4. File Modal Logic (CV & Certificates)
window.openModal = function(fileUrl) {
    document.getElementById('modal-iframe').src = fileUrl;
    document.getElementById('file-modal').style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('file-modal').style.display = 'none';
    document.getElementById('modal-iframe').src = '';
};

window.openContact = function() {
    document.getElementById('contact-modal').style.display = 'flex';
};

window.closeContact = function() {
    document.getElementById('contact-modal').style.display = 'none';
};

window.addEventListener('click', (e) => {
    const contactModal = document.getElementById('contact-modal');
    if (e.target === contactModal) {
        closeContact();
    }
    // Also handle file-modal if it was not handled globally elsewhere
    const fileModal = document.getElementById('file-modal');
    if (e.target === fileModal) {
        closeModal();
    }
});

// 5. Interactive Canvas Background
const canvas = document.createElement('canvas');
canvas.id = 'bg-canvas';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const mouse = { x: null, y: null, radius: 150 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
}
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
    }
    draw() {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse interaction (repel)
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * this.density * 0.1;
                const directionY = forceDirectionY * force * this.density * 0.1;
                
                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }
}

function initParticles() {
    particles = [];
    let numberOfParticles = (width * height) / 10000;
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(212, 175, 55, ${1 - distance/120})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    requestAnimationFrame(animateParticles);
}

resize();
animateParticles();

// 6. Magnetic Profile Image
const magnetImg = document.querySelector('.hero-image-wrapper');
if (magnetImg) {
    magnetImg.addEventListener('mousemove', (e) => {
        const rect = magnetImg.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        magnetImg.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1)`;
    });

    magnetImg.addEventListener('mouseleave', () => {
        magnetImg.style.transform = `translate(0px, 0px) scale(0.8)`;
    });
}

// 7. Notification Popup Auto-Show
window.toggleNotification = function() {
    const popup = document.getElementById('notification-popup');
    if (popup) {
        if (popup.classList.contains('show')) {
            popup.classList.remove('show');
        } else {
            popup.classList.add('show');
            // Auto hide after 8 seconds
            setTimeout(() => {
                popup.classList.remove('show');
            }, 8000);
        }
    }
};

window.closeNotification = function() {
    const popup = document.getElementById('notification-popup');
    if (popup) {
        popup.classList.remove('show');
    }
};

setTimeout(() => {
    const popup = document.getElementById('notification-popup');
    if (popup) {
        popup.classList.add('show');
        
        // Auto hide after 8 seconds
        setTimeout(() => {
            popup.classList.remove('show');
        }, 8000);
    }
}, 500);

// 8. Logo Stamp Effect on Click & Copy Protection
document.addEventListener('contextmenu', event => event.preventDefault()); // Prevent Right Click

document.addEventListener('click', (e) => {
    // List of elements that should NOT trigger a stamp
    const blockedSelectors = [
        '#navbar', 
        '.notification-popup', 
        '#file-modal',
        '#contact-modal',
        '.project-card-detailed',
        '.cert-card-detailed',
        '.contact-card',
        '.grid-item',
        'a', 'button', 'img', 
        'h1', 'h2', 'h3', 'h4', 'p', 'i'
    ];

    // If clicked on any of the blocked elements (cards, text, buttons), don't stamp
    if (blockedSelectors.some(selector => e.target.closest(selector))) {
        return;
    }

    const stamp = document.createElement('img');
    stamp.src = 'logo_transparent.png';
    stamp.className = 'logo-stamp';
    
    // Position the stamp exactly where clicked
    stamp.style.left = `${e.pageX}px`;
    stamp.style.top = `${e.pageY}px`;
    
    document.body.appendChild(stamp);
    
    // Remove stamp from DOM after the 3s animation finishes
    setTimeout(() => {
        stamp.remove();
    }, 3000);
});

// --- Smooth Scroll Reveal Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Dynamically add the 'reveal' class to major elements so we don't have to edit HTML manually
    const elementsToReveal = document.querySelectorAll('.page-title, .hero-content, .skill-category, .project-card-detailed, .cert-card-detailed');
    elementsToReveal.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Optional: animate only once
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px 0px -50px 0px"
    });

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });
});



// --- Scroll Features Logic ---
document.addEventListener('scroll', () => {
    // Scroll Progress Bar
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + "%";
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
});

// Back to Top Click
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// --- Mobile Menu Toggle ---
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// --- Dynamic URL Update & Scrollspy ---
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    // Intercept clicks to scroll smoothly without updating the URL hash
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ================= PREMIUM UX UPGRADES ================= //

    // 1. Smart Nav Indicator
    const navIndicator = document.querySelector('.nav-indicator');
    const navLinksArray = Array.from(navLinks);
    
    const updateNavIndicator = (activeLink) => {
        if (!activeLink || !navIndicator) return;
        const rect = activeLink.getBoundingClientRect();
        const navRect = document.querySelector('.nav-center').getBoundingClientRect();
        // Calculate relative position within the nav-center
        const leftPos = rect.left - navRect.left + (rect.width / 2) - 3;
        navIndicator.style.left = `${leftPos}px`;
        navIndicator.style.opacity = '1';
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                if (currentId) {
                    const activeLink = document.querySelector(`.nav-links a[href="#${currentId}"]`);
                    if (activeLink) updateNavIndicator(activeLink);
                }
            }
        });
    }, { threshold: 0.4, rootMargin: "-50px 0px -50px 0px" });

    sections.forEach(section => sectionObserver.observe(section));

    // Handle clicks for indicator immediately
    navLinks.forEach(link => {
        if(link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', (e) => {
                updateNavIndicator(e.target);
            });
        }
    });

    // 3. Scroll Reveal Animations (AOS Style)
    // First, let's dynamically add reveal classes to elements if they don't have them
    document.querySelectorAll('.page-title').forEach(el => el.classList.add('reveal'));
    document.querySelectorAll('.project-card-detailed, .bento-tile, .journey-milestone').forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });


});

// 5. Sleek Toast Notification
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'ux-toast';
    toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};

// Intercept form submission for Contact Form to use Toast instead of Alert
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-modal-content form');
    if (contactForm) {
        contactForm.removeAttribute('onsubmit');
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page reload
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);

            try {
                const response = await fetch('https://formspree.io/f/xlgqnrel', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Show custom premium toast
                    showToast("Message sent successfully! ✨ I'll get back to you soon.");
                    
                    // Reset form and close modal
                    contactForm.reset();
                    setTimeout(() => {
                        closeContact();
                    }, 1500);
                } else {
                    showToast("Oops! There was a problem submitting your form.", "error");
                }
            } catch (error) {
                showToast("Oops! There was a problem submitting your form.", "error");
            } finally {
                // Restore button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
