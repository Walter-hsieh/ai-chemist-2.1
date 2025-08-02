// static/js/app.js - Complete final fixed version

class ChemistryResearchApp {
    constructor() {
        this.state = {
            currentSummary: '',
            currentProposal: '',
            currentSmiles: '',
            currentStructureImage: '',
            currentMoleculeName: '',
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
        this.apiKeyGroup = document.getElementById('api-key-group');
        this.apiKeyLabel = document.getElementById('api-key-label');
        
        // Research elements
        this.researchTopicInput = document.getElementById('research-topic');
        this.dataSourceSelect = document.getElementById('data-source');
        this.generateBtn = document.getElementById('generate-btn');
        
        // Results elements
        this.resultsSection = document.getElementById('results-section');
        this.summaryContent = document.getElementById('summary-content');
        this.proposalContent = document.getElementById('proposal-content');
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
        if (this.aiProviderSelect) {
            this.aiProviderSelect.addEventListener('change', () => {
                this.updateUIForProvider();
            });
        }

        // Toggle API key visibility
        if (this.toggleApiKeyBtn) {
            this.toggleApiKeyBtn.addEventListener('click', () => {
                this.toggleApiKeyVisibility();
            });
        }

        // Generate research
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => {
                this.generateResearch();
            });
        }

        // Proposal toggle
        if (this.proposalToggle) {
            this.proposalToggle.addEventListener('click', () => {
                this.toggleProposalContent();
            });
        }

        // Proposal actions
        if (this.approveProposalBtn) {
            this.approveProposalBtn.addEventListener('click', () => {
                this.approveProposal();
            });
        }

