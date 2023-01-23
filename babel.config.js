module.exports = (api) => {
    api.cache(true);
    return {
        presets: [
            ["@babel/preset-env", {debug: true, }],
             "@babel/preset-react"
        ],
        plugins: [
            "@babel/plugin-transform-runtime",
          ]
    };
};
