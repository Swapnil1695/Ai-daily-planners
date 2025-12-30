// ads.js - Google AdSense Integration for AI Daily Planner

// AdSense configuration
const AD_CONFIG = {
    client: 'ca-pub-9991916363065932',
    adSlots: {
        sidebar: {
            slotId: 'sidebar-ad-1',
            adUnitPath: '/6355419/Travel/Europe/France/Paris',
            size: [300, 250],
            sizeMapping: [
                [[300, 250], [300, 250]],
                [[320, 100], [320, 50]],
                [[0, 0], 'fluid']
            ]
        },
        content1: {
            slotId: 'content-ad-1',
            adUnitPath: '/6355419/Travel/Europe',
            size: [728, 90],
            sizeMapping: [
                [[970, 90], [970, 90]],
                [[728, 90], [728, 90]],
                [[468, 60], [468, 60]],
                [[320, 50], [320, 50]],
                [[0, 0], 'fluid']
            ]
        },
        content2: {
            slotId: 'content-ad-2',
            adUnitPath: '/6355419/Travel',
            size: [300, 250],
            sizeMapping: [
                [[300, 250], [300, 250]],
                [[320, 100], [320, 50]],
                [[0, 0], 'fluid']
            ]
        },
        bottom: {
            slotId: 'bottom-ad-1',
            adUnitPath: '/6355419/Travel/Europe/France',
            size: [970, 250],
            sizeMapping: [
                [[970, 250], [970, 250]],
                [[728, 90], [728, 90]],
                [[468, 60], [468, 60]],
                [[0, 0], 'fluid']
            ]
        },
        mobile: {
            slotId: 'mobile-ad-1',
            adUnitPath: '/6355419/Travel/Europe/France/Paris',
            size: [320, 50],
            sizeMapping: [
                [[320, 50], [320, 50]],
                [[300, 250], [300, 250]],
                [[0, 0], 'fluid']
            ]
        }
    },
    adLabels: {
        textAd: 'Advertisement',
        nativeAd: 'Ad',
        sponsored: 'Sponsored'
    },
    refreshTime: 30, // seconds (minimum 30 seconds for AdSense)
    maxAdsPerPage: 3,
    enableAutoRefresh: true,
    enableLazyLoading: true,
    privacySettings: {
        personalized: true,
        restrictedDataProcessing: false,
        childDirectedTreatment: false,
        underAgeOfConsent: false
    }
};

// Ad templates for fallback when ads are blocked or fail to load
const AD_TEMPLATES = {
    sidebar: `
        <div class="ad-fallback">
            <span class="ad-label">${AD_CONFIG.adLabels.textAd}</span>
            <div class="ad-content">
                <i class="fas fa-ad"></i>
                <h4>AI Productivity Tools</h4>
                <p>Boost your efficiency by 40% with our AI-powered planning tools</p>
                <button class="ad-cta">Learn More</button>
                <p class="ad-disclaimer"><small>Ad ID: google.com, pub-${AD_CONFIG.client}</small></p>
            </div>
        </div>
    `,
    content: `
        <div class="ad-fallback">
            <span class="ad-label">${AD_CONFIG.adLabels.textAd}</span>
            <div class="ad-content">
                <i class="fas fa-graduation-cap"></i>
                <h4>Master AI Productivity</h4>
                <p>Online Course - 50% Off Today. Learn to automate your daily tasks</p>
                <button class="ad-cta">Enroll Now</button>
                <p class="ad-disclaimer"><small>Ad ID: google.com, pub-${AD_CONFIG.client}</small></p>
            </div>
        </div>
    `,
    bottom: `
        <div class="ad-fallback">
            <span class="ad-label">${AD_CONFIG.adLabels.textAd}</span>
            <div class="ad-content">
                <i class="fas fa-calendar-alt"></i>
                <h4>Advanced Scheduling Tools</h4>
                <p>Try Premium Features Free for 30 Days. No credit card required</p>
                <button class="ad-cta">Start Free Trial</button>
                <p class="ad-disclaimer"><small>Ad ID: google.com, pub-${AD_CONFIG.client}</small></p>
            </div>
        </div>
    `
};

