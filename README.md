# PDF to Text Converter for LLM Applications

A REST API service that converts PDF documents (including those with images) into LLM-ready text format. This service helps prepare your PDF data for Large Language Model applications by extracting text from both standard PDFs and those containing images.

[![Docker Hub](https://img.shields.io/docker/pulls/anngpham/pdf-ocr)](https://hub.docker.com/r/anngpham/pdf-ocr)

## Features

-   Convert PDF documents to clean, structured text
-   Extract text from images within PDFs
-   Two processing methods:
    -   Basic OCR using OCRmyPDF for standard text extraction
    -   Advanced processing with OpenAI Vision API for enhanced accuracy
-   Selective page processing
-   Docker containerization

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

| Parameter   | Type     | Location  | Description                          |
| ----------- | -------- | --------- | ------------------------------------ |
| `pdf`       | `file`   | form-data | PDF document to process              |
| `pageStart` | `number` | query     | Starting page (optional, default: 1) |
| `pageEnd`   | `number` | query     | Ending page (optional, default: 5)   |

```bash
# Basic OCR
curl -X POST \
  -F "pdf=@/path/to/file.pdf" \
  http://localhost:5500/ocr
```

**Sample Response:**

```json
{
	"status": "success",
	"msg": "File uploaded and processed successfully",
	"file": {
		"originalName": "book.pdf",
		"filePath": "book_1734604121041.pdf",
		"ocrFilePath": "book_1734604121041-ocr.pdf"
	},
	"contents": "Table:   Self-Discovery   Map  Aspect   Questions   to   Explore   Example   Answers  Strengths   What   am   |   naturally   good   at?   Writing,   Problem-solving  Weaknesses   Where   do!   struggle?   Time   management,   Focus Core   Values   What   matters   most   to   me?   Integrity,   Family Interests   What   activities   bring   me   joy?   Reading,   Painting  Triggers   What   makes   me   stressed   or   frustrated?   Deadlines,   Criticism  Table:   SMART   Goals   Examples  Goal   Specificity   Measure   Deadline   Achievability  Learn   a   new   skill   Learn   ReactJS   Build   a   portfolio   3months   _   Realistic Improve   fitness   Lose   5   kg   Track   weight   6   months   _   Realistic  Strengthen   bonds   Weekly   family   dinners   Maintain   routine   Ongoing   Highly   doable  Chapter 3: Setting Goals  Goals act as a roadmap to your aspirations. Without clear objectives, progress feels aimless. This chapter introduces strategies for setting effective goals and tracking them.  The Importance of Goals  •   Provides direction •   Increases motivation •   Creates accountability  The SMART Framework  SMART stands for Specific, Measurable, Achievable, Relevant, and Time-bound.  Chapter 4: Embracing Failure  Failure isn’t the end; it’s a critical part of growth. This chapter delves into why failure is valuable and how to leverage it for success.\n"
}
```

#### 2. AI-Powered Processing

`POST /ocr-ai`

Uses OpenAI Vision API for advanced text extraction and image analysis. This method provides better accuracy for complex documents and can understand context from images.

| Parameter    | Type     | Location  | Description                          |
| ------------ | -------- | --------- | ------------------------------------ |
| `pdf`        | `file`   | form-data | PDF document to process              |
| `openAPIKey` | `string` | form-data | Your OpenAI API key                  |
| `pageStart`  | `number` | query     | Starting page (optional, default: 1) |
| `pageEnd`    | `number` | query     | Ending page (optional, default: 5)   |

```bash
# OCR with AI analysis
curl -X POST \
  -F "pdf=@/path/to/file.pdf" \
  -F "openAPIKey=your-api-key" \
  http://localhost:5500/ocr-ai
```

**Sample Response:**

```json
{
	"status": "success",
	"msg": "File uploaded and processed successfully",
	"file": {
		"originalName": "book.pdf",
		"filePath": "book_1734604525868.pdf"
	},
	"contents": "Table: Self-Discovery Map\nAspect Questions to Explore Example Answers\nStrengths What am | naturally good at? Writing, Problem-solving\nWeaknesses Where do | struggle? Time management, Focus\nCore Values What matters most to me? Integrity, Family\nInterests What activities bring me joy? Reading, Painting\nTriggers What makes me stressed or frustrated? Deadlines, Criticism\n\n[Image Description: The table titled \"Self-Discovery Map\" includes three columns: Aspect, Questions to Explore, and Example Answers.\n\n1. **Strengths**\n   - Question: What am I naturally good at?\n   - Example Answers: Writing, Problem-solving\n\n2. **Weaknesses**\n   - Question: Where do I struggle?\n   - Example Answers: Time management, Focus\n\n3. **Core Values**\n   - Question: What matters most to me?\n   - Example Answers: Integrity, Family\n\n4. **Interests**\n   - Question: What activities bring me joy?\n   - Example Answers: Reading, Painting\n\n5. **Triggers**\n   - Question: What makes me stressed or frustrated?\n   - Example Answers: Deadlines, Criticism]\nChapter 3: Setting Goals\n\nGoals act as a roadmap to your aspirations. Without clear objectives, progress feels aimless.\n\nThis chapter introduces strategies for setting effective goals and tracking them.\n\nThe Importance of Goals\n\n•\n \nProvides direction\n\n•\n \nIncreases motivation\n\n•\n \nCreates accountability\n\nThe SMART Framework\n\nSMART stands for Specific, Measurable, Achievable, Relevant, and Time\n-\nbound.\nTable: SMART Goals Examples\nGoal Specificity Measure Deadline  Achievability\nLearn a new skill Learn ReactJS Build a portfolio 3 months Realistic\nImprove fitness Lose 5 kg Track weight 6 months Realistic\nStrengthen bonds = Weekly family dinners ~~ Maintain routine = Ongoing Highly doable\n\n[Image Description: This table provides examples of SMART goals, which are Specific, Measurable, Achievable, Relevant, and Time-bound. Here are the details:\n\n1. **Goal: Learn a new skill**\n   - **Specificity:** Learn ReactJS\n   - **Measure:** Build a portfolio\n   - **Deadline:** 3 months\n   - **Achievability:** Realistic\n\n2. **Goal: Improve fitness**\n   - **Specificity:** Lose 5 kg\n   - **Measure:** Track weight\n   - **Deadline:** 6 months\n   - **Achievability:** Realistic\n\n3. **Goal: Strengthen bonds**\n   - **Specificity:** Weekly family dinners\n   - **Measure:** Maintain routine\n   - **Deadline:** Ongoing\n   - **Achievability:** Highly doable\n\nThese examples illustrate how to set clear and attainable goals.]\n\nChapter 4: Embracing Failure\n\nFailure isn’t the end; it’s a critical part of growth. This chapter delves into why failure is\n\nvaluable and how to leverage it for success.",
	"totalTokenUsage": 3255
}
```

### 📁 File Operations

| Endpoint              | Method   | Description              |
| --------------------- | -------- | ------------------------ |
| `/download/:filePath` | `GET`    | Download processed files |
| `/files/:filePath`    | `DELETE` | Delete files from server |

## Environment Variables

-   `PORT`: Server port (default: 5500)

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
