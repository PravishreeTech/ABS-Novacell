// Lazy Loading Implementation
class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.contentObserver = null;
        this.loadedImages = new Set();
        this.loadingQueue = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.setupImageLazyLoading();
        this.setupContentLazyLoading();
        this.setupProgressiveImageLoading();
        this.preloadCriticalImages();
    }

    setupImageLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.loadAllImages();
            return;
        }

        const imageObserverOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, imageObserverOptions);

        // Observe all lazy images
        this.observeImages();
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img.lazy');
        lazyImages.forEach(img => {
            if (!this.loadedImages.has(img)) {
                this.imageObserver.observe(img);
            }
        });
    }

    loadImage(img) {
        return new Promise((resolve, reject) => {
            // Skip if already loaded
            if (this.loadedImages.has(img)) {
                resolve(img);
                return;
            }

            // Create a new image element for preloading
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                // Apply loaded image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                
                // Add loading animation
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                });

                this.loadedImages.add(img);
                this.imageObserver.unobserve(img);
                resolve(img);
            };

            imageLoader.onerror = () => {
                // Handle error - show placeholder or retry
                this.handleImageError(img);
                reject(new Error(`Failed to load image: ${img.src}`));
            };

            // Start loading
            imageLoader.src = img.dataset.src || img.src;
        });
    }

    handleImageError(img) {
        // Create placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.cssText = `
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 0.9rem;
            border-radius: 8px;
        `;
        placeholder.innerHTML = '<i class="fas fa-image"></i> Image unavailable';

        img.parentNode.replaceChild(placeholder, img);
    }

    setupContentLazyLoading() {
        const contentObserverOptions = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        this.contentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadContent(entry.target);
                }
            });
        }, contentObserverOptions);

        // Observe lazy content sections
        const lazyContent = document.querySelectorAll('[data-lazy-content]');
        lazyContent.forEach(content => {
            this.contentObserver.observe(content);
        });
    }

    loadContent(element) {
        const contentType = element.getAttribute('data-lazy-content');
        
        switch (contentType) {
            case 'map':
                this.loadMap(element);
                break;
            case 'video':
                this.loadVideo(element);
                break;
            case 'iframe':
                this.loadIframe(element);
                break;
            case 'chart':
                this.loadChart(element);
                break;
            default:
                this.loadGenericContent(element);
        }

        this.contentObserver.unobserve(element);
    }

    loadMap(element) {
        const mapSrc = element.getAttribute('data-src');
        if (mapSrc) {
            const iframe = document.createElement('iframe');
            iframe.src = mapSrc;
            iframe.width = '100%';
            iframe.height = '300';
            iframe.style.border = '0';
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            
            element.appendChild(iframe);
            element.classList.add('loaded');
        }
    }

    loadVideo(element) {
        const videoSrc = element.getAttribute('data-src');
        if (videoSrc) {
            const video = document.createElement('video');
            video.src = videoSrc;
            video.controls = true;
            video.style.width = '100%';
            video.style.borderRadius = '8px';
            
            element.appendChild(video);
            element.classList.add('loaded');
        }
    }

    loadIframe(element) {
        const iframeSrc = element.getAttribute('data-src');
        if (iframeSrc) {
            const iframe = document.createElement('iframe');
            iframe.src = iframeSrc;
            iframe.style.width = '100%';
            iframe.style.height = element.getAttribute('data-height') || '400px';
            iframe.style.border = '0';
            iframe.style.borderRadius = '8px';
            
            element.appendChild(iframe);
            element.classList.add('loaded');
        }
    }

    loadChart(element) {
        // Placeholder for chart loading
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-chart-bar"></i>
                <p>Chart loaded successfully</p>
            </div>
        `;
        
        element.appendChild(chartContainer);
        element.classList.add('loaded');
    }

    loadGenericContent(element) {
        element.classList.add('loaded');
        
        // Trigger any animations for newly loaded content
        const animatedElements = element.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach((animElement, index) => {
            setTimeout(() => {
                animElement.classList.add('animated');
            }, index * 100);
        });
    }

    setupProgressiveImageLoading() {
        // Progressive image enhancement
        const progressiveImages = document.querySelectorAll('[data-progressive]');
        
        progressiveImages.forEach(img => {
            const lowResSrc = img.getAttribute('data-low-res');
            const highResSrc = img.getAttribute('data-high-res');
            
            if (lowResSrc && highResSrc) {
                // Load low-res first
                img.src = lowResSrc;
                img.style.filter = 'blur(5px)';
                img.style.transition = 'filter 0.3s ease';
                
                // Preload high-res
                const highResImage = new Image();
                highResImage.onload = () => {
                    img.src = highResSrc;
                    img.style.filter = 'blur(0px)';
                };
                highResImage.src = highResSrc;
            }
        });
    }

    preloadCriticalImages() {
        // Preload hero and above-the-fold images
        const criticalImages = [
            'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
            'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
            'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800&h=600'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Batch loading for performance
    batchLoadImages(images, batchSize = 3) {
        const batches = [];
        for (let i = 0; i < images.length; i += batchSize) {
            batches.push(images.slice(i, i + batchSize));
        }

        const loadBatch = (batchIndex) => {
            if (batchIndex >= batches.length) return;

            const batch = batches[batchIndex];
            const promises = batch.map(img => this.loadImage(img));

            Promise.allSettled(promises).then(() => {
                // Load next batch after a short delay
                setTimeout(() => {
                    loadBatch(batchIndex + 1);
                }, 100);
            });
        };

        loadBatch(0);
    }

    // Adaptive loading based on connection speed
    adaptiveLoading() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;

            // Adjust loading strategy based on connection
            switch (effectiveType) {
                case 'slow-2g':
                case '2g':
                    this.enableDataSaver();
                    break;
                case '3g':
                    this.enableReducedQuality();
                    break;
                case '4g':
                default:
                    this.enableFullQuality();
                    break;
            }
        }
    }

    enableDataSaver() {
        // Load smaller images and disable auto-play
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            const src = img.src || img.dataset.src;
            if (src && src.includes('pexels.com')) {
                // Reduce image quality for data saving
                const dataSaverSrc = src.replace(/w=\d+&h=\d+/, 'w=400&h=300');
                img.dataset.src = dataSaverSrc;
            }
        });
    }

    enableReducedQuality() {
        // Medium quality images
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            const src = img.src || img.dataset.src;
            if (src && src.includes('pexels.com')) {
                const mediumQualitySrc = src.replace(/w=\d+&h=\d+/, 'w=800&h=600');
                img.dataset.src = mediumQualitySrc;
            }
        });
    }

    enableFullQuality() {
        // Full quality images (default)
    }

    // Cleanup method
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
    }

    // Fallback for browsers without IntersectionObserver
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img.lazy');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            img.classList.remove('lazy');
            img.classList.add('loaded');
        });
    }

    // Manual trigger for dynamic content
    observeNewImages() {
        if (this.imageObserver) {
            this.observeImages();
        }
    }

    // Performance monitoring
    measureLoadingPerformance() {
        const startTime = performance.now();
        let loadedCount = 0;
        const totalImages = document.querySelectorAll('img').length;

        const checkComplete = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                const endTime = performance.now();
                console.log(`All images loaded in ${endTime - startTime}ms`);
            }
        };

        document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                checkComplete();
            } else {
                img.addEventListener('load', checkComplete);
                img.addEventListener('error', checkComplete);
            }
        });
    }
}