// CSS for ads
const AD_STYLES = `
    /* Ad container styles */
    .ad-container {
        background-color: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        margin: 15px 0;
        border: 1px solid #eaeaea;
        position: relative;
        transition: all 0.3s ease;
    }
    
    .ad-container:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
    }
    
    .ad-label {
        background-color: #f8f9fa;
        color: #6c757d;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        margin: 10px;
        display: inline-block;
        font-weight: 500;
    }
    
    .ad-content {
        padding: 20px;
        text-align: center;
    }
    
    .ad-content i {
        font-size: 36px;
        color: #3498db;
        margin-bottom: 15px;
        display: block;
    }
    
    .ad-content h4 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-size: 16px;
    }
    
    .ad-content p {
        color: #7f8c8d;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 15px;
    }
    
    .ad-cta {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
    }
    
    .ad-cta:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .ad-disclaimer {
        font-size: 11px !important;
        color: #95a5a6 !important;
        margin-top: 10px !important;
    }
    
    /* Responsive ad styles */
    @media (max-width: 768px) {
        .ad-container {
            margin: 10px 0;
        }
        
        .ad-content {
            padding: 15px;
        }
        
        .ad-content i {
            font-size: 28px;
        }
        
        .ad-content h4 {
            font-size: 14px;
        }
        
        .ad-content p {
            font-size: 12px;
        }
    }
    
    /* Ad loading animation */
    .ad-loading {
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .ad-loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Ad blocker detection */
    .ad-blocked-message {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        margin: 15px 0;
    }
    
    .ad-blocked-message i {
        color: #f39c12;
        font-size: 24px;
        margin-bottom: 10px;
        display: block;
    }
    
    .ad-blocked-message p {
        color: #856404;
        margin-bottom: 10px;
    }
    
    .ad-blocked-message button {
        background-color: #f39c12;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    
    /* Premium user ad-free */
    .premium-ad-free {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        margin: 15px 0;
    }
    
    .premium-ad-free i {
        font-size: 48px;
        color: #f1c40f;
        margin-bottom: 15px;
        display: block;
    }
    
    .premium-ad-free h4 {
        color: #2c3e50;
        margin-bottom: 10px;
    }
    
    .premium-ad-free p {
        color: #7f8c8d;
        margin-bottom: 15px;
    }
`;

// Ad Manager Class
class AdManager {
    constructor() {
        this.adsInitialized = false;
        this.adsLoaded = 0;
        this.adsFailed = 0;
        this.adRefreshInterval = null;
        this.isPremiumUser = false;
        this.adBlockerDetected = false;
        
        this.initialize();
    }
    
    initialize() {
        // Inject CSS styles
        this.injectStyles();
        
        // Check for ad blocker
        this.detectAdBlocker();
        
        // Check if user is premium
        this.checkPremiumStatus();
        
        // Load AdSense script if no ad blocker
        if (!this.adBlockerDetected && !this.isPremiumUser) {
            this.loadAdSense();
        }
    }
    
