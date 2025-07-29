# AI Chemistry Research Assistant 🧪

An intelligent web application that helps chemists generate comprehensive research proposals with AI assistance. The system analyzes scientific literature, creates novel research proposals, designs molecular structures, and produces publication-ready documents.

![Chemistry Assistant Demo](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- 🔬 **Literature Analysis**: Analyze papers from Semantic Scholar, arXiv, or local documents
- 💡 **AI-Powered Proposals**: Generate novel research proposals using OpenAI GPT or Google Gemini
- ⚗️ **Chemical Structure Design**: Create and visualize molecular structures with RDKit
- 📄 **Document Generation**: Produce Word documents, Excel synthesis recipes, and data templates
- 🔄 **Interactive Refinement**: Iteratively improve proposals based on user feedback
- 📊 **Molecular Properties**: Calculate and display chemical properties automatically

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher (tested with Python 3.13.5)
- Git
- OpenAI API key or Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Walter-hsieh/ai-chemist-2.0.git
   cd ai-chemist-2.0
   ```

2. **Create a virtual environment**
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
   
   **Note**: RDKit is commented out in requirements.txt due to build issues on some systems. Install it separately:
   
   **Option A - Using pip (may require build tools):**
   ```bash
   pip install rdkit
   ```
   
   **Option B - Using conda (recommended for Windows):**
   ```bash
   # Install conda/miniconda first if not available
   conda install -c conda-forge rdkit
   ```

4. **Run the setup script**
   ```bash
   python setup.py
   ```

5. **Get API Keys**
   - **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Google Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

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

## 📁 Project Structure

```
ai-chemist-2.0/
├── main.py                 # FastAPI application entry point
├── setup.py               # Project setup script
├── requirements.txt       # Python dependencies
├── models/
│   └── schemas.py         # Pydantic data models
├── routers/
│   ├── upload.py          # File upload endpoints
│   ├── research.py        # Research analysis endpoints
│   ├── structure.py       # Chemical structure endpoints
│   └── documents.py       # Document generation endpoints
├── services/
│   ├── ai_service.py      # AI provider integration
│   ├── research_service.py # Literature analysis
│   ├── structure_service.py # Chemical structure handling
│   ├── document_service.py # Document generation
│   └── file_service.py    # File management
├── utils/
│   └── config.py          # Application configuration
├── static/
│   ├── index.html         # Main web interface
│   ├── css/
│   │   └── styles.css     # Application styling
│   └── js/
│       ├── app.js         # Main application logic
│       ├── config.js      # Frontend configuration
│       ├── components/    # UI components
│       ├── services/      # Frontend services
│       └── utils/         # Utility functions
└── knowledge_base/        # Local document storage
```

## 🔧 Configuration

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
```

### API Configuration

The application supports two AI providers:

1. **OpenAI GPT Models**
   - Default: `gpt-4`
   - Alternatives: `gpt-4-turbo`, `gpt-3.5-turbo`

2. **Google Gemini Models**
   - Default: `gemini-2.5-flash`
   - Alternatives: `gemini-1.5-pro`, `gemini-1.0-pro`

## 📖 Usage Guide

### Step 1: Configure AI Provider
1. Select your preferred AI provider (OpenAI or Google)
2. Enter your API key
3. Optionally specify a model name

### Step 2: Choose Data Source
- **Semantic Scholar**: Access academic papers database
- **arXiv**: Access preprint server
- **Local Knowledge Base**: Upload your own documents (PDF, DOCX, TXT)

### Step 3: Generate Research
1. Enter your research topic (e.g., "MOFs for carbon capture")
2. Click "Generate Summary & Proposal"
3. Review the literature summary and research proposal

### Step 4: Refine (Optional)
- Approve the proposal to proceed
- Or provide feedback to improve it

### Step 5: Generate Structure
- Review the generated molecular structure
- Check molecular properties
- Redesign if needed

### Step 6: Download Documents
- Research proposal (Word document)
- Synthesis recipe (Excel spreadsheet)
- Data recording template (Excel spreadsheet)

## 🧪 Supported File Types

- **PDF**: Scientific papers, research documents
- **DOCX**: Word documents, reports
- **TXT**: Plain text files, notes

Maximum file size: 50MB per file

## 🔬 Chemical Structure Features

- **SMILES Generation**: Create valid SMILES notation
- **2D Visualization**: Generate molecular structure images
- **Property Calculation**:
  - Molecular weight
  - LogP (lipophilicity)
  - Hydrogen bond donors/acceptors
  - Number of rings, atoms, bonds
  - Lipinski's Rule of Five compliance

## 🚨 Troubleshooting

### Common Issues

1. **Import Error with RDKit**
   - RDKit installation can be challenging on some systems due to build dependencies
   - **Windows users**: Use conda installation (recommended):
   ```bash
   conda install -c conda-forge rdkit
   ```
   - **Alternative**: Try pip without version constraints:
   ```bash
   pip install rdkit
   ```
   - **If still failing**: You may need Microsoft Visual C++ Build Tools for Windows
   - Make sure you're using a compatible Python version (3.8-3.12 recommended)

2. **API Key Invalid**
   - Verify your API key is correct
   - Check if you have sufficient credits
   - Ensure the key has proper permissions

3. **File Upload Fails**
   - Check file size (max 50MB)
   - Verify file format is supported
   - Ensure sufficient disk space

4. **Structure Generation Fails**
   - Try a different research topic
   - Check if RDKit is properly installed
   - Verify AI provider is responding

### Performance Tips

- Use local knowledge base for faster processing
- Limit literature analysis to 5-10 papers for optimal performance
- Close unused browser tabs to free memory

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
- **OpenAI**: GPT language models
- **Google**: Gemini AI models
- **Semantic Scholar**: Academic paper database
- **arXiv**: Preprint server access

## 📞 Support

- Create an [issue](https://github.com/Walter-hsieh/ai-chemist-2.0/issues) for bug reports
- Start a [discussion](https://github.com/Walter-hsieh/ai-chemist-2.0/discussions) for questions

## 🗺️ Roadmap

- [ ] Support for more file formats (RTF, ODT)
- [ ] Integration with PubMed database
- [ ] 3D molecular visualization
- [ ] Collaborative proposal editing
- [ ] Export to LaTeX format
- [ ] Advanced chemical property prediction
- [ ] Multi-language support

---

**Made with ❤️ for the chemistry research community**