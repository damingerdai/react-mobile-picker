const args = require("minimist")(process.argv.slice(2));
const colors = require("colors/safe");
const semver = require("semver");
const { exec } = require("shelljs");
const currentVersion = require("../package.json").version;
const { prompt } = require("enquirer");
const path = require("path");
const fs = require("fs");

const { getGitRemoteRepos } = require("./git");
const { fetchTargets } = require("./utils");

const preId =
  args.preId ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0]);

const isDryRun = !!args.dry;

const versionIncrements = [
  "patch",
  "minor",
  "major",
  ...(preId ? ["prepatch", "preminor", "premajor", "prerelease"] : []),
];

const inc = (i) => semver.inc(currentVersion, i, preId);

const realRun = (command) => exec(command);
const dryRun = (command) => console.log(colors.blue(`[dry run]: ${command}`));

const run = isDryRun ? dryRun : realRun;

const step = (msg) => console.log(colors.cyan(msg));

const fetchTargetVersion = async () => {
  let targetVersion = args._[0];
  if (!targetVersion) {
    const { release } = await prompt({
      type: "select",
      name: "release",
      message: "Select release version",
      choices: versionIncrements
        .map((i) => `${i} (${inc(i)})`)
        .concat("custom"),
    });

    if (release === "custom") {
      targetVersion = (
        await prompt({
          type: "input",
          name: "version",
          message: "Input custom version",
          initial: currentVersion,
        })
      ).version;
    } else {
      targetVersion = release.match(/\((.*)\)/)[1];
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  return targetVersion;
};

const confirmUpdateTargetVersion = async (targetVersion, targets) => {
  targets.forEach((target) => {
    console.log(
      `${colors.blue(target.name)}@${colors.cyan(
        target.version
      )} => ${colors.red("v" + targetVersion)}`
    );
  });
  const { yes } = await prompt({
    type: "confirm",
    name: "yes",
    message: `Releasing v${targetVersion}. Confirm?`,
  });

  return yes === true;
};

const updatePackageVersion = (pkgPath, version) => {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.version = version;
  if (isDryRun) {
    console.log(`${colors.bgCyan(pkg.name + "@" + pkg.version)}`);
  } else {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
};

const updatePackageDeps = (pkgPath, version, targets) => {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const { dependencies } = pkg;
  Object.keys(dependencies)
    .filter((dependency) => targets.map(t => t.name).includes(dependency))
    .forEach((dependency) => {
      dependencies[dependency] = version;
    });
  if (isDryRun) {
    console.log(`${colors.bgCyan(pkg.name + "@" + pkg.version)}`);
  } else {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
};

const updateRootPackage = (targetVersion) => {
  // root
  updatePackageVersion(
    path.resolve(__dirname, "..", "package.json"),
    targetVersion
  );
};

const updatePackages = (targetVersion, targets) => {
  // update root package
  updateRootPackage(targetVersion);
  targets.forEach((target) => {
    target.version = targetVersion;
    updatePackageVersion(
      path.resolve(target.location, "package.json"),
      targetVersion
    );
    updatePackageDeps(
      path.resolve(target.location, "package.json"),
      targetVersion,
      targets
    );
  });
};

function publishGithub(targetVersion) {
  const repos = getGitRemoteRepos();
  repos.forEach((repo) => {
    if (repo.type === "push") {
      run(`git push ${repo.name} develop`);
      run(`git push ${repo.name} v${targetVersion}`);
    }
  });
}

async function main() {
  const targetVersion = await fetchTargetVersion();
  const targets = fetchTargets();
  // const nodes = fetchTopologicalSorting(targets);
  if (!(await confirmUpdateTargetVersion(targetVersion, targets))) {
    return;
  }

  step("\n run build");
  run("node scripts/build.js");

  step("\n update version");
  updatePackages(targetVersion, targets);

  step("\n gentreate changelog");
  run("yarn changelog");

  step("\n commit");
  run("git add package.json");
  targets.forEach((target) =>
    run(`git add ${path.resolve(target.location, "package.json")}`)
  );
  run("git add CHANGELOG.md");
  run(`git commit -m "chore(release): v${targetVersion}"`);

  step("\n tag");
  run(`git tag "v${targetVersion}"`);

  step("\n publish github");
  publishGithub(targetVersion);
}

if (require.main === module) {
  main();
}