    injectStyles() {
        if (!document.querySelector('#ad-manager-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'ad-manager-styles';
            styleSheet.textContent = AD_STYLES;
            document.head.appendChild(styleSheet);
        }
    }
    
    detectAdBlocker() {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-9999px';
        testAd.style.top = '-9999px';
        testAd.style.height = '1px';
        testAd.style.width = '1px';
        testAd.style.overflow = 'hidden';
        
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            const isBlocked = testAd.offsetHeight === 0;
            this.adBlockerDetected = isBlocked;
            
            if (isBlocked) {
                console.log('Ad blocker detected');
                this.showAdBlockerMessage();
            }
            
            document.body.removeChild(testAd);
        }, 100);
    }
    
    checkPremiumStatus() {
        // Check localStorage or server for premium status
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.isPremiumUser = user.plan === 'premium';
            } catch (e) {
                this.isPremiumUser = false;
            }
        }
    }
    
    loadAdSense() {
        // Check if script is already loaded
        if (document.querySelector('script[src*="adsbygoogle.js"]')) {
            this.initializeAds();
            return;
        }
        
        // Create and load AdSense script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.setAttribute('data-ad-client', AD_CONFIG.client);
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
            console.log('AdSense script loaded successfully');
            this.initializeAds();
        };
        
        script.onerror = () => {
            console.error('Failed to load AdSense script');
            this.showFallbackAds();
        };
        
        document.head.appendChild(script);
    }
    
    initializeAds() {
        if (this.adsInitialized || this.isPremiumUser) return;
        
        // Initialize AdSense
        (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: AD_CONFIG.client,
            enable_page_level_ads: false,
            overlays: { bottom: true }
        });
        
        this.adsInitialized = true;
        console.log('AdSense initialized');
        
        // Set up ad slots on current page
        this.setupAdSlots();
        
        // Start auto-refresh if enabled
        if (AD_CONFIG.enableAutoRefresh) {
            this.startAutoRefresh();
        }
    }
    
    setupAdSlots() {
        // Find all ad containers on the page
        const adContainers = document.querySelectorAll('.ad-container');
        
        adContainers.forEach((container, index) => {
            if (index >= AD_CONFIG.maxAdsPerPage) {
                container.style.display = 'none';
                return;
            }
            
            if (this.isPremiumUser) {
                this.showPremiumAdFreeMessage(container);
                return;
            }
            
            if (this.adBlockerDetected) {
                this.showFallbackAd(container);
                return;
            }
            
            this.createAdSlot(container);
        });
    }
    
    createAdSlot(container) {
        // Clear container
        container.innerHTML = '';
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ad-loading';
        loadingDiv.innerHTML = '<div class="ad-loading-spinner"></div>';
        container.appendChild(loadingDiv);
        
        // Determine ad slot type based on container size or ID
        const containerId = container.id || '';
        const containerWidth = container.offsetWidth;
        let adSlot;
        
        if (containerId.includes('sidebar') || containerWidth <= 300) {
            adSlot = AD_CONFIG.adSlots.sidebar;
        } else if (containerId.includes('bottom') || containerWidth >= 700) {
            adSlot = AD_CONFIG.adSlots.bottom;
        } else if (containerWidth >= 468) {
            adSlot = AD_CONFIG.adSlots.content1;
        } else {
            adSlot = AD_CONFIG.adSlots.mobile;
        }
        
        // Create ins element for AdSense
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        
        // Set ad attributes
        ins.setAttribute('data-ad-client', AD_CONFIG.client);
        ins.setAttribute('data-ad-slot', adSlot.slotId);
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        ins.setAttribute('data-ad-channel', 'ai-daily-planner');
        
        // Add size mapping if available
        if (adSlot.sizeMapping) {
            ins.setAttribute('data-ad-responsive', 'true');
        }
        
        // Create ad placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'ad-placeholder';
        
        container.appendChild(ins);
        container.appendChild(placeholder);
        
        // Load the ad
        this.loadAd(ins, container);
    }
    
    loadAd(insElement, container) {
        // Set a timeout for ad loading
        const loadTimeout = setTimeout(() => {
            if (!insElement.hasAttribute('data-adsbygoogle-status')) {
                console.log('Ad load timeout, showing fallback');
                this.showFallbackAd(container);
            }
        }, 5000);
        
        // Push to adsbygoogle array
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
            
            // Listen for ad load events
            insElement.addEventListener('load', () => {
                clearTimeout(loadTimeout);
                this.adsLoaded++;
                this.logAdEvent('loaded', container.id || 'unknown');
            });
            
            insElement.addEventListener('error', () => {
                clearTimeout(loadTimeout);
                this.adsFailed++;
                console.log('Ad failed to load, showing fallback');
                this.showFallbackAd(container);
                this.logAdEvent('error', container.id || 'unknown');
            });
            
        } catch (error) {
            clearTimeout(loadTimeout);
            console.error('Error loading ad:', error);
            this.showFallbackAd(container);
        }
    }
    
    showFallbackAd(container) {
        // Clear container
        container.innerHTML = '';
        
        // Determine which template to use
        let template = AD_TEMPLATES.content;
        
        if (container.id && container.id.includes('sidebar')) {
            template = AD_TEMPLATES.sidebar;
        } else if (container.id && container.id.includes('bottom')) {
            template = AD_TEMPLATES.bottom;
        }
        
        // Add fallback ad
        container.innerHTML = template;
        
        // Add click handler for CTA buttons
        const ctaButton = container.querySelector('.ad-cta');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAdClick('fallback', container.id || 'unknown');
                
                // In a real scenario, this would redirect to the advertiser's site
                // For demo purposes, show a message
                alert('Thank you for your interest! This is a demonstration ad. In a real application, this would redirect to the advertiser.');
            });
        }
    }
    
    showPremiumAdFreeMessage(container) {
        container.innerHTML = `
            <div class="premium-ad-free">
                <i class="fas fa-crown"></i>
                <h4>Ad-Free Experience</h4>
                <p>As a premium user, you enjoy an ad-free experience. Thank you for your support!</p>
                <p><small>Upgrade helps us keep developing amazing features</small></p>
            </div>
        `;
    }
    
    showAdBlockerMessage() {
        // Only show message on first detection
        if (document.querySelector('.ad-blocked-message')) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ad-blocked-message';
        messageDiv.innerHTML = `
            <i class="fas fa-shield-alt"></i>
            <p>Ad blocker detected. Please consider disabling it to support our free service.</p>
            <p><small>Ads help us keep this service free for everyone</small></p>
            <button id="dismiss-adblock-message">Dismiss</button>
        `;
        
        // Insert at the beginning of main content
        const mainContent = document.querySelector('.main-content') || document.body;
        if (mainContent.firstChild) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);
        } else {
            mainContent.appendChild(messageDiv);
        }
        
        // Add dismiss handler
        messageDiv.querySelector('#dismiss-adblock-message').addEventListener('click', () => {
            messageDiv.style.display = 'none';
        });
    }
    
    startAutoRefresh() {
        if (this.adRefreshInterval) {
            clearInterval(this.adRefreshInterval);
        }
        
        // AdSense requires minimum 30 seconds between refreshes
        this.adRefreshInterval = setInterval(() => {
            this.refreshAds();
        }, AD_CONFIG.refreshTime * 1000);
    }
    
    refreshAds() {
        if (this.isPremiumUser || this.adBlockerDetected) return;
        
        // Only refresh ads that are currently visible
        const adElements = document.querySelectorAll('.adsbygoogle');
        
        adElements.forEach((adElement) => {
            // Check if ad is in viewport
            if (this.isElementInViewport(adElement)) {
                try {
                    // AdSense refresh method
                    if (window.adsbygoogle && adsbygoogle.loaded) {
                        adsbygoogle.requestNonPersonalizedAds = AD_CONFIG.privacySettings.personalized ? 0 : 1;
                        (adsbygoogle = window.adsbygoogle || []).push({});
                        console.log('Ad refreshed');
                    }
                } catch (error) {
                    console.error('Error refreshing ad:', error);
                }
            }
        });
    }
    
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    handleAdClick(adType, adPosition) {
        // Log ad click for analytics
        console.log(`Ad clicked: ${adType} at ${adPosition}`);
        
        // In a real application, send this to your analytics service
        // Example: googleAnalytics.trackEvent('ad_click', { type: adType, position: adPosition });
    }
    
    logAdEvent(eventType, adPosition) {
        // Log ad events for monitoring
        console.log(`Ad event: ${eventType} at ${adPosition}`);
        
        // In a real application, send this to your analytics service
        // Example: googleAnalytics.trackEvent('ad_event', { event: eventType, position: adPosition });
    }
    
    destroy() {
        // Clean up intervals
        if (this.adRefreshInterval) {
            clearInterval(this.adRefreshInterval);
            this.adRefreshInterval = null;
        }
        
        console.log('Ad Manager destroyed');
    }
    
    // Public method to manually refresh ads
    refreshAllAds() {
        this.refreshAds();
    }
    
    // Public method to check ad status
    getAdStats() {
        return {
            loaded: this.adsLoaded,
            failed: this.adsFailed,
            total: this.adsLoaded + this.adsFailed,
            successRate: this.adsLoaded / (this.adsLoaded + this.adsFailed) || 0,
            premiumUser: this.isPremiumUser,
            adBlockerDetected: this.adBlockerDetected
        };
    }
}

// Initialize Ad Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adManager = new AdManager();
    
    // Expose public methods
    window.refreshAds = () => window.adManager.refreshAllAds();
    window.getAdStats = () => window.adManager.getAdStats();
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.adManager) {
            // Page became visible again, refresh ads
            setTimeout(() => {
                window.adManager.refreshAds();
            }, 1000);
        }
    });
    
    // Handle beforeunload to clean up
    window.addEventListener('beforeunload', () => {
        if (window.adManager) {
            window.adManager.destroy();
        }
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdManager, AD_CONFIG, AD_TEMPLATES };
}