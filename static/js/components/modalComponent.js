// static/js/components/modalComponent.js

class ModalComponent {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentCallback = null;
    }

    initializeElements() {
        this.modal = document.getElementById('feedback-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.feedbackText = document.getElementById('feedback-text');
        this.submitBtn = document.getElementById('submit-feedback');
        this.cancelBtn = document.getElementById('cancel-feedback');
        this.closeBtn = document.getElementById('modal-close');
    }

    bindEvents() {
        // Close modal events
        this.closeBtn.addEventListener('click', () => this.hideModal());
        this.cancelBtn.addEventListener('click', () => this.hideModal());
        
        // Submit feedback
        this.submitBtn.addEventListener('click', () => this.submitFeedback());
        
        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hideModal();
            }
        });
        
        // Handle enter key in textarea
        this.feedbackText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.submitFeedback();
            }
        });
    }

    showFeedbackModal(title, placeholder, callback) {
        this.modalTitle.textContent = title;
        this.feedbackText.placeholder = placeholder || 'Enter your feedback...';
        this.feedbackText.value = '';
        this.currentCallback = callback;
        
        this.showModal();
        
        // Focus on textarea
        setTimeout(() => {
            this.feedbackText.focus();
        }, 100);
    }

    showModal() {
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Add animation class if needed
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.9)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modalContent.style.transition = 'all 0.3s ease';
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
        }, 10);
    }

    hideModal() {
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.style.transition = 'all 0.3s ease';
        modalContent.style.transform = 'scale(0.9)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            this.modal.classList.add('hidden');
            document.body.style.overflow = '';
            this.currentCallback = null;
        }, 300);
    }

    async submitFeedback() {
        const feedback = this.feedbackText.value.trim();
        
        if (!feedback) {
            notificationService.warning('Empty Feedback', 'Please provide some feedback before submitting');
            this.feedbackText.focus();
            return;
        }

        if (this.currentCallback) {
            try {
                // Disable submit button
                this.submitBtn.disabled = true;
                this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                await this.currentCallback(feedback);
                this.hideModal();
                
            } catch (error) {
                console.error('Feedback processing failed:', error);
                notificationService.error(
                    'Processing Failed', 
                    error.message || 'Failed to process feedback'
                );
            } finally {
                // Reset submit button
                this.submitBtn.disabled = false;
                this.submitBtn.innerHTML = 'Submit Feedback';
            }
        }
    }

    // Generic confirmation modal
    showConfirmModal(title, message, onConfirm, onCancel = null) {
        return new Promise((resolve) => {
            // Create temporary modal
            const confirmModal = document.createElement('div');
            confirmModal.className = 'modal';
            confirmModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary confirm-cancel">Cancel</button>
                        <button class="btn btn-danger confirm-ok">Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(confirmModal);
            document.body.style.overflow = 'hidden';
            
            const cleanup = () => {
                document.body.removeChild(confirmModal);
                document.body.style.overflow = '';
            };
            
            // Bind events
            confirmModal.querySelector('.modal-close').addEventListener('click', () => {
                cleanup();
                if (onCancel) onCancel();
                resolve(false);
            });
            
            confirmModal.querySelector('.confirm-cancel').addEventListener('click', () => {
                cleanup();
                if (onCancel) onCancel();
                resolve(false);
            });
            
            confirmModal.querySelector('.confirm-ok').addEventListener('click', () => {
                cleanup();
                if (onConfirm) onConfirm();
                resolve(true);
            });
            
            // Close on backdrop click
            confirmModal.addEventListener('click', (e) => {
                if (e.target === confirmModal) {
                    cleanup();
                    if (onCancel) onCancel();
                    resolve(false);
                }
            });
        });
    }

    // Generic alert modal
    showAlertModal(title, message, type = 'info') {
        return new Promise((resolve) => {
            const iconMap = {
                info: 'fas fa-info-circle',
                success: 'fas fa-check-circle',
                warning: 'fas fa-exclamation-triangle',
                error: 'fas fa-exclamation-circle'
            };
            
            const colorMap = {
                info: '#3498db',
                success: '#27ae60',
                warning: '#f39c12',
                error: '#e74c3c'
            };
            
            const alertModal = document.createElement('div');
            alertModal.className = 'modal';
            alertModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 style="color: ${colorMap[type]};">
                            <i class="${iconMap[type]}"></i> ${title}
                        </h3>
                        <button class="modal-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary alert-ok">OK</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(alertModal);
            document.body.style.overflow = 'hidden';
            
            const cleanup = () => {
                document.body.removeChild(alertModal);
                document.body.style.overflow = '';
                resolve();
            };
            
            // Bind events
            alertModal.querySelector('.modal-close').addEventListener('click', cleanup);
            alertModal.querySelector('.alert-ok').addEventListener('click', cleanup);
            
            // Close on backdrop click
            alertModal.addEventListener('click', (e) => {
                if (e.target === alertModal) {
                    cleanup();
                }
            });
            
            // Close on escape
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', escapeHandler);
                    cleanup();
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    }
}

// Create global instance
window.modalComponent = new ModalComponent();