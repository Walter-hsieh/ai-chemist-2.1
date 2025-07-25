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

        // Display SM