import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
    external: [],
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
            name: 'reactivedom.api',
            dir: 'dist/umd',
            format: 'umd',
            sourcemap: true,
        },
        {
            name: 'reactivedom.api',
            dir: 'dist/umd.min',
            format: 'umd',
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
