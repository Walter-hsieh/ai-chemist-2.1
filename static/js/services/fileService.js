// static/js/services/fileService.js

class FileService {
    constructor() {
        this.selectedFiles = new Map();
    }

    // Validate file type
    isValidFileType(file) {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        return Config.ALLOWED_EXTENSIONS.includes(extension);
    }

    // Validate file size
    isValidFileSize(file) {
        return file.size <= Config.MAX_FILE_SIZE;
    }

    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get file icon based on extension
    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const iconMap = {
            pdf: 'fas fa-file-pdf',
            docx: 'fas fa-file-word',
            txt: 'fas fa-file-alt'
        };
        return iconMap[extension] || 'fas fa-file';
    }

    // Validate and add files
    validateAndAddFiles(files) {
        const validFiles = [];
        const errors = [];

        Array.from(files).forEach(file => {
            if (!this.isValidFileType(file)) {
                errors.push(`${file.name}: Invalid file type. Allowed: ${Config.ALLOWED_EXTENSIONS.join(', ')}`);
                return;
            }

            if (!this.isValidFileSize(file)) {
                errors.push(`${file.name}: File too large. Max size: ${this.formatFileSize(Config.MAX_FILE_SIZE)}`);
                return;
            }

            if (this.selectedFiles.has(file.name)) {
                errors.push(`${file.name}: File already selected`);
                return;
            }

            validFiles.push(file);
            this.selectedFiles.set(file.name, file);
        });

        return { validFiles, errors };
    }

    // Remove file from selection
    removeFile(filename) {
        return this.selectedFiles.delete(filename);
    }

    // Get all selected files
    getSelectedFiles() {
        return Array.from(this.selectedFiles.values());
    }

    // Clear all selected files
    clearSelectedFiles() {
        this.selectedFiles.clear();
    }

    // Get selected files count
    getSelectedFilesCount() {
        return this.selectedFiles.size;
    }

    // Get total size of selected files
    getTotalSize() {
        let totalSize = 0;
        this.selectedFiles.forEach(file => {
            totalSize += file.size;
        });
        return totalSize;
    }

    // Create download link from base64 data
    createDownloadLink(base64Data, filename, mimeType) {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        return { link, url };
    }

    // Download file from base64
    downloadBase64File(base64Data, filename, mimeType) {
        const { link, url } = this.createDownloadLink(base64Data, filename, mimeType);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // Get MIME type by file extension
    getMimeType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            pdf: 'application/pdf',
            txt: 'text/plain'
        };
        return mimeTypes[extension] || 'application/octet-stream';
    }

    // Handle drag and drop events
    setupDragAndDrop(element, onFilesDropped) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('dragover');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            element.classList.remove('dragover');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                onFilesDropped(files);
            }
        });
    }
}

// Create global instance
window.fileService = new FileService();