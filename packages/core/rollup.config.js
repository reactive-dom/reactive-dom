import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
    external: ['rxjs', 'rxjs/operators', '@reactive-dom/api'],
    input: 'src/index.ts',
    output: [
        {
            dir: 'dist/cjs',
            format: 'cjs',
            plugins: [terser()],
        },
        {
            dir: 'dist/esm',
            format: 'esm',
            plugins: [terser()],
        },
        {
            name: 'reactivedom.core',
            dir: 'dist/umd',
            format: 'umd',
            globals: {
                rxjs: 'rxjs',
                'rxjs/operators': 'rxjs.operators',
                '@reactive-dom/api': 'reactivedom.api',
            },
            sourcemap: true,
        },
        {
            name: 'reactivedom.core',
            dir: 'dist/umd.min',
            format: 'umd',
            globals: {
                rxjs: 'rxjs',
                'rxjs/operators': 'rxjs.operators',
                '@reactive-dom/api': 'reactivedom.api',
            },
            sourcemap: true,
            plugins: [terser()],
        },
    ],
    plugins: [
        typescript({
            tsconfig: 'tsconfig.build.json',
            useTsconfigDeclarationDir: true,
        }),
    ],
};
