const esbuild = require('esbuild')


async function runBuild () {

  const ctx = await esbuild.context({
    absWorkingDir: process.cwd(),
  })

  await ctx.serve(
    {
      port: 8000,
      // 静态资源目录
      servedir: '../../'
    },
  ).then((server) => {
    console.log("HTTP Server starts at port", server.port);
  });
}

runBuild();