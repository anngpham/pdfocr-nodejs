import { createCanvas } from "canvas";
import path from "path";
import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api.js";
import { createWorker } from "tesseract.js";
import { fileURLToPath } from "url";
import { getDescriptionFromImage } from "./ai.js";

export type PageContent = {
	type: "text" | "image";
	text: string;
	transform: number[];
	data?: string;
	description?: string;
	tokenUsage?: number;
};

export type Page = {
	pageNum: number;
	contents: PageContent[];
};

// Update the worker configuration for Node.js environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PDF_WORKER_URL = path.join(
	__dirname,
	"../node_modules/pdfjs-dist/build/pdf.worker.mjs"
);
pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${PDF_WORKER_URL}`;

export async function extractPage(
	page: pdfjsLib.PDFPageProxy,
	openAPIKey: string
) {
	const textContents = await extractTexts(page);
	const imageContents = await extractImages(page, openAPIKey);
	const contents = [...textContents, ...imageContents];
	contents.sort((a, b) => {
		const yA = a.transform ? a.transform[5] : 0;
		const yB = b.transform ? b.transform[5] : 0;
		const xA = a.transform ? a.transform[4] : 0;
		const xB = b.transform ? b.transform[4] : 0;
		if (yA !== yB) return yB - yA;
		return xA - xB;
	});
	return contents;
}

export async function extractTexts(page: pdfjsLib.PDFPageProxy) {
	const textContent = await page.getTextContent();
	return textContent.items.map((item) => ({
		type: "text",
		text: (item as TextItem).str,
		transform: (item as TextItem).transform,
	})) as PageContent[];
}

export async function extractImages(
	page: pdfjsLib.PDFPageProxy,
	openAPIKey: string
) {
	const imageContents: PageContent[] = [];
	const ops = await page.getOperatorList();
	const worker = await createWorker(["eng"]);

	for (let i = 0; i < ops.fnArray.length; i++) {
		if (
			ops.fnArray[i] === pdfjsLib.OPS.paintXObject ||
			ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject
		) {
			const objId = ops.argsArray[i][0];

			try {
				const imageObj = await page.objs.get(objId);

				if (imageObj && imageObj.width && imageObj.height) {
					const canvas = createCanvas(
						imageObj.width,
						imageObj.height
					);
					const ctx = canvas.getContext("2d");
					const rgbaData = new Uint8ClampedArray(
						imageObj.width * imageObj.height * 4
					);

					switch (imageObj.kind) {
						case 1: // GRAYSCALE
							for (let j = 0; j < imageObj.data.length; j++) {
								const pos = j * 4;
								rgbaData[pos] = imageObj.data[j]; // R
								rgbaData[pos + 1] = imageObj.data[j]; // G
								rgbaData[pos + 2] = imageObj.data[j]; // B
								rgbaData[pos + 3] = 255; // A
							}
							break;
						case 2: // RGB
							for (let j = 0; j < imageObj.data.length; j += 3) {
								const pos = (j / 3) * 4;
								rgbaData[pos] = imageObj.data[j]; // R
								rgbaData[pos + 1] = imageObj.data[j + 1]; // G
								rgbaData[pos + 2] = imageObj.data[j + 2]; // B
								rgbaData[pos + 3] = 255; // A
							}
							break;
						case 3: // RGBA
							rgbaData.set(imageObj.data);
							break;
					}

					const imageData = ctx.createImageData(
						imageObj.width,
						imageObj.height
					);
					imageData.data.set(rgbaData);
					ctx.putImageData(imageData, 0, 0);

					const { description, tokenUsage } =
						await getDescriptionFromImage(
							canvas.toBuffer(),
							openAPIKey
						);

					const data = canvas.toDataURL();
					const result = await worker.recognize(data);
					imageContents.push({
						transform: ops.argsArray[i - 2],
						type: "image",
						text: result.data.text,
						description,
						tokenUsage,
					});
				}
			} catch (error) {
				console.error("Error extracting image:", error);
				throw error;
			}
		}
	}

	await worker.terminate();
	return imageContents;
}
