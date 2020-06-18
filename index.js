const fs = require('fs');
const path = require('path');
const https = require('https');

function exists(filePath) {
	return new Promise((resolve) => {
		fs.exists(filePath, (isExists) => {
			resolve(isExists);
		});
	});
}
function mkdir(filePath) {
	return new Promise((resolve) => {
		fs.mkdir(filePath, resolve);
	});
}
function createAgent(baseURL) {
	return {
		get: (url) => {
			return new Promise((resolve, reject) => {
				https
				.get(url ? `${baseURL}/${url}` : baseURL, res => {
					const { statusCode } = res;
					const contentType = res.headers['content-type'];
					let error;
					let isJson = false;
					const startCh = statusCode.toString()[0];
					if (['2', '3'].indexOf(startCh) < 0) {
						error = new Error('Request Failed.\n' +
							`Status Code: ${statusCode}`);
					} else if (/^application\/json/.test(contentType)) {
						isJson = true;
					}
					if (error) {
						reject(error);
						res.resume();
						return;
					}

					res.setEncoding('utf8');
					let rawData = '';
					res.on('data', (chunk) => { rawData += chunk; });
					res.on('end', () => {
						if(error) return;
						if(isJson) {
							try {
								const parsedData = JSON.parse(rawData);
								resolve({
									data: parsedData,
									status: statusCode,
								});
							} catch (err) {
								reject(err);
							}
						} else {
							resolve({
								data: rawData,
								status: statusCode,
							});
						}
					});
				})
				.on('error', err => {
					reject(err);
				});
			});
		},
	};
}

function download(url, dest) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest);
		const request = https
		.get(url, function(response) {
			response.pipe(file);
			file.on('finish', function() {
				file.close(resolve);
			});
		})
		.on('error', function(err) {
			fs.unlink(dest);
			reject(err.message);
		});
	});
};

async function main() {
	const dataFolder = path.join(__dirname, 'data');
	if(!await exists(dataFolder)) {
		await mkdir(dataFolder);
	}
	const table = require(path.join(__dirname, 'lang-table.json'));

	const url = 'https://www.unknown.nu/';
	for(let i in table) {
		let data = table[i];
		await download(data.thumbnail, path.join(dataFolder, data.code+'.png'));
	}
	// const agent = createAgent(url);
	// try {
	// 	const { data, status } = await agent.get('flags/');
	// 	console.log(data);
	// } catch(err) {
	// 	console.log(err);
	// }
	
}

if(module.id === '.') {
	main();
}
