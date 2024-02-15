/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Storage } from '@google-cloud/storage';



export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
	//
	// Example binding to a D1 Database. Learn more at https://developers.cloudflare.com/workers/platform/bindings/#d1-database-bindings
	// DB: D1Database
}

async function downloadAndUploadFile(originalUrl: string, gcpStorage: Storage, bucketName: string, destinationFilename: string) {
	const bucket = gcpStorage.bucket(bucketName);
  const file = bucket.file(destinationFilename);

	const response = await fetch(originalUrl)
	if (!response.ok || response.body === null) {
		throw new Error(`unexpected response ${response.statusText}`);
	};
	for await (const chunck of response.body) {
		file.createWriteStream().write(chunck);
	};

	return;
}

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
  async fetch(request, env, ctx) {
		const gcpCredentials = JSON.parse(env.GCP_SERVICEKEY);
		const storage = new Storage({
			credentials: gcpCredentials,
			projectId: 'speech-to-text', // プロジェクトID
		});
		const bucketName = 'taketoncheir-podcast';
		const fileUrl = 'https://dts.podtrac.com/redirect.mp3/media.blubrry.com/thismorning/dealdl.noxsolutions.com/gordondeal/mp3/gd_20240213.mp3';
		downloadAndUploadFile(fileUrl, storage, bucketName, 'test.mp3');
    return new Response("hello");
  }
	// async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
	// 	// A Cron Trigger can make requests to other endpoints on the Internet,
	// 	// publish to a Queue, query a D1 Database, and much more.
	// 	//
	// 	// We'll keep it simple and make an API call to a Cloudflare API:
	// 	let resp = await fetch('https://api.cloudflare.com/client/v4/ips');
	// 	let wasSuccessful = resp.ok ? 'success' : 'fail';

	// 	// You could store this result in KV, write to a D1 Database, or publish to a Queue.
	// 	// In this template, we'll just log the result:
	// 	console.log(`trigger fired at ${event.cron}: ${wasSuccessful}`);
	// },
};
