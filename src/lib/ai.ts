import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export async function getDescriptionFromImage(
	imageBuffer: Buffer,
	openAPIKey: string
): Promise<{
	description: string;
	tokenUsage: number;
}> {
	try {
		const openai = createOpenAI({
			compatibility: "strict",
			apiKey: openAPIKey,
		});
		const result = await generateText({
			model: openai("gpt-4o", {}),
			maxTokens: 500,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "image",
							image: imageBuffer,
						},
					],
				},
			],
			system: "You are a helpful assistant that can describe images in detail.",
		});

		console.log("Token usage:", result.usage);

		return {
			description: result.text,
			tokenUsage: result.usage.totalTokens,
		};
	} catch (error) {
		console.error("Error getting image description:", error);
		throw new Error("Failed to generate image description");
	}
}