// Intersection Observer polyfill for older browsers
if (!('IntersectionObserver' in window)) {
    // Simple polyfill - load everything immediately
    window.IntersectionObserver = class {
        constructor(callback) {
            this.callback = callback;
        }
        
        observe(element) {
            // Immediately trigger callback
            this.callback([{
                target: element,
                isIntersecting: true
            }]);
        }
        
        unobserve() {}
        disconnect() {}
    };
}

// Image loading utilities
class ImageUtils {
    static createPlaceholder(width, height, text = 'Loading...') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, width / 2, height / 2);
        
        return canvas.toDataURL();
    }

    static generateBlurredPlaceholder(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 40;
        canvas.height = 30;
        
        ctx.filter = 'blur(2px)';
        ctx.drawImage(img, 0, 0, 40, 30);
        
        return canvas.toDataURL();
    }

    static optimizeImageUrl(url, width, height, quality = 80) {
        if (url.includes('pexels.com')) {
            // Optimize Pexels URLs
            const baseUrl = url.split('?')[0];
            return `${baseUrl}?auto=compress&cs=tinysrgb&w=${width}&h=${height}&q=${quality}`;
        }
        
        return url;
    }

    static getOptimalImageSize(container) {
        const rect = container.getBoundingClientRect();
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        return {
            width: Math.ceil(rect.width * devicePixelRatio),
            height: Math.ceil(rect.height * devicePixelRatio)
        };
    }
}

// Responsive image loading
class ResponsiveImageLoader {
    constructor() {
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            large: 1440
        };
        
        this.init();
    }

    init() {
        this.setupResponsiveImages();
        this.handleResize();
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupResponsiveImages() {
        const responsiveImages = document.querySelectorAll('[data-responsive]');
        
        responsiveImages.forEach(img => {
            this.updateImageSource(img);
        });
    }

    updateImageSource(img) {
        const currentBreakpoint = this.getCurrentBreakpoint();
        const baseSrc = img.getAttribute('data-src-base');
        
        if (!baseSrc) return;

        const sizes = {
            mobile: img.getAttribute('data-src-mobile') || this.generateResponsiveUrl(baseSrc, 400, 300),
            tablet: img.getAttribute('data-src-tablet') || this.generateResponsiveUrl(baseSrc, 800, 600),
            desktop: img.getAttribute('data-src-desktop') || this.generateResponsiveUrl(baseSrc, 1200, 800),
            large: img.getAttribute('data-src-large') || this.generateResponsiveUrl(baseSrc, 1600, 1200)
        };

        const targetSrc = sizes[currentBreakpoint] || sizes.desktop;
        
        if (img.src !== targetSrc) {
            img.dataset.src = targetSrc;
            
            // Trigger lazy loading if image is in viewport
            if (this.isInViewport(img)) {
                window.lazyLoader.loadImage(img);
            }
        }
    }

    generateResponsiveUrl(baseSrc, width, height) {
        return ImageUtils.optimizeImageUrl(baseSrc, width, height);
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width <= this.breakpoints.tablet) return 'tablet';
        if (width <= this.breakpoints.desktop) return 'desktop';
        return 'large';
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.setupResponsiveImages();
        }, 250);
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
    window.responsiveImageLoader = new ResponsiveImageLoader();
    
    // Monitor loading performance in development
    if (window.location.hostname === 'localhost') {
        window.lazyLoader.measureLoadingPerformance();
    }
});

// Export for use in other modules
window.LazyLoader = LazyLoader;
window.ImageUtils = ImageUtils;
window.ResponsiveImageLoader = ResponsiveImageLoader;