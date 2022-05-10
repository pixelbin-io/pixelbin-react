module.exports = () => {
    return {
        setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
        moduleNameMapper: {},
        modulePaths: ["<rootDir>/src/"],
        testEnvironment: "jsdom",
        transformIgnorePatterns: ["/node_modules/(?!@pixelbin/core)/.+\\.js$"],
    };
};
