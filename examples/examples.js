"use strict";

const fs = require("fs");
const path = require("path");

/**
 * 在文件夹中查找
 * 
 * @param folder 文件夹
 * @param depth 查找深度
 */
function findInFolder(folder, depth) {
	// 如果文件夹中存在 `template.md` 文件
	// 返回数组
	if (fs.existsSync(path.join(folder, "template.md"))) {
		return [folder];
	}
	// 如果查找深度>0
	else if (depth > 0) {
		// 读取文件夹中的文件
		const files = fs.readdirSync(folder);
		// 收集结果
		const results = [];

		// 便利文件
		for (const file of files) {
			// 文件路径
			const innerPath = path.join(folder, file);

			// 是文件夹的话，递归，深度-1
			// 结果展开到results里
			if (fs.statSync(innerPath).isDirectory()) {
				const innerResult = findInFolder(innerPath, depth - 1);
				for (const item of innerResult)
					results.push(item);
			}
		}
		return results;
	}
	// 什么都不是，返回空数组
	else {
		return [];
	}
}

// 导出 `/examples/*` 中深度为2以内的所有文件
module.exports = findInFolder(__dirname, 2).sort();
