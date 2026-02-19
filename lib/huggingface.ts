import { HfInference } from "@huggingface/inference";

let _hf: HfInference | null = null;

/**
 * Lazily initialize the HfInference client. This avoids creating the client
 * during client-side builds and gives a clear error when the API key is missing.
 */
export function getHf() {
	if (_hf) return _hf;
	const key = process.env.HF_API_KEY;
	if (!key) {
		throw new Error('HF_API_KEY is not defined in environment variables');
	}
	_hf = new HfInference(key);
	return _hf;
}