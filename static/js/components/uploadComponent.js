// static/js/components/uploadComponent.js

class UploadComponent {
    constructor() {
        // This constructor is called when the script is loaded.
        // We can defer initialization until the main app is ready.
    }

    init() {
        console.log('UploadComponent: Initializing...');
        this.initializeElements();
        this.bindEvents();
        this.loadKnowledgeBaseStats();
    }

    initializeElements() {
        this.dataSourceSelect = document.getElementById('data-source');
        this.localUploadSection = document.getElementById('local-upload-section');
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.fileList = document.getElementById('file-list');
        this.uploadBtn = document.getElementById('upload-btn');
        this.statsDisplay = document.getElementById('knowledge-base-stats');
        console.log('UploadComponent: Elements initialized.');
    }

    bindEvents() {
        console.log('UploadComponent: Binding events...');
        // Data source change
        if (this.dataSourceSelect) {
            this.dataSourceSelect.addEventListener('change', () => {
                console.log('UploadComponent: Data source changed.');
                this.handleDataSourceChange();
            });
        } else {
            console.error('UploadComponent: dataSourceSelect element not found!');
        }

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Drag and drop
        fileService.setupDragAndDrop(this.uploadArea, (files) => {
            this.handleFileSelection(files);
        });

        // Upload button
        this.uploadBtn.addEventListener('click', () => {
            this.uploadFiles();
        });

        // Initial state
        this.handleDataSourceChange();
    }

    handleDataSourceChange() {
        const isLocal = this.dataSourceSelect.value === 'local';
        console.log(`UploadComponent: handleDataSourceChange called. isLocal: ${isLocal}`);
        
        if (isLocal) {
            this.localUploadSection.classList.remove('hidden');
            console.log('UploadComponent: "local-upload-section" should be visible.');
            this.loadKnowledgeBaseStats();
        } else {
            this.localUploadSection.classList.add('hidden');
            console.log('UploadComponent: "local-upload-section" should be hidden.');
        }
    }

    handleFileSelection(files) {
        const { validFiles, errors } = fileService.validateAndAddFiles(files);

        // Show errors if any
        errors.forEach(error => {
            notificationService.error('File Error', error);
        });

        // Update file list display
        this.updateFileListDisplay();

        // Update upload button state
        this.updateUploadButtonState();

        // Show success message for valid files
        if (validFiles.length > 0) {
            notificationService.success(
                'Files Added', 
                `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} ready for upload`
            );
        }
    }

    updateFileListDisplay() {
        const files = fileService.getSelectedFiles();
        
        if (files.length === 0) {
            this.fileList.innerHTML = '';
            return;
        }

        const fileListHTML = files.map(file => `
            <div class="file-item" data-filename="${file.name}">
                <div class="file-info">
                    <i class="${fileService.getFileIcon(file.name)}"></i>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${fileService.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="remove-file" onclick="uploadComponent.removeFile('${file.name}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        this.fileList.innerHTML = fileListHTML;
    }

    removeFile(filename) {
        if (fileService.removeFile(filename)) {
            this.updateFileListDisplay();
            this.updateUploadButtonState();
            notificationService.info('File Removed', `${filename} removed from upload queue`);
        }
    }

    updateUploadButtonState() {
        const hasFiles = fileService.getSelectedFilesCount() > 0;
        this.uploadBtn.disabled = !hasFiles;
        
        if (hasFiles) {
            const count = fileService.getSelectedFilesCount();
            const size = fileService.formatFileSize(fileService.getTotalSize());
            this.uploadBtn.innerHTML = `
                <i class="fas fa-upload"></i> 
                Upload ${count} File${count > 1 ? 's' : ''} (${size})
            `;
        } else {
            this.uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Files';
        }
    }

    async uploadFiles() {
        const files = fileService.getSelectedFiles();
        
        if (files.length === 0) {
            notificationService.warning('No Files', 'Please select files to upload');
            return;
        }

        try {
            this.uploadBtn.disabled = true;
            this.uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

            // Perform upload
            const result = await apiService.uploadFiles(files);

            // Show success notification
            notificationService.success('Upload Complete', result.message);

            // Clear file list and update state
            fileService.clearSelectedFiles();
            this.updateFileListDisplay();
            this.updateUploadButtonState();

            // Refresh knowledge base stats
            this.loadKnowledgeBaseStats();

        } catch (error) {
            console.error('Upload failed:', error);
            notificationService.error(
                'Upload Failed',
                error.message || 'An unknown error occurred during upload'
            );
            
            // Re-enable upload button on failure
            this.uploadBtn.disabled = false;
            this.updateUploadButtonState();
        }
    }

    async loadKnowledgeBaseStats() {
        try {
            const stats = await apiService.getKnowledgeBaseStats();
            
            if (stats.total_files === 0) {
                this.statsDisplay.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    <span>Your knowledge base is empty. Upload some documents to get started.</span>
                `;
            } else {
                const fileTypesHTML = Object.entries(stats.file_types)
                    .map(([type, count]) => `<li>${type.toUpperCase()}: ${count}</li>`)
                    .join('');

                this.statsDisplay.innerHTML = `
                    <div class="stats-header">
                        <i class="fas fa-chart-bar"></i>
                        <h4>Knowledge Base Stats</h4>
                        <button class="clear-kb-btn" onclick="uploadComponent.confirmClearKnowledgeBase()">
                            <i class="fas fa-trash"></i> Clear All
                        </button>
                    </div>
                    <div class="stats-content">
                        <p><strong>Total Files:</strong> ${stats.total_files}</p>
                        <p><strong>Total Size:</strong> ${stats.total_size_mb.toFixed(2)} MB</p>
                        <p><strong>File Types:</strong></p>
                        <ul>${fileTypesHTML}</ul>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load knowledge base stats:', error);
            this.statsDisplay.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Could not load knowledge base stats.</span>
            `;
        }
    }

    confirmClearKnowledgeBase() {
        if (confirm('Are you sure you want to delete all files from your knowledge base? This action cannot be undone.')) {
            this.clearKnowledgeBase();
        }
    }

    async clearKnowledgeBase() {
        try {
            const result = await apiService.clearKnowledgeBase();
            notificationService.success('Knowledge Base Cleared', result.message);
            this.loadKnowledgeBaseStats();
        } catch (error) {
            console.error('Failed to clear knowledge base:', error);
            notificationService.error(
                'Clear Failed',
                error.message || 'Could not clear knowledge base'
            );
        }
    }
}

// The component is now initialized by the main ChemistryResearchApp
// document.addEventListener('DOMContentLoaded', () => {
//     window.uploadComponent = new UploadComponent();
// });

// Expose the class to the global window object so app.js can find it
window.UploadComponent = UploadComponent;