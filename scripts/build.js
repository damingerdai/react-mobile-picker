const colors = require("colors/safe");
const fs = require("fs/promises");
const fsEx = require("fs-extra");
const path = require("path");
const sh = require("shelljs");

const { fetchTargets, fetchTopologicalSorting } = require("./utils");

// ShellJS should exit if a command fails.
sh.set("-e");

async function buildTarget(target) {
  if (target.private === true) {
    console.log(
      `${colors.blue(target.name)} ${colors.cyan("skip")} for private module`
    );
  } else {
    const { code } = sh.exec(
      `yarn workspace ${target.name} run  build`
    );

    if (code !== 0) {
      throw new Error(`fail to compile the ${target.name}`);
    }
    console.log(`${colors.blue(target.name)} ${colors.green("success")} 🚀`);
  }
}

async function run() {
  const packageNames = ["dev-app", "react-mobile-picker"];
  await Promise.all(
    packageNames
      .map((packageName) =>
        path.join(__dirname, "..", "packages", packageName, "dist")
      )
      .map((p) => fs.rm(p, { force: true, recursive: true }))
  );

  const targets = await fetchTargets();
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
      try {
        await buildTarget(node.target);
      } catch (e) {
        console.error(e.message);
        sh.exit(2);
      }

      node.afters.forEach((a) => {
        nodes.get(a.name).indegree--;
        if (nodes.get(a.name).indegree === 0) {
          queue.push(a.name);
        }
      });
    }
  }
  sh.exit(0);
}

if (require.main === module) {
  run();
}
