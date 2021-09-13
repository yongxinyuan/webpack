it("global", () => {
    expect(typeof global).toBe("object");
		// global as local identifier should not warn
		const global = 1;
});

it("__filename", () => {
	expect(typeof __filename).toBe("string");
});

it("__dirname", () => {
	expect(typeof __dirname).toBe("string");
});
