// Main JavaScript functionality
class ABSNovacellWebsite {
    constructor() {
        this.currentPage = 'home';
        this.isLoading = false;
        this.animationObserver = null;
        this.lazyLoadObserver = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.initializeLazyLoading();
        this.initializeCarousels();
        this.initializeTabs();
        this.initializeCounters();
        this.initializeAccordions();
        this.initializeFilterSystem();
        this.initializeNavigation();
        this.initializeForms();
        this.hideLoadingScreen();
        this.initializeBackToTop();
        this.initializeMobileMenu();
    }

    setupEventListeners() {
        // Page navigation
        document.querySelectorAll('[data-page]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = element.getAttribute('data-page');
                this.navigateToPage(targetPage);
            });
        });

        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Window scroll events
        window.addEventListener('scroll', () => {
            this.updateNavigationState();
            this.updateBackToTopButton();
        });

        // Window resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1500);
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Set initial active state
        this.updateActiveNavLink('home');
        
        // Navigation sticky behavior
        const nav = document.getElementById('main-nav');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                nav.style.background = 'rgba(255, 255, 255, 0.95)';
                nav.style.backdropFilter = 'blur(10px)';
            } else {
                nav.style.background = 'rgba(255, 255, 255, 0.95)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    navigateToPage(pageId) {
        if (this.isLoading || pageId === this.currentPage) return;
        
        this.isLoading = true;
        
        // Hide current page
        const currentPageElement = document.querySelector('.page.active');
        if (currentPageElement) {
            currentPageElement.classList.remove('active');
        }
        
        // Show target page with animation
        setTimeout(() => {
            const targetPageElement = document.getElementById(pageId);
            if (targetPageElement) {
                targetPageElement.classList.add('active');
                targetPageElement.scrollIntoView({ behavior: 'smooth' });
                
                // Update navigation
                this.updateActiveNavLink(pageId);
                this.currentPage = pageId;
                
                // Re-trigger animations for new page
                this.triggerPageAnimations(targetPageElement);
            }
            
            this.isLoading = false;
        }, 150);
    }

    updateActiveNavLink(pageId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${pageId}"]`);
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active');
        }
    }

    triggerPageAnimations(pageElement) {
        const animatedElements = pageElement.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animated');
            }, index * 100);
        });
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = element.getAttribute('data-delay') || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animated');
                    }, parseInt(delay));
                    
                    this.animationObserver.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe all animation elements
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            this.animationObserver.observe(element);
        });
    }

    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        this.lazyLoadObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                this.lazyLoadObserver.observe(img);
            });
        }
    }

    initializeCounters() {
        const counters = document.querySelectorAll('[data-target]');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const increment = target / 200;
                    let current = 0;
                    
                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            counter.textContent = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    
                    updateCounter();
                    counterObserver.unobserve(counter);
                }
            });
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    initializeCarousels() {
        // Achievements Carousel
        const achievementsCarousel = document.getElementById('achievements-carousel');
        if (achievementsCarousel) {
            this.initializeCarousel('achievements', {
                container: achievementsCarousel,
                prevBtn: document.getElementById('achievements-prev'),
                nextBtn: document.getElementById('achievements-next'),
                autoPlay: true,
                interval: 4000
            });
        }

        // Stories Slider
        const storiesSlider = document.getElementById('stories-slider');
        if (storiesSlider) {
            this.initializeCarousel('stories', {
                container: storiesSlider,
                prevBtn: document.getElementById('stories-prev'),
                nextBtn: document.getElementById('stories-next'),
                indicators: document.getElementById('stories-indicators'),
                autoPlay: true,
                interval: 6000
            });
        }

        // Partnerships Carousel
        const partnershipsCarousel = document.getElementById('partnerships-carousel');
        if (partnershipsCarousel) {
            this.initializeCarousel('partnerships', {
                container: partnershipsCarousel,
                prevBtn: document.getElementById('partnerships-prev'),
                nextBtn: document.getElementById('partnerships-next'),
                autoPlay: true,
                interval: 4000
            });
        }
    }

    initializeCarousel(name, config) {
        const slides = config.container.querySelectorAll('.carousel-slide, .story-slide, .partnership-slide');
        let currentSlide = 0;
        let autoPlayInterval;

        // Create indicators if container exists
        if (config.indicators) {
            config.indicators.innerHTML = '';
            slides.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
                indicator.addEventListener('click', () => goToSlide(index));
                config.indicators.appendChild(indicator);
            });
        }

        const updateSlides = () => {
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentSlide);
            });

            if (config.indicators) {
                const indicators = config.indicators.querySelectorAll('.indicator');
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentSlide);
                });
            }
        };

        const goToSlide = (index) => {
            currentSlide = index;
            updateSlides();
            resetAutoPlay();
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlides();
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlides();
        };

        const startAutoPlay = () => {
            if (config.autoPlay) {
                autoPlayInterval = setInterval(nextSlide, config.interval);
            }
        };

        const resetAutoPlay = () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                startAutoPlay();
            }
        };

        // Event listeners
        if (config.nextBtn) {
            config.nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoPlay();
            });
        }

        if (config.prevBtn) {
            config.prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoPlay();
            });
        }

        // Touch/swipe support
        let startX = 0;
        config.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        config.container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                resetAutoPlay();
            }
        });

        // Start autoplay
        startAutoPlay();

        // Pause on hover
        config.container.addEventListener('mouseenter', () => {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
        });

        config.container.addEventListener('mouseleave', startAutoPlay);
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update active panel
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === `${targetTab}-tab`) {
                        panel.classList.add('active');
                        // Re-trigger animations for tab content
                        const animatedElements = panel.querySelectorAll('.animate-on-scroll');
                        animatedElements.forEach(element => {
                            element.classList.add('animated');
                        });
                    }
                });
            });
        });
    }

    initializeAccordions() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                const isActive = faqItem.classList.contains('active');

                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });

                // Open clicked item if it wasn't active
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }

    initializeFilterSystem() {
        // Product filter
        const productFilters = document.querySelectorAll('.filter-btn');
        const productCards = document.querySelectorAll('.product-card');

        productFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterValue = filter.getAttribute('data-filter');

                // Update active filter
                productFilters.forEach(btn => btn.classList.remove('active'));
                filter.classList.add('active');

                // Filter products
                productCards.forEach(card => {
                    const categories = card.getAttribute('data-category');
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        card.classList.remove('hidden');
                        card.style.display = 'block';
                    } else {
                        card.classList.add('hidden');
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });

        // News filter
        const newsFilters = document.querySelectorAll('.news-filter .filter-btn');
        const newsCards = document.querySelectorAll('.news-card');

        newsFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterValue = filter.getAttribute('data-filter');

                // Update active filter
                newsFilters.forEach(btn => btn.classList.remove('active'));
                filter.classList.add('active');

                // Filter news
                newsCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'block';
                        card.classList.remove('hidden');
                    } else {
                        card.style.display = 'none';
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    initializeForms() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(contactForm);
            });

            // Real-time validation
            const inputs = contactForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        this.validateField(input);
                    }
                });
            });
        }
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        let isValid = true;
        let message = '';

        // Remove previous error state
        formGroup.classList.remove('error');

        // Validation rules
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        } else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        } else if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }

        if (!isValid) {
            formGroup.classList.add('error');
            errorMessage.textContent = message;
        } else {
            errorMessage.textContent = '';
        }

        return isValid;
    }

    handleFormSubmission(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;

        // Validate all fields
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            // Scroll to first error
            const firstError = form.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Simulate form submission
        submitBtn.classList.add('loading');

        setTimeout(() => {
            submitBtn.classList.remove('loading');
            this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            form.reset();
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    initializeBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    updateBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top');
        const scrollPosition = window.pageYOffset;

        if (scrollPosition > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    initializeMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    updateNavigationState() {
        // Update navigation based on scroll position
        const scrollPosition = window.pageYOffset;
        const nav = document.getElementById('main-nav');

        if (scrollPosition > 50) {
            nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
    }

    handleResize() {
        // Handle responsive adjustments
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (window.innerWidth > 768) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
}

// Global utility functions
function simulateDownload(filename) {
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.innerHTML = `
        <div class="download-content">
            <i class="fas fa-download"></i>
            <span>Downloading ${filename}...</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.innerHTML = `
            <div class="download-content">
                <i class="fas fa-check"></i>
                <span>Download complete!</span>
            </div>
        `;
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }, 3000);
}

// Initialize website functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.absNovacell = new ABSNovacellWebsite();
    
    // Initialize location map toggles
    const locationToggles = document.querySelectorAll('.location-toggle');
    locationToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const location = toggle.getAttribute('data-location');
            const mapId = location === 'india' ? 'india-map' : 
                         location === 'buffalo' ? 'buffalo-map' :
                         location === 'miami' ? 'miami-map' : 
                         'philadelphia-map';
            
            const map = document.getElementById(mapId);
            if (map) {
                if (map.style.display === 'none' || !map.style.display) {
                    map.style.display = 'block';
                    toggle.innerHTML = '<i class="fas fa-map"></i> Hide Map';
                } else {
                    map.style.display = 'none';
                    toggle.innerHTML = '<i class="fas fa-map"></i> View on Map';
                }
            }
        });
    });
    
    // Initialize product modal functionality
    const modal = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    
    const productDetails = {
        'veterinary-vaccines': {
            title: 'Veterinary Vaccines',
            content: `
                <div class="modal-product-content">
                    <img src="https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=500&h=300" alt="Veterinary Vaccines" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    <h4>Comprehensive Veterinary Vaccine Portfolio</h4>
                    <p>Our veterinary vaccines protect livestock and companion animals from major infectious diseases, ensuring animal health and productivity.</p>
                    <h5>Key Products:</h5>
                    <ul>
                        <li><strong>FMD Vaccine:</strong> Foot-and-mouth disease protection for cattle and sheep</li>
                        <li><strong>PPR Vaccine:</strong> Peste des petits ruminants vaccine for goats and sheep</li>
                        <li><strong>Newcastle Disease Vaccine:</strong> Protection for poultry against Newcastle disease</li>
                        <li><strong>Rabies Vaccine:</strong> Post-exposure prophylaxis for companion animals</li>
                    </ul>
                    <h5>Benefits:</h5>
                    <ul>
                        <li>High efficacy and safety profile</li>
                        <li>Extended shelf life and stability</li>
                        <li>Cost-effective disease prevention</li>
                        <li>Regulatory compliant manufacturing</li>
                    </ul>
                </div>
            `
        },
        'human-vaccines': {
            title: 'Human Vaccines',
            content: `
                <div class="modal-product-content">
                    <img src="https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=500&h=300" alt="Human Vaccines" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    <h4>Next-Generation Human Vaccines</h4>
                    <p>Our human vaccine portfolio focuses on preventing infectious diseases with innovative formulations and enhanced efficacy.</p>
                    <h5>Key Products:</h5>
                    <ul>
                        <li><strong>COVID-19 Vaccine:</strong> mRNA-based vaccine with broad variant protection</li>
                        <li><strong>Universal Flu Vaccine:</strong> Broad-spectrum influenza protection</li>
                        <li><strong>Hepatitis B Vaccine:</strong> Enhanced immunogenicity formulation</li>
                        <li><strong>Pneumococcal Vaccine:</strong> Multi-serotype conjugate vaccine</li>
                    </ul>
                    <h5>Innovation Features:</h5>
                    <ul>
                        <li>Novel adjuvant technology for enhanced immunogenicity</li>
                        <li>Cold-chain independent formulations</li>
                        <li>Single-dose and combination vaccines</li>
                        <li>Needle-free delivery options</li>
                    </ul>
                </div>
            `
        },
        'biosimilars': {
            title: 'Biosimilar Therapeutics',
            content: `
                <div class="modal-product-content">
                    <img src="https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=500&h=300" alt="Biosimilars" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    <h4>Cost-Effective Biosimilar Solutions</h4>
                    <p>Our biosimilar portfolio provides affordable alternatives to expensive biologics while maintaining equivalent efficacy and safety.</p>
                    <h5>Therapeutic Areas:</h5>
                    <ul>
                        <li><strong>Oncology:</strong> Monoclonal antibodies for cancer treatment</li>
                        <li><strong>Autoimmune Disorders:</strong> TNF-alpha inhibitors and IL-6 blockers</li>
                        <li><strong>Diabetes:</strong> Insulin analogs and GLP-1 receptor agonists</li>
                        <li><strong>Growth Disorders:</strong> Human growth hormone biosimilars</li>
                    </ul>
                    <h5>Quality Assurance:</h5>
                    <ul>
                        <li>Comprehensive analytical characterization</li>
                        <li>Clinical comparability studies</li>
                        <li>Global regulatory approvals</li>
                        <li>Robust pharmacovigilance systems</li>
                    </ul>
                </div>
            `
        },
        'diagnostic-kits': {
            title: 'Diagnostic Kits',
            content: `
                <div class="modal-product-content">
                    <img src="https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=500&h=300" alt="Diagnostic Kits" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    <h4>Advanced Diagnostic Solutions</h4>
                    <p>Our diagnostic portfolio enables rapid, accurate detection and monitoring of various diseases and conditions.</p>
                    <h5>Product Categories:</h5>
                    <ul>
                        <li><strong>PCR Assays:</strong> Molecular diagnostics for infectious diseases</li>
                        <li><strong>ELISA Kits:</strong> Serological testing for antibodies and antigens</li>
                        <li><strong>Rapid Tests:</strong> Point-of-care testing for immediate results</li>
                        <li><strong>Biomarker Assays:</strong> Disease monitoring and prognosis</li>
                    </ul>
                    <h5>Key Features:</h5>
                    <ul>
                        <li>High sensitivity and specificity</li>
                        <li>User-friendly protocols</li>
                        <li>Rapid turnaround times</li>
                        <li>Cost-effective solutions</li>
                    </ul>
                </div>
            `
        },
        'stem-cells': {
            title: 'Stem Cell Therapy',
            content: `
                <div class="modal-product-content">
                    <img src="https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=500&h=300" alt="Stem Cell Therapy" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    <h4>Regenerative Medicine Solutions</h4>
                    <p>Our stem cell therapy programs focus on developing advanced treatments for degenerative diseases and tissue repair.</p>
                    <h5>Research Areas:</h5>
                    <ul>
                        <li><strong>Mesenchymal Stem Cells (MSCs):</strong> Bone, cartilage, and adipose tissue regeneration</li>
                        <li><strong>Induced Pluripotent Stem Cells (iPSCs):</strong> Disease modeling and drug testing</li>
                        <li><strong>Neural Stem Cells:</strong> Neurological disorder treatments</li>
                        <li><strong>Hematopoietic Stem Cells:</strong> Blood disorder therapies</li>
                    </ul>
                    <h5>Applications:</h5>
                    <ul>
                        <li>Orthopedic and joint disorders</li>
                        <li>Cardiovascular diseases</li>
                        <li>Neurological conditions</li>
                        <li>Autoimmune diseases</li>
                    </ul>
                </div>
            `
        },
        'livestock-cloning': {
            title: 'Livestock Cloning',
            content: `
                <div class="modal-product-content">
                    <img src="https://images.pexels.com/photos/3184351/pexels-photo-3184351.jpeg?auto=compress&cs=tinysrgb&w=500&h=300" alt="Livestock Cloning" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    <h4>Advanced Reproductive Technologies</h4>
                    <p>Our livestock cloning and reproductive technology services help improve animal genetics and productivity.</p>
                    <h5>Services:</h5>
                    <ul>
                        <li><strong>Somatic Cell Nuclear Transfer (SCNT):</strong> Elite animal cloning</li>
                        <li><strong>Embryo Transfer:</strong> Genetic improvement programs</li>
                        <li><strong>In Vitro Fertilization (IVF):</strong> Assisted reproduction</li>
                        <li><strong>Genetic Preservation:</strong> Germplasm banking</li>
                    </ul>
                    <h5>Benefits:</h5>
                    <ul>
                        <li>Preservation of superior genetics</li>
                        <li>Increased productivity and disease resistance</li>
                        <li>Conservation of endangered breeds</li>
                        <li>Accelerated breeding programs</li>
                    </ul>
                </div>
            `
        }
    };
    
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product');
            const product = productDetails[productId];
            
            if (product) {
                document.getElementById('modal-title').textContent = product.title;
                document.getElementById('modal-body').innerHTML = product.content;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// Export for use in other modules
window.ABSNovacellWebsite = ABSNovacellWebsite;