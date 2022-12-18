const colors = require('colors/safe');
const shelljs = require('shelljs');
const path = require('path');

const { fetchTargets, fetchTopologicalSorting } = require('./utils');

function publishNpm(target) {
	try {
		if (target.private === true) {
			console.log(
				`${colors.red(target.name)} is ${colors.cyan(
					'private'
				)}, ${colors.green('skip')}`
			);
		} else {
			doPublishNpm(target);
		}
	} catch (err) {
		console.log(
			`failed to puslish ${colors.red(target.name)}@${colors.brightYellow(
				target.version
			)}, error: ${colors.blue(err.message)}`
		);
	}
}

function doPublishNpm(target) {
	console.log(
		`build ${colors.red(target.name)}@${colors.yellow(target.version)}`
	);
	const packagePath = path.join(__dirname, '..', 'dist', target.folderName);
	shelljs.cd(packagePath).exec('npm publish');
	console.log(
		`puslish ${colors.red(target.name)}@${colors.brightYellow(
			target.version
		)} ${colors.green('successfully')}`
	);
}

async function run() {
	const targets = fetchTargets();
	const nodes = fetchTopologicalSorting(targets);
	const queue = [];
	nodes.forEach((v, k) => {
		if (v.indegree === 0) {
			queue.push(k);
		}
	});
	while (queue.length > 0) {
		const name = queue.shift();
		const node = nodes.get(name);
		if (node && node.target) {
			publishNpm(node.target);
			node.afters.forEach(a => {
				nodes.get(a.name).indegree--;
				if (nodes.get(a.name).indegree === 0) {
					queue.push(a.name);
				}
			});
		}
	}
	shelljs.exit(0);
}

if (require.main === module) {
	run();
}