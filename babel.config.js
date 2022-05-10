module.exports = (api) => {
    api.cache(true);
    return {
        presets: [
            "@babel/preset-react",
            [
                "@babel/preset-env",
                {
                    targets: {
                        node: "current",
                    },
                },
            ],
        ],
    };
};
