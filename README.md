# AI Chemistry Research Assistant

A modern, modular web application that generates comprehensive chemistry research proposals using AI assistance. The application analyzes scientific literature, generates research proposals, creates molecular structures, and produces professional documentation.

## Features

- **Multiple AI Providers**: Support for both OpenAI and Google Gemini APIs
- **Literature Analysis**: Integrate with Semantic Scholar, arXiv, or local knowledge base
- **Interactive Workflow**: Approve/disapprove proposals with feedback for refinement
- **Chemical Structure Generation**: AI-powered molecular design with SMILES notation
- **Professional Documentation**: Generate Word documents, Excel templates, and synthesis recipes
- **Modern UI**: Responsive design with real-time notifications and smooth animations
- **File Upload**: Support for PDF, DOCX, and TXT document uploads

## Architecture

### Backend (Python/FastAPI)
```
backend/
├── main.py                 # FastAPI application entry point
├── models/schemas.py       # Pydantic data models
├── services/              # Business logic services
│   ├── ai_service.py      # AI provider integration
│   ├── file_service.py    # File handling operations
│   ├── research_service.py # Literature search and analysis
│   ├── structure_service.py # Chemical structure generation
│   └── document_service.py # Document generation
├── routers/               # API route handlers
│   ├── upload.py          # File upload endpoints
│   ├── research.py        # Research generation endpoints
│   ├── structure.py       # Structure generation endpoints
│   └── documents.py       # Document generation endpoints
└── utils/config.py        # Application configuration
```

### Frontend (Vanilla JavaScript)
```
frontend/static/
├── index.html             # Main application page
├── css/styles.css         # Modern styling
└── js/
    ├── config.js          # Configuration constants
    ├── app.js             # Main application controller
    ├── services/          # API and utility services
    │   ├── apiService.js
    │   ├── fileService.js
    │   └── notificationService.js
    ├── components/        # Modular UI components
    │   ├── uploadComponent.js
    │   ├── modalComponent.js
    │   ├── structureComponent.js
    │   └── documentsComponent.js
    └── utils/helpers.js   # Utility functions
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js (optional, for development)
- API keys for OpenAI and/or Google Gemini

### Setup Steps

1. **Clone or download the application files**

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables (optional)**
   Create a `.env` file in the root directory:
   ```env
   # Optional: Semantic Scholar API key for higher rate limits
   SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_key
   ```

4. **Create required directories**
   ```bash
   mkdir -p knowledge_base static/css static/js/services static/js/components static/js/utils
   ```

5. **Organize the files according to the architecture above**

6. **Start the application**
   ```bash
   python main.py
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:8000`

## Usage

### 1. Configuration
- Select your AI provider (OpenAI or Google Gemini)
- Enter your API key
- Optionally specify a model name

### 2. Data Source Selection
- **Semantic Scholar**: Search academic papers online
- **arXiv**: Search preprint papers
- **Local Knowledge Base**: Upload and analyze your own documents

### 3. Generate Research
- Enter your research topic
- Click "Generate Summary & Proposal"
- Review the literature summary and research proposal

### 4. Refine Proposal (Optional)
- Click "Provide Feedback" to improve the proposal
- Enter specific feedback about desired changes
- Review the refined proposal

### 5. Generate Chemical Structure
- Click "Approve Proposal" to generate a molecular structure
- Review the proposed molecule and its properties
- Optionally redesign with specific requirements

### 6. Generate Final Documents
- Click "Generate Final Documents" to create:
  - Research proposal (Word document)
  - Synthesis recipe (Excel spreadsheet)
  - Experimental data template (Excel spreadsheet)

## API Endpoints

### Upload
- `POST /api/upload` - Upload files to knowledge base
- `GET /api/knowledge-base/stats` - Get knowledge base statistics
- `DELETE /api/knowledge-base/clear` - Clear knowledge base

### Research
- `GET /api/research/summarize` - Generate literature summary and proposal
- `POST /api/research/refine` - Refine proposal based on feedback

### Structure
- `POST /api/structure/generate` - Generate chemical structure
- `GET /api/structure/validate` - Validate SMILES string

### Documents
- `POST /api/documents/generate` - Generate final research documents

## Configuration

### Environment Variables
- `SEMANTIC_SCHOLAR_API_KEY`: Optional API key for Semantic Scholar
- `KNOWLEDGE_BASE_DIR`: Directory for uploaded files (default: "knowledge_base")

### Application Settings
Modify `utils/config.py` to adjust:
- File upload limits
- API timeouts
- Model defaults
- Safety settings

## Development

### Adding New Features

1. **New API Endpoint**: Add to appropriate router in `routers/`
2. **New Service**: Create in `services/` and import in main.py
3. **New UI Component**: Create in `static/js/components/`
4. **New Styling**: Add to `static/css/styles.css`

### Component Architecture

Each frontend component follows this pattern:
```javascript
class ComponentName {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Get DOM references
    }

    bindEvents() {
        // Bind event listeners
    }

    // Component-specific methods
}

