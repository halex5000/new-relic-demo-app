import {init} from 'launchdarkly-node-server-sdk';
import * as newRelic from 'newrelic';

const launchDarklySdkKey = process.env.LAUNCHDARKLY_SDK_KEY ?? '';
const featureFlagKey = process.env.LAUNCHDARKLY_FLAG_KEY ?? '';

const launchDarklyClient = init(launchDarklySdkKey, {});

const getRandomInteger = (minimum: number, maximum: number) => {
	minimum = Math.ceil(minimum);
	maximum = Math.floor(maximum);
	return Math.floor((Math.random() * (maximum - minimum)) + minimum);
};

type Event = {
	errorRateMax: number;
	errorRateMin: number;
	errorRateBump: number;
	successRateMax: number;
	successRateMin: number;
	waitSeconds: number;
	iterations: number;
};

const handler = async (event: Event) => {
	const {
		errorRateMax,
		errorRateMin,
		errorRateBump,
		successRateMax,
		successRateMin,
		waitSeconds,
		iterations,
	} = event;
	const initialized = await launchDarklyClient.waitForInitialization();
	if (initialized) {
		console.log('LaunchDarkly initialized');

		// NewRelic.recordCustomEvent('SomethingHappened', {
		//   errors: 50
		// });

		// newRelic.addCustomAttributes({
		//   "someAttribute": "someValue"
		// });

		const user = {
			key: 'munnawar-unique-user-key',
			name: 'Munnawar',
		};

		const flagValue = await launchDarklyClient.variation(featureFlagKey, user, false) as boolean;

		const goodMetric = getRandomInteger(successRateMin, successRateMax);
		let badMetric = 0;

		badMetric = flagValue ? getRandomInteger(errorRateMin + errorRateBump, errorRateMax + errorRateBump) : getRandomInteger(errorRateMin, errorRateMax);

		newRelic.recordMetric('failedCalls', badMetric);
		newRelic.recordMetric('successfulCalls', goodMetric);

		newRelic.addCustomAttribute('apiErrors', badMetric);
		newRelic.addCustomAttribute('apiSuccess', goodMetric);
	}
};

export {handler};
