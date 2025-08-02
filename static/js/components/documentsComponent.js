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
            const state = window.app ? window.app.getState() : {};
            
            // Validate required data
            if (!state.currentSummary || !state.currentProposal || !state.currentSmiles || 
                !state.currentStructureImage || !state.currentMoleculeName) {
                throw new Error('Missing required data for document generation');
            }

            // Show documents section
            if (this.documentsSection) {
                this.documentsSection.classList.remove('hidden');
                
                // Scroll to documents section
                if (window.Helpers) {
                    window.Helpers.scrollToElement(this.documentsSection, 100);
                }
            }

            // Show loading state
            this.showLoadingState();

            // Get API configuration
            const apiConfig = window.app ? window.app.getApiConfig() : {};

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
            if (window.app) {
                window.app.showLoading('Generating documents...', 'Creating comprehensive research proposal');
            }
            
            const result = await window.apiService.generateDocuments(requestData);

            // Display documents
            this.displayDocuments(result);

            // Show success notification
            if (window.notificationService) {
                window.notificationService.success(
                    'Documents Generated',
                    'Research proposal and supporting documents are ready for download'
                );
            }

        } catch (error) {
            console.error('Document generation failed:', error);
            if (window.notificationService) {
                window.notificationService.error(
                    'Generation Failed',
                    error.message || 'Failed to generate research documents'
                );
            }
            this.showErrorState(error.message);
        } finally {
            if (window.app) {
                window.app.hideLoading();
            }
        }
    }

    showLoadingState() {
        const documentsGrid = this.documentsSection ? this.documentsSection.querySelector('.documents-grid') : null;
        if (documentsGrid) {
            documentsGrid.innerHTML = `
                <div class="loading-documents">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Generating research documents...</p>
                        <p class="loading-subtext">This may take a few moments</p>
                    </div>
                </div>
            `;
        }
        
        if (this.fullProposalContent) {
            this.fullProposalContent.innerHTML = `
                <div class="loading-preview">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Preparing proposal preview...</p>
                </div>
            `;
        }
    }

    showErrorState(errorMessage) {
        const documentsGrid = this.documentsSection ? this.documentsSection.querySelector('.documents-grid') : null;
        if (documentsGrid) {
            documentsGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to generate documents</p>
                    <p class="error-details">${errorMessage || 'Unknown error'}</p>
                    <button class="btn btn-primary mt-1" onclick="window.documentsComponent.generateDocuments()">
                        <i class="fas fa-retry"></i> Try Again
                    </button>
                </div>
            `;
        }
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
        if (this.downloadProposal) this.downloadProposal.href = proposalUrl;
        if (this.downloadRecipe) this.downloadRecipe.href = recipeUrl;
        if (this.downloadTemplate) this.downloadTemplate.href = templateUrl;

        // Restore documents grid
        const documentsGrid = this.documentsSection ? this.documentsSection.querySelector('.documents-grid') : null;
        if (documentsGrid) {
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
        }

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
        if (!this.fullProposalContent) return;
        
        // Format the proposal text for better display
        const formattedText = this.formatProposalText(proposalText);
        this.fullProposalContent.innerHTML = formattedText;
    }

    formatProposalText(text) {
        // Convert markdown-style formatting to HTML
        let formatted = window.Helpers ? window.Helpers.escapeHtml(text) : text;
        
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
        const downloadLinks = this.documentsSection ? this.documentsSection.querySelectorAll('.btn-download') : [];
        
        downloadLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const filename = link.download;
                if (window.notificationService) {
                    window.notificationService.info(
                        'Download Started',
                        `Downloading ${filename}...`
                    );
                }
                
                // Track download completion (approximate)
                setTimeout(() => {
                    if (window.notificationService) {
                        window.notificationService.success(
                            'Download Complete',
                            `${filename} downloaded successfully`
                        );
                    }
                }, 1000);
            });
        });
    }

    // Method to regenerate specific document
    async regenerateDocument(documentType) {
        try {
            if (window.notificationService) {
                window.notificationService.info('Regenerating', `Recreating ${documentType} document...`);
            }
            
            // For now, regenerate all documents
            // In a more advanced implementation, you could regenerate specific documents
            await this.generateDocuments();
            
        } catch (error) {
            if (window.notificationService) {
                window.notificationService.error(
                    'Regeneration Failed',
                    `Failed to regenerate ${documentType}: ${error.message}`
                );
            }
        }
    }

    // Method to clear generated documents
    clearDocuments() {
        if (this.documentsSection) {
            this.documentsSection.classList.add('hidden');
        }
        
        // Clean up blob URLs to prevent memory leaks
        if (this.downloadProposal && this.downloadProposal.href.startsWith('blob:')) {
            URL.revokeObjectURL(this.downloadProposal.href);
        }
        if (this.downloadRecipe && this.downloadRecipe.href.startsWith('blob:')) {
            URL.revokeObjectURL(this.downloadRecipe.href);
        }
        if (this.downloadTemplate && this.downloadTemplate.href.startsWith('blob:')) {
            URL.revokeObjectURL(this.downloadTemplate.href);
        }
    }
}

// Create global instance only if it doesn't exist
if (!window.documentsComponent) {
    document.addEventListener('DOMContentLoaded', () => {
        window.documentsComponent = new DocumentsComponent();
    });
}