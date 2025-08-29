// Animation Controller
class AnimationController {
    constructor() {
        this.observers = new Map();
        this.animationQueue = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupParallaxEffects();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: [0.1, 0.3, 0.5],
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target);
                }
            });
        }, options);

        // Observe all animation elements
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            observer.observe(element);
        });

        this.observers.set('scroll', observer);
    }

    triggerAnimation(element) {
        const animationType = element.getAttribute('data-animation') || 'fade-up';
        const delay = parseInt(element.getAttribute('data-delay')) || 0;
        const duration = element.getAttribute('data-duration') || '0.8s';

        // Add to animation queue
        this.animationQueue.push({
            element,
            animationType,
            delay,
            duration
        });

        if (!this.isProcessing) {
            this.processAnimationQueue();
        }
    }

    processAnimationQueue() {
        this.isProcessing = true;

        const processNext = () => {
            if (this.animationQueue.length === 0) {
                this.isProcessing = false;
                return;
            }

            const animation = this.animationQueue.shift();
            
            setTimeout(() => {
                this.executeAnimation(animation);
                processNext();
            }, animation.delay);
        };

        processNext();
    }

    executeAnimation(animation) {
        const { element, animationType, duration } = animation;
        
        // Set custom duration if specified
        if (duration !== '0.8s') {
            element.style.transitionDuration = duration;
        }

        // Apply animation class
        element.classList.add('animated');
        
        // Add specific animation class if needed
        switch (animationType) {
            case 'bounce':
                element.classList.add('bounce');
                break;
            case 'pulse':
                element.classList.add('pulse');
                break;
            case 'shake':
                element.classList.add('shake');
                break;
            case 'wobble':
                element.classList.add('wobble');
                break;
            case 'flip-in-x':
                element.classList.add('flip-in-x');
                break;
            case 'flip-in-y':
                element.classList.add('flip-in-y');
                break;
            case 'rotate-in':
                element.classList.add('rotate-in');
                break;
            case 'zoom-in-up':
                element.classList.add('zoom-in-up');
                break;
        }

        // Remove observer after animation
        if (this.observers.has('scroll')) {
            this.observers.get('scroll').unobserve(element);
        }
    }

    setupScrollAnimations() {
        let ticking = false;

        const updateScrollAnimations = () => {
            const scrollY = window.pageYOffset;
            const windowHeight = window.innerHeight;

            // Parallax backgrounds
            const parallaxElements = document.querySelectorAll('.parallax');
            parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-speed') || 0.5;
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });

            // Navigation background opacity
            const nav = document.getElementById('main-nav');
            if (nav) {
                const opacity = Math.min(scrollY / 100, 1);
                nav.style.backgroundColor = `rgba(255, 255, 255, ${0.9 + (opacity * 0.1)})`;
            }

            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate);
    }

    setupHoverAnimations() {
        // Enhanced hover effects for cards
        const cards = document.querySelectorAll('.card, .product-card, .news-card, .leader-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addHoverEffect(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeHoverEffect(card);
            });
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.addButtonHoverEffect(button);
            });

            button.addEventListener('mouseleave', () => {
                this.removeButtonHoverEffect(button);
            });
        });
    }

    addHoverEffect(element) {
        element.style.transform = 'translateY(-8px) scale(1.02)';
        element.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    removeHoverEffect(element) {
        element.style.transform = 'translateY(0) scale(1)';
        element.style.boxShadow = '';
    }

    addButtonHoverEffect(button) {
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255,255,255,0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';

        button.style.position = 'relative';
        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    removeButtonHoverEffect(button) {
        // Button hover effect is handled by CSS
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-background, .page-hero');
        
        if (parallaxElements.length === 0) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });

            ticking = false;
        };

        const requestParallaxUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestParallaxUpdate);
    }

    // Utility methods for triggering specific animations
    fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    slideIn(element, direction = 'up', duration = 500) {
        const transforms = {
            up: 'translateY(30px)',
            down: 'translateY(-30px)',
            left: 'translateX(-30px)',
            right: 'translateX(30px)'
        };

        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        requestAnimationFrame(() => {
            element.style.transform = 'translate(0, 0)';
            element.style.opacity = '1';
        });
    }

    scaleIn(element, duration = 500) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        requestAnimationFrame(() => {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        });
    }

    staggerAnimation(elements, animationType = 'fadeIn', staggerDelay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                switch (animationType) {
                    case 'fadeIn':
                        this.fadeIn(element);
                        break;
                    case 'slideIn':
                        this.slideIn(element);
                        break;
                    case 'scaleIn':
                        this.scaleIn(element);
                        break;
                }
            }, index * staggerDelay);
        });
    }

    // Counter animation with easing
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // Typewriter effect
    typeWriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;

        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };

        type();
    }

    // Morphing shape animation
    morphShape(element, shapes, duration = 2000) {
        let currentShape = 0;
        
        const morph = () => {
            element.style.borderRadius = shapes[currentShape];
            currentShape = (currentShape + 1) % shapes.length;
        };

        morph();
        setInterval(morph, duration);
    }

    // Particle system for backgrounds
    createParticleSystem(container, particleCount = 50) {
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: rgba(37, 99, 235, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particle ${Math.random() * 3 + 2}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            
            container.appendChild(particle);
            particles.push(particle);
        }

        return particles;
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.animationQueue = [];
    }
}

