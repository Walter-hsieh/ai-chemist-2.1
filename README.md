# AI Chemist-2.0

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)

**Generate comprehensive chemistry research proposals with AI assistance**

[Demo](#demo) • [Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

## 🧪 Overview

AI Chemist-2.0 is a modern web application that helps researchers generate professional chemistry research proposals using AI. Simply upload your documents or specify a research topic, and the system will analyze literature, generate proposals, design molecular structures, and create publication-ready documents.

### ✨ What makes this special?

- **🤖 Multi-AI Support**: Works with both OpenAI and Google Gemini
- **📚 Smart Literature Analysis**: Processes papers from Semantic Scholar, arXiv, or your own documents
- **🧬 Molecular Design**: AI-generated chemical structures with properties
- **📄 Professional Output**: Publication-ready Word docs and Excel templates
- **🎨 Modern Interface**: Clean, responsive design with real-time feedback

## 🎬 Demo

![AI Chemistry Demo](https://via.placeholder.com/800x450/667eea/white?text=AI+Chemistry+Research+Assistant+Demo)

> **Try it yourself**: Upload some chemistry papers → Enter "MOFs for carbon capture" → Watch AI generate a complete research proposal with molecular structures!

## 🚀 Features

| Feature | Description |
|---------|-------------|
| **📖 Literature Analysis** | Automatically analyzes research papers and generates comprehensive summaries |
| **✍️ Proposal Generation** | Creates detailed research proposals with methodology and objectives |
| **🧬 Structure Design** | AI-powered molecular structure generation with SMILES notation |
| **📊 Professional Documents** | Word documents, synthesis recipes, and experimental templates |
| **🔄 Interactive Refinement** | Approve/disapprove workflow with feedback integration |
| **📁 File Management** | Drag-and-drop upload for PDF, DOCX, and TXT files |
| **🎯 Multi-Source Data** | Semantic Scholar, arXiv, or local knowledge base |
| **📱 Responsive Design** | Works on desktop, tablet, and mobile devices |

## 🏃‍♂️ Quick Start

### Prerequisites
- Python 3.8+
- OpenAI or Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-chemist-2.0.git
   cd ai-chemist-2.0
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up directories**
   ```bash
   mkdir -p models services routers utils static/{css,js/{services,components,utils}} knowledge_base
   touch models/__init__.py services/__init__.py routers/__init__.py utils/__init__.py
   ```

4. **Start the application**
   ```bash
   python main.py
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

### First Run

1. Enter your OpenAI or Google Gemini API key
2. Choose "Semantic Scholar" as data source
3. Type: "metal-organic frameworks for gas separation"
4. Click "Generate Summary & Proposal"
5. Review and approve the generated proposal
6. Download your professional research documents!

## 📋 Usage Examples

### Example 1: Academic Research
```
Topic: "perovskite solar cells efficiency enhancement"
Source: Semantic Scholar
Output: 15-page research proposal with synthesis pathways
```

### Example 2: Industry R&D
```
Topic: "biodegradable polymers for packaging"
Source: Local documents (your company's research)
Output: Targeted proposal with specific molecular targets
```

### Example 3: Grant Application
```
Topic: "carbon capture using MOFs"
Source: arXiv + Semantic Scholar
Output: Comprehensive proposal ready for funding submission
```

## 🏗️ Architecture

```
ai-chemist-2.0/
├── 🐍 Backend (Python/FastAPI)
│   ├── main.py                 # Application entry point
│   ├── models/schemas.py       # Data validation models
│   ├── services/              # Business logic
│   ├── routers/               # API endpoints
│   └── utils/config.py        # Configuration
├── 🎨 Frontend (Vanilla JS)
│   ├── static/index.html      # Single-page app
│   ├── static/css/styles.css  # Modern styling
│   └── static/js/             # Modular components
└── 📁 Data
    └── knowledge_base/        # Uploaded documents
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: For higher API rate limits
SEMANTIC_SCHOLAR_API_KEY=your_key_here

# Optional: Custom storage location
KNOWLEDGE_BASE_DIR=custom_directory
```

### Supported File Types
- **PDF**: Research papers, textbooks
- **DOCX**: Word documents, reports
- **TXT**: Plain text files, notes

## 📚 API Reference

### Generate Research Proposal
```http
GET /api/research/summarize
```
| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | string | Research topic (required) |
| `source` | string | Data source: "semantic", "arxiv", "local" |
| `api_key` | string | AI provider API key (required) |
| `api_provider` | string | "openai" or "google" |

### Generate Chemical Structure
```http
POST /api/structure/generate
Content-Type: application/json

{
  "api_key": "your_key",
  "api_provider": "openai",
  "proposal_text": "Research proposal text..."
}
```

<details>
<summary>View all API endpoints</summary>

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload documents |
| `/api/research/summarize` | GET | Generate research summary |
| `/api/research/refine` | POST | Refine proposal with feedback |
| `/api/structure/generate` | POST | Generate molecular structure |
| `/api/structure/validate` | GET | Validate SMILES string |
| `/api/documents/generate` | POST | Create final documents |
| `/api/knowledge-base/stats` | GET | Knowledge base statistics |

</details>

## 🛠️ Development

### Adding a New AI Provider

```python
# services/ai_service.py
async def _call_new_provider(self, request: BaseAIRequest, prompt: str) -> str:
    # Your implementation here
    return ai_response

# Add to providers dictionary
self.providers[AIProvider.NEW_PROVIDER] = self._call_new_provider
```

### Creating a Custom Component

```javascript
// static/js/components/customComponent.js
class CustomComponent {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        // DOM element setup
    }
    
    bindEvents() {
        // Event listeners
    }
}

window.customComponent = new CustomComponent();
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
python -m pytest tests/

# Test API endpoints
curl -X GET "http://localhost:8000/api/health"
```

## 🚀 Deployment

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

```bash
docker build -t ai-chemist-2.0 .
docker run -p 8000:8000 ai-chemist-2.0
```

### Production
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🐛 Troubleshooting

<details>
<summary><strong>Common Issues & Solutions</strong></summary>

### "Approve Proposal" button not working
- Check browser console (F12) for errors
- Verify API key is entered correctly
- Ensure proposal was generated successfully

### File upload fails
- Check file size (max 50MB)
- Verify file format (PDF, DOCX, TXT only)
- Ensure `knowledge_base` directory exists

### API key errors
- Verify key is valid and has sufficient quota
- Check provider selection matches your key type
- Try regenerating the API key

### Slow performance
- Reduce number of papers analyzed (limit parameter)
- Use simpler research topics
- Check internet connection

</details>

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin amazing-feature`
5. **Open** a Pull Request

### Areas we need help with:
- 🐛 Bug fixes and testing
- 🎨 UI/UX improvements
- 🔬 Advanced chemistry features
- 📚 Documentation and examples
- 🌐 New AI provider integrations

## 📈 Roadmap

- [ ] **User Authentication** - Multi-user support with saved projects
- [ ] **Advanced Analytics** - Research trend analysis and visualization  
- [ ] **3D Molecular Viewer** - Interactive structure visualization
- [ ] **Batch Processing** - Handle multiple research topics
- [ ] **API Marketplace** - Third-party integrations
- [ ] **Mobile App** - Native iOS/Android applications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **RDKit** - Chemistry toolkit for molecular operations
- **FastAPI** - Modern web framework for building APIs
- **OpenAI & Google** - AI models powering the intelligence
- **Semantic Scholar** - Academic paper database
- **arXiv** - Open access research repository

## 📞 Support

- 📖 **Documentation**: Check our [Wiki](../../wiki) for detailed guides
- 🐛 **Bug Reports**: [Open an issue](../../issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Request a feature](../../issues/new?template=feature_request.md)  
- 💬 **Discussions**: [Join our community](../../discussions)

---

<div align="center">

**⭐ Star this repository if it helped you generate better research proposals! ⭐**

[Report Bug](../../issues) • [Request Feature](../../issues) • [View Demo](http://demo-link.com)

Made with ❤️ for the chemistry research community

</div>d before experimental use
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
mkdir ai-chemist-2.0 && cd ai-chemist-2.0
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
