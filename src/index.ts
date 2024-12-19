import express, { Request, Response, NextFunction } from "express";
import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import morgan from "morgan";
import { ocr } from "./lib/ocr.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { extractPage } from "./lib/pdf.js";

dotenv.config();
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const STORAGE_DIR = "./storage";
const storage: StorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, STORAGE_DIR);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const filename =
			path.basename(file.originalname, ext) + "_" + Date.now() + ext;
		cb(null, filename.replace(/[^a-zA-Z0-9-_\.]/g, "_"));
	},
});

// Configure multer with file type filtering
const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
		} else {
			cb(new Error("Only PDF files are allowed"));
		}
	},
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync(STORAGE_DIR)) {
	fs.mkdirSync(STORAGE_DIR);
}

// Routes
app.get("/", (req: Request, res: Response) => {
	res.send("OK");
});

app.post(
	"/ocr-ai",
	upload.single("pdf"),
	async (req: Request, res: Response) => {
		try {
			if (!req.file) {
				return res.status(400).json({
					status: "error",
					msg: "No PDF file uploaded",
				});
			}

			const openAPIKey = req.body.openAPIKey;

			if (!openAPIKey) {
				return res.status(400).json({
					status: "error",
					msg: "No OpenAI API key provided",
				});
			}

			const pageStart = req.query.pageStart
				? parseInt(req.query.pageStart as string)
				: 1;
			const pageEnd = req.query.pageEnd
				? parseInt(req.query.pageEnd as string)
				: 5;

			if (pageStart > pageEnd || pageStart < 1) {
				return res.status(400).json({
					status: "error",
					msg: "Page range is invalid",
				});
			}

			const pdfDoc = await pdfjsLib.getDocument(req.file.path).promise;
			if (pageEnd > pdfDoc.numPages) {
				return res.status(400).json({
					status: "error",
					msg: "Page range is invalid",
				});
			}
			const allPageContents = [];
			let totalTokenUsage = 0;

			for (
				let i = pageStart;
				i <= (pageEnd > pdfDoc.numPages ? pdfDoc.numPages : pageEnd);
				i++
			) {
				const page = await pdfDoc.getPage(i);
				const pageContents = await extractPage(page, openAPIKey);
				allPageContents.push({
					pageNum: i,
					contents: pageContents,
				});
			}

			res.json({
				status: "success",
				msg: "File uploaded and processed successfully",
				file: {
					originalName: req.file.originalname,
					filePath: req.file.filename,
				},
				contents: allPageContents
					.map((page) =>
						page.contents
							.map((content) => {
								if (
									content.type === "image" &&
									content.description
								) {
									totalTokenUsage += content.tokenUsage || 0;
									return `${content.text}\n[Image Description: ${content.description}]`;
								}
								return content.text;
							})
							.join("\n")
					)
					.join(`\n${"=".repeat(20)}\n`),
				totalTokenUsage: totalTokenUsage,
			});
		} catch (error) {
			res.status(500).json({
				status: "error",
				msg: error instanceof Error ? error.message : String(error),
			});
		}
	}
);

app.post("/ocr", upload.single("pdf"), async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				status: "error",
				msg: "No PDF file uploaded",
			});
		}

		const pageStart = req.query.pageStart
			? parseInt(req.query.pageStart as string)
			: 1;
		const pageEnd = req.query.pageEnd
			? parseInt(req.query.pageEnd as string)
			: 5;

		if (pageStart > pageEnd || pageStart < 1) {
			return res.status(400).json({
				status: "error",
				msg: "Page range is invalid",
			});
		}

		// Process the PDF file with OCR
		const ocrResult = await ocr.process(req.file.path, pageStart, pageEnd);

		res.json({
			status: "success",
			msg: "File uploaded and processed successfully",
			file: {
				originalName: req.file.originalname,
				filePath: req.file.filename,
				ocrFilePath: req.file.filename.replace(".pdf", "-ocr.pdf"),
			},
			contents: ocrResult.textContents,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			msg: error instanceof Error ? error.message : String(error),
		});
	}
});

app.get("/download/:filename", (req: Request, res: Response) => {
	const { filename } = req.params;
	const filePath = path.join(STORAGE_DIR, filename);

	fs.exists(filePath, (exists) => {
		if (!exists) {
			return res.status(404).json({ message: "File not found" });
		}

		res.download(filePath, filename, (err) => {
			if (err) {
				res.status(500).json({ message: "Error downloading the file" });
			}
		});
	});
});

app.delete("/files/:filename", (req: Request, res: Response) => {
	const { filename } = req.params;
	const filePath = path.join(STORAGE_DIR, filename);

	fs.exists(filePath, (exists) => {
		if (!exists) {
			return res.status(404).json({ message: "File not found" });
		}

		fs.unlink(filePath, (err) => {
			if (err) {
				return res
					.status(500)
					.json({ message: "Error deleting the file" });
			}
			res.json({ message: "File deleted successfully" });
		});
	});
});

if (!process.env.PORT) {
	throw new Error("PORT environment variable is not set");
}

const PORT = parseInt(process.env.PORT);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
