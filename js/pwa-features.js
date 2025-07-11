// 2Du! PWA Advanced Features
class PWAFeatures {
  constructor() {
    this.isOnline = navigator.onLine;
    this.installPrompt = null;
    this.isInstalled = false;
    this.notificationPermission = 'default';
    
    this.init();
  }
  
  async init() {
    console.log('🚀 2Du! PWA: Initializing advanced features');
    console.log('📱 2Du! PWA: User Agent:', navigator.userAgent);
    console.log('🔒 2Du! PWA: Protocol:', location.protocol);
    console.log('🌐 2Du! PWA: Online status:', navigator.onLine);
    
    // Check if app is installed
    this.checkInstallStatus();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize offline detection
    this.setupOfflineDetection();
    
    // Initialize install prompt
    this.setupInstallPrompt();
    
    // Initialize push notifications
    await this.setupPushNotifications();
    
    // Initialize camera features
    this.setupCameraFeatures();
    
    // Initialize touch gestures
    this.setupTouchGestures();
    
    // Initialize background sync
    this.setupBackgroundSync();
    
    console.log('✅ 2Du! PWA: Advanced features initialized successfully');
    
    // Log manifest status
    this.checkManifestStatus();
    
    // Log service worker status
    this.checkServiceWorkerStatus();
  }
  
  checkInstallStatus() {
    // Check if running in standalone mode (installed)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
    
    if (this.isInstalled) {
      document.body.classList.add('pwa-installed');
      console.log('📱 2Du! PWA: App is installed and running in standalone mode');
    } else {
      console.log('🌐 2Du! PWA: App is running in browser mode');
    }
  }
  
  async checkManifestStatus() {
    try {
      const response = await fetch('/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        console.log('📋 2Du! PWA: Manifest loaded successfully');
        console.log('📋 2Du! PWA: App name:', manifest.name);
        console.log('📋 2Du! PWA: Icons count:', manifest.icons?.length || 0);
        console.log('📋 2Du! PWA: Start URL:', manifest.start_url);
        console.log('📋 2Du! PWA: Display mode:', manifest.display);
      } else {
        console.error('❌ 2Du! PWA: Manifest failed to load:', response.status);
      }
    } catch (error) {
      console.error('❌ 2Du! PWA: Manifest error:', error);
    }
  }
  
