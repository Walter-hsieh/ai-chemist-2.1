# AI Chemistry Research Assistant

A modern, modular web application that generates comprehensive chemistry research proposals using AI assistance. The application analyzes scientific literature, generates research proposals, creates molecular structures, and produces professional documentation.

## 🚀 Features

- **Multiple AI Providers**: Support for both OpenAI and Google Gemini APIs
- **Literature Analysis**: Integrate with Semantic Scholar, arXiv, or local knowledge base
- **Interactive Workflow**: Approve/disapprove proposals with feedback for refinement
- **Chemical Structure Generation**: AI-powered molecular design with SMILES notation and properties
- **Professional Documentation**: Generate Word documents, Excel templates, and synthesis recipes
- **Modern UI**: Responsive design with real-time notifications and smooth animations
- **File Upload**: Support for PDF, DOCX, and TXT document uploads with drag-and-drop
- **Real-time Feedback**: Interactive notifications and progress tracking

## 📁 Architecture

### Backend (Python/FastAPI)
```
backend/
├── main.py                 # FastAPI application entry point
├── models/schemas.py       # Pydantic data models with validation
├── services/              # Business logic services
│   ├── ai_service.py      # AI provider integration (OpenAI/Google)
│   ├── file_service.py    # File handling and validation
│   ├── research_service.py # Literature search and analysis
│   ├── structure_service.py # Chemical structure generation with RDKit
│   └── document_service.py # Professional document generation
├── routers/               # API route handlers
│   ├── upload.py          # File upload and knowledge base management
│   ├── research.py        # Research generation and refinement
│   ├── structure.py       # Structure generation and validation
│   └── documents.py       # Document generation endpoints
└── utils/config.py        # Application configuration and settings
```

### Frontend (Modern Vanilla JavaScript)
```
frontend/static/
├── index.html             # Single-page application
├── css/styles.css         # Modern CSS with animations and responsive design
└── js/
    ├── config.js          # Frontend configuration constants
    ├── app.js             # Main application controller (centralized logic)
    ├── services/          # API and utility services
    │   ├── apiService.js  # RESTful API communication
    │   ├── fileService.js # File handling and validation
    │   └── notificationService.js # Toast notifications system
    ├── components/        # Modular UI components
    │   ├── uploadComponent.js     # File upload with progress
    │   ├── modalComponent.js      # Modal dialogs and feedback
    │   ├── structureComponent.js  # Chemical structure display
    │   └── documentsComponent.js  # Document generation UI
    └── utils/helpers.js   # Utility functions and animations
```

## 🛠 Installation & Setup

### Prerequisites
- **Python 3.8+** (tested with Python 3.9-3.11)
- **pip** (Python package manager)
- **API Keys**: OpenAI and/or Google Gemini API keys
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

### Quick Setup Guide

1. **Download/Clone the Application**
   ```bash
   # Create project directory
   mkdir ai-chemistry-assistant
   cd ai-chemistry-assistant
   ```

2. **Create Directory Structure**
   ```bash
   mkdir -p models services routers utils static/css static/js/{services,components,utils} knowledge_base
   ```

3. **Create Required `__init__.py` Files**
   ```bash
   # Create empty __init__.py files for Python packages
   touch models/__init__.py services/__init__.py routers/__init__.py utils/__init__.py
   ```

4. **Copy Application Files**
   - Copy each code artifact to its corresponding directory according to the architecture above
   - Ensure all files are in their correct locations

5. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Optional: Create Environment File**
   ```bash
   # Create .env file for optional configuration
   echo "SEMANTIC_SCHOLAR_API_KEY=your_key_here" > .env
   ```

7. **Start the Application**
   ```bash
   python main.py
   ```

8. **Access the Application**
   - Open your browser and navigate to: `http://localhost:8000`
   - The application should display the modern UI interface

## 🎯 Complete User Workflow

### Step 1: Configuration
1. **Select AI Provider**: Choose between OpenAI or Google Gemini
2. **Enter API Key**: Input your API key (stored locally, not on server)
3. **Optional Model**: Specify a particular model (e.g., `gpt-4`, `gemini-1.5-pro`)

### Step 2: Data Source Setup
**Option A: Online Sources**
- Select "Semantic Scholar" or "arXiv"
- Enter your research topic
- System will automatically fetch relevant papers

**Option B: Local Knowledge Base**
- Select "Local Knowledge Base"
- Upload documents via drag-and-drop or file browser
- Supported formats: PDF, DOCX, TXT (max 50MB each)
- View knowledge base statistics

### Step 3: Generate Research Summary & Proposal
1. Enter your **research topic** (e.g., "MOFs for carbon capture")
2. Click **"Generate Summary & Proposal"**
3. Review the **literature summary** (automatically generated)
4. Expand the **research proposal** section to read details

