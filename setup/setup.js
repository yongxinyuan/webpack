"use strict";

const fs = require("fs");
const path = require("path");
const root = process.cwd();
const node_modulesFolder = path.resolve(root, "node_modules");
const webpackDependencyFolder = path.resolve(root, "node_modules/webpack");

function setup() {
	return Promise.all([
		checkSymlinkExistsAsync().then(async hasSymlink => {
			// 检查如果node_modules/webpack不是链接，如下处理
			if (!hasSymlink) {
				// 确保安装了yarn
				await ensureYarnInstalledAsync();
				// 通过yarn安装依赖，创建webpack链接
				await runSetupSymlinkAsync();

				// 再次检查运行环境，异常直接抛出
				if (!(await checkSymlinkExistsAsync())) {
					throw new Error("windows symlink was not successfully created");
				}
			}
		})
	])
		// 结束进程
		.then(() => {
			process.exitCode = 0;
		})
		// 打印错误，结束进程
		.catch(e => {
			console.error(e);
			process.exitCode = 1;
		});
}

/**
 * 通过yarn安装依赖
 * 链接webpack到自己
 */
async function runSetupSymlinkAsync() {
	await exec("yarn", ["install"], "Install dependencies");
	await exec("yarn", ["link"], "Create webpack symlink");
	await exec("yarn", ["link", "webpack"], "Link webpack into itself");
}

/**
 * 检查node_modules/webpack是否是链接
 */
function checkSymlinkExistsAsync() {
	return new Promise((resolve, reject) => {
		// 检查根目录node_modules是否存在
		// 检查根目录node_modules/webpack是否存在
		// 检测node_modules/webpack是否是链接
		if (
			fs.existsSync(node_modulesFolder) &&
			fs.existsSync(webpackDependencyFolder) &&
			fs.lstatSync(webpackDependencyFolder).isSymbolicLink()
		) {
			resolve(true);
		} else {
			resolve(false);
		}
	});
}

/**
 * 确保安装了yarn
 */
async function ensureYarnInstalledAsync() {
	const semverPattern =
		/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;
	let hasYarn = false;
	try {
		// 尝试执行 `yarn -v` 获取输出
		const stdout = await execGetOutput("yarn", ["-v"], "Check yarn version");

		// 匹配是否正常
		hasYarn = semverPattern.test(stdout);
	} catch (e) {
		// 捕获异常视为未安装
		hasYarn = false;
	}

	// 如果检测没有安装yarn，执行安装程序
	if (!hasYarn) await installYarnAsync();
}

/**
 * 安装yarn
 */
function installYarnAsync() {
	return exec("npm", ["install", "-g", "yarn"], "Install yarn");
}

/**
 * 执行命令，忽略输出
 */
function exec(command, args, description) {
	console.log(`Setup: ${description}`);
	return new Promise((resolve, reject) => {
		let cp = require("child_process").spawn(command, args, {
			cwd: root,
			stdio: "inherit",
			shell: true
		});
		cp.on("error", error => {
			reject(new Error(`${description} failed with ${error}`));
		});
		cp.on("exit", exitCode => {
			if (exitCode) {
				reject(`${description} failed with exit code ${exitCode}`);
			} else {
				resolve();
			}
		});
	});
}

/**
 * 执行命令获取输出
 */
function execGetOutput(command, args, description) {
	// 打印命令描述
	console.log(`Setup: ${description}`);
	return new Promise((resolve, reject) => {
		// 子进程执行命令
		let cp = require("child_process").spawn(command, args, {
			cwd: root,
			stdio: [process.stdin, "pipe", process.stderr],
			shell: true
		});
		cp.on("error", error => {
			reject(new Error(`${description} failed with ${error}`));
		});
		cp.on("exit", exitCode => {
			if (exitCode) {
				reject(`${description} failed with exit code ${exitCode}`);
			} else {
				resolve(Buffer.concat(buffers).toString("utf-8").trim());
			}
		});
		const buffers = [];
		cp.stdout.on("data", data => buffers.push(data));
	});
}

setup();
