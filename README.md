# PDF to Text Converter for LLM Applications

A REST API service that converts PDF documents (including those with images) into LLM-ready text format. This service helps prepare your PDF data for Large Language Model applications by extracting text from both standard PDFs and those containing images.

[![Docker Hub](https://img.shields.io/docker/pulls/anngpham/pdf-ocr)](https://hub.docker.com/r/anngpham/pdf-ocr)



## Features

- Convert PDF documents to clean, structured text
- Extract text from images within PDFs
- Two processing methods:
  - Basic OCR using OCRmyPDF for standard text extraction
  - Advanced processing with OpenAI Vision API for enhanced accuracy
- Selective page processing
- Docker containerization

## Support the Project

If you find this project helpful, you can support its development by buying me a coffee:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/anngpham)

## Quick Start

### Using Docker Hub

```bash
# Pull the image
docker pull anngpham/pdf-ocr

# Run the container
docker run -d -p 5500:5500 -e PORT=5500 anngpham/pdf-ocr
```

### Building Locally

```bash
# Clone the repository
git clone https://github.com/anngpham/pdfocr-nodejs.git
cd pdfocr-nodejs

# Build the image
docker build -t pdf-ocr .

# Run the container
docker run -d -p 5500:5500 -e PORT=5500 pdf-ocr
```

### Using Docker Compose

```bash
docker-compose up --build
```

## 🚀 API Endpoints

### 📑 PDF Processing Methods

#### 1. Basic OCR Processing
`POST /ocr`

Uses OCRmyPDF to convert PDF documents (including images) to searchable text. This method is ideal for standard PDFs with clear text and simple images.

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `pdf` | `file` | form-data | PDF document to process |
| `pageStart` | `number` | query | Starting page (optional, default: 1) |
| `pageEnd` | `number` | query | Ending page (optional, default: 5) |

```bash
# Basic OCR
curl -X POST \
  -F "pdf=@/path/to/file.pdf" \
  http://localhost:5500/ocr
```

#### 2. AI-Powered Processing
`POST /ocr-ai`

Uses OpenAI Vision API for advanced text extraction and image analysis. This method provides better accuracy for complex documents and can understand context from images.

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `pdf` | `file` | form-data | PDF document to process |
| `openAPIKey` | `string` | form-data | Your OpenAI API key |
| `pageStart` | `number` | query | Starting page (optional, default: 1) |
| `pageEnd` | `number` | query | Ending page (optional, default: 5) |

```bash
# OCR with AI analysis
curl -X POST \
  -F "pdf=@/path/to/file.pdf" \
  -F "openAPIKey=your-api-key" \
  http://localhost:5500/ocr-ai
```

### 📁 File Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/download/:filePath` | `GET` | Download processed files |
| `/files/:filePath` | `DELETE` | Delete files from server |

## Environment Variables

- `PORT`: Server port (default: 5500)

## Project Structure

```
.
├── src/
│   ├── index.ts          # Main application entry
│   └── lib/
│       ├── ai.ts         # AI image analysis
│       ├── ocr.ts        # OCR processing
│       └── pdf.ts        # PDF handling
├── Dockerfile            # Production build
├── docker-compose.yml    # Production orchestration
└── package.json
```
