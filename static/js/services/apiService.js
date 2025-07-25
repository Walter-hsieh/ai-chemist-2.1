// static/js/services/apiService.js

class ApiService {
    constructor() {
        this.baseURL = Config.API_BASE_URL;
    }

    // Build request with authentication
    buildRequest(options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        return {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };
    }

    // Handle API response
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    }

    // Generic API call method
    async apiCall(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const request = this.buildRequest(options);
            
            const response = await fetch(url, request);
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Upload files
    async uploadFiles(files) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        return await this.apiCall(Config.ENDPOINTS.upload, {
            method: 'POST',
            headers: {}, // Let browser set content-type for FormData
            body: formData,
        });
    }

    // Get knowledge base statistics
    async getKnowledgeBaseStats() {
        return await this.apiCall(Config.ENDPOINTS.knowledgeBaseStats, {
            method: 'GET',
        });
    }

    // Clear knowledge base
    async clearKnowledgeBase() {
        return await this.apiCall(Config.ENDPOINTS.knowledgeBaseClear, {
            method: 'DELETE',
        });
    }

    // Generate research summary and proposal
    async generateResearch(params) {
        const queryParams = new URLSearchParams(params);
        return await this.apiCall(`${Config.ENDPOINTS.research}?${queryParams}`, {
            method: 'GET',
        });
    }

    // Refine proposal based on feedback
    async refineProposal(data) {
        return await this.apiCall(Config.ENDPOINTS.refineProposal, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Generate chemical structure
    async generateStructure(data) {
        return await this.apiCall(Config.ENDPOINTS.generateStructure, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Validate SMILES string
    async validateSmiles(smiles) {
        const queryParams = new URLSearchParams({ smiles });
        return await this.apiCall(`${Config.ENDPOINTS.validateSmiles}?${queryParams}`, {
            method: 'GET',
        });
    }

    // Generate final documents
    async generateDocuments(data) {
        return await this.apiCall(Config.ENDPOINTS.generateDocuments, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

// Create global instance
window.apiService = new ApiService();