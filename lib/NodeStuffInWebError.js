/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Ivan Kopeykin @vankop
*/

const WebpackError = require("./WebpackError");
const makeSerializable = require("./util/makeSerializable");

/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */

class NodeStuffInWebError extends WebpackError {
	/**
	 * @param {DependencyLocation} loc loc
	 * @param {string} expression expression
	 * @param {string} shouldEvaluationTo result of evaluation
	 */
	constructor(loc, expression, shouldEvaluationTo) {
		super(
			`${JSON.stringify(
				expression
			)} has been used, it will evaluate to ${shouldEvaluationTo} in next major version`
		);

		this.name = "NodeStuffInWebError";
		this.loc = loc;
	}
}

makeSerializable(NodeStuffInWebError, "webpack/lib/NodeStuffInWebError");

module.exports = NodeStuffInWebError;