// Page transition effects
class PageTransitions {
    constructor() {
        this.transitionDuration = 300;
        this.currentTransition = null;
    }

    fadeTransition(fromPage, toPage) {
        return new Promise((resolve) => {
            fromPage.style.opacity = '0';
            fromPage.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                fromPage.classList.remove('active');
                toPage.classList.add('active');
                toPage.style.opacity = '0';
                toPage.style.transform = 'translateY(20px)';
                
                requestAnimationFrame(() => {
                    toPage.style.opacity = '1';
                    toPage.style.transform = 'translateY(0)';
                    resolve();
                });
            }, this.transitionDuration / 2);
        });
    }

    slideTransition(fromPage, toPage, direction = 'left') {
        return new Promise((resolve) => {
            const slideDistance = direction === 'left' ? '-100%' : '100%';
            
            fromPage.style.transform = `translateX(${slideDistance})`;
            
            setTimeout(() => {
                fromPage.classList.remove('active');
                toPage.classList.add('active');
                toPage.style.transform = `translateX(${direction === 'left' ? '100%' : '-100%'})`;
                
                requestAnimationFrame(() => {
                    toPage.style.transform = 'translateX(0)';
                    resolve();
                });
            }, this.transitionDuration);
        });
    }

    scaleTransition(fromPage, toPage) {
        return new Promise((resolve) => {
            fromPage.style.transform = 'scale(0.8)';
            fromPage.style.opacity = '0';
            
            setTimeout(() => {
                fromPage.classList.remove('active');
                toPage.classList.add('active');
                toPage.style.transform = 'scale(1.2)';
                toPage.style.opacity = '0';
                
                requestAnimationFrame(() => {
                    toPage.style.transform = 'scale(1)';
                    toPage.style.opacity = '1';
                    resolve();
                });
            }, this.transitionDuration / 2);
        });
    }
}

// Scroll-triggered animations
class ScrollAnimations {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.setupScrollTriggers();
        this.setupProgressBars();
        this.setupCounterAnimations();
    }

    setupScrollTriggers() {
        const triggers = document.querySelectorAll('[data-scroll-trigger]');
        
        triggers.forEach(trigger => {
            const targetSelector = trigger.getAttribute('data-scroll-trigger');
            const target = document.querySelector(targetSelector);
            
            if (target) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.executeScrollTrigger(trigger, target);
                        }
                    });
                });

                observer.observe(trigger);
            }
        });
    }

    executeScrollTrigger(trigger, target) {
        const action = trigger.getAttribute('data-action');
        const animation = trigger.getAttribute('data-animation');

        switch (action) {
            case 'animate':
                target.classList.add(animation);
                break;
            case 'count':
                this.animateCounter(target);
                break;
            case 'progress':
                this.animateProgressBar(target);
                break;
        }
    }

    setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const targetWidth = progressBar.style.width;
                    
                    progressBar.style.width = '0%';
                    progressBar.style.transition = 'width 1.5s ease-out';
                    
                    setTimeout(() => {
                        progressBar.style.width = targetWidth;
                    }, 200);
                    
                    observer.unobserve(progressBar);
                }
            });
        });

        progressBars.forEach(bar => observer.observe(bar));
    }

    setupCounterAnimations() {
        const counters = document.querySelectorAll('[data-target]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = parseInt(element.getAttribute('data-duration')) || 2000;
        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOutCubic);
            
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(updateCounter);
    }
}

// Mouse trail effect
class MouseTrail {
    constructor() {
        this.trail = [];
        this.maxTrailLength = 20;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.addTrailPoint(e.clientX, e.clientY);
        });

        this.animate();
    }

    addTrailPoint(x, y) {
        const point = {
            x,
            y,
            life: 1,
            element: this.createTrailElement(x, y)
        };

        this.trail.push(point);

        if (this.trail.length > this.maxTrailLength) {
            const oldPoint = this.trail.shift();
            if (oldPoint.element.parentNode) {
                oldPoint.element.parentNode.removeChild(oldPoint.element);
            }
        }
    }

    createTrailElement(x, y) {
        const element = document.createElement('div');
        element.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 6px;
            height: 6px;
            background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
        `;
        
        document.body.appendChild(element);
        return element;
    }

    animate() {
        this.trail.forEach((point, index) => {
            point.life -= 0.05;
            point.element.style.opacity = point.life;
            point.element.style.transform = `translate(-50%, -50%) scale(${point.life})`;

            if (point.life <= 0) {
                if (point.element.parentNode) {
                    point.element.parentNode.removeChild(point.element);
                }
                this.trail.splice(index, 1);
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize animation systems
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
    window.pageTransitions = new PageTransitions();
    window.scrollAnimations = new ScrollAnimations();
    
    // Optional: Enable mouse trail effect (can be disabled for performance)
    // window.mouseTrail = new MouseTrail();
});

// Export for use in other modules
window.AnimationController = AnimationController;
window.PageTransitions = PageTransitions;
window.ScrollAnimations = ScrollAnimations;