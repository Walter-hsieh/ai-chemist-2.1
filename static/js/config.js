// static/js/config.js

const Config = {
    // API Configuration
    API_BASE_URL: 'http://127.0.0.1:8000/api',
    
    // Default Models
    DEFAULT_MODELS: {
        google: 'gemini-2.5-flash',
        openai: 'gpt-4'
    },
    
    // File Upload Limits
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt'],
    
    // UI Configuration
    ANIMATION_DURATION: 300,
    NOTIFICATION_DURATION: 5000,
    LOADING_MESSAGES: {
        upload: 'Uploading files...',
        research: 'Analyzing literature...',
        proposal: 'Generating proposal...',
        structure: 'Designing molecular structure...',
        documents: 'Creating final documents...'
    },
    
    // API Endpoints
    ENDPOINTS: {
        upload: '/upload',
        knowledgeBaseStats: '/knowledge-base/stats',
        knowledgeBaseClear: '/knowledge-base/clear',
        research: '/research/summarize',
        refineProposal: '/research/refine',
        generateStructure: '/structure/generate',
        validateSmiles: '/structure/validate',
        generateDocuments: '/documents/generate'
    }
};

// Make config globally available
window.Config = Config;