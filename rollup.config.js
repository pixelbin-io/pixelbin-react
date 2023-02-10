import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';
import del from "rollup-plugin-delete";

const packageJson = require("./package.json");

export default [
    {
        external: ["@pixelbin/core", "async-retry", "axios", "react", /@babel\/runtime/],
        input: "src",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
            },
            {
                file: packageJson.module,
                format: "esm",
            },
        ],
        plugins: [
            nodeResolve(),
            babel({
                babelHelpers: "runtime"
            }),
        ],
    },
    {
        input: './dist/esm/components/index.d.ts',
        output: [{ file: 'dist/esm/bundle.d.ts', format: 'es' }],
        plugins: [
            dts.default(),
            del({ hook: "buildEnd", targets: ["./dist/esm/components", "./dist/esm/errors"] }),
        ],
    },
    {
        input: './dist/cjs/components/index.d.ts',
        output: [{ file: 'dist/cjs/bundle.d.ts', format: 'cjs' }],
        plugins: [
            dts.default(),
            del({ hook: "buildEnd", targets: ["./dist/cjs/components", "./dist/cjs/errors"] }),
        ],
    },
]