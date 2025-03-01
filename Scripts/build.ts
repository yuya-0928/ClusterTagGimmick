import { readdir } from 'node:fs/promises';

// Cleanup
const oldFiles = await readdir('../Assets/Scripts');
for (const file of oldFiles) {
  if (file.endsWith('.js')) {
    await Bun.file(`../Assets/Scripts/${file}`).delete();
  }
}

// Build
const files = await readdir('./scripts');
const entrypoints = files.map((file) => `./scripts/${file}`);
await Promise.all(
  entrypoints.map((entrypoint) =>
    Bun.build({
      entrypoints: [entrypoint],
      outdir: '../Assets/Scripts',
    }),
  ),
);
