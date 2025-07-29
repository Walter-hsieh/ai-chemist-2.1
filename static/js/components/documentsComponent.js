// static/js/components/documentsComponent.js

class DocumentsComponent {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.documentsSection = document.getElementById('documents-section');
        this.downloadProposal = document.getElementById('download-proposal');
        this.downloadRecipe = document.getElementById('download-recipe');
        this.downloadTemplate = document.getElementById('download-template');
        this.fullProposalContent = document.getElementById('full-proposal-content');
    }

    bindEvents() {
        // Download links are set up dynamically when documents are generated
    }

    async generateDocuments() {
        try {
            const state = window.app.getState();
            
            // Validate required data
            if (!state.currentSummary || !state.currentProposal || !state.currentSmiles || 
                !state.currentStructureImage || !state.currentMoleculeName) {
                throw new Error('Missing required data for document generation');
            }

            // Show documents section
            this.documentsSection.classList.remove('hidden');
            
            // Show loading state
            this.showLoadingState();
            
            // Scroll to documents section
            Helpers.scrollToElement(this.documentsSection, 100);

            // Get API configuration
            const apiConfig = window.app.getApiConfig();

            // Prepare request data
            const requestData = {
                ...apiConfig,
                summary_text: state.currentSummary,
                proposal_text: state.currentProposal,
                smiles_string: state.currentSmiles,
                structure_image_base64: state.currentStructureImage.replace('data:image/png;base64,', ''),
                molecule_name: state.currentMoleculeName
            };

            // Generate documents
            window.app.showLoading('Generating documents...', 'Creating comprehensive research proposal');
            
            const result = await apiService.generateDocuments(requestData);

            // Display documents
            this.displayDocuments(result);

            // Show success notification
            notificationService.success(
                'Documents Generated',
                'Research proposal and supporting documents are ready for download'
            );

        } catch (error) {
            console.error('Document generation failed:', error);
            notificationService.error(
                'Generation Failed',
                error.message || 'Failed to generate research documents'
            );
            this.showErrorState(error.message);
        } finally {
            window.app.hideLoading();
        }
    }

    showLoadingState() {
        const documentsGrid = this.documentsSection.querySelector('.documents-grid');
        documentsGrid.innerHTML = `
            <div class="loading-documents">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Generating research documents...</p>
                    <p class="loading-subtext">This may take a few moments</p>
                </div>
            </div>
        `;
        
        this.fullProposalContent.innerHTML = `
            <div class="loading-preview">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Preparing proposal preview...</p>
            </div>
        `;
    }

    showErrorState(errorMessage) {
        const documentsGrid = this.documentsSection.querySelector('.documents-grid');
        documentsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to generate documents</p>
                <p class="error-details">${errorMessage}</p>
                <button class="btn btn-primary mt-1" onclick="documentsComponent.generateDocuments()">
                    <i class="fas fa-retry"></i> Try Again
                </button>
            </div>
        `;
    }

    displayDocuments(documentsData) {
        // Create download links
        const proposalUrl = this.createDownloadUrl(
            documentsData.proposal_docx_base64,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        
        const recipeUrl = this.createDownloadUrl(
            documentsData.recipe_file_base64,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        
        const templateUrl = this.createDownloadUrl(
            documentsData.data_template_base64,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        // Update download links
        this.downloadProposal.href = proposalUrl;
        this.downloadRecipe.href = recipeUrl;
        this.downloadTemplate.href = templateUrl;

        // Restore documents grid
        const documentsGrid = this.documentsSection.querySelector('.documents-grid');
        documentsGrid.innerHTML = `
            <div class="document-item">
                <i class="fas fa-file-word"></i>
                <h4>Research Proposal</h4>
                <p>Complete proposal with structure and methodology</p>
                <a href="${proposalUrl}" class="btn btn-download" download="Research_Proposal.docx">
                    <i class="fas fa-download"></i> Download DOCX
                </a>
            </div>
            
            <div class="document-item">
                <i class="fas fa-file-word"></i>
                <h4>Synthesis Recipe</h4>
                <p>Detailed chemical synthesis procedure</p>
                <a href="${recipeUrl}" class="btn btn-download" download="Synthesis_Recipe.docx">
                    <i class="fas fa-download"></i> Download DOCX
                </a>
            </div>
            
            <div class="document-item">
                <i class="fas fa-table"></i>
                <h4>Data Template</h4>
                <p>Experimental data recording template</p>
                <a href="${templateUrl}" class="btn btn-download" download="Data_Template.xlsx">
                    <i class="fas fa-download"></i> Download XLSX
                </a>
            </div>
        `;

        // Display proposal preview
        this.displayProposalPreview(documentsData.full_proposal_text);

        // Add download tracking
        this.trackDownloads();
    }

    createDownloadUrl(base64Data, mimeType) {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: mimeType });
        return URL.createObjectURL(blob);
    }

    displayProposalPreview(proposalText) {
        // Format the proposal text for better display
        const formattedText = this.formatProposalText(proposalText);
        this.fullProposalContent.innerHTML = formattedText;
    }

    formatProposalText(text) {
        // Convert markdown-style formatting to HTML
        let formatted = Helpers.escapeHtml(text);
        
        // Convert headers
        formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        
        // Convert bold text
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic text
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // Convert line breaks
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Wrap in paragraphs
        formatted = '<p>' + formatted + '</p>';
        
        // Clean up empty paragraphs
        formatted = formatted.replace(/<p><\/p>/g, '');
        formatted = formatted.replace(/<p><h([1-6])>/g, '<h$1>');
        formatted = formatted.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
        
        return formatted;
    }

    trackDownloads() {
        // Add click tracking to download links
        const downloadLinks = this.documentsSection.querySelectorAll('.btn-download');
        
        downloadLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const filename = link.download;
                notificationService.info(
                    'Download Started',
                    `Downloading ${filename}...`
                );
                
                // Track download completion (approximate)
                setTimeout(() => {
                    notificationService.success(
                        'Download Complete',
                        `${filename} downloaded successfully`
                    );
                }, 1000);
            });
        });
    }

    // Method to regenerate specific document
    async regenerateDocument(documentType) {
        try {
            notificationService.info('Regenerating', `Recreating ${documentType} document...`);
            
            // For now, regenerate all documents
            // In a more advanced implementation, you could regenerate specific documents
            await this.generateDocuments();
            
        } catch (error) {
            notificationService.error(
                'Regeneration Failed',
                `Failed to regenerate ${documentType}: ${error.message}`
            );
        }
    }

    // Method to clear generated documents
    clearDocuments() {
        this.documentsSection.classList.add('hidden');
        
        // Clean up blob URLs to prevent memory leaks
        if (this.downloadProposal.href.startsWith('blob:')) {
            URL.revokeObjectURL(this.downloadProposal.href);
        }
        if (this.downloadRecipe.href.startsWith('blob:')) {
            URL.revokeObjectURL(this.downloadRecipe.href);
        }
        if (this.downloadTemplate.href.startsWith('blob:')) {
            URL.revokeObjectURL(this.downloadTemplate.href);
        }
    }
}

// Add styles for documents component
if (!document.querySelector('#documents-component-styles')) {
    const style = document.createElement('style');
    style.id = 'documents-component-styles';
    style.textContent = `
        .loading-documents {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            color: #7f8c8d;
        }
        
        .loading-documents .loading-spinner i {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #3498db;
        }
        
        .loading-subtext {
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        
        .loading-preview {
            text-align: center;
            padding: 2rem;
            color: #7f8c8d;
        }
        
        .loading-preview i {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #3498db;
        }
        
        .preview-content h1, .preview-content h2, 
        .preview-content h3, .preview-content h4 {
            color: #2c3e50;
            margin: 1.5rem 0 1rem 0;
            font-weight: 600;
        }
        
        .preview-content h1 {
            font-size: 1.5rem;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
        }
        
        .preview-content h2 {
            font-size: 1.3rem;
            color: #3498db;
        }
        
        .preview-content h3 {
            font-size: 1.1rem;
        }
        
        .preview-content h4 {
            font-size: 1rem;
        }
        
        .preview-content p {
            margin-bottom: 1rem;
            text-align: justify;
        }
        
        .preview-content strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        .preview-content em {
            color: #7f8c8d;
            font-style: italic;
        }
        
        .error-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            color: #e74c3c;
        }
        
        .error-state i {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .error-details {
            color: #7f8c8d;
            font-size: 0.9rem;
            margin: 1rem 0;
        }
        
        @media (max-width: 768px) {
            .loading-documents,
            .error-state {
                padding: 2rem 1rem;
            }
            
            .preview-content {
                font-size: 0.9rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Create global instance
window.documentsComponent = new DocumentsComponent();