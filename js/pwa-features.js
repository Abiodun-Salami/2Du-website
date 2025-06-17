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
    console.log('2Du! PWA: Initializing advanced features');
    
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
    
    console.log('2Du! PWA: Advanced features initialized');
  }
  
  checkInstallStatus() {
    // Check if running in standalone mode (installed)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
    
    if (this.isInstalled) {
      document.body.classList.add('pwa-installed');
      console.log('2Du! PWA: App is installed');
    }
  }
  
  setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
    
    // App install events
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallBanner();
    });
    
    window.addEventListener('appinstalled', () => {
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
    
    // Install button click
    document.getElementById('install-button').addEventListener('click', () => {
      this.promptInstall();
    });
    
    // Dismiss button click
    document.getElementById('dismiss-install').addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }
  
  showInstallBanner() {
    if (!this.isInstalled) {
      document.getElementById('install-banner').classList.remove('hidden');
    }
  }
  
  hideInstallBanner() {
    document.getElementById('install-banner').classList.add('hidden');
  }
  
  async promptInstall() {
    if (this.installPrompt) {
      this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('2Du! PWA: User accepted install prompt');
      } else {
        console.log('2Du! PWA: User dismissed install prompt');
      }
      
      this.installPrompt = null;
      this.hideInstallBanner();
    }
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
    
    document.getElementById('enable-notifications').addEventListener('click', async () => {
      await this.requestNotificationPermission();
      prompt.remove();
    });
    
    document.getElementById('skip-notifications').addEventListener('click', () => {
      prompt.remove();
    });
  }
  
  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        await this.subscribeToPush();
        this.showNotificationSuccess();
      }
    } catch (error) {
      console.error('2Du! PWA: Notification permission error:', error);
    }
  }
  
  async subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Replace with actual VAPID key
      });
      
      // Send subscription to server
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      console.log('2Du! PWA: Push subscription successful');
    } catch (error) {
      console.error('2Du! PWA: Push subscription failed:', error);
    }
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
      const registration = await navigator.serviceWorker.ready;
      
      // Register sync events
      await registration.sync.register('sync-tasks');
      await registration.sync.register('sync-progress');
      await registration.sync.register('sync-social');
      
      console.log('2Du! PWA: Background sync triggered');
    } catch (error) {
      console.error('2Du! PWA: Background sync failed:', error);
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

