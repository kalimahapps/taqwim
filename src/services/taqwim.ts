import Taqwim from '@taqwim/index';
class TaqwimSingleton {
	private static instance: Taqwim;

	constructor() {
		// Create a Taqwim instance.
	}

	static getInstance(): Taqwim {
		// Create a Taqwim instance.
		const taqwim = new Taqwim();
		TaqwimSingleton.instance = TaqwimSingleton.instance || taqwim;
		return TaqwimSingleton.instance;
	}
}

export const taqwim = TaqwimSingleton.getInstance();