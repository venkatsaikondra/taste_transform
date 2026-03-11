import { HfInference } from "@huggingface/inference";

let _hf: HfInference | null = null;

export function parseHfApiKeys(): string[] {
	const raw = process.env.HF_API_KEY || '';
	return raw
		.split(/[,\s]+/)
		.map((k) => k.trim())
		.filter((k) => k.length > 0);
}

function validateHfKey(key: string) {
	if (!key) {
		throw new Error("HF_API_KEY is not defined in environment variables");
	}
	if (/^(hf_)?(your_api_key|placeholder_token)$/i.test(key)) {
		throw new Error("HF_API_KEY appears invalid (placeholder detected)");
	}
}

export function getHf() {
	if (_hf) return _hf;

	const firstKey = parseHfApiKeys()[0];
	validateHfKey(firstKey);

	_hf = new HfInference(firstKey);
	return _hf;
}

export function createHfClient(key: string): HfInference {
	validateHfKey(key);
	return new HfInference(key);
}