### Step 4: Proposal Refinement (Optional)
- Click **"Provide Feedback"** if you want improvements
- Enter specific feedback in the modal dialog
- System generates refined proposal based on your input
- Repeat until satisfied

### Step 5: Chemical Structure Generation
1. Click **"Approve Proposal"** when satisfied
2. AI generates a relevant chemical structure
3. View the **molecular structure image**
4. See **chemical properties** (molecular weight, atoms, bonds, etc.)
5. Copy **SMILES notation** for external use

### Step 6: Structure Refinement (Optional)
- Click **"Redesign Structure"** for modifications
- Specify desired chemical properties or characteristics
- System refines proposal and generates new structure

### Step 7: Final Document Generation
1. Click **"Generate Final Documents"** when satisfied with structure
2. System creates professional-quality documents:
   - **Research Proposal** (Word document with embedded structure)
   - **Synthesis Recipe** (Excel spreadsheet with chemicals and procedures)
   - **Data Recording Template** (Excel template for experimental tracking)
3. Download all documents for use

## 🔧 API Reference

### Core Endpoints

#### Research Generation
```http
GET /api/research/summarize
Parameters:
- topic: string (required)
- source: "semantic" | "arxiv" | "local"
- api_key: string (required)
- api_provider: "openai" | "google"
- model_name: string (optional)
- limit: integer (1-20, default: 5)
```

#### Proposal Refinement
```http
POST /api/research/refine
Body: {
  "api_key": "string",
  "api_provider": "openai" | "google",
  "model_name": "string",
  "original_proposal": "string",
  "user_feedback": "string"
}
```

#### Structure Generation
```http
POST /api/structure/generate
Body: {
  "api_key": "string",
  "api_provider": "openai" | "google",
  "model_name": "string",
  "proposal_text": "string"
}
```

#### Document Generation
```http
POST /api/documents/generate
Body: {
  "api_key": "string",
  "api_provider": "openai" | "google",
  "summary_text": "string",
  "proposal_text": "string",
  "smiles_string": "string",
  "structure_image_base64": "string",
  "molecule_name": "string"
}
```

#### File Management
```http
POST /api/upload              # Upload files
GET /api/knowledge-base/stats  # Get knowledge base statistics
DELETE /api/knowledge-base/clear # Clear all uploaded files
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
# Optional: Semantic Scholar API key for higher rate limits
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_key

# Optional: Custom knowledge base directory
KNOWLEDGE_BASE_DIR=custom_knowledge_base

# Optional: Custom file size limits (in bytes)
MAX_FILE_SIZE=52428800  # 50MB default
```

### Application Settings
Modify `utils/config.py` to customize:
```python
class Settings(BaseSettings):
    # File Upload Configuration
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".txt"}
    
    # AI Configuration
    DEFAULT_OPENAI_MODEL: str = "gpt-4"
    DEFAULT_GOOGLE_MODEL: str = "gemini-2.5-flash"
    MAX_RETRIES: int = 3
    REQUEST_TIMEOUT: int = 30
    
    # Research Configuration
    DEFAULT_PAPER_LIMIT: int = 5
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. "Approve Proposal" Button Not Working
**Symptoms**: Button click has no effect, no structure generation
**Solutions**:
- Open browser console (F12) and check for JavaScript errors
- Ensure you have entered a valid API key
- Verify you have generated a proposal first
- Check browser console for debug messages

#### 2. API Key Errors
**Symptoms**: Authentication errors, invalid key messages
**Solutions**:
- Verify API key is correct and active
- Check API provider selection matches your key type
- Ensure sufficient API credits/quota remaining
- Try switching between OpenAI and Google Gemini

#### 3. File Upload Issues
**Symptoms**: Upload fails, unsupported format errors
**Solutions**:
- Check file size (max 50MB per file)
- Verify file format (only PDF, DOCX, TXT supported)
- Ensure `knowledge_base` directory exists and is writable
- Try uploading files one at a time

#### 4. Structure Generation Failures
**Symptoms**: "Failed to generate structure" errors
**Solutions**:
- Simplify your research proposal text
- Try regenerating with different feedback
- Check that RDKit is properly installed: `pip install rdkit-pypi`
- Verify AI provider is responding correctly

#### 5. Document Generation Issues
**Symptoms**: Download fails, incomplete documents
**Solutions**:
- Ensure all previous steps completed successfully
- Check browser console for errors
- Verify all required data is present (summary, proposal, structure)
- Try regenerating documents

#### 6. Performance Issues
**Symptoms**: Slow responses, timeouts
**Solutions**:
- Check internet connection
- Try reducing the number of papers analyzed (limit parameter)
- Use simpler research topics for faster processing
- Clear browser cache and reload

### Debug Mode
To enable detailed logging:
1. Open browser console (F12)
2. Look for debug messages starting with application actions
3. Check the Network tab for failed API requests
4. Review error messages for specific issues

## 🔒 Security Considerations

### Data Privacy
- **API Keys**: Stored only in browser memory, never sent to our servers
- **File Uploads**: Stored locally in `knowledge_base` directory
- **User Data**: No user data is permanently stored or tracked

### Input Validation
- **File Types**: Strictly validated (PDF, DOCX, TXT only)
- **File Sizes**: Limited to prevent abuse (50MB default)
- **User Input**: Sanitized to prevent XSS attacks
- **API Requests**: Validated with Pydantic models

### Production Considerations
```python
# For production deployment, consider:
- Use environment variables for sensitive configuration
- Implement rate limiting for API endpoints
- Use HTTPS for all communications
- Configure proper CORS origins (not "*")
- Use a reverse proxy (nginx) for static files
- Implement user authentication for multi-user setups
```

## 🚀 Deployment

### Development Mode
```bash
# Standard development server
python main.py
# Access at: http://localhost:8000
```

### Production Deployment
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# With custom configuration
gunicorn main:app --config gunicorn.conf.py
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for RDKit
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create knowledge base directory
RUN mkdir -p knowledge_base

EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run Docker container
docker build -t ai-chemistry-assistant .
docker run -p 8000:8000 -v $(pwd)/knowledge_base:/app/knowledge_base ai-chemistry-assistant
```

