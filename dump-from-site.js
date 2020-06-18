/*
 * @description: Goto https://www.unknown.nu/flags/ and execute the following scripts
 */
(function() {
	const table = document.getElementsByTagName('table')[0];

	const trs = table.getElementsByTagName('tr');

	let langTable = {};

	for(let i = 1; i < trs.length; i++) {
		let tr = trs[i];
		let tds = tr.getElementsByTagName('td');
		let code = tds[0].innerText;
		let name = tds[1].innerText;
		let nativeName = tds[2].innerText;
		let thumbnail = tds[3].getElementsByTagName('img')[0].src;
		console.log(code, name, nativeName, thumbnail);
		langTable[code] = {
			code,
			names: name.split(',').map(name => name.trim()),
			nativeNames: nativeName.split(',').map(name => name.trim()),
			thumbnail,
		};
	}

	console.log(JSON.stringify(langTable, null, '  '));

})();