import { exec as execCallback } from "child_process";
import { promisify } from "util";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { extractTexts } from "./pdf.js";

const exec = promisify(execCallback);

export type OcrResult = {
	textContents: string;
	ocrFilePath: string;
};

export const ocr = {
	async process(
		inputFile: string,
		pageStart: number,
		pageEnd: number
	): Promise<OcrResult> {
		try {
			let start = new Date();

			const outputFile = inputFile.replace(".pdf", "-ocr.pdf");

			// ocrmypdf command
			const ocrResult = await exec(
				`ocrmypdf --pages ${pageStart}-${pageEnd} ${inputFile} ${outputFile} --redo-ocr `,
				{ timeout: 900000 }
			);

			// check for ocr errors
			if (
				ocrResult.stderr.length &&
				ocrResult.stderr.indexOf("ERROR") >= 0
			)
				console.info(`ocr failed for ${inputFile}`, ocrResult);

			console.log(
				`Ocr (process) -> finished OCR on ${inputFile} in %d secs.`,
				(new Date().getTime() - start.getTime()) / 1000
			);

			// Load the PDF document
			const loadingTask = pdfjsLib.getDocument(outputFile);
			const pdfDocument = await loadingTask.promise;

			// Extract text from specified pages
			let textContents = "";
			for (
				let pageNum = pageStart;
				pageNum <=
				(pageEnd > pdfDocument.numPages
					? pdfDocument.numPages
					: pageEnd);
				pageNum++
			) {
				const page = await pdfDocument.getPage(pageNum);
				const contents = await extractTexts(page);
				textContents +=
					contents.map((content) => content.text).join(" ") + "\n";
			}

			return {
				textContents,
				ocrFilePath: outputFile,
			};
		} catch (e) {
			throw e;
		}
	},
};
