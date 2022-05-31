#!/usr/bin/env node
import esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import { lessLoader } from 'esbuild-plugin-less';

await esbuild.build({
    logLevel: "info",
    entryPoints: ["src/index.html"],
    outdir: "bin",
    bundle: true,
    //sourcemap: "inline",
    //banner: {
    //    js: banner
    //},
    //minify: true,
    keepNames: true,
    target: "es2020",
    //watch: true,
    format: "iife",
    charset: "utf8",
    assetNames: 'assets/[name]-[hash]',
    chunkNames: '[ext]/[name]-[hash]',
    legalComments: "none",
    plugins: [
        htmlPlugin(),
        lessLoader(),
    ],
    loader: {
        '.png': 'file',
        '.svg': 'file',
        '.json': 'json'
    }
});
