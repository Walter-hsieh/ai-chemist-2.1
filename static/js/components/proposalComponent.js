// static/js/components/proposalComponent.js

class ProposalComponent {
    constructor() {
        // Defer initialization
    }

    init() {
        console.log('ProposalComponent: Initializing...');
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.proposalContent = document.getElementById('proposal-content');
        this.proposalToggle = document.getElementById('proposal-toggle');
        this.approveBtn = document.getElementById('approve-proposal');
        this.disapproveBtn = document.getElementById('disapprove-proposal');
        console.log('ProposalComponent: proposalToggle element:', this.proposalToggle);
    }

    bindEvents() {
        console.log('ProposalComponent: Binding primary actions...');
        // The toggle button is now bound dynamically
        this.approveBtn.addEventListener('click', () => {
            this.approveProposal();
        });

        this.disapproveBtn.addEventListener('click', () => {
            this.disapproveProposal();
        });
    }

    // This function will be called by the main app whenever the proposal section is updated
    rebindToggleEvent() {
        this.proposalToggle = document.getElementById('proposal-toggle');
        console.log('ProposalComponent: Re-binding toggle event. Element:', this.proposalToggle);
        if (this.proposalToggle) {
            this.proposalToggle.addEventListener('click', () => {
                console.log('ProposalComponent: Toggle button clicked!');
                this.toggleProposalContent();
            });
        } else {
            console.error('ProposalComponent: Could not find proposal-toggle to rebind.');
        }
    }

    toggleProposalContent() {
        const isCollapsed = this.proposalContent.classList.contains('collapsed');
        console.log(`ProposalComponent: isCollapsed is ${isCollapsed}. Toggling visibility.`);
        
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

    approveProposal() {
        const appState = window.app.getState();
        if (!appState.currentProposal) {
            notificationService.warning('No Proposal', 'Please generate a proposal first');
            return;
        }
        window.structureComponent.generateStructure(appState.currentProposal);
    }

    disapproveProposal() {
        const appState = window.app.getState();
        if (!appState.currentProposal) {
            notificationService.warning('No Proposal', 'Please generate a proposal first');
            return;
        }

        window.modalComponent.showFeedbackModal(
            'Improve Research Proposal',
            'What would you like to improve about this proposal?',
            async (feedback) => {
                await window.app.refineProposal(feedback);
            }
        );
    }
}

// The component is now initialized by the main ChemistryResearchApp
// document.addEventListener('DOMContentLoaded', () => {
//     window.proposalComponent = new ProposalComponent();
// });
