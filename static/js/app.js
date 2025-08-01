// static/js/app.js

class ChemistryResearchApp {
    constructor() {
        this.state = {
            currentSummary: '',
            currentProposal: '',
            currentReason: '',
            currentSmiles: '',
            currentStructureImage: '',
            currentMoleculeName: '',
            currentAvailabilityInfo: null,
            currentTopic: '',
            isProcessing: false
        };
        
        this.initializeElements();
        this.bindEvents();
        this.initializeComponents();
    }

    initializeElements() {
        // Configuration elements
        this.aiProviderSelect = document.getElementById('ai-provider');
        this.apiKeyInput = document.getElementById('api-key');
        this.modelNameInput = document.getElementById('model-name');
        this.toggleApiKeyBtn = document.getElementById('toggle-api-key');
        
        // Research elements
        this.researchTopicInput = document.getElementById('research-topic');
        this.dataSourceSelect = document.getElementById('data-source');
        this.generateBtn = document.getElementById('generate-btn');
        
        // Results elements
        this.resultsSection = document.getElementById('results-section');
        this.summaryContent = document.getElementById('summary-content');
        this.proposalContent = document.getElementById('proposal-content');
        this.reasonContent = document.getElementById('reason-content');
        this.proposalToggle = document.getElementById('proposal-toggle');
        this.papersCount = document.getElementById('papers-count');
        this.sourceUsed = document.getElementById('source-used');
        
        // Action buttons
        this.approveProposalBtn = document.getElementById('approve-proposal');
        this.disapproveProposalBtn = document.getElementById('disapprove-proposal');
        
        // Structure action buttons
        this.approveStructureBtn = document.getElementById('approve-structure');
        this.redesignStructureBtn = document.getElementById('redesign-structure');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingMessage = document.getElementById('loading-message');
        this.loadingSubmessage = document.getElementById('loading-submessage');
    }

