import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      // 将所有类型合并为单个 index.d.ts
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'LeaferXSvg',
      fileName: 'leafer-x-svg',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // leafer-ui 作为 peerDependency 不打入产物，由使用方提供
      external: ['leafer-ui'],
      output: {
        exports: 'named',
        globals: {
          'leafer-ui': 'LeaferUI',
        },
      },
    },
  },
});
