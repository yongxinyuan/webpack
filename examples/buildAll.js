"use strict";

const cp = require("child_process");
const examples = require("./examples");

// 追加名称包含 `persistent-caching` 的文件
// 转换成命令，进入文件夹，执行build文件
// 得到需要执行的命令数组
const commands = examples
	.concat(
		examples.filter(dirname => dirname.includes("persistent-caching"))
	)
	.map(function (dirname) {
		return "cd " + dirname + " && node build.js";
	});

// 统计失败格式
let failed = 0;
// 记录执行索引
let i = 0;

// 遍历
for (const cmd of commands) {
	// 打印索引，命令的长度，命令
	console.log(`[${++i}/${commands.length}] ${cmd}`);

	// 尝试同步执行命令
	try {
		cp.execSync(cmd, { encoding: "utf-8" });
	} catch (e) {
		failed++;
		console.log(e);
	}
}
console.log("done");

// 如果有失败的，打印失败的
if (failed > 0)
	console.log(`${failed} failed`);
