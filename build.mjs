#!/usr/bin/env node
import esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import { lessLoader } from 'esbuild-plugin-less';
import { copy } from 'esbuild-plugin-copy';

function hasArg( a ) {
	return process.argv.indexOf( a )>=0;
}

const release = hasArg( 'release' );

await esbuild.build({
    logLevel: "info",
    entryPoints: ["src/index.html"],
    outdir: "bin",
    bundle: true,
  	sourcemap: release ? false : false, //"inline",
    minify: release ? true : false,
    keepNames: true,
    target: "es2020",
    watch: release ? false : true,
	charset: "utf8",
    assetNames: 'assets/[name]',
    chunkNames: '[ext]/[name]',
    legalComments: "none",
	platform: "node",
	format: 'esm',
	plugins: [
        htmlPlugin(),
		lessLoader( {
			rootpath: ".",
		}),
		copy( {
			assets: {
				from: ['src/assets/**/*'],
				to: ['.' ],
				keepStructure: true
			  },
		})
    ],
	external: [ "electron" ],
    loader: {
        '.png': 'file',
        '.svg': 'file',
        '.json': 'json',
		'.ttf': 'dataurl',
    }
});