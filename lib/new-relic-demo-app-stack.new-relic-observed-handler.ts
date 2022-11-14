import {init} from 'launchdarkly-node-server-sdk';

const launchDarklySdkKey = process.env.LAUNCHDARKLY_SDK_KEY ?? '';
const featureFlagKey = process.env.LAUNCHDARKLY_FLAG_KEY ?? '';

const launchDarklyClient = init(launchDarklySdkKey, {});

const getRandomInteger = (minimum: number, maximum: number) => {
	minimum = Math.ceil(minimum);
	maximum = Math.floor(maximum);
	return Math.floor((Math.random() * (maximum - minimum)) + minimum);
};

type Event = {
	queryStringParameters: {
		location: string;
	};
};

const failingLocations = new Set(['AWS_US_EAST_1']);

const handler = async (event: Event) => {
	console.log('logging incoming location from event', event.queryStringParameters.location);

	const initialized = await launchDarklyClient.waitForInitialization();

	const rando = getRandomInteger(0, 9);
	console.log(`random generated integer: ${rando}`);

	let statusCode = 200;

	const body = {
		message: 'success',
	};

	let threshold = 2;

	if (initialized) {
		console.log('LaunchDarkly initialized');

		const user = {
			key: 'munnawar-unique-user-key',
			name: 'Munnawar',
		};

		const flagValue = await launchDarklyClient.variation(featureFlagKey, user, false) as boolean;

		if (flagValue && failingLocations.has(event.queryStringParameters.location)) {
			threshold = 10;
		} else if (!flagValue) {
			threshold = 6;
		}

		if (rando < threshold) {
			statusCode = 500;
			body.message = 'something went wrong';
		}
	}

	return {
		statusCode,
		body: JSON.stringify(body),
	};
};

export {handler};
