import path from 'path';
import babel from '@rollup/plugin-babel';
import styles from 'rollup-plugin-styles';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import less from 'rollup-plugin-less';
import pkg from './package.json';

const babelOptions = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  babelHelpers: 'runtime',
  plugins: ['@babel/plugin-transform-runtime'],
};

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: false,
        name: 'reactMobilePicker',
        exports: 'default',
      },
    ],
    plugins: [
      external(),
      resolve(),
      babel(babelOptions),
      commonjs(),
      styles(),
      // less({
      //   output: path.join(__dirname, 'dist', 'index.css'),
      // }),
    ],
    external: ['react', 'react-dom', 'prop-types'],
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: false,
        exports: 'default',
      },
    ],
    plugins: [
      external(),
      resolve(),
      babel(babelOptions),
      commonjs(),
      styles(),
      // less({
      //   output: path.join(__dirname, 'dist', 'index.css'),
      // }),
    ],
    external: ['react', 'react-dom', 'prop-types'],
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.min.js',
        format: 'umd',
        sourcemap: true,
        name: 'reactMobilePicker',
        exports: 'default',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'prop-types': 'PropTypes',
        },
      },
    ],
    plugins: [
      external(),
      resolve(),
      babel(babelOptions),
      commonjs(),
      less({
        output: path.join(__dirname, 'dist', 'index.css'),
      }),
      terser(),
    ],
    external: ['react', 'react-dom'],
  },
];
