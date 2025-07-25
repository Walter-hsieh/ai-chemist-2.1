// static/js/services/notificationService.js

class NotificationService {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = new Map();
        this.counter = 0;
    }

    show(type, title, message, duration = Config.NOTIFICATION_DURATION) {
        const id = `notification-${++this.counter}`;
        
        const notification = this.createNotification(id, type, title, message);
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }

        return id;
    }

    createNotification(id, type, title, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = id;

        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <i class="${iconMap[type] || iconMap.info}"></i>
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close" onclick="notificationService.remove('${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add click to dismiss
        notification.addEventListener('click', () => this.remove(id));

        return notification;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }

    clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }
}

// Add slide out animation to CSS dynamically
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideOut {
            to { 
                transform: translateX(100%); 
                opacity: 0;
            }
        }
        .notification-close {
            background: none;
            border: none;
            color: #7f8c8d;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            margin-left: auto;
            transition: color 0.3s ease;
        }
        .notification-close:hover {
            color: #e74c3c;
        }
    `;
    document.head.appendChild(style);
}

// Create global instance
window.notificationService = new NotificationService();