  async checkServiceWorkerStatus() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          console.log('🔧 2Du! PWA: Service worker registered');
          console.log('🔧 2Du! PWA: SW state:', registration.active?.state);
          console.log('🔧 2Du! PWA: SW scope:', registration.scope);
        } else {
          console.log('⚠️ 2Du! PWA: No service worker registration found');
        }
      } catch (error) {
        console.error('❌ 2Du! PWA: Service worker check failed:', error);
      }
    } else {
      console.log('❌ 2Du! PWA: Service workers not supported');
    }
  }
  
  setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
    
    // App install events with enhanced debugging for Brave browser
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 2Du! PWA: beforeinstallprompt event fired - install prompt captured');
      console.log('📱 2Du! PWA: Browser:', navigator.userAgent.includes('Brave') ? 'Brave' : 'Other');
      e.preventDefault();
      this.installPrompt = e;
      
      // Show install banner immediately when prompt is available
      setTimeout(() => {
        this.showInstallBanner();
      }, 1000); // Small delay to ensure page is ready
    });
    
    window.addEventListener('appinstalled', () => {
      console.log('🎉 2Du! PWA: App installed successfully');
      this.isInstalled = true;
      this.hideInstallBanner();
      this.showInstallSuccess();
    });
    
    // Visibility change for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.triggerBackgroundSync();
      }
    });
    
    // Mobile-specific events for better touch handling
    document.addEventListener('touchstart', () => {
      // Enable touch interactions
    }, { passive: true });
    
    // Enhanced install prompt detection for Brave browser
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.checkInstallPromptAvailability();
      }, 3000); // Reduced delay for faster detection
    });
    
    // Additional check on DOMContentLoaded for immediate detection
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        this.checkInstallPromptAvailability();
      }, 1000); // Faster initial check
    });
    
    // Brave browser specific checks
    if (navigator.userAgent.includes('Brave') || navigator.brave) {
      console.log('🦁 2Du! PWA: Brave browser detected, using enhanced compatibility mode');
      
      // Additional checks for Brave browser
      setTimeout(() => {
        this.checkBraveInstallCompatibility();
      }, 2000);
      
      // Periodic checks for Brave (beforeinstallprompt may be delayed)
      setInterval(() => {
        if (!this.installPrompt && !this.isInstalled) {
          this.checkInstallPromptAvailability();
        }
      }, 10000); // Check every 10 seconds
    }
    
    // Set up hero notification button event listener
    this.setupHeroNotificationButton();
  }
  
  setupHeroNotificationButton() {
    // Wait for DOM to be ready
    const setupButton = () => {
      const heroButton = document.getElementById('hero-enable-notifications');
      if (heroButton) {
        console.log('🔔 2Du! PWA: Setting up hero notification button event listeners');
        
        // Add both click and touchend events for better mobile support
        ['click', 'touchend'].forEach(eventType => {
          heroButton.addEventListener(eventType, async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔔 2Du! PWA: Hero enable notifications button clicked via', eventType);
            
            // Call the same notification request function
            await this.requestNotificationPermission();
          }, { passive: false });
        });
        
        console.log('✅ 2Du! PWA: Hero notification button event listeners added successfully');
      } else {
        console.log('⚠️ 2Du! PWA: Hero notification button not found, retrying...');
        // Retry after a short delay
        setTimeout(setupButton, 500);
      }
    };
    
    // Try to set up immediately, then retry if needed
    setupButton();
  }
  
  checkInstallPromptAvailability() {
    console.log('🔍 2Du! PWA: === Install Prompt Availability Check ===');
    console.log('📱 2Du! PWA: Install prompt available:', !!this.installPrompt);
    console.log('📱 2Du! PWA: Is installed:', this.isInstalled);
    console.log('🌐 2Du! PWA: User agent:', navigator.userAgent);
    console.log('🔒 2Du! PWA: Is HTTPS:', location.protocol === 'https:');
    console.log('🔧 2Du! PWA: Service worker registered:', !!navigator.serviceWorker.controller);
    
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ 2Du! PWA: App is running in standalone mode (already installed)');
      this.isInstalled = true;
      return;
    }
    
    // Show install banner if conditions are met
    if (!this.isInstalled && !this.installPrompt) {
      console.log('⚠️ 2Du! PWA: No automatic install prompt detected, showing manual install option');
      this.showManualInstallBanner();
    } else if (!this.isInstalled && this.installPrompt) {
      console.log('✅ 2Du! PWA: Install prompt available, showing install banner');
      this.showInstallBanner();
    }
  }
  
  checkBraveInstallCompatibility() {
    console.log('🦁 2Du! PWA: === Brave Browser Install Compatibility Check ===');
    
    // Check PWA installation criteria for Brave
    const criteria = {
      https: location.protocol === 'https:',
      manifest: !!document.querySelector('link[rel="manifest"]'),
      serviceWorker: 'serviceWorker' in navigator,
      swRegistered: !!navigator.serviceWorker.controller,
      beforeInstallPrompt: !!this.installPrompt,
      standalone: window.matchMedia('(display-mode: standalone)').matches
    };
    
    console.log('🔍 2Du! PWA: Brave install criteria:', criteria);
    
    // Check if all basic criteria are met
    const basicCriteriaMet = criteria.https && criteria.manifest && criteria.serviceWorker;
    
    if (!basicCriteriaMet) {
      console.log('❌ 2Du! PWA: Basic PWA criteria not met for Brave');
      return;
    }
    
    // If criteria are met but no prompt, show manual install
    if (basicCriteriaMet && !criteria.beforeInstallPrompt && !criteria.standalone) {
      console.log('🦁 2Du! PWA: Brave browser - criteria met but no prompt, showing manual install');
      setTimeout(() => {
        this.showManualInstallBanner();
      }, 1000);
    }
    
    // Check if Brave has specific PWA settings that might block the prompt
    if (navigator.brave) {
      console.log('🦁 2Du! PWA: Brave API detected, checking PWA support');
      // Brave browser has specific PWA handling
    }
  }
  
  showManualInstallBanner() {
    // Only show if not already installed and no automatic prompt
    if (this.isInstalled || this.installPrompt) {
      console.log('📱 2Du! PWA: Skipping manual install banner - already installed or prompt available');
      return;
    }
    
    // Check if manual banner already exists
    if (document.getElementById('manual-install-banner')) {
      console.log('📱 2Du! PWA: Manual install banner already exists');
      return;
    }
    
    console.log('📱 2Du! PWA: Showing manual install banner for Brave/unsupported browsers');
    
    const banner = document.createElement('div');
    banner.id = 'manual-install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-text">
          <h3>📱 Install 2Du! App</h3>
          <p>Add to your home screen for the best experience</p>
        </div>
        <div class="banner-buttons">
          <button id="manual-install-button" class="btn btn-primary">How to Install</button>
          <button id="dismiss-manual-install" class="btn btn-secondary">Later</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Enhanced install button click with mobile support
    const installButton = document.getElementById('manual-install-button');
    const dismissButton = document.getElementById('dismiss-manual-install');
    
    // Add both click and touchend events for better mobile support
    ['click', 'touchend'].forEach(eventType => {
      installButton.addEventListener(eventType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('📱 2Du! PWA: Manual install button triggered via', eventType);
        this.showInstallInstructions();
        banner.remove();
      }, { passive: false });
      
      dismissButton.addEventListener(eventType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('📱 2Du! PWA: Dismiss manual install triggered via', eventType);
        banner.remove();
      }, { passive: false });
    });
  }
  
  showInstallInstructions() {
    const isBrave = navigator.userAgent.includes('Brave') || navigator.brave;
    const isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Brave');
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    const isFirefox = navigator.userAgent.includes('Firefox');
    
    let instructions = '';
    
    if (isBrave) {
      instructions = `
        <h3>🦁 Install on Brave Browser:</h3>
        <ol>
          <li>Click the menu button (⋮) in the top right</li>
          <li>Select "Install 2Du!..." or "Add to Home screen"</li>
          <li>Click "Install" in the popup</li>
          <li>The app will be added to your desktop/home screen</li>
        </ol>
        <p><strong>Note:</strong> If you don't see the install option, make sure Brave's PWA features are enabled in Settings → Advanced → Privacy and security → Site settings → Additional content settings → Progressive Web Apps.</p>
      `;
    } else if (isChrome) {
      instructions = `
        <h3>🌐 Install on Chrome:</h3>
        <ol>
          <li>Click the install icon (⊞) in the address bar</li>
          <li>Or click menu (⋮) → "Install 2Du!..."</li>
          <li>Click "Install" in the popup</li>
        </ol>
      `;
    } else if (isSafari) {
      instructions = `
        <h3>🍎 Install on Safari:</h3>
        <ol>
          <li>Tap the Share button (□↗)</li>
          <li>Scroll down and tap "Add to Home Screen"</li>
          <li>Tap "Add" to confirm</li>
        </ol>
      `;
    } else if (isFirefox) {
      instructions = `
        <h3>🦊 Install on Firefox:</h3>
        <ol>
          <li>Click the menu button (☰)</li>
          <li>Select "Install 2Du!..." if available</li>
          <li>Or bookmark this page for quick access</li>
        </ol>
      `;
    } else {
      instructions = `
        <h3>📱 Install Instructions:</h3>
        <ol>
          <li>Look for an install icon in your browser's address bar</li>
          <li>Or check your browser's menu for "Install" or "Add to Home Screen"</li>
          <li>Follow the prompts to install the app</li>
        </ol>
      `;
    }
    
    const modal = document.createElement('div');
    modal.className = 'install-instructions-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>📱 Install 2Du! App</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          ${instructions}
          <p><strong>Benefits of installing:</strong></p>
          <ul>
            <li>✅ Faster loading and offline access</li>
            <li>✅ Desktop/home screen shortcut</li>
            <li>✅ Full-screen app experience</li>
            <li>✅ Push notifications (when available)</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary close-modal">Got it!</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelectorAll('.close-modal').forEach(button => {
      button.addEventListener('click', () => {
        modal.remove();
      });
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  setupOfflineDetection() {
    // Initialize with navigator.onLine but don't rely on it completely
    this.handleOnlineStatus(navigator.onLine);
    
    // Only do periodic checks if navigator.onLine is false
    // This prevents unnecessary network requests when online
    setInterval(() => {
      if (!navigator.onLine || !this.isOnline) {
        this.checkConnectivity();
      }
    }, 30000); // Check every 30 seconds only when potentially offline
  }
  
  async checkConnectivity() {
    try {
      // Use a lightweight request to check connectivity
      // Try the main page first, then fallback to a simple fetch
      const response = await fetch('/', {
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors'
      });
      this.handleOnlineStatus(true);
    } catch (error) {
      // If that fails, try a simple connectivity test
      try {
        const testResponse = await fetch(window.location.origin, {
          method: 'HEAD',
          cache: 'no-cache'
        });
        this.handleOnlineStatus(testResponse.ok);
      } catch (secondError) {
        this.handleOnlineStatus(false);
      }
    }
  }
  
  handleOnlineStatus(isOnline) {
    console.log('2Du! PWA: Online status changed to:', isOnline);
    this.isOnline = isOnline;
    
    const offlineIndicator = document.getElementById('offline-indicator');
    if (!offlineIndicator) {
      this.createOfflineIndicator();
    }
    
    if (isOnline) {
      document.body.classList.remove('offline');
      document.getElementById('offline-indicator').classList.remove('show');
      this.triggerBackgroundSync();
      console.log('2Du! PWA: App is online - hiding offline indicator');
    } else {
      document.body.classList.add('offline');
      document.getElementById('offline-indicator').classList.add('show');
      console.log('2Du! PWA: App is offline - showing offline indicator');
    }
  }
  
  createOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.className = 'offline-indicator';
    indicator.innerHTML = `
      <i class="fas fa-wifi-slash"></i>
      You're offline. Changes will sync when connection is restored.
    `;
    document.body.appendChild(indicator);
  }
  
  setupInstallPrompt() {
    // Create install banner
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner hidden';
    banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-text">
          <h3>Install 2Du! App</h3>
          <p>Get the full app experience with offline access and notifications</p>
        </div>
        <div class="banner-buttons">
          <button id="install-button" class="btn btn-primary">Install</button>
          <button id="dismiss-install" class="btn btn-secondary">Later</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Enhanced install button click with mobile support
    const installButton = document.getElementById('install-button');
    const dismissButton = document.getElementById('dismiss-install');
    
    // Add both click and touchend events for better mobile support
    ['click', 'touchend'].forEach(eventType => {
      installButton.addEventListener(eventType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('2Du! PWA: Install button triggered via', eventType);
        this.promptInstall();
      }, { passive: false });
      
      dismissButton.addEventListener(eventType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('2Du! PWA: Dismiss button triggered via', eventType);
        this.hideInstallBanner();
      }, { passive: false });
    });
  }
  
  showInstallBanner() {
    console.log('2Du! PWA: Attempting to show install banner');
    
    if (!this.isInstalled) {
      const banner = document.getElementById('install-banner');
      if (banner) {
        banner.classList.remove('hidden');
        console.log('2Du! PWA: Install banner shown successfully');
      } else {
        console.log('2Du! PWA: Install banner element not found, creating it');
        this.setupInstallPrompt();
        setTimeout(() => {
          const newBanner = document.getElementById('install-banner');
          if (newBanner) {
            newBanner.classList.remove('hidden');
          }
        }, 100);
      }
    } else {
      console.log('2Du! PWA: App already installed, not showing banner');
    }
  }
  
  hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.classList.add('hidden');
      console.log('2Du! PWA: Install banner hidden');
    }
  }
  
  async promptInstall() {
    console.log('2Du! PWA: promptInstall called, installPrompt:', !!this.installPrompt);
    
    if (this.installPrompt) {
      try {
        console.log('2Du! PWA: Showing install prompt');
        this.installPrompt.prompt();
        const result = await this.installPrompt.userChoice;
        
        console.log('2Du! PWA: User choice:', result.outcome);
        
        if (result.outcome === 'accepted') {
          console.log('2Du! PWA: User accepted install prompt');
        } else {
          console.log('2Du! PWA: User dismissed install prompt');
        }
        
        this.installPrompt = null;
        this.hideInstallBanner();
      } catch (error) {
        console.error('2Du! PWA: Error showing install prompt:', error);
        // Fallback for browsers that don't support the install prompt
        this.showInstallInstructions();
      }
    } else {
      console.log('2Du! PWA: No install prompt available, showing instructions');
      this.showInstallInstructions();
    }
  }
  
  showInstallInstructions() {
    const instructions = document.createElement('div');
    instructions.className = 'install-instructions';
    instructions.innerHTML = `
      <div class="instructions-content">
        <h3>Install 2Du! App</h3>
        <div class="instructions-steps">
          <p><strong>On Android Chrome:</strong></p>
          <ol>
            <li>Tap the menu (⋮) in the top right</li>
            <li>Select "Add to Home screen"</li>
            <li>Tap "Add" to install</li>
          </ol>
          <p><strong>On iOS Safari:</strong></p>
          <ol>
            <li>Tap the share button (□↗)</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to install</li>
          </ol>
        </div>
        <button id="close-instructions" class="btn btn-secondary">Got it</button>
      </div>
    `;
    
    document.body.appendChild(instructions);
    
    document.getElementById('close-instructions').addEventListener('click', () => {
      instructions.remove();
      this.hideInstallBanner();
    });
  }
  
  showInstallSuccess() {
    const toast = document.createElement('div');
    toast.className = 'install-success-toast';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      2Du! app installed successfully!
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  async setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      this.notificationPermission = Notification.permission;
      
      if (this.notificationPermission === 'default') {
        this.showNotificationPrompt();
      } else if (this.notificationPermission === 'granted') {
        await this.subscribeToPush();
      }
    }
  }
  
  showNotificationPrompt() {
    const prompt = document.createElement('div');
    prompt.id = 'notification-prompt';
    prompt.className = 'notification-prompt';
    prompt.innerHTML = `
      <div class="prompt-content">
        <h3>Stay Productive with Reminders</h3>
        <p>Get timely notifications to help you stay on track with your goals</p>
        <div class="prompt-buttons">
          <button id="enable-notifications" class="btn btn-primary">Enable Notifications</button>
          <button id="skip-notifications" class="btn btn-secondary">Skip</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(prompt);
    
    const enableButton = document.getElementById('enable-notifications');
    const skipButton = document.getElementById('skip-notifications');
    
    // Enhanced mobile event handling for notification buttons
    // Ensure user gesture compliance for mobile browsers
    ['click', 'touchend'].forEach(eventType => {
      enableButton.addEventListener(eventType, async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('2Du! PWA: Enable notifications button clicked via', eventType);
        
        // Add visual feedback
        enableButton.textContent = 'Enabling...';
        enableButton.disabled = true;
        
        try {
          // Ensure this is called within user gesture for mobile compliance
          await this.requestNotificationPermission();
          prompt.remove();
        } catch (error) {
          console.error('2Du! PWA: Notification enable error:', error);
          enableButton.textContent = 'Enable Notifications';
          enableButton.disabled = false;
          this.showNotificationError('Failed to enable notifications: ' + error.message);
        }
      }, { passive: false });
      
      skipButton.addEventListener(eventType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('2Du! PWA: Skip notifications triggered via', eventType);
        prompt.remove();
      }, { passive: false });
    });
  }
  
  async requestNotificationPermission() {
    try {
      console.log('2Du! PWA: Requesting notification permission');
      
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('2Du! PWA: Notifications not supported');
        this.showNotificationError('Notifications are not supported in this browser.');
        return;
      }
      
      // Check current permission status
      let permission = Notification.permission;
      console.log('2Du! PWA: Current permission status:', permission);
      
      // Request permission if not already granted or denied
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      
      this.notificationPermission = permission;
      console.log('2Du! PWA: Final permission result:', permission);
      
      if (permission === 'granted') {
        console.log('2Du! PWA: Permission granted, attempting push subscription');
        await this.subscribeToPush();
        this.showNotificationSuccess();
      } else if (permission === 'denied') {
        console.log('2Du! PWA: Permission denied');
        this.showNotificationError('Notifications were blocked. You can enable them in your browser settings.');
      } else {
        console.log('2Du! PWA: Permission not granted');
        this.showNotificationError('Notification permission was not granted.');
      }
    } catch (error) {
      console.error('2Du! PWA: Notification permission error:', error);
      this.showNotificationError('Failed to request notification permission: ' + error.message);
    }
  }
  
  showNotificationError(message = 'Failed to enable notifications') {
    const toast = document.createElement('div');
    toast.className = 'notification-error-toast';
    toast.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
  
  async subscribeToPush() {
    try {
      console.log('🔔 2Du! PWA: Starting push subscription process');
      
      // Check if service worker is available
      if (!('serviceWorker' in navigator)) {
        console.log('❌ 2Du! PWA: Service workers not supported');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      console.log('🔧 2Du! PWA: Service worker ready');
      
      // Check if pushManager is available
      if (!registration.pushManager) {
        console.log('❌ 2Du! PWA: Push messaging not supported');
        this.showNotificationError('Push notifications are not supported in this browser');
        return;
      }
      
      console.log('✅ 2Du! PWA: Push manager available');
      
      // Check if VAPID key is configured
      const vapidKey = this.getVapidKey();
      if (!vapidKey) {
        console.log('⚠️ 2Du! PWA: VAPID key not configured, skipping push subscription');
        return;
      }
      
      console.log('🔑 2Du! PWA: VAPID key configured, attempting subscription');
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('✅ 2Du! PWA: Already subscribed to push notifications');
        return;
      }
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });
      
      console.log('🎉 2Du! PWA: Push subscription successful');
      
      // Send subscription to server (optional - graceful failure)
      try {
        await fetch('/api/push-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription)
        });
        console.log('📤 2Du! PWA: Subscription sent to server');
      } catch (serverError) {
        console.log('⚠️ 2Du! PWA: Failed to send subscription to server (non-critical):', serverError.message);
        // Don't throw error - subscription still works locally
      }
      
    } catch (error) {
      console.error('❌ 2Du! PWA: Push subscription failed:', error);
      
      // Provide specific error messages for common issues
      if (error.name === 'NotSupportedError') {
        this.showNotificationError('Push notifications are not supported in this browser');
      } else if (error.name === 'NotAllowedError') {
        this.showNotificationError('Push notifications were blocked. Please enable them in browser settings.');
      } else if (error.message.includes('pushManager')) {
        this.showNotificationError('Push messaging is not available in this browser');
      } else {
        this.showNotificationError('Failed to set up push notifications: ' + error.message);
      }
    }
  }
  
  getVapidKey() {
    // Return the VAPID public key if configured
    // This should be replaced with your actual VAPID public key
    
    // Safe VAPID key access as recommended
    const vapidKey = typeof process !== 'undefined' && process.env?.VAPID_PUBLIC_KEY
        ? process.env.VAPID_PUBLIC_KEY
        : (typeof window !== 'undefined' && window.VAPID_PUBLIC_KEY)
        ? window.VAPID_PUBLIC_KEY
        : null;
    
    // For development/testing, return null to skip push notifications
    if (!vapidKey || vapidKey === 'YOUR_VAPID_PUBLIC_KEY') {
      console.log('2Du! PWA: VAPID key not configured, push notifications disabled');
      return null;
    }
    
    console.log('2Du! PWA: VAPID key configured successfully');
    return vapidKey;
  }
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  showNotificationSuccess() {
    const toast = document.createElement('div');
    toast.className = 'notification-success-toast';
    toast.innerHTML = `
      <i class="fas fa-bell"></i>
      Notifications enabled! You'll receive productivity reminders.
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  setupCameraFeatures() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      this.initializeCameraCapture();
    }
  }
  
  initializeCameraCapture() {
    // Add camera button to relevant sections
    const cameraButtons = document.querySelectorAll('.camera-capture');
    
    cameraButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.openCamera();
      });
    });
  }
  
  async openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      this.showCameraInterface(stream);
    } catch (error) {
      console.error('2Du! PWA: Camera access failed:', error);
      this.showCameraError();
    }
  }
  
  showCameraInterface(stream) {
    const cameraModal = document.createElement('div');
    cameraModal.className = 'camera-modal';
    cameraModal.innerHTML = `
      <div class="camera-container">
        <video id="camera-video" autoplay playsinline></video>
        <canvas id="camera-canvas" style="display: none;"></canvas>
        <div class="camera-controls">
          <button id="capture-photo" class="btn btn-primary">
            <i class="fas fa-camera"></i> Capture
          </button>
          <button id="close-camera" class="btn btn-secondary">
            <i class="fas fa-times"></i> Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(cameraModal);
    
    const video = document.getElementById('camera-video');
    video.srcObject = stream;
    
    document.getElementById('capture-photo').addEventListener('click', () => {
      this.capturePhoto(video, stream);
    });
    
    document.getElementById('close-camera').addEventListener('click', () => {
      this.closeCamera(stream, cameraModal);
    });
  }
  
  capturePhoto(video, stream) {
    const canvas = document.getElementById('camera-canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      this.handleCapturedPhoto(blob);
    }, 'image/jpeg', 0.8);
  }
  
  handleCapturedPhoto(blob) {
    // Create form data for upload
    const formData = new FormData();
    formData.append('photo', blob, `progress-photo-${Date.now()}.jpg`);
    
    // Upload to server or store locally
    this.uploadProgressPhoto(formData);
  }
  
  async uploadProgressPhoto(formData) {
    try {
      if (this.isOnline) {
        const response = await fetch('/api/progress-photos', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          this.showPhotoSuccess();
        }
      } else {
        // Store locally for later sync
        await this.storePhotoOffline(formData);
        this.showPhotoStoredOffline();
      }
    } catch (error) {
      console.error('2Du! PWA: Photo upload failed:', error);
    }
  }
  
  closeCamera(stream, modal) {
    stream.getTracks().forEach(track => track.stop());
    modal.remove();
  }
  
  showCameraError() {
    const toast = document.createElement('div');
    toast.className = 'camera-error-toast';
    toast.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      Camera access denied or not available
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  setupTouchGestures() {
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;
    let isPulling = false;
    
    // Pull-to-refresh functionality
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    });
    
    document.addEventListener('touchmove', (e) => {
      if (isPulling && window.scrollY === 0) {
        currentY = e.touches[0].clientY;
        pullDistance = currentY - startY;
        
        if (pullDistance > 0) {
          e.preventDefault();
          this.showPullToRefresh(pullDistance);
        }
      }
    });
    
    document.addEventListener('touchend', () => {
      if (isPulling && pullDistance > 100) {
        this.triggerRefresh();
      }
      
      this.hidePullToRefresh();
      isPulling = false;
      pullDistance = 0;
    });
    
    // Swipe gestures for navigation
    this.setupSwipeNavigation();
  }
  
  showPullToRefresh(distance) {
    let indicator = document.getElementById('pull-to-refresh');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'pull-to-refresh';
      indicator.className = 'pull-to-refresh';
      indicator.innerHTML = `
        <i class="fas fa-sync-alt pull-to-refresh-icon"></i>
        Pull to refresh
      `;
      document.body.appendChild(indicator);
    }
    
    if (distance > 100) {
      indicator.classList.add('show');
      indicator.innerHTML = `
        <i class="fas fa-sync-alt pull-to-refresh-icon"></i>
        Release to refresh
      `;
    }
  }
  
  hidePullToRefresh() {
    const indicator = document.getElementById('pull-to-refresh');
    if (indicator) {
      indicator.classList.remove('show');
    }
  }
  
  async triggerRefresh() {
    console.log('2Du! PWA: Pull-to-refresh triggered');
    
    // Show loading state
    const indicator = document.getElementById('pull-to-refresh');
    if (indicator) {
      indicator.innerHTML = `
        <i class="fas fa-sync-alt pull-to-refresh-icon"></i>
        Refreshing...
      `;
    }
    
    // Trigger background sync
    await this.triggerBackgroundSync();
    
    // Refresh content
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  
  setupSwipeNavigation() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      this.handleSwipeGesture(startX, startY, endX, endY);
    });
  }
  
  handleSwipeGesture(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 100;
    
    // Horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go back
        this.handleSwipeRight();
      } else {
        // Swipe left - go forward
        this.handleSwipeLeft();
      }
    }
  }
  
  handleSwipeRight() {
    // Navigate back or show side menu
    if (history.length > 1) {
      history.back();
    }
  }
  
  handleSwipeLeft() {
    // Navigate forward or show quick actions
    console.log('2Du! PWA: Swipe left detected');
  }
  
  setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      console.log('2Du! PWA: Background sync available');
    }
  }
  
  async triggerBackgroundSync() {
    try {
      // Check if background sync is supported
      if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
        console.log('2Du! PWA: Background sync not supported, skipping');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      
      // Check if sync is available on the registration
      if (!registration.sync) {
        console.log('2Du! PWA: Sync not available on service worker registration');
        return;
      }
      
      // Register sync events with permission handling
      try {
        await registration.sync.register('sync-tasks');
        await registration.sync.register('sync-progress');
        await registration.sync.register('sync-social');
        console.log('2Du! PWA: Background sync triggered successfully');
      } catch (syncError) {
        if (syncError.name === 'NotAllowedError') {
          console.log('2Du! PWA: Background sync permission denied, gracefully skipping');
        } else {
          console.error('2Du! PWA: Background sync registration failed:', syncError);
        }
      }
    } catch (error) {
      console.error('2Du! PWA: Background sync setup failed:', error);
      // Gracefully continue without background sync
    }
  }
  
  // Offline data storage helpers
  async storeTaskOffline(task) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('2du-offline', 2);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        
        const addRequest = store.add({
          ...task,
          id: Date.now().toString(),
          offline: true,
          timestamp: Date.now()
        });
        
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
    });
  }
  
  async storePhotoOffline(formData) {
    // Convert FormData to storable format
    const photoData = {
      id: Date.now().toString(),
      blob: await formData.get('photo').arrayBuffer(),
      filename: formData.get('photo').name,
      timestamp: Date.now(),
      offline: true
    };
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('2du-offline', 2);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['photos'], 'readwrite');
        const store = transaction.objectStore('photos');
        
        const addRequest = store.add(photoData);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
    });
  }
  
  showPhotoSuccess() {
    const toast = document.createElement('div');
    toast.className = 'photo-success-toast';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      Progress photo uploaded successfully!
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  showPhotoStoredOffline() {
    const toast = document.createElement('div');
    toast.className = 'photo-offline-toast';
    toast.innerHTML = `
      <i class="fas fa-cloud-upload-alt"></i>
      Photo saved offline. Will upload when online.
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize PWA features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pwaFeatures = new PWAFeatures();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAFeatures;
}

