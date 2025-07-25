// static/js/components/uploadComponent.js

class UploadComponent {
    constructor() {
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
    }

    bindEvents() {
        // Data source change
        this.dataSourceSelect.addEventListener('change', () => {
            this.handleDataSourceChange();
        });

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
        
        if (isLocal) {
            this.localUploadSection.classList.remove('hidden');
            this.loadKnowledgeBaseStats();
        } else {
            this.localUploadSection.classList.add('hidden');
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
            // Update UI to show uploading state
            this.uploadBtn.disabled = true;
            this.uploadBtn.innerHTML