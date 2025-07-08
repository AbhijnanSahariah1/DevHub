// Enhanced Portfolio Script with Advanced Features

// Global Variables
let isLoading = true;
let particles = [];
let mouseX = 0;
let mouseY = 0;
let currentTheme = 'dark';

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePreloader();
    initializeCustomCursor();
    initializeNavigation();
    initializeParticles();
    initializeScrollEffects();
    initializeAnimations();
    initializeThemeToggle();
    initializeTypingEffect();
    initializeCounters();
    initializeContactForm();
    initializeEasterEggs();
    initializeBackToTop();
    initializeMobileOptimizations();
});

// Preloader
function initializePreloader() {
    const preloader = document.getElementById('preloader');
    const loadingProgress = document.querySelector('.loading-progress');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                preloader.classList.add('hidden');
                isLoading = false;
                startMainAnimations();
            }, 500);
        }
        loadingProgress.style.width = progress + '%';
    }, 100);
}

// Custom Cursor
function initializeCustomCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = cursor.querySelector('.cursor-dot');
    const cursorOutline = cursor.querySelector('.cursor-outline');
    
    // Hide cursor on mobile
    if (window.innerWidth <= 768) {
        cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        
        cursorOutline.style.left = e.clientX + 'px';
        cursorOutline.style.top = e.clientY + 'px';
    });
    
    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-category, .achievement-card');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });
}

// Enhanced Navigation
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
        
        // Update scroll progress
        updateScrollProgress();
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Smooth scrolling with offset
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    });
}

// Particle System
function initializeParticles() {
    const particleContainer = document.getElementById('particleContainer');
    const particleCount = window.innerWidth > 768 ? 50 : 25;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const speedX = (Math.random() - 0.5) * 0.5;
        const speedY = (Math.random() - 0.5) * 0.5;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        
        particleContainer.appendChild(particle);
        
        particles.push({
            element: particle,
            x: x,
            y: y,
            speedX: speedX,
            speedY: speedY,
            size: size
        });
    }
    
    function animateParticles() {
        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around screen
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            
            // Mouse interaction
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x -= dx * force * 0.01;
                particle.y -= dy * force * 0.01;
            }
            
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// Scroll Effects
function initializeScrollEffects() {
    // Parallax effect for shapes
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
    
    // Skill bars animation
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width;
                entry.target.style.opacity = '1';
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        bar.style.width = '0';
        bar.style.opacity = '0';
        skillObserver.observe(bar);
    });
}

// Advanced Animations
function initializeAnimations() {
    // Intersection Observer for animations
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) translateX(0) scale(1) rotateY(0)';
                }, delay);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        const aosType = el.getAttribute('data-aos');
        
        switch(aosType) {
            case 'fade-up':
                el.style.transform = 'translateY(30px)';
                break;
            case 'fade-left':
                el.style.transform = 'translateX(-30px)';
                break;
            case 'fade-right':
                el.style.transform = 'translateX(30px)';
                break;
            case 'zoom-in':
                el.style.transform = 'scale(0.8)';
                break;
            case 'flip-left':
                el.style.transform = 'rotateY(-90deg)';
                break;
        }
        
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });
    
    // Floating animation for project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) rotateX(5deg) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateX(0) scale(1)';
        });
    });
}

// Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        currentTheme = 'light';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        
        // Update particles color based on theme
        updateParticlesTheme();
    });
}

function updateParticlesTheme() {
    particles.forEach(particle => {
        const opacity = currentTheme === 'dark' ? 0.5 : 0.3;
        particle.element.style.background = currentTheme === 'dark' ? 
            'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
    });
}

// Typing Effect
function initializeTypingEffect() {
    const typingText = document.getElementById('typingText');
    const roleText = document.getElementById('roleText');
    
    const roles = [
        'Student Developer',
        'Game Creator',
        'AI Enthusiast',
        'Problem Solver',
        'Future Engineer'
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeRole() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            roleText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            roleText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }
        
        setTimeout(typeRole, typeSpeed);
    }
    
    setTimeout(typeRole, 1000);
}

// Counter Animation
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
}

// Enhanced Contact Form
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, textarea');
    
    // Enhanced input animations
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Real-time validation
        input.addEventListener('input', () => {
            validateField(input);
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        
        // Remove previous error styling
        field.classList.remove('error');
        
        if (fieldType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        } else if (field.hasAttribute('required')) {
            isValid = value.length > 0;
        }
        
        if (!isValid) {
            field.classList.add('error');
        }
        
        return isValid;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            showNotification('Please fill in all fields correctly.', 'error');
            return;
        }
        
        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = 'Sending...';
        
        // Add loading animation
        submitBtn.classList.add('loading');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            form.reset();
            inputs.forEach(input => {
                input.parentElement.classList.remove('focused');
                input.classList.remove('error');
            });
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = originalText;
            submitBtn.classList.remove('loading');
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        backdrop-filter: blur(20px);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
    
    function removeNotification(notif) {
        notif.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notif.parentElement) {
                notif.parentElement.removeChild(notif);
            }
        }, 300);
    }
}