## 🔧 Development & Customization

### Adding New Features

#### 1. New AI Provider
```python
# In services/ai_service.py
async def _call_new_provider(self, request: BaseAIRequest, prompt: str) -> str:
    # Implement new provider logic
    pass

# Update providers dictionary
self.providers = {
    AIProvider.OPENAI: self._call_openai,
    AIProvider.GOOGLE: self._call_google,
    AIProvider.NEW_PROVIDER: self._call_new_provider  # Add new provider
}
```

#### 2. New Document Format
```python
# In services/document_service.py
def _generate_new_format(self, data):
    # Implement new document format
    pass
```

#### 3. New UI Component
```javascript
// In static/js/components/newComponent.js
class NewComponent {
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
}

// Create global instance
window.newComponent = new NewComponent();
```

### Code Style Guidelines

#### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints for all function parameters and returns
- Document functions with docstrings
- Use async/await for I/O operations
- Implement proper error handling with try/catch blocks

#### JavaScript (Frontend)
- Use consistent camelCase naming
- Document complex functions with comments
- Use modern ES6+ features (arrow functions, async/await, destructuring)
- Keep functions small and focused
- Use semantic HTML and accessible design patterns

### Testing
```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Run backend tests
python -m pytest tests/

# Frontend testing
# Use browser console for manual testing
# Consider adding automated tests with Playwright or Selenium
```

## 📚 Dependencies & Licenses

### Core Dependencies
| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| FastAPI | 0.104.1 | Web framework | MIT |
| RDKit | 2022.9.5 | Chemistry library | BSD |
| OpenAI | 1.3.7 | AI provider SDK | MIT |
| Google AI | 0.3.2 | AI provider SDK | Apache 2.0 |
| Pydantic | 2.5.0 | Data validation | MIT |
| python-docx | 1.1.0 | Word documents | MIT |
| openpyxl | 3.1.2 | Excel files | MIT |

### Frontend Dependencies
- **Font Awesome 6.0.0**: Icons (Free license)
- **Modern CSS**: Grid, Flexbox, animations (No external dependencies)
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility

## 📈 Performance Optimization

### Backend Optimizations
```python
# Implement caching for API responses
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_research_query(topic: str, source: str):
    # Cache frequently requested research topics
    pass

# Use background tasks for long operations
from fastapi import BackgroundTasks

@app.post("/api/generate-async")
async def generate_async(background_tasks: BackgroundTasks):
    background_tasks.add_task(long_running_generation)
    return {"status": "started"}
```

### Frontend Optimizations
```javascript
// Implement debouncing for search inputs
const debouncedSearch = Helpers.debounce(searchFunction, 300);

// Lazy load components
const lazyLoadComponent = async (componentName) => {
    if (!window[componentName]) {
        await import(`./components/${componentName}.js`);
    }
};

// Cache API responses
const apiCache = new Map();
const cachedApiCall = (endpoint, data) => {
    const key = JSON.stringify({endpoint, data});
    if (apiCache.has(key)) {
        return Promise.resolve(apiCache.get(key));
    }
    return apiService.call(endpoint, data).then(result => {
        apiCache.set(key, result);
        return result;
    });
};
```

