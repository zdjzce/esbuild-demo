let envPlugin = {
  name: 'env',
  setup (build) {
    console.log('build====:', build)
    build.onResolve({ filter: /^env$/ }, args => {
      console.log('args:', args)
      return {
        path: args.path,
        namespace: 'env-ns',
      }
    })

    // 构建时将会把 env 替换成 process.env 对象
    build.onLoad({ filter: /.*/, namespace: 'env-ns' }, () => ({
      contents: JSON.stringify(process.env),
      loader: 'json',
    }))
  },
}

require('esbuild').build({
  entryPoints: ['src/index.jsx'],
  bundle: true,
  outfile: 'out.js',
  // 应用插件
  plugins: [envPlugin],
}).catch(() => process.exit(1))