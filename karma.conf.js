// karma.conf.js
module.exports = (config) => {
    config.set({
        // this will keep the test output open on the karma browser result site
        client: {
            clearContext: false
        },
        basePath: "./",
        frameworks: ["jasmine", "esm"],
        files: [
            { pattern: "./src/heightgraph.js", type: 'module' },
            "./src/heightgraph.css",
            { pattern: 'spec/**/*.spec.js', type: 'module' }
        ],
        plugins: [
            // load plugin
            require.resolve('@open-wc/karma-esm'),
            // fallback: resolve any karma- plugins
            'karma-*',
        ],
        browsers: ["Chrome"],
        autoWatch: true,
        reporters: [
            "progress",
            "kjhtml"
        ],
        esm: {
            nodeResolve: true
        },
        logLevel: config.LOG_DEBUG, failOnEmptyTestSuite: true
    })
}