## 🆕 Recent Updates & Changelog

### Version 2.1.0 (Current)
- ✅ **Fixed**: "Approve Proposal" button now works correctly
- ✅ **Improved**: Centralized workflow in main app controller
- ✅ **Enhanced**: Better error handling and user feedback
- ✅ **Added**: Debug logging for troubleshooting
- ✅ **Updated**: Complete integration of all workflow steps

### Version 2.0.0
- 🎉 **New**: Complete modular rewrite with modern architecture
- 🎉 **New**: Support for multiple AI providers (OpenAI + Google Gemini)
- 🎉 **New**: Modern responsive UI with animations and notifications
- 🎉 **New**: Professional document generation with embedded images
- 🎉 **New**: Real-time file upload with drag-and-drop support
- 🎉 **New**: Chemical structure visualization with properties
- 🎉 **New**: Interactive feedback system for proposal refinement

### Version 1.0.0
- 📝 Initial release with basic functionality
- 📝 Simple research proposal generation
- 📝 Basic structure generation
- 📝 Basic document export

## 🔮 Roadmap & Future Enhancements

### Planned Features (v2.2.0)
- [ ] **User Authentication**: Multi-user support with project saving
- [ ] **Project Management**: Save and load research projects
- [ ] **Batch Processing**: Process multiple research topics simultaneously
- [ ] **Advanced Analytics**: Research trend analysis and visualization
- [ ] **Template System**: Customizable proposal templates
- [ ] **Integration**: Connect with reference managers (Zotero, Mendeley)

### Technical Improvements (v2.3.0)
- [ ] **Database Integration**: PostgreSQL for data persistence
- [ ] **Caching Layer**: Redis for improved performance
- [ ] **Background Tasks**: Celery for long-running operations
- [ ] **Advanced Chemistry**: 3D structure visualization, reaction prediction
- [ ] **Export Options**: LaTeX, PowerPoint, PDF formats
- [ ] **Cloud Storage**: Integration with Google Drive, Dropbox

### Long-term Vision (v3.0.0)
- [ ] **AI Agents**: Autonomous research assistants
- [ ] **Collaboration**: Real-time collaborative editing
- [ ] **Advanced ML**: Custom model fine-tuning
- [ ] **API Marketplace**: Third-party integrations
- [ ] **Mobile App**: Native mobile applications

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the code style guidelines
4. Test thoroughly with different AI providers
5. Submit a pull request with detailed description

### Areas for Contribution
- 🐛 **Bug Fixes**: Help identify and fix issues
- 🎨 **UI/UX Improvements**: Enhance the user interface
- 🔬 **Chemistry Features**: Add advanced chemical analysis
- 🌐 **Integrations**: Connect with external APIs and services
- 📚 **Documentation**: Improve guides and examples
- 🧪 **Testing**: Add comprehensive test coverage

### Code Review Process
1. All pull requests require review
2. Automated tests must pass
3. Code must follow style guidelines
4. Documentation must be updated for new features

## 📄 License & Legal

This project is provided as-is for educational and research purposes. Please ensure compliance with:

- **API Provider Terms**: OpenAI and Google Gemini terms of service
- **Academic Use**: Proper citation of generated research
- **Commercial Use**: Verify licensing for commercial applications
- **Data Privacy**: Comply with applicable data protection regulations

### Disclaimer
- Generated research proposals are AI-assisted and should be reviewed by domain experts
- Chemical structures should be validated before experimental use
- Always follow proper safety protocols in laboratory settings
- The authors are not responsible for any consequences of using this software

## 📞 Support & Community

### Getting Help
1. **Documentation**: Check this README for comprehensive guidance
2. **Troubleshooting**: Review the troubleshooting section above
3. **Console Logs**: Use browser developer tools for debugging
4. **GitHub Issues**: Report bugs and request features

### Community Resources
- **Examples**: See the `examples/` directory for sample usage
- **Wiki**: Additional documentation and tutorials
- **Discussions**: Community Q&A and feature discussions

---

## 🎉 Quick Start Summary

```bash
# 1. Setup
mkdir ai-chemistry-assistant && cd ai-chemistry-assistant
mkdir -p models services routers utils static/{css,js/{services,components,utils}} knowledge_base
touch models/__init__.py services/__init__.py routers/__init__.py utils/__init__.py

# 2. Install
pip install -r requirements.txt

# 3. Run
python main.py

# 4. Use
# Open http://localhost:8000
# Add API key → Upload docs OR select online source → Generate research → Approve → Download
```

**🚀 You're ready to generate professional chemistry research proposals with AI assistance!**

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
