// Check for saved theme preference, system preference, or set default theme
function getThemePreference() {
    // First check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    
    // Then check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    // Default to light
    return 'light';
}

// Apply theme to document with animation
function applyTheme(theme, animate = true) {
    // Apply theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle icon with rotation animation
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        if (animate) {
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                if (theme === 'dark') {
                    themeToggle.className = 'fas fa-sun';
                } else {
                    themeToggle.className = 'fas fa-moon';
                }
                setTimeout(() => {
                    themeToggle.style.transform = 'rotate(0deg)';
                }, 50);
            }, 150);
        } else {
            // No animation for initial load
            if (theme === 'dark') {
                themeToggle.className = 'fas fa-sun';
            } else {
                themeToggle.className = 'fas fa-moon';
            }
        }
    }
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }
}

// Initialize AOS animations
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme on initial load without animation
    const savedTheme = getThemePreference();
    applyTheme(savedTheme, false);
    
    // Listen for system theme changes
    if (window.matchMedia) {
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (colorSchemeQuery.addEventListener) {
            colorSchemeQuery.addEventListener('change', (e) => {
                // Only change if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
        mirror: false
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed header
                    behavior: 'smooth'
                });
                
                // Update URL without refreshing the page
                history.pushState(null, null, targetId);
            }
        });
    });

    // Active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');

    function highlightNavigation() {
        let scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);
    highlightNavigation(); // Run once on page load

    // Portfolio filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterBtns.length && portfolioItems.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-filter');
                
                portfolioItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 100);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // Animated counter for stats section
    const counters = document.querySelectorAll('.counter-value');
    
    if (counters.length) {
        const animateCounters = () => {
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const increment = target / 50; // Speed of counting
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(animateCounters, 20);
                } else {
                    counter.innerText = target;
                }
            });
        };
        
        // Start counter animation when stats section is in view
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounters();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(statsSection);
        }
    }

    // Typing animation for hero section
    const typedElement = document.querySelector('.typed-text');
    if (typedElement) {
        const phrases = JSON.parse(typedElement.getAttribute('data-typed-items'));
        new Typed('.typed-text', {
            strings: phrases,
            typeSpeed: 80,
            backSpeed: 40,
            backDelay: 2000,
            loop: true
        });
    }

    // Form submission handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', formObject);
            
            // Show success message
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                this.reset();
            }, 3000);
        });
    }
    
    // Theme toggle functionality with enhanced animations
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        // Add tooltip to show current mode
        const tooltip = document.createElement('div');
        tooltip.className = 'theme-tooltip';
        tooltip.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? 'Light Mode' : 'Dark Mode';
        themeToggle.appendChild(tooltip);
        
        themeToggle.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });
        
        themeToggle.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
        });
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Update tooltip text
            tooltip.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
            
            // Apply the new theme with animation
            applyTheme(newTheme);
            
            // Add animation effect
            document.body.classList.add('theme-transition');
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, 1000);
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            themeToggle.appendChild(ripple);
            
            const rect = themeToggle.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${-size/4}px`;
            ripple.style.top = `${-size/4}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
});
