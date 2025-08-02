# AI Chemistry Research Assistant 🧪

An intelligent web application that helps chemists generate comprehensive research proposals with AI assistance. The system analyzes scientific literature, creates novel research proposals, designs molecular structures, and produces publication-ready documents with real-time chemical availability verification.

![Chemistry Assistant Demo](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Key Features

### 🔬 **Multi-Source Literature Analysis**
- **Semantic Scholar Integration**: Access 200M+ academic papers
- **arXiv Support**: Search preprint servers for latest research
- **Local Knowledge Base**: Upload and analyze your own documents (PDF, DOCX, TXT)
- **Smart Content Processing**: Advanced document parsing and text extraction

### 🤖 **Multi-AI Provider Support**
- **OpenAI GPT Models**: GPT-4, GPT-4-turbo, GPT-3.5-turbo
- **Google Gemini**: Gemini-2.5-flash, Gemini-1.5-pro, Gemini-1.0-pro
- **Ollama Local AI**: Run models locally (llama3.1, gemma2, codellama, etc.)
- **Automatic Fallback**: Retry logic with error handling and optimization

### 💡 **Intelligent Research Generation**
- **Literature Summarization**: AI-powered analysis of scientific papers
- **Novel Proposal Creation**: Generate innovative research directions
- **Interactive Refinement**: Provide feedback to improve proposals
- **Academic Quality**: Publication-ready formatting and structure

### ⚗️ **Advanced Chemical Structure Design**
- **SMILES Generation**: AI-created molecular structures with validation
- **Real-time Availability**: Check commercial availability via PubChem/Cactus APIs
- **2D Visualization**: Generate high-quality molecular structure images
- **Property Calculation**: Molecular weight, LogP, Lipinski's Rule of Five
- **Alternative Suggestions**: Recommend similar available compounds

### 📄 **Professional Document Generation**
- **Research Proposals**: Comprehensive Word documents with 9 structured sections
- **Synthesis Recipes**: Detailed laboratory procedures and protocols
- **Data Templates**: Excel spreadsheets for experimental tracking
- **Consistent Formatting**: Perfect preview-to-document matching

### 📊 **Research History & Analytics**
- **Session Tracking**: Complete research workflow history
- **Search & Filter**: Find previous research by topic or keywords
- **Usage Statistics**: Analytics on research patterns and trends
- **Export Capabilities**: JSON and CSV data export

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (tested with Python 3.13.5)
- **Git**
- **AI API Key**: Choose one or more:
  - OpenAI API key ([Get here](https://platform.openai.com/api-keys))
  - Google Gemini API key ([Get here](https://makersuite.google.com/app/apikey))
  - Ollama for local AI ([Install guide](https://ollama.ai/download))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Walter-hsieh/ai-chemist-2.0.git
   cd ai-chemist-2.0
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install RDKit (Chemistry Library)**
   
   RDKit is essential for molecular structure operations:
   
   **Option A - Using conda (recommended):**
   ```bash
   conda install -c conda-forge rdkit
   ```
   
   **Option B - Using pip:**
   ```bash
   pip install rdkit
   ```
   
   > **Note**: If you encounter build issues, try using conda or see troubleshooting section.

5. **Run setup script**
   ```bash
   python setup.py
   ```

6. **Start the application**
   ```bash
   python main.py
   ```
   
   Or alternatively:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

7. **Open your browser**
   Navigate to `http://localhost:8000`

## 🔧 Configuration Options

### Environment Variables (Optional)

Create a `.env` file in the project root:

```env
# Optional: Set default API keys (not recommended for security)
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here

# Optional: Customize settings
KNOWLEDGE_BASE_DIR=knowledge_base
MAX_FILE_SIZE=52428800
DEFAULT_OPENAI_MODEL=gpt-4
DEFAULT_GOOGLE_MODEL=gemini-2.5-flash
DEFAULT_OLLAMA_MODEL=llama3.1:latest
DEFAULT_OLLAMA_URL=http://localhost:11434
```

### AI Provider Setup

#### OpenAI
- Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Recommended models: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`

#### Google Gemini
- Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Recommended models: `gemini-2.5-flash`, `gemini-1.5-pro`

#### Ollama (Local AI)
- Install Ollama: [Download here](https://ollama.ai/download)
- Start server: `ollama serve`
- Pull models: `ollama pull llama3.1:latest`
- Popular models: `llama3.1:latest`, `gemma2:latest`, `codellama:latest`

## 📖 User Guide

### Step 1: Configure AI Provider
1. Select your preferred AI provider (OpenAI, Google, or Ollama)
2. Enter your API key (or Ollama server URL)
3. Optionally specify a model name

### Step 2: Choose Data Source
- **Semantic Scholar**: Access 200M+ academic papers
- **arXiv**: Search preprint servers
- **Local Knowledge Base**: Upload your documents (PDF, DOCX, TXT up to 50MB each)

### Step 3: Generate Research
1. Enter your research topic (e.g., "MOFs for carbon capture", "perovskite solar cells")
2. Click "Generate Summary & Proposal"
3. Review the literature summary and research proposal

### Step 4: Refine (Optional)
- **Approve**: Proceed to structure generation
- **Provide Feedback**: Improve the proposal with specific suggestions

### Step 5: Generate Chemical Structure
- Review the AI-generated molecular structure
- Check molecular properties and commercial availability
- **Approve** to generate documents or **Redesign** with feedback

### Step 6: Download Documents
- **Research Proposal**: Comprehensive Word document
- **Synthesis Recipe**: Detailed laboratory procedures
- **Data Template**: Excel spreadsheet for experimental tracking

## 🏗️ Project Architecture

```
ai-chemist-2.0/
├── main.py                     # FastAPI application entry point
├── setup.py                   # Project setup script  
├── requirements.txt           # Python dependencies
├── models/
│   └── schemas.py            # Pydantic data models
├── routers/                  # API endpoints
│   ├── upload.py            # File upload handling
│   ├── research.py          # Literature analysis
│   ├── structure.py         # Chemical structure operations
│   ├── documents.py         # Document generation
│   └── history.py           # Research history management
├── services/                # Core business logic
│   ├── ai_service.py        # Multi-AI provider integration
│   ├── research_service.py  # Literature analysis
│   ├── structure_service.py # Chemical structure handling
│   ├── document_service.py  # Document generation
│   ├── file_service.py      # File management
│   ├── chemical_info_service.py # Chemical availability verification
│   ├── template_service.py  # Proposal templates
│   └── history_service.py   # Research session tracking
├── utils/
│   └── config.py            # Application configuration
├── static/                  # Frontend assets
│   ├── index.html          # Main web interface
│   ├── css/styles.css      # Application styling
│   └── js/                 # JavaScript modules
│       ├── app.js          # Main application logic
│       ├── config.js       # Frontend configuration
│       ├── components/     # UI components
│       ├── services/       # API communication
│       └── utils/          # Utility functions
├── knowledge_base/         # Local document storage
└── data/
    └── history/           # Research session history
```

## 🧪 Advanced Features

### Chemical Availability Verification
- **Real-time checking** via PubChem and Cactus databases
- **Availability scoring** (0-100 scale)
- **Commercial source identification**
- **Alternative compound suggestions**

### Research History
- **Complete session tracking** with metadata
- **Search and filter** by topic or keywords
- **Usage analytics** and trends
- **Export capabilities** (JSON/CSV)

### Enhanced Document Generation
- **9-section proposal structure**: Abstract, Introduction, Objectives, Chemical Design, Methodology, Expected Outcomes, Timeline, Risk Assessment, Conclusion
- **Chemical formula handling**: Proper subscripts and formatting
- **Academic-quality writing**: Publication-ready formatting
- **Embedded structure images**: High-quality molecular visualizations

## 🚨 Troubleshooting

### Common Issues

#### 1. RDKit Installation Problems
```bash
# If pip installation fails, try conda:
conda install -c conda-forge rdkit

# Or install specific version:
pip install rdkit==2023.9.4

# Windows users may need Microsoft Visual C++ Build Tools
```

#### 2. AI Service Errors
- **Invalid API Key**: Verify key is correct and has sufficient credits
- **Rate Limits**: Wait and retry, or use different provider
- **Ollama Connection**: Ensure `ollama serve` is running on correct port

#### 3. Structure Generation Failures
- **Invalid SMILES**: System will retry with simpler structures
- **Ring Closure Errors**: AI will attempt fallback generation
- **Complex Molecules**: Try providing feedback for simpler structures

#### 4. File Upload Issues
- **Size Limits**: Maximum 50MB per file
- **Format Support**: Only PDF, DOCX, TXT supported
- **Parsing Errors**: Check file is not corrupted or password-protected

### Performance Tips
- Use **local Ollama** for privacy and unlimited usage
- **Limit papers** to 5-10 for optimal performance
- **Clear browser cache** if interface becomes slow
- **Use SSD storage** for better file processing speed

## 🧪 Testing

Run the comprehensive test suite:

```bash
python test_improvements.py
```

Tests cover:
- Chemical information service functionality
- Template service consistency  
- History tracking accuracy
- File structure integrity
- Core service functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **RDKit**: Open-source cheminformatics toolkit
- **OpenAI & Google**: Advanced language models
- **PubChem & Cactus**: Chemical databases
- **Semantic Scholar**: Academic paper database
- **arXiv**: Preprint server access
- **FastAPI**: Modern web framework
- **Ollama**: Local AI model hosting

## 📞 Support

- 🐛 **Bug Reports**: [Create an issue](https://github.com/Walter-hsieh/ai-chemist-2.0/issues)
- 💬 **Questions**: [Start a discussion](https://github.com/Walter-hsieh/ai-chemist-2.0/discussions)
- 📧 **Email**: Contact the maintainers

## 🗺️ Roadmap

### Upcoming Features
- [ ] **3D Molecular Visualization**: Interactive structure viewing
- [ ] **Multi-language Support**: Interface localization
- [ ] **Advanced Analytics**: Research trend analysis
- [ ] **Collaborative Features**: Team research workflows
- [ ] **API Integration**: Third-party chemistry tools
- [ ] **Mobile App**: iOS/Android applications

### Data Sources
- [ ] **PubMed Integration**: Medical chemistry papers
- [ ] **Patent Databases**: IP landscape analysis
- [ ] **ChemRxiv**: Chemistry preprints
- [ ] **Crystallographic Databases**: Structure data

### Export Formats
- [ ] **LaTeX Export**: Academic publishing
- [ ] **PowerPoint**: Presentation generation
- [ ] **HTML Reports**: Web-based sharing
- [ ] **Jupyter Notebooks**: Interactive analysis

---

**Made with ❤️ for the chemistry research community**

*Empowering chemists with AI-driven research tools since 2024*