// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navigation active state
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Interest buttons functionality
const interestButtons = document.querySelectorAll('.interest-btn');
interestButtons.forEach(button => {
    button.addEventListener('click', () => {
        interestButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Contact form submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = {
        name: contactForm.querySelector('input[type="text"]').value,
        email: contactForm.querySelector('input[type="email"]').value,
        message: contactForm.querySelector('textarea').value,
        service: document.querySelector('.interest-btn.active').dataset.service
    };
    
    // Simulate form submission
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            contactForm.reset();
            
            // Reset active interest button to first one
            interestButtons.forEach(btn => btn.classList.remove('active'));
            interestButtons[0].classList.add('active');
        }, 2000);
    }, 1500);
});

// Enhanced Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = '';
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        body.style.overflow = '';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        body.style.overflow = '';
    }
});

// Parallax effect for hero section (disabled on mobile for performance)
if (window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        const heroVisual = document.querySelector('.hero-visual');
        
        if (hero && scrolled < hero.offsetHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for fade-in animation
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});

// Project cards hover effects (only on desktop)
if (window.innerWidth > 768) {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Tech icons hover effects (only on desktop)
if (window.innerWidth > 768) {
    const techIcons = document.querySelectorAll('.tech-icon, .skill-icon');
    techIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'translateY(-8px) rotate(5deg)';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateY(0) rotate(0deg)';
        });
    });
}

// Header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(41, 28, 58, 0.98)';
    } else {
        header.style.background = 'rgba(41, 28, 58, 0.95)';
    }
});

// Typing animation for hero text (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation on page load
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        typeWriter(heroTitle, 'Hello 👋,', 150);
    }
});

// Add click handlers for view code buttons
document.querySelectorAll('.view-code-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Get project name from the card
        const projectCard = button.closest('.project-card');
        const projectName = projectCard.querySelector('h3').textContent;
        
        // Simulate opening project (you can replace this with actual links)
        console.log(`Opening ${projectName} repository...`);
        
        // Add ripple effect
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255,255,255,0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.marginLeft = '-50px';
        ripple.style.marginTop = '-50px';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Touch gesture support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) {
        return;
    }

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchStartX - touchEndX;
    let diffY = touchStartY - touchEndY;

    // Reset values
    touchStartX = 0;
    touchStartY = 0;

    // Swipe detection (optional - can be used for navigation)
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
            // Swipe left
            console.log('Swipe left detected');
        } else if (diffX < -50) {
            // Swipe right
            console.log('Swipe right detected');
        }
    }
});

// Viewport height fix for mobile browsers
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Your scroll handling code here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    /* Mobile-specific improvements */
    @media (max-width: 768px) {
        .hero {
            min-height: calc(var(--vh, 1vh) * 100);
        }
        
        /* Improve touch targets */
        .nav-link,
        .social-link,
        .interest-btn,
        .view-code-btn,
        .submit-btn {
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Better spacing for touch */
        .social-links {
            gap: 1.5rem;
        }
        
        .interest-buttons {
            gap: 1rem;
        }
        
        /* Prevent zoom on input focus */
        input, textarea, select {
            font-size: 16px;
        }
    }
    
    /* Loading states */
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
    
    /* Focus styles for accessibility */
    .nav-link:focus,
    .hire-btn:focus,
    .social-link:focus,
    .interest-btn:focus,
    .view-code-btn:focus,
    .submit-btn:focus,
    .contact-social-link:focus {
        outline: 2px solid #8B5CF6;
        outline-offset: 2px;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .hero {
            background: #000;
        }
        
        .nav-link,
        .hero-description {
            color: #fff;
        }
        
        .highlight {
            color: #ff0;
        }
    }
`;
document.head.appendChild(style);