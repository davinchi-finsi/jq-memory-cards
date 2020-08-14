const typescript = require('rollup-plugin-typescript2');
const terser = require('rollup-plugin-terser').terser;
const license = require('rollup-plugin-license');
const camelCase = require("lodash.camelCase");
const scss = require("rollup-plugin-scss");
const pkg = require("./package.json");
const banner=`@license <%= pkg.name %> v<%= pkg.version %>
(c) <%= moment().format('YYYY') %> Finsi, Inc. Based on @Jonathan Tarnate https://codepen.io/jstarnate

`,
    name = "jquery.memory-game",
    fileName=name,
    packageName =camelCase(pkg.name),
    src = "./src/index.ts",
    srcUI ="./src/jquery-ui-deps.ts",
    globals= {
        jquery: '$'
    },
    external=(id)=>id.indexOf("node_modules")!=-1;


module.exports = [
    {
        input: "./src/styles.ts",
        output: [
            {
                file: `dist/${fileName}.js`,
                name:packageName,
                format: 'umd',
                globals:globals
            }
        ],
        plugins: [
            scss() // will output compiled styles to output.css
        ]
    },
    {
        input: "./src/styles-structure.ts",
        output: [
            {
                file: `dist/${fileName}.structure.js`,
                name:packageName,
                format: 'umd',
                globals:globals
            }
        ],
        plugins: [
            scss() // will output compiled styles to output.css
        ]
    },
    {
        input: "./src/styles-theme.ts",
        output: [
            {
                file: `dist/${fileName}.theme.js`,
                name:packageName,
                format: 'umd',
                globals:globals
            }
        ],
        plugins: [
            scss() // will output compiled styles to output.css
        ]
    },
    {
        input: src,
        output: {
            file: `dist/${fileName}.js`,
            name:packageName,
            format: 'umd',
            globals:globals
        },
        plugins: [
            typescript({
                tsconfigOverride: {
                    "compilerOptions": {
                        "target": "es5"
                    }
                }
            }),
            license({
                banner:banner
            })
        ],
        external:external
    },
    //min
    {
        input: src,
        output: {
            file: `dist/${fileName}.min.js`,
            name:packageName,
            format: 'umd',
            globals:globals
        },
        plugins: [
            typescript({
                tsconfigOverride: {
                    "compilerOptions": {
                        "target": "es5"
                    }
                }
            }),
            terser(),
            license({
                banner:banner
            })
        ],
        external:external
    },
    //esm2015
    {
        input: src,
        output: {
            file: `esm2015/${fileName}.js`,
            name:packageName,
            format: 'es'
        },
        plugins: [
            typescript({
            }),
            license({
                banner:banner
            })
        ],
        external:external
    },
    //esm2015 min
    {
        input: src,
        output: {
            file: `esm2015/${fileName}.min.js`,
            name:packageName,
            format: 'es'
        },
        plugins: [
            typescript({
            }),
            terser(),
            license({
                banner:banner
            })
        ],
        external:external
    }
];
