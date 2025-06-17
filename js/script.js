// 2Du! Website JavaScript
// Interactive functionality and animations

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                }
            });
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const bars = navToggle.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            }
        });
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Progress rings animation
    function animateProgressRings() {
        const progressRings = document.querySelectorAll('.progress-ring');
        progressRings.forEach(ring => {
            const progress = ring.getAttribute('data-progress') || 75;
            const degrees = (progress / 100) * 360;
            ring.style.background = `conic-gradient(#2563EB 0deg ${degrees}deg, #E5E7EB ${degrees}deg)`;
        });
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                
                // Animate progress rings when they come into view
                if (entry.target.classList.contains('hero-visual')) {
                    setTimeout(animateProgressRings, 500);
                }
                
                // Animate feature cards with stagger
                if (entry.target.classList.contains('feature-card')) {
                    const cards = document.querySelectorAll('.feature-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-fade-in-up');
                        }, index * 100);
                    });
                }
                
                // Animate steps with alternating directions
                if (entry.target.classList.contains('step')) {
                    const steps = document.querySelectorAll('.step');
                    steps.forEach((step, index) => {
                        setTimeout(() => {
                            if (index % 2 === 0) {
                                step.classList.add('animate-fade-in-left');
                            } else {
                                step.classList.add('animate-fade-in-right');
                            }
                        }, index * 200);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.hero-visual, .feature-card, .step, .pricing-card');
    animatedElements.forEach(el => observer.observe(el));
    
    // Early Access Form Handling
    const earlyAccessForm = document.getElementById('early-access-form');
    if (earlyAccessForm) {
        earlyAccessForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const email = formData.get('email');
            const name = formData.get('name');
            const role = formData.get('role');
            
            // Validate form
            if (!email || !name || !role) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner"></span> Joining...';
            submitButton.disabled = true;
            
            // Submit to Formspree for immediate email capture
            fetch('https://formspree.io/f/xpzgkqpv', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    // Show success message
                    showMessage('🎉 Welcome to 2Du! Check your email for next steps.', 'success');
                    
                    // Reset form
                    this.reset();
                    
                    // Track conversion in Google Analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'conversion', {
                            'send_to': 'G-Y6590QZERE',
                            'event_category': 'Email Signup',
                            'event_label': 'Early Access',
                            'value': 1
                        });
                        
                        gtag('event', 'signup', {
                            'event_category': 'engagement',
                            'event_label': 'early_access'
                        });
                    }
                    
                    // Store locally as backup
                    const signupData = {
                        email: email,
                        name: name,
                        role: role,
                        timestamp: new Date().toISOString()
                    };
                    
                    let signups = JSON.parse(localStorage.getItem('2du-signups') || '[]');
                    signups.push(signupData);
                    localStorage.setItem('2du-signups', JSON.stringify(signups));
                    
                    // Redirect to success page after a short delay
                    setTimeout(() => {
                        window.location.href = '/success/';
                    }, 2000);
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('Something went wrong. Please try again.', 'error');
            })
            .finally(() => {
                // Reset button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Show message function
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        // Insert after form
        const form = document.getElementById('early-access-form');
        form.parentNode.insertBefore(messageDiv, form.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
    
    // Typing animation for hero title
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
    
    // Initialize typing animation for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        // Start typing animation after a short delay
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 50);
        }, 1000);
    }
    
    // Parallax effect for hero background orbs
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.gradient-orb');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
    
    // Counter animation for hero stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
        
        updateCounter();
    }
    
    // Initialize counter animations when hero stats come into view
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach((stat, index) => {
                        const text = stat.textContent;
                        let target = 0;
                        
                        if (text.includes('10,000+')) target = 10000;
                        else if (text.includes('95%')) target = 95;
                        else if (text.includes('4.9')) target = 4.9;
                        
                        setTimeout(() => {
                            if (text.includes('%')) {
                                animateCounter(stat, target, 1500);
                                setTimeout(() => {
                                    stat.textContent = target + '%';
                                }, 1500);
                            } else if (text.includes('4.9')) {
                                animateCounter(stat, target, 1500);
                                setTimeout(() => {
                                    stat.textContent = target + '★';
                                }, 1500);
                            } else {
                                animateCounter(stat, target, 2000);
                                setTimeout(() => {
                                    stat.textContent = target.toLocaleString() + '+';
                                }, 2000);
                            }
                        }, index * 200);
                    });
                    
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(heroStats);
    }
    
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click tracking for buttons (replace with actual analytics)
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonType = this.classList.contains('btn-primary') ? 'primary' : 'secondary';
            
            // Track button clicks (replace with actual analytics)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'button',
                    'event_label': buttonText,
                    'custom_parameter': buttonType
                });
            }
            
            console.log(`Button clicked: ${buttonText} (${buttonType})`);
        });
    });
    
    // Initialize progress rings animation on page load
    setTimeout(animateProgressRings, 2000);
    
    // Add loading states to external links
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 1000);
        });
    });
    
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            });
        }
    });
    
    // Add focus styles for accessibility
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #2563EB';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    console.log('2Du! Website initialized successfully! 🚀');
});