// Easter Eggs
function initializeEasterEggs() {
    // Konami Code
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateKonamiEasterEgg();
            konamiCode = [];
        }
    });
    
    function activateKonamiEasterEgg() {
        document.body.style.animation = 'rainbow 2s infinite';
        showNotification('🎉 Konami Code activated! You found the secret!', 'success');
        
        // Add rainbow animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.body.style.animation = '';
            document.head.removeChild(style);
        }, 4000);
    }
    
    // Footer easter egg
    const footerEasterEgg = document.getElementById('footerEasterEgg');
    footerEasterEgg.addEventListener('click', () => {
        const messages = [
            '🎮 Game development is my passion!',
            '💻 Code is poetry in motion',
            '🚀 Building the future, one line at a time',
            '🎯 Precision in every pixel',
            '⚡ Speed of thought, power of code'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        showNotification(randomMessage, 'info');
    });
}

// Back to Top Button
function initializeBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Mobile Optimizations
function initializeMobileOptimizations() {
    // Disable hover effects on mobile
    if (window.innerWidth <= 768) {
        const hoverElements = document.querySelectorAll('.project-card, .skill-category, .achievement-card');
        hoverElements.forEach(element => {
            element.style.transform = 'none';
        });
    }
    
    // Touch gestures for project cards
    let startY = 0;
    let startX = 0;
    
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        const diffY = startY - endY;
        const diffX = startX - endX;
        
        // Swipe up to scroll to next section
        if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
            const currentSection = getCurrentSection();
            const nextSection = getNextSection(currentSection);
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    function getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + window.innerHeight / 2;
        
        for (let section of sections) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos <= sectionBottom) {
                return section;
            }
        }
        return null;
    }
    
    function getNextSection(currentSection) {
        if (!currentSection) return null;
        
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const currentIndex = sections.indexOf(currentSection);
        
        return sections[currentIndex + 1] || null;
    }
}

// Scroll Progress
function updateScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    scrollProgress.style.width = scrollPercent + '%';
}

// Start main animations after preloader
function startMainAnimations() {
    // Trigger hero animations
    const heroElements = document.querySelectorAll('.hero-greeting, .hero-title, .hero-roles, .hero-description, .hero-stats, .hero-buttons, .social-links');
    
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Start profile card animation
    const profileCard = document.querySelector('.profile-card-3d');
    setTimeout(() => {
        profileCard.style.opacity = '1';
        profileCard.style.transform = 'translateY(0) scale(1)';
    }, 800);
}

// Performance optimizations
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

// Optimize scroll events
const optimizedScrollHandler = debounce(() => {
    updateScrollProgress();
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// Resize handler
window.addEventListener('resize', debounce(() => {
    // Reinitialize particles on resize
    if (particles.length > 0) {
        particles.forEach(particle => {
            particle.element.remove();
        });
        particles = [];
        initializeParticles();
    }
}, 250));

// Add CSS for additional animations and effects
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .notification {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .form-group.focused label {
        color: var(--primary-color);
        transform: translateY(-2px);
    }
    
    .form-group input.error,
    .form-group textarea.error {
        border-color: var(--error-color);
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
    }
    
    .btn.loading .btn-text::after {
        content: '';
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 8px;
    }
    
    .nav-link.active {
        color: var(--primary-color);
    }
    
    .nav-link.active::after {
        width: 100%;
    }
    
    @media (max-width: 768px) {
        .particle {
            display: none;
        }
        
        .floating-elements {
            display: none;
        }
        
        .geometric-shapes .shape {
            opacity: 0.3;
        }
    }
    
    @media (prefers-reduced-motion: reduce) {
        .particle {
            animation: none;
        }
        
        .shape {
            animation: none;
        }
        
        .floating-icon {
            animation: none;
        }
    }
`;

document.head.appendChild(additionalStyles);

// Console easter egg
console.log(`
🎮 Welcome to Alex Chen's Portfolio!
🚀 Built with passion and lots of coffee
💻 Check out the source code: github.com/alexchen-dev
🎯 Found a bug? Let me know!

Try the Konami Code: ↑↑↓↓←→←→BA
`);

// Service Worker registration for PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