        if (this.disapproveProposalBtn) {
            this.disapproveProposalBtn.addEventListener('click', () => {
                this.disapproveProposal();
            });
        }

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
        if (this.researchTopicInput) {
            this.researchTopicInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.state.isProcessing) {
                    this.generateResearch();
                }
            });
        }

        // Initial setup
        this.updateUIForProvider();
    }

    initializeComponents() {
        console.log("App: Initializing components...");
        
        // Initialize UploadComponent
        try {
            if (window.UploadComponent) {
                this.uploadComponent = new window.UploadComponent();
                this.uploadComponent.init();
                console.log("App: UploadComponent initialized successfully");
            }
        } catch (error) {
            console.error("App: Failed to initialize UploadComponent:", error);
        }

        // Initialize ProposalComponent
        try {
            if (window.ProposalComponent) {
                this.proposalComponent = new window.ProposalComponent();
                this.proposalComponent.init();
                console.log("App: ProposalComponent initialized successfully");
            }
        } catch (error) {
            console.error("App: Failed to initialize ProposalComponent:", error);
            this.proposalComponent = null;
        }
        
        console.log("App: All components initialization completed");
    }

    updateUIForProvider() {
        const provider = this.aiProviderSelect ? this.aiProviderSelect.value : 'google';
        
        // Update API key label and placeholder
        let keyLabel = 'API Key';
        let placeholder = 'Enter your API key';
        let modelPlaceholder = '';
        
        switch (provider) {
            case 'openai':
                keyLabel = 'OpenAI API Key';
                placeholder = 'Enter your OpenAI API key';
                modelPlaceholder = 'e.g., gpt-4, gpt-4-turbo, gpt-3.5-turbo';
                break;
            case 'google':
                keyLabel = 'Google Gemini API Key';
                placeholder = 'Enter your Google Gemini API key';
                modelPlaceholder = 'e.g., gemini-2.5-flash, gemini-1.5-pro';
                break;
            case 'ollama':
                keyLabel = 'Ollama Server URL (Optional)';
                placeholder = 'e.g., localhost:11434 or leave empty for default';
                modelPlaceholder = 'e.g., llama3.1:latest, gemma2:latest, codellama:latest';
                break;
        }
        
        if (this.apiKeyLabel) {
            this.apiKeyLabel.textContent = keyLabel;
        }
        if (this.apiKeyInput) {
            this.apiKeyInput.placeholder = placeholder;
        }
        if (this.modelNameInput) {
            this.modelNameInput.placeholder = modelPlaceholder;
            
            // Set default model if empty
            if (!this.modelNameInput.value && window.Config) {
                this.modelNameInput.value = window.Config.DEFAULT_MODELS[provider] || '';
            }
        }
        
        // Show helpful info for Ollama
        this.updateOllamaInfo(provider === 'ollama');
    }

    updateOllamaInfo(isOllama) {
        let existingInfo = document.getElementById('ollama-info');
        
        if (isOllama) {
            if (!existingInfo && this.modelNameInput) {
                const infoDiv = document.createElement('div');
                infoDiv.id = 'ollama-info';
                infoDiv.className = 'ollama-info';
                infoDiv.innerHTML = `
                    <div class="info-box">
                        <i class="fas fa-info-circle"></i>
                        <div class="info-content">
                            <p><strong>Using Ollama Local AI:</strong></p>
                            <ul>
                                <li>Make sure Ollama is running: <code>ollama serve</code></li>
                                <li>Popular models: llama3.1:latest, gemma2:latest, codellama:latest</li>
                                <li>Pull models: <code>ollama pull llama3.1:latest</code></li>
                                <li>Default URL: localhost:11434</li>
                            </ul>
                        </div>
                    </div>
                `;
                
                // Insert after the model name field
                const modelGroup = this.modelNameInput.closest('.form-group');
                if (modelGroup && modelGroup.parentNode) {
                    modelGroup.parentNode.insertBefore(infoDiv, modelGroup.nextSibling);
                }
            }
        } else {
            if (existingInfo) {
                existingInfo.remove();
            }
        }
    }

    toggleApiKeyVisibility() {
        if (!this.apiKeyInput || !this.toggleApiKeyBtn) return;
        
        const isPassword = this.apiKeyInput.type === 'password';
        this.apiKeyInput.type = isPassword ? 'text' : 'password';
        
        const icon = this.toggleApiKeyBtn.querySelector('i');
        if (icon) {
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
    }

    toggleProposalContent() {
        if (!this.proposalContent || !this.proposalToggle) return;
        
        const isCollapsed = this.proposalContent.classList.contains('collapsed');
        
        if (isCollapsed) {
            this.proposalContent.classList.remove('collapsed');
            this.proposalToggle.classList.add('expanded');
            this.proposalToggle.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Proposal Details';
        } else {
            this.proposalContent.classList.add('collapsed');
            this.proposalToggle.classList.remove('expanded');
            this.proposalToggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Proposal Details';
        }
    }

    validateInputs() {
        const provider = this.aiProviderSelect ? this.aiProviderSelect.value : 'google';
        const apiKey = this.apiKeyInput ? this.apiKeyInput.value.trim() : '';
        const topic = this.researchTopicInput ? this.researchTopicInput.value.trim() : '';

        // Validation rules differ by provider
        if (provider === 'ollama') {
            // For Ollama, API key (server URL) is optional
            if (this.modelNameInput && !this.modelNameInput.value.trim()) {
                throw new Error('Please enter a model name for Ollama (e.g., llama3.1:latest)');
            }
        } else {
            // For OpenAI and Google, API key is required
            if (!apiKey) {
                const providerName = provider === 'openai' ? 'OpenAI' : 'Google Gemini';
                throw new Error(`Please enter your ${providerName} API key`);
            }
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
                source: this.dataSourceSelect ? this.dataSourceSelect.value : 'semantic',
                api_key: apiKey || (window.Config ? window.Config.DEFAULT_OLLAMA_URL : 'http://localhost:11434'),
                api_provider: this.aiProviderSelect ? this.aiProviderSelect.value : 'google',
                model_name: this.modelNameInput ? this.modelNameInput.value.trim() || undefined : undefined,
                limit: 5
            };

            // Make API request
            const result = await window.apiService.generateResearch(params);

            // Update state with results
            this.state.currentSummary = result.summary;
            this.state.currentProposal = result.proposal;

            // Display results
            this.displayResearchResults(result);

            // Show success notification
            if (window.notificationService) {
                window.notificationService.success(
                    'Research Generated',
                    `Analyzed ${result.papers_analyzed} papers and generated proposal`
                );
            }

        } catch (error) {
            console.error('Research generation failed:', error);
            if (window.notificationService) {
                window.notificationService.error(
                    'Generation Failed',
                    error.message || 'Failed to generate research summary'
                );
            }
        } finally {
            this.hideLoading();
            this.state.isProcessing = false;
        }
    }

    displayResearchResults(result) {
        // Show results section
        if (this.resultsSection) {
            this.resultsSection.classList.remove('hidden');
        }
        
        // Populate summary
        if (this.summaryContent) {
            this.summaryContent.textContent = result.summary;
        }
        
        // Populate proposal
        if (this.proposalContent) {
            this.proposalContent.textContent = result.proposal;
        }
        
        // Update metadata
        if (this.papersCount) {
            this.papersCount.textContent = `${result.papers_analyzed} papers analyzed`;
        }
        if (this.sourceUsed) {
            this.sourceUsed.textContent = `Source: ${this.getSourceDisplayName(result.source_used)}`;
        }
        
        // Reset proposal toggle to collapsed state
        if (this.proposalContent && this.proposalToggle) {
            this.proposalContent.classList.add('collapsed');
            this.proposalToggle.classList.remove('expanded');
            this.proposalToggle.innerHTML = '<i class="fas fa-chevron-down"></i> Show Proposal Details';
        }
        
        // Re-bind the event listener to the new content (with safety check)
        if (this.proposalComponent && typeof this.proposalComponent.rebindToggleEvent === 'function') {
            this.proposalComponent.rebindToggleEvent();
        } else {
            // Fallback: bind the toggle event directly
            this.bindProposalToggleEvent();
        }
        
        // Hide structure and documents sections
        const structureSection = document.getElementById('structure-section');
        const documentsSection = document.getElementById('documents-section');
        if (structureSection) structureSection.classList.add('hidden');
        if (documentsSection) documentsSection.classList.add('hidden');
        
        // Scroll to results
        if (window.Helpers && this.resultsSection) {
            window.Helpers.scrollToElement(this.resultsSection, 100);
        }
    }

    // Fallback method to bind proposal toggle event directly
    bindProposalToggleEvent() {
        if (this.proposalToggle) {
            // Remove any existing event listeners
            this.proposalToggle.replaceWith(this.proposalToggle.cloneNode(true));
            this.proposalToggle = document.getElementById('proposal-toggle');
            
            // Add new event listener
            if (this.proposalToggle) {
                this.proposalToggle.addEventListener('click', () => {
                    this.toggleProposalContent();
                });
            }
        }
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
            if (window.notificationService) {
                window.notificationService.warning('No Proposal', 'Please generate a proposal first');
            }
            return;
        }

        console.log('Approving proposal, generating structure...');

        // Show structure section immediately
        const structureSection = document.getElementById('structure-section');
        if (structureSection) {
            structureSection.classList.remove('hidden');
            
            // Scroll to structure section
            if (window.Helpers) {
                window.Helpers.scrollToElement(structureSection, 100);
            }
        }

        // Generate chemical structure with enhanced error handling
        await this.generateStructureWithRetry(this.state.currentProposal);
    }

    async generateStructureWithRetry(proposalText, maxRetries = 3) {
        const imageContainer = document.getElementById('structure-image-container');
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Show loading state
                if (imageContainer) {
                    imageContainer.innerHTML = `
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Designing molecular structure... (Attempt ${attempt}/${maxRetries})</p>
                        </div>
                    `;
                }

                // Get API configuration
                const apiConfig = this.getApiConfig();
                
                // Prepare request data
                const requestData = {
                    ...apiConfig,
                    proposal_text: proposalText
                };

                // Generate structure
                const result = await window.apiService.generateStructure(requestData);
                
                // Validate the returned SMILES
                if (result.smiles && result.smiles.length > 0) {
                    // Additional client-side validation
                    const validationResult = await window.apiService.validateSmiles(result.smiles);
                    if (validationResult.is_valid) {
                        // Success! Update app state and display
                        this.state.currentSmiles = result.smiles;
                        this.state.currentStructureImage = `data:image/png;base64,${result.image_base64}`;
                        this.state.currentMoleculeName = result.name;

                        // Display structure
                        await this.displayStructure(result);

                        // Show success notification
                        if (window.notificationService) {
                            window.notificationService.success(
                                'Structure Generated',
                                `Created molecular structure for ${result.name}`
                            );
                        }
                        return; // Success, exit retry loop
                    } else {
                        throw new Error(`Generated SMILES is invalid: ${result.smiles}`);
                    }
                } else {
                    throw new Error('No SMILES generated');
                }

            } catch (error) {
                console.warn(`Structure generation attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    // On final attempt, show detailed error and options
                    this.displayStructureError(error, imageContainer);
                    return;
                }
                
                // Wait a bit before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    displayStructureError(error, container) {
        if (!container) return;
        
        let errorMessage = 'Failed to generate a valid chemical structure.';
        let suggestions = [
            'Try regenerating with a different model',
            'Simplify your research proposal',
            'Check if your AI service is responding correctly'
        ];
        
        if (error.message.includes('unclosed ring')) {
            errorMessage += ' The AI generated a structure with ring closure errors.';
            suggestions.unshift('Try using a simpler molecular structure');
        } else if (error.message.includes('SMILES')) {
            errorMessage += ' The AI generated an invalid chemical structure.';
            suggestions.unshift('Consider using a different AI model');
        } else if (error.message.includes('timeout')) {
            errorMessage += ' The AI model took too long to respond.';
            suggestions.unshift('Try using a faster model like llama3.1:8b');
        } else if (error.message.includes('connect')) {
            errorMessage += ' Cannot connect to the AI service.';
            suggestions = ['Check your Ollama server is running', 'Verify your API key and settings', 'Check your internet connection'];
        }

        const errorHtml = `
            <div class="error-state smiles-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Structure Generation Failed</h4>
                <p class="error-message">${errorMessage}</p>
                <div class="error-suggestions">
                    <p><strong>Suggestions:</strong></p>
                    <ul>
                        ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="app.retryStructureGeneration()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                    <button class="btn btn-secondary" onclick="app.suggestSimpleStructure()">
                        <i class="fas fa-lightbulb"></i> Use Simple Structure
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = errorHtml;
    }

    async retryStructureGeneration() {
        if (this.state.currentProposal) {
            await this.generateStructureWithRetry(this.state.currentProposal);
        } else {
            if (window.notificationService) {
                window.notificationService.warning('No Proposal', 'Please generate a research proposal first');
            }
        }
    }

    async suggestSimpleStructure() {
        try {
            const apiConfig = this.getApiConfig();
            const simpleProposal = "Generate a simple benzene ring with a carboxylic acid group for basic organic chemistry research.";
            
            const requestData = {
                ...apiConfig,
                proposal_text: simpleProposal
            };

            const result = await window.apiService.generateStructure(requestData);
            
            // Update the app state and display
            this.state.currentSmiles = result.smiles;
            this.state.currentStructureImage = `data:image/png;base64,${result.image_base64}`;
            this.state.currentMoleculeName = result.name + " (simplified)";

            await this.displayStructure(result);
            
            if (window.notificationService) {
                window.notificationService.info(
                    'Simple Structure Generated',
                    'Generated a basic structure. You can redesign it to better match your research.'
                );
            }
            
        } catch (error) {
            if (window.notificationService) {
                window.notificationService.error(
                    'Fallback Failed',
                    'Could not generate even a simple structure. Please check your AI configuration.'
                );
            }
        }
    }

    async displayStructure(structureData) {
        // Display image
        const imageContainer = document.getElementById('structure-image-container');
        if (imageContainer) {
            imageContainer.innerHTML = `
                <img id="molecule-img" src="data:image/png;base64,${structureData.image_base64}" 
                     alt="Chemical Structure of ${structureData.name}" />
            `;
        }

        // Display molecule name
        const moleculeNameDisplay = document.getElementById('molecule-name');
        if (moleculeNameDisplay) {
            moleculeNameDisplay.textContent = structureData.name;
        }

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
            if (window.apiService) {
                const propertiesData = await window.apiService.validateSmiles(structureData.smiles);
                
                if (propertiesData.properties && Object.keys(propertiesData.properties).length > 0) {
                    this.displayMolecularProperties(propertiesData.properties);
                }
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
            if (window.notificationService) {
                window.notificationService.success('Copied', 'SMILES string copied to clipboard');
            }
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = smiles;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            if (window.notificationService) {
                window.notificationService.success('Copied', 'SMILES string copied to clipboard');
            }
        });
    }

    async approveStructure() {
        if (!this.state.currentSmiles || !this.state.currentStructureImage || !this.state.currentMoleculeName) {
            if (window.notificationService) {
                window.notificationService.warning('No Structure', 'Please generate a chemical structure first');
            }
            return;
        }

        console.log('Approving structure, generating documents...');
        await this.generateDocuments();
    }

    redesignStructure() {
        if (!this.state.currentProposal) {
            if (window.notificationService) {
                window.notificationService.warning('No Proposal', 'Please generate a proposal first');
            }
            return;
        }

        // Show feedback modal for structure redesign
        if (window.modalComponent && window.modalComponent.showFeedbackModal) {
            window.modalComponent.showFeedbackModal(
                'Redesign Chemical Structure',
                'What properties or characteristics would you like the new structure to have?',
                async (feedback) => {
                    await this.refineStructure(feedback);
                }
            );
        }
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

            const refinedResult = await window.apiService.refineProposal(refineData);
            
            // Update app state with refined proposal
            this.state.currentProposal = refinedResult.new_proposal;

            // Update proposal display
            const proposalContent = document.getElementById('proposal-content');
            if (proposalContent) {
                proposalContent.textContent = refinedResult.new_proposal;
            }

            // Now generate new structure based on refined proposal
            this.showLoading('Generating new structure...', 'Creating molecule based on feedback');
            
            await this.generateStructureWithRetry(this.state.currentProposal);

            if (window.notificationService) {
                window.notificationService.success(
                    'Structure Redesigned',
                    'Generated new molecular structure based on your feedback'
                );
            }

        } catch (error) {
            console.error('Structure refinement failed:', error);
            if (window.notificationService) {
                window.notificationService.error(
                    'Redesign Failed',
                    error.message || 'Failed to redesign chemical structure'
                );
            }
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
            if (documentsSection) {
                documentsSection.classList.remove('hidden');
                
                // Scroll to documents section
                if (window.Helpers) {
                    window.Helpers.scrollToElement(documentsSection, 100);
                }
            }

            // Show loading
            this.showLoading('Generating documents...', 'Creating comprehensive research proposal');

            // Get API configuration
            const apiConfig = this.getApiConfig();

            // Clean the structure image base64
            let cleanImageBase64 = '';
            if (this.state.currentStructureImage) {
                cleanImageBase64 = this.state.currentStructureImage.replace(/^data:image\/[a-z]+;base64,/, '');
            }

            // Prepare request data - only required fields, properly cleaned
            const requestData = {
                api_key: apiConfig.api_key || '',
                api_provider: apiConfig.api_provider || 'google',
                summary_text: String(this.state.currentSummary || ''),
                proposal_text: String(this.state.currentProposal || ''),
                smiles_string: String(this.state.currentSmiles || ''),
                structure_image_base64: cleanImageBase64,
                molecule_name: String(this.state.currentMoleculeName || '')
            };

            // Add model_name only if it exists
            if (apiConfig.model_name && apiConfig.model_name.trim()) {
                requestData.model_name = apiConfig.model_name.trim();
            }

            // Final validation - ensure no empty required fields
            const requiredFields = ['summary_text', 'proposal_text', 'smiles_string', 'structure_image_base64', 'molecule_name'];
            const emptyFields = requiredFields.filter(field => !requestData[field] || requestData[field].trim() === '');
            
            if (emptyFields.length > 0) {
                throw new Error(`Missing required data: ${emptyFields.join(', ')}`);
            }

            console.log('Sending document generation request with fields:', Object.keys(requestData));

            // Generate documents
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
            
            // Provide specific error messages
            let errorMessage = 'Failed to generate research documents';
            if (error.message.includes('Missing required data')) {
                errorMessage = error.message;
            } else if (error.message.includes('validation')) {
                errorMessage = 'Data validation failed. Please try regenerating the structure.';
            } else if (error.message.includes('availability_info')) {
                errorMessage = 'Server configuration issue. Please try again or contact support.';
            }
            
            if (window.notificationService) {
                window.notificationService.error('Generation Failed', errorMessage);
            }
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
        const downloadProposal = document.getElementById('download-proposal');
        const downloadRecipe = document.getElementById('download-recipe');
        const downloadTemplate = document.getElementById('download-template');
        
        if (downloadProposal) downloadProposal.href = proposalUrl;
        if (downloadRecipe) downloadRecipe.href = recipeUrl;
        if (downloadTemplate) downloadTemplate.href = templateUrl;

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

    disapproveProposal() {
        if (!this.state.currentProposal) {
            if (window.notificationService) {
                window.notificationService.warning('No Proposal', 'Please generate a proposal first');
            }
            return;
        }

        // Show feedback modal
        if (window.modalComponent && window.modalComponent.showFeedbackModal) {
            window.modalComponent.showFeedbackModal(
                'Improve Research Proposal',
                'What would you like to improve about this proposal?',
                async (feedback) => {
                    await this.refineProposal(feedback);
                }
            );
        }
    }

    async refineProposal(feedback) {
        try {
            this.showLoading('Refining proposal...', 'Incorporating your feedback');

            const { apiKey } = this.validateInputs();

            const requestData = {
                api_key: apiKey || (window.Config ? window.Config.DEFAULT_OLLAMA_URL : ''),
                api_provider: this.aiProviderSelect ? this.aiProviderSelect.value : 'google',
                model_name: this.modelNameInput ? this.modelNameInput.value.trim() || undefined : undefined,
                original_proposal: this.state.currentProposal,
                user_feedback: feedback
            };

            const result = await window.apiService.refineProposal(requestData);

            // Update state and display
            this.state.currentProposal = result.new_proposal;
            if (this.proposalContent) {
                this.proposalContent.textContent = result.new_proposal;
            }

            if (window.notificationService) {
                window.notificationService.success(
                    'Proposal Refined',
                    'Updated proposal based on your feedback'
                );
            }

        } catch (error) {
            console.error('Proposal refinement failed:', error);
            if (window.notificationService) {
                window.notificationService.error(
                    'Refinement Failed',
                    error.message || 'Failed to refine proposal'
                );
            }
        } finally {
            this.hideLoading();
        }
    }

    showLoading(message, submessage = '') {
        if (this.loadingMessage) {
            this.loadingMessage.textContent = message;
        }
        if (this.loadingSubmessage) {
            this.loadingSubmessage.textContent = submessage;
        }
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    // Public methods for other components to access state
    getState() {
        return { ...this.state };
    }

    updateState(updates) {
        this.state = { ...this.state, ...updates };
    }

    getApiConfig() {
        const provider = this.aiProviderSelect ? this.aiProviderSelect.value : 'google';
        let apiKey = this.apiKeyInput ? this.apiKeyInput.value.trim() : '';
        
        // For Ollama, use default URL if empty
        if (provider === 'ollama' && !apiKey) {
            apiKey = window.Config ? window.Config.DEFAULT_OLLAMA_URL : 'http://localhost:11434';
        }
        
        return {
            api_key: apiKey,
            api_provider: provider,
            model_name: this.modelNameInput ? this.modelNameInput.value.trim() || undefined : undefined
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChemistryResearchApp();
});