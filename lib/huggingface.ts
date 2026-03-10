import { HfInference } from "@huggingface/inference";

const legacyKey = process.env.HF_API_KEY?.trim() || "";
const hfApiKeysFromLegacy = legacyKey
	? legacyKey
		.split(",")
		.map((k) => k.trim())
		.filter(Boolean)
	: [];

const hfApiKeys: string[] = [
	process.env.HF_API_KEY_1,
	process.env.HF_API_KEY_2,
	process.env.HF_API_KEY_3,
	...hfApiKeysFromLegacy,
]
	.filter(Boolean)
	.map((k) => k!.trim());

if (hfApiKeys.length === 0) {
	throw new Error(
		"No Hugging Face API key found. Please set HF_API_KEY_1, HF_API_KEY_2, HF_API_KEY_3 or HF_API_KEY",
	);
}

const hfClients = hfApiKeys.map((key) => new HfInference(key));
let currentKeyIndex = 0;

/**
 * Get next HfInference client using round-robin key rotation.
 */
export function getHf() {
	const client = hfClients[currentKeyIndex];
	currentKeyIndex = (currentKeyIndex + 1) % hfClients.length;
	return client;
}