/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

/** @typedef {import("../declarations/WebpackOptions").EntryDescriptionNormalized} EntryDescription */
/** @typedef {import("../declarations/WebpackOptions").EntryNormalized} Entry */
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Entrypoint").EntryOptions} EntryOptions */

class EntryOptionPlugin {
	/**
	 * register `Compiler.hooks.entryOption` hook.
	 * run `EntryOptionPlugin.applyEntryOption` static function.
	 * 
	 * @param {Compiler} compiler the compiler instance one is tapping into
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
			EntryOptionPlugin.applyEntryOption(compiler, context, entry);
			return true;
		});
	}

	/**
	 * @param {Compiler} compiler the compiler
	 * @param {string} context context directory
	 * @param {Entry} entry request
	 * @returns {void}
	 */
	static applyEntryOption(compiler, context, entry) {
		// 标准函数入口，配置成动态入口
		if (typeof entry === "function") {
			const DynamicEntryPlugin = require("./DynamicEntryPlugin");
			new DynamicEntryPlugin(context, entry).apply(compiler);
		}
		// 标准化配置对象入口，全部配置成静态入口
		else {
			const EntryPlugin = require("./EntryPlugin");
			// 遍历 entry 对象，将 description 转化成 options
			for (const name of Object.keys(entry)) {
				// 入口的描述对象
				const desc = entry[name];
				// 标准描述对象 => 入口配置
				const options = EntryOptionPlugin.entryDescriptionToOptions(
					compiler,
					name,
					desc
				);
				// 标准描述对象的所有 import 都作为入口配置到编译器
				// 起到分组的效果，同一个入口的import共用同一个入口配置
				for (const entry of desc.import) {
					// 每个入口创建
					new EntryPlugin(context, entry, options).apply(compiler);
				}
			}
		}
	}

	/**
	 * 标准描述对象 => 入口配置
	 * 
	 * @param {Compiler} compiler the compiler
	 * @param {string} name entry name
	 * @param {EntryDescription} desc entry description
	 * @returns {EntryOptions} options for the entry
	 */
	static entryDescriptionToOptions(compiler, name, desc) {
		/** @type {EntryOptions} */
		const options = {
			name,
			filename: desc.filename,
			runtime: desc.runtime,
			layer: desc.layer,
			dependOn: desc.dependOn,
			publicPath: desc.publicPath,
			chunkLoading: desc.chunkLoading,
			wasmLoading: desc.wasmLoading,
			library: desc.library
		};
		if (desc.layer !== undefined && !compiler.options.experiments.layers) {
			throw new Error(
				"'entryOptions.layer' is only allowed when 'experiments.layers' is enabled"
			);
		}
		if (desc.chunkLoading) {
			const EnableChunkLoadingPlugin = require("./javascript/EnableChunkLoadingPlugin");
			EnableChunkLoadingPlugin.checkEnabled(compiler, desc.chunkLoading);
		}
		if (desc.wasmLoading) {
			const EnableWasmLoadingPlugin = require("./wasm/EnableWasmLoadingPlugin");
			EnableWasmLoadingPlugin.checkEnabled(compiler, desc.wasmLoading);
		}
		if (desc.library) {
			const EnableLibraryPlugin = require("./library/EnableLibraryPlugin");
			EnableLibraryPlugin.checkEnabled(compiler, desc.library.type);
		}
		return options;
	}
}

module.exports = EntryOptionPlugin;
