import { useEffect, useRef, useCallback } from 'react';

const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1eZqabprWvmYKXkY+QiYKAdnJ0b3p1dXl6e3p7e3t7e3x9gIOEjJKWiH18d3NwbWtnYGZhYWNlZWNlZWRkZGNjY2Jh4eDgn56dm5qZmZiYmJkZGJjY2JhYWBfX19fX19fX19gYGFjZGNkY2Jh4eDgn56dm5qZmZiYmJkZGJjY2JhYWBfX19fX19fX19gYGFjZGNkY2Jh4eDgn56dm5qZmZiYmJkZGJjY2JhYWBfX19fX19fX19gYGFjZGNkY2Jh4eDgn56dm5qZmZiYmJkZGJjY2JhYWBfX19fX19fX19gYGFjZGQ=';

export function useNotificationService() {
  const audioRef = useRef(null);
  const notificationPermissionRef = useRef(Notification?.permission || 'default');

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    if ('vibrate' in navigator) {
      navigator.vibrate = navigator.vibrate.bind(navigator);
    }
  }, []);

  const isMuted = useCallback((type, id) => {
    if (type === 'group') {
      const mutes = JSON.parse(localStorage.getItem('groupMutes') || '{}');
      return !!mutes[id];
    } else if (type === 'user') {
      const mutes = JSON.parse(localStorage.getItem('userMutes') || '{}');
      return !!mutes[id];
    }
    return false;
  }, []);

  const mute = useCallback((type, id, displayName) => {
    if (type === 'group') {
      const mutes = JSON.parse(localStorage.getItem('groupMutes') || '{}');
      mutes[id] = displayName || id;
      localStorage.setItem('groupMutes', JSON.stringify(mutes));
    } else if (type === 'user') {
      const mutes = JSON.parse(localStorage.getItem('userMutes') || '{}');
      mutes[id] = displayName || id;
      localStorage.setItem('userMutes', JSON.stringify(mutes));
    }
  }, []);

  const unmute = useCallback((type, id) => {
    if (type === 'group') {
      const mutes = JSON.parse(localStorage.getItem('groupMutes') || '{}');
      delete mutes[id];
      localStorage.setItem('groupMutes', JSON.stringify(mutes));
    } else if (type === 'user') {
      const mutes = JSON.parse(localStorage.getItem('userMutes') || '{}');
      delete mutes[id];
      localStorage.setItem('userMutes', JSON.stringify(mutes));
    }
  }, []);

  const playSound = useCallback(() => {
    const soundEnabled = localStorage.getItem('soundEnabled');
    if (soundEnabled === 'false') return;
    
    try {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.log('Audio play failed', e);
    }
  }, []);

  const vibrate = useCallback(() => {
    const vibrateEnabled = localStorage.getItem('vibrateEnabled');
    if (vibrateEnabled === 'false') return;
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.log('Vibrate failed', e);
    }
  }, []);

  const showPopup = useCallback((title, body, icon) => {
    const popupEnabled = localStorage.getItem('popupEnabled');
    if (popupEnabled === 'false') return;

    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.innerHTML = `
      <div class="notification-popup-icon">${icon || '💬'}</div>
      <div class="notification-popup-content">
        <div class="notification-popup-title">${title}</div>
        <div class="notification-popup-body">${body}</div>
      </div>
      <button class="notification-popup-close">&times;</button>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .notification-popup {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1f2c34, #2a3a47);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        border: 1px solid #00ba82;
      }
      .notification-popup-icon {
        font-size: 32px;
        flex-shrink: 0;
      }
      .notification-popup-content {
        flex: 1;
        min-width: 0;
      }
      .notification-popup-title {
        font-weight: 600;
        color: #eaeaea;
        font-size: 14px;
        margin-bottom: 4px;
      }
      .notification-popup-body {
        color: #8696a1;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .notification-popup-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: #8696a1;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
      }
      .notification-popup-close:hover {
        color: #eaeaea;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.notification-popup-close');
    closeBtn.onclick = () => {
      popup.remove();
      style.remove();
    };

    setTimeout(() => {
      popup.remove();
      style.remove();
    }, 5000);
  }, []);

  const showBrowserNotification = useCallback(async (title, options) => {
    const notificationsEnabled = localStorage.getItem('notificationsEnabled');
    if (notificationsEnabled === 'false') return null;

    if (!('Notification' in window)) return null;

    if (Notification.permission === 'granted') {
      return new Notification(title, options);
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return new Notification(title, options);
      }
    }

    return null;
  }, []);

  const notify = useCallback(async ({ title, body, icon, sound = true, vibrate: doVibrate = true, popup = true, groupId, userId }) => {
    if (groupId && isMuted('group', groupId)) return;
    if (userId && isMuted('user', userId)) return;

    if (sound) playSound();
    if (doVibrate) vibrate();

    if (popup) {
      showPopup(title, body, icon);
    }

    await showBrowserNotification(title, {
      body,
      icon: icon || '/logo192.png',
      badge: '/logo192.png',
      tag: groupId || userId || 'message',
      renotify: true,
      vibrate: doVibrate ? [200, 100, 200] : [],
    });
  }, [isMuted, playSound, vibrate, showPopup, showBrowserNotification]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      localStorage.setItem('notificationsEnabled', permission === 'granted');
      return permission;
    }

    return 'denied';
  }, []);

  return {
    notify,
    mute,
    unmute,
    isMuted,
    playSound,
    vibrate,
    requestPermission,
  };
}

export default useNotificationService;