// Create global instance
window.componentName = new ComponentName();
```

### Error Handling

- Backend: Consistent HTTPException usage with detailed error messages
- Frontend: Centralized notification system for user feedback
- Validation: Input validation on both client and server sides

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify your API key is correct
   - Check API provider selection matches your key
   - Ensure sufficient API credits/quota

2. **File Upload Issues**
   - Check file size (max 50MB per file)
   - Verify file format (PDF, DOCX, TXT only)
   - Ensure knowledge_base directory exists

3. **Structure Generation Failures**
   - Try simplifying the research proposal
   - Check if RDKit is properly installed
   - Verify AI provider is generating valid SMILES

4. **Document Generation Issues**
   - Ensure all required data is present (summary, proposal, structure)
   - Check file permissions in the application directory
   - Verify OpenPyXL and python-docx are installed

### Logs and Debugging

- Check console logs in browser developer tools
- Review FastAPI logs in terminal
- Enable detailed error messages in config.py

## Security Considerations

- API keys are handled client-side (not stored on server)
- File uploads are validated for type and size
- User input is sanitized to prevent XSS
- CORS is configured for development (adjust for production)

## Performance Optimization

### Backend
- Implement caching for frequently accessed papers
- Add rate limiting for API endpoints
- Use async operations for I/O intensive tasks

### Frontend
- Lazy load components as needed
- Implement virtual scrolling for large lists
- Cache API responses in browser storage

## Deployment

### Development
```bash
python main.py
# Application runs on http://localhost:8000
```

### Production
1. **Use a production ASGI server**
   ```bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Environment Configuration**
   - Set environment variables for production
   - Configure proper CORS origins
   - Use HTTPS in production

3. **Static File Serving**
   - Use a reverse proxy (nginx) for static files
   - Configure proper caching headers

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## API Reference

### Request/Response Models

#### Research Request
```json
{
  "topic": "MOFs for carbon capture",
  "source": "semantic",
  "api_key": "your_api_key",
  "api_provider": "google",
  "model_name": "gemini-1.5-pro",
  "limit": 5
}
```

#### Structure Response
```json
{
  "smiles": "CCO",
  "name": "Ethanol",
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### Error Response
```json
{
  "error": "Validation Error",
  "detail": "API key cannot be empty",
  "code": "VALIDATION_ERROR"
}
```

## Contributing

1. **Code Style**
   - Python: Follow PEP 8
   - JavaScript: Use consistent formatting
   - Comments: Document complex logic

2. **Testing**
   - Add unit tests for new services
   - Test API endpoints with different inputs
   - Verify frontend components work across browsers

3. **Pull Requests**
   - Include description of changes
   - Update documentation as needed
   - Test thoroughly before submitting

## License

This project is provided as-is for educational and research purposes. Please ensure compliance with API provider terms of service and applicable regulations when using AI services.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the console logs for error details
3. Verify all dependencies are correctly installed
4. Ensure API keys have sufficient quota

## Changelog

### Version 2.0.0
- Complete modular rewrite
- Support for multiple AI providers
- Modern responsive UI
- Enhanced error handling
- Professional document generation
- Real-time notifications
- Drag-and-drop file uploads

### Version 1.0.0
- Initial release
- Basic research proposal generation
- Simple structure generation
- Basic document export

## Future Enhancements

### Planned Features
- **User Authentication**: Multi-user support with saved projects
- **Project Management**: Save and load research projects
- **Advanced Analytics**: Research trend analysis and visualization
- **Collaboration**: Share proposals and get feedback
- **Template System**: Customizable proposal templates
- **Integration**: Connect with reference managers (Zotero, Mendeley)
- **Advanced Chemistry**: 3D structure visualization, reaction prediction
- **Export Options**: LaTeX, PowerPoint, PDF formats
- **Cloud Storage**: Integration with Google Drive, Dropbox
- **Batch Processing**: Process multiple research topics simultaneously

### Technical Improvements
- **Database Integration**: PostgreSQL/MongoDB for data persistence
- **Caching Layer**: Redis for improved performance
- **Background Tasks**: Celery for long-running operations
- **API Versioning**: Backward-compatible API evolution
- **Monitoring**: Application performance monitoring
- **Testing**: Comprehensive test suite with CI/CD
- **Documentation**: Interactive API documentation
- **Containerization**: Docker and Kubernetes deployment

## Dependencies

### Core Dependencies
- **FastAPI**: Modern web framework for building APIs
- **RDKit**: Cheminformatics library for molecular operations
- **OpenAI/Google AI**: AI provider SDKs
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server implementation

### Document Processing
- **PyPDF**: PDF text extraction
- **python-docx**: Word document generation
- **openpyxl**: Excel file creation and manipulation

### Frontend
- **Font Awesome**: Icon library
- **Vanilla JavaScript**: No framework dependencies for simplicity
- **Modern CSS**: Grid, Flexbox, animations, and responsive design

This modular architecture makes the application highly maintainable and extensible, allowing you to easily add new features, remove unwanted components, or modify existing functionality.