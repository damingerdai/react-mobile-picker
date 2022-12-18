const path = require('path');
const fs = require('fs-extra');

function fetchTargets() {
	return fs
		.readdirSync('packages')
		.filter(f => fs.statSync(`packages/${f}`).isDirectory())
		.map(f => {
			const pkg = require(path.join(
				__dirname,
				'..',
				'packages',
				f,
				'package.json'
			));
			pkg.folderName = f;
			pkg.location = path.join(__dirname, '..', 'packages', f);

			return pkg;
		});
}

function fetchTopologicalSorting(targets) {
	const nodes = new Map();
	targets.forEach(target => {
		const { name, dependencies } = target;
		if (!nodes.has(name)) {
			nodes.set(name, { target, indegree: 0, afters: [] });
		}
		const keys = Object.keys(dependencies).filter(dependency =>
            targets.map(t => t.name).includes(dependency)
		);
		keys.forEach(key => {
			if (!nodes.has(key)) {
				nodes.set(key, {
					target: targets.find(t => t.name === key),
					indegree: 0,
					afters: []
				});
			}
			nodes.get(name).indegree = nodes.get(key).indegree + 1;
			nodes.get(key).afters.push(target);
		});
	});
	return nodes;
}

module.exports = {
	fetchTargets,
	fetchTopologicalSorting
};