    bindEvents() {
        // AI Provider change
        this.aiProviderSelect.addEventListener('change', () => {
            this.updateApiKeyPlaceholder();
        });

        // Toggle API key visibility
        this.toggleApiKeyBtn.addEventListener('click', () => {
            this.toggleApiKeyVisibility();
        });

        // Generate research
        this.generateBtn.addEventListener('click', () => {
            this.generateResearch();
        });

        // Proposal toggle
        this.proposalToggle.addEventListener('click', () => {
            this.toggleProposalContent();
        });

        // Proposal actions
        this.approveProposalBtn.addEventListener('click', () => {
            this.approveProposal();
        });

        this.disapproveProposalBtn.addEventListener('click', () => {
            this.disapproveProposal();
        });

        // Structure actions
        if (this.approveStructureBtn) {
            this.approveStructureBtn.addEventListener('click', () => {
                this.approveStructure();
            });
        }

        if (this.redesignStructureBtn) {
            this.redesignStructureBtn.addEventListener('click', () => {
                this.redesignStructure();
            });
        }

        // Enter key support
        this.researchTopicInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.state.isProcessing) {
                this.generateResearch();
            }
        });

        // Initial setup
        this.updateApiKeyPlaceholder();
    }

    initializeComponents() {
        console.log("App: Initializing UploadComponent...");
        this.uploadComponent = new UploadComponent();
        this.uploadComponent.init();

        console.log("App: Initializing ProposalComponent...");
        this.proposalComponent = new ProposalComponent();
        this.proposalComponent.init();
        
        // Other components can be initialized here
    }

    updateApiKeyPlaceholder() {
        const provider = this.aiProviderSelect.value;
        const providerName = provider === 'openai' ? 'OpenAI' : 'Google Gemini';
        this.apiKeyInput.placeholder = `Enter your ${providerName} API key`;
    }

    toggleApiKeyVisibility() {
        const isPassword = this.apiKeyInput.type === 'password';
        this.apiKeyInput.type = isPassword ? 'text' : 'password';
        
        const icon = this.toggleApiKeyBtn.querySelector('i');
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }

    validateInputs() {
        const apiKey = this.apiKeyInput.value.trim();
        const topic = this.researchTopicInput.value.trim();

        if (!apiKey) {
            const provider = this.aiProviderSelect.value === 'openai' ? 'OpenAI' : 'Google Gemini';
            throw new Error(`Please enter your ${provider} API key`);
        }

        if (!topic) {
            throw new Error('Please enter a research topic');
        }

        return { apiKey, topic };
    }

    async generateResearch() {
        if (this.state.isProcessing) return;

        try {
            // Validate inputs
            const { apiKey, topic } = this.validateInputs();

            // Update state
            this.state.isProcessing = true;
            this.state.currentTopic = topic;

            // Show loading
            this.showLoading('Analyzing literature...', 'This may take a few moments');

            // Prepare request parameters
            const params = {
                topic: topic,
                source: this.dataSourceSelect.value,
                api_key: apiKey,
                api_provider: this.aiProviderSelect.value,
                model_name: this.modelNameInput.value.trim() || undefined,
                limit: 5
            };

            // Make API request
            const result = await apiService.generateResearch(params);

            // Update state with results
            this.state.currentSummary = result.summary;
            this.state.currentProposal = result.proposal;
            this.state.currentReason = result.reason;

            // Display results
            this.displayResearchResults(result);

            // Show success notification
            notificationService.success(
                'Research Generated',
                `Analyzed ${result.papers_analyzed} papers and generated proposal`
            );

        } catch (error) {
            console.error('Research generation failed:', error);
            notificationService.error(
                'Generation Failed',
                error.message || 'Failed to generate research summary'
            );
        } finally {
            this.hideLoading();
            this.state.isProcessing = false;
        }
    }

    displayResearchResults(result) {
        // Show results section
        this.resultsSection.classList.remove('hidden');
        
        // Populate summary
        this.summaryContent.textContent = result.summary;
        
        // Populate proposal
        this.proposalContent.textContent = result.proposal;

        // Populate reason
        this.reasonContent.textContent = result.reason;
        
        // Update metadata
        this.papersCount.textContent = `${result.papers_analyzed} papers analyzed`;
        this.sourceUsed.textContent = `Source: ${this.getSourceDisplayName(result.source_used)}`;
        
        // Reset proposal toggle to collapsed state
        this.proposalContent.classList.add('collapsed');
        
        // Re-bind the event listener to the new content
        this.proposalComponent.rebindToggleEvent();
        
        // Hide structure and documents sections
        document.getElementById('structure-section').classList.add('hidden');
        document.getElementById('documents-section').classList.add('hidden');
        
        // Scroll to results
        Helpers.scrollToElement(this.resultsSection, 100);
    }

    getSourceDisplayName(source) {
        const sourceNames = {
            semantic: 'Semantic Scholar',
            arxiv: 'arXiv',
            local: 'Local Knowledge Base'
        };
        return sourceNames[source] || source;
    }

    async approveProposal() {
        if (!this.state.currentProposal) {
            notificationService.warning('No Proposal', 'Please generate a proposal first');
            return;
        }

        console.log('Approving proposal, generating structure...'); // Debug log

        // Show structure section immediately
        const structureSection = document.getElementById('structure-section');
        structureSection.classList.remove('hidden');
        
        // Scroll to structure section
        Helpers.scrollToElement(structureSection, 100);

        // Generate chemical structure directly
        try {
            // Show loading state
            const imageContainer = document.getElementById('structure-image-container');
            imageContainer.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Designing molecular structure...</p>
                </div>
            `;

            // Get API configuration
            const apiConfig = this.getApiConfig();
            
            // Prepare request data
            const requestData = {
                ...apiConfig,
                proposal_text: this.state.currentProposal
            };

            // Generate structure
            const result = await apiService.generateStructure(requestData);

            // Update app state
            this.state.currentSmiles = result.smiles;
            this.state.currentStructureImage = `data:image/png;base64,${result.image_base64}`;
            this.state.currentMoleculeName = result.name;

            // Display structure
            this.displayStructure(result);

            // Show success notification
            notificationService.success(
                'Structure Generated',
                `Created molecular structure for ${result.name}`
            );

        } catch (error) {
            console.error('Structure generation failed:', error);
            notificationService.error(
                'Generation Failed',
                error.message || 'Failed to generate chemical structure'
            );
            
            // Show error state
            const imageContainer = document.getElementById('structure-image-container');
            imageContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to generate structure</p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
        }
    }

    async displayStructure(structureData) {
        // Display image
        const imageContainer = document.getElementById('structure-image-container');
        imageContainer.innerHTML = `
            <img id="molecule-img" src="data:image/png;base64,${structureData.image_base64}" 
                 alt="Chemical Structure of ${structureData.name}" />
        `;

        // Display molecule name
        const moleculeNameDisplay = document.getElementById('molecule-name');
        moleculeNameDisplay.textContent = structureData.name;

        // Display SMILES
        const smilesDisplay = document.getElementById('smiles-display');
        if (smilesDisplay) {
            smilesDisplay.innerHTML = `
                <div class="smiles-header">
                    <span class="smiles-label">SMILES:</span>
                    <button class="copy-btn" onclick="app.copySmiles('${structureData.smiles}')" title="Copy SMILES">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="smiles-text">${structureData.smiles}</div>
            `;
        }

        // Get and display molecular properties
        try {
            const propertiesData = await apiService.validateSmiles(structureData.smiles);
            
            if (propertiesData.properties && Object.keys(propertiesData.properties).length > 0) {
                this.displayMolecularProperties(propertiesData.properties);
            }
        } catch (error) {
            console.warn('Could not fetch molecular properties:', error);
        }
    }

    displayMolecularProperties(properties) {
        const moleculeProperties = document.getElementById('molecule-properties');
        if (!moleculeProperties) return;

        const propertyLabels = {
            molecular_weight: 'Molecular Weight',
            num_atoms: 'Number of Atoms',
            num_bonds: 'Number of Bonds',
            num_rings: 'Number of Rings',
            lipinski_hbd: 'H-Bond Donors',
            lipinski_hba: 'H-Bond Acceptors',
            logp: 'LogP'
        };

        const propertyUnits = {
            molecular_weight: 'g/mol',
            num_atoms: '',
            num_bonds: '',
            num_rings: '',
            lipinski_hbd: '',
            lipinski_hba: '',
            logp: ''
        };

        const propertiesHTML = Object.entries(properties)
            .filter(([key, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                const label = propertyLabels[key] || key;
                const unit = propertyUnits[key] || '';
                const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
                
                return `
                    <div class="property-item">
                        <span class="property-label">${label}:</span>
                        <span class="property-value">${displayValue} ${unit}</span>
                    </div>
                `;
            })
            .join('');

        moleculeProperties.innerHTML = propertiesHTML;
    }

    copySmiles(smiles) {
        navigator.clipboard.writeText(smiles).then(() => {
            notificationService.success('Copied', 'SMILES string copied to clipboard');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = smiles;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            notificationService.success('Copied', 'SMILES string copied to clipboard');
        });
    }

    async approveStructure() {
        if (!this.state.currentSmiles || !this.state.currentStructureImage || !this.state.currentMoleculeName) {
            notificationService.warning('No Structure', 'Please generate a chemical structure first');
            return;
        }

        console.log('Approving structure, generating documents...'); // Debug log

        // Generate final documents
        await this.generateDocuments();
    }

    redesignStructure() {
        if (!this.state.currentProposal) {
            notificationService.warning('No Proposal', 'Please generate a proposal first');
            return;
        }

        // Show feedback modal for structure redesign
        window.modalComponent.showFeedbackModal(
            'Redesign Chemical Structure',
            'What properties or characteristics would you like the new structure to have?',
            async (feedback) => {
                await this.refineStructure(feedback);
            }
        );
    }

    async refineStructure(feedback) {
        try {
            // First, refine the proposal with structure-specific feedback
            const proposalFeedback = `Please modify the research proposal to incorporate these structural requirements: ${feedback}. Focus on adjusting the chemical design and synthetic approach.`;
            
            this.showLoading('Refining proposal for new structure...', 'Incorporating structural feedback');

            const apiConfig = this.getApiConfig();
            
            const refineData = {
                ...apiConfig,
                original_proposal: this.state.currentProposal,
                user_feedback: proposalFeedback
            };

            const refinedResult = await apiService.refineProposal(refineData);
            
            // Update app state with refined proposal
            this.state.currentProposal = refinedResult.new_proposal;

            // Update proposal display
            document.getElementById('proposal-content').textContent = refinedResult.new_proposal;

            // Now generate new structure based on refined proposal
            this.showLoading('Generating new structure...', 'Creating molecule based on feedback');
            
            await this.approveProposal(); // This will generate a new structure

            notificationService.success(
                'Structure Redesigned',
                'Generated new molecular structure based on your feedback'
            );

        } catch (error) {
            console.error('Structure refinement failed:', error);
            notificationService.error(
                'Redesign Failed',
                error.message || 'Failed to redesign chemical structure'
            );
        } finally {
            this.hideLoading();
        }
    }

    async generateDocuments() {
        try {
            // Validate required data
            if (!this.state.currentSummary || !this.state.currentProposal || !this.state.currentSmiles || 
                !this.state.currentStructureImage || !this.state.currentMoleculeName) {
                throw new Error('Missing required data for document generation');
            }

            // Show documents section
            const documentsSection = document.getElementById('documents-section');
            documentsSection.classList.remove('hidden');
            
            // Scroll to documents section
            Helpers.scrollToElement(documentsSection, 100);

            // Show loading
            this.showLoading('Generating documents...', 'Creating comprehensive research proposal');

            // Get API configuration
            const apiConfig = this.getApiConfig();

            // Prepare request data
            const requestData = {
                ...apiConfig,
                summary_text: this.state.currentSummary,
                proposal_text: this.state.currentProposal,
                smiles_string: this.state.currentSmiles,
                structure_image_base64: this.state.currentStructureImage.replace('data:image/png;base64,', ''),
                molecule_name: this.state.currentMoleculeName
            };

            // Generate documents
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
        } finally {
            this.hideLoading();
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
        document.getElementById('download-proposal').href = proposalUrl;
        document.getElementById('download-recipe').href = recipeUrl;
        document.getElementById('download-template').href = templateUrl;

        // Display proposal preview
        const fullProposalContent = document.getElementById('full-proposal-content');
        if (fullProposalContent) {
            fullProposalContent.innerHTML = this.formatProposalText(documentsData.full_proposal_text);
        }
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

    disapproveProposal() {
        if (!this.state.currentProposal) {
            notificationService.warning('No Proposal', 'Please generate a proposal first');
            return;
        }

        // Show feedback modal
        window.modalComponent.showFeedbackModal(
            'Improve Research Proposal',
            'What would you like to improve about this proposal?',
            async (feedback) => {
                await this.refineProposal(feedback);
            }
        );
    }

    async refineProposal(feedback) {
        try {
            this.showLoading('Refining proposal...', 'Incorporating your feedback');

            const { apiKey } = this.validateInputs();

            const requestData = {
                api_key: apiKey,
                api_provider: this.aiProviderSelect.value,
                model_name: this.modelNameInput.value.trim() || undefined,
                original_proposal: this.state.currentProposal,
                user_feedback: feedback
            };

            const result = await apiService.refineProposal(requestData);

            // Update state and display
            this.state.currentProposal = result.new_proposal;
            this.proposalContent.textContent = result.new_proposal;

            notificationService.success(
                'Proposal Refined',
                'Updated proposal based on your feedback'
            );

        } catch (error) {
            console.error('Proposal refinement failed:', error);
            notificationService.error(
                'Refinement Failed',
                error.message || 'Failed to refine proposal'
            );
        } finally {
            this.hideLoading();
        }
    }

    showLoading(message, submessage = '') {
        this.loadingMessage.textContent = message;
        this.loadingSubmessage.textContent = submessage;
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    // Public methods for other components to access state
    getState() {
        return { ...this.state };
    }

    updateState(updates) {
        this.state = { ...this.state, ...updates };
    }

    getApiConfig() {
        return {
            api_key: this.apiKeyInput.value.trim(),
            api_provider: this.aiProviderSelect.value,
            model_name: this.modelNameInput.value.trim() || undefined
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChemistryResearchApp();
});