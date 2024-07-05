import ts from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'

import pkg from './package.json' assert { type: 'json' }

const banner =
    '/*!' +
    '\n * snowflake-worker v' +
    pkg.version +
    '\n * ' +
    pkg.description +
    '\n * Copyright (c)' +
    ' jl15988(https://github.com/jl15988).' +
    '\n * This source code is licensed under the MIT license(https://github.com/jl15988/api-render-vue/blob/master/LICENSE).' +
    '\n */'
const sourcemap = false

function createEntry(options) {
    const config = {
        input: 'src/index.ts',
        external: ['vue'],
        output: {
            name: 'SnowflakeWorker',
            file: options.file,
            format: options.format,
            exports: 'default',
            globals: {
                vue: 'Vue'
            },
            banner,
        },
        plugins: [
            ts({
                check: options.format === 'es',
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: options.format === 'es',
                    },
                    exclude: ['example'],
                }
            }),
        ],
    }

    if (Array.isArray(options.plugins)) {
        config.plugins.push(...options.plugins)
    }

    return config
}

const browserPlugins = [
    terser({
        format: {
            comments: function (node, comment) {
                const { value, type } = comment
                return type === 'comment2' && /^!/.test(value)
            },
        },
        compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            drop_console: true,
        },
    }),
]

export default [
    createEntry({ format: 'cjs', file: pkg.main }),
    createEntry({ format: 'es', file: pkg.module }),
    createEntry({ format: 'umd', file: pkg.browser, }),
    createEntry({ format: 'umd', file: pkg.unpkg, plugins: browserPlugins }),
]
