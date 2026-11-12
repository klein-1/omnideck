import fs from 'fs';
import path from 'path';

const nativePath = path.resolve('node_modules/rollup/dist/native.js');
if (fs.existsSync(nativePath)) {
  let content = fs.readFileSync(nativePath, 'utf8');
  if (!content.includes("@rollup/wasm-node/dist/native.js")) {
    content = content.replace(
      /if \(error instanceof Error && error\.code === 'ERR_DLOPEN_FAILED'\) \{[\s\S]*?throw error;[\s\S]*?\}/,
      `if (error instanceof Error && error.code === 'ERR_DLOPEN_FAILED') {
			try {
				return require('@rollup/wasm-node/dist/native.js');
			} catch (wasmErr) {
				throw error;
			}
		}`
    );
    fs.writeFileSync(nativePath, content, 'utf8');
    console.log('[PATCH] Applied @rollup/wasm-node fallback to rollup/dist/native.js');
  }
}

