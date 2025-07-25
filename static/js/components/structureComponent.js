// static/js/components/structureComponent.js

class StructureComponent {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.structureSection = document.getElementById('structure-section');
        this.imageContainer = document.getElementById('structure-image-container');
        this.moleculeNameDisplay = document.getElementById('molecule-name');
        this.moleculeInfo = document.getElementById('molecule-info');
        this.smilesDisplay = document.getElementById('smiles-display');
        this.moleculeProperties = document.getElementById('molecule-properties');
        this.approveBtn = document.getElementById('approve-structure');
        this.redesignBtn = document.getElementById('redesign-structure');
    }

    bindEvents() {
        this.approveBtn.addEventListener('click', () => {
            this.approveStructure();
        });

        this.redesignBtn.addEventListener('click', () => {
            this.redesignStructure();
        });
    }

    async generateStructure(proposalText) {
        try {
            // Show structure section
            this.structureSection.classList.remove('hidden');
            
            // Show loading state
            this.showLoadingState();
            
            // Scroll to structure section
            Helpers.scrollToElement(this.structureSection, 100);

            // Get API configuration
            const apiConfig = window.app.getApiConfig();

            // Prepare request data
            const requestData = {
                ...apiConfig,
                proposal_text: proposalText
            };

            // Generate structure
            const result = await apiService.generateStructure(requestData);

            // Update app state
            window.app.updateState({
                currentSmiles: result.smiles,
                currentStructureImage: `data:image/png;base64,${result.image_base64}`,
                currentMoleculeName: result.name
            });

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
            this.showErrorState(error.message);
        }
    }

    showLoadingState() {
        this.imageContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Designing molecular structure...</p>
            </div>
        `;
        
        this.moleculeNameDisplay.textContent = '';
        this.smilesDisplay.textContent = '';
        this.moleculeProperties.innerHTML = '';
    }

    showErrorState(errorMessage) {
        this.imageContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to generate structure</p>
                <p class="error-details">${errorMessage}</p>
            </div>
        `;
    }

    async displayStructure(structureData) {
        // Display image
        this.imageContainer.innerHTML = `
            <img id="molecule-img" src="data:image/png;base64,${structureData.image_base64}" 
                 alt="Chemical Structure of ${structureData.name}" />
        `;

        // Display molecule name
        this.moleculeNameDisplay.textContent = structureData.name;

        // Display SMILES
        if (this.smilesDisplay) {
            this.smilesDisplay.innerHTML = `
                <div class="smiles-header">
                    <span class="smiles-label">SMILES:</span>
                    <button class="copy-btn" onclick="window.app.copySmiles('${structureData.smiles}')" title="Copy SMILES">
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
        if (!this.moleculeProperties) return;

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

        this.moleculeProperties.innerHTML = propertiesHTML;
    }

    approveStructure() {
        const appState = window.app.getState();
        if (!appState.currentSmiles || !appState.currentStructureImage || !appState.currentMoleculeName) {
            notificationService.warning('No Structure', 'Please generate a chemical structure first');
            return;
        }
        window.app.generateDocuments();
    }

    redesignStructure() {
        const appState = window.app.getState();
        if (!appState.currentProposal) {
            notificationService.warning('No Proposal', 'Please generate a proposal first');
            return;
        }

        window.modalComponent.showFeedbackModal(
            'Redesign Chemical Structure',
            'What properties or characteristics would you like the new structure to have?',
            async (feedback) => {
                await window.app.refineStructure(feedback);
            }
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.structureComponent = new StructureComponent();
});