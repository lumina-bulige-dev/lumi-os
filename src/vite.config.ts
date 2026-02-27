export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'src/main.ts',
        hidden: 'src/internal/__lumi-core.ts' // ビルドには含めるが、公開しない
      }
    }
  }
});
