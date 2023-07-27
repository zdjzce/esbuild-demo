// http-import-plugin.js
const https = require("https");
const http = require("http");
module.exports = () => ({
  name: "esbuild:http",
  setup (build) {

    // 1. 拦截 CDN 请求
    build.onResolve({ filter: /^https?:\/\// }, (args) => {
      return {
        path: args.path,
        namespace: 'http-url'
      }
    })

    // 拦截间接依赖的路径，并重写路径
    // tip: 间接依赖同样会被自动带上 `http-url`的 namespace
    build.onResolve({ filter: /.*/, namespace: "http-url" }, (args) => {
      console.log('args========= filter:', args)
      // 重写路径
      return {
        path: new URL(args.path, args.importer).toString(),
        namespace: "http-url",
      }
    });


    // 2. 通过 fetch 请求加载 CDN 资源
    build.onLoad({ filter: /.*/, namespace: "http-url" }, async (args) => {
      console.log('args:', args)

      const contents = await fetchUrl(args.path)


      return { contents }
    })


  },
});


async function fetchUrl (url) {

  const data = await new Promise((resolve, reject) => {
    console.log('url=======:', url)
    const req = url.startsWith("https") ? https : http

    req.get(url, (res) => {
      if ([301, 302, 307].includes(res.statusCode)) {
        // 重定向
        fetch(new URL(res.headers.location, url).toString());
        req.abort();
      } else if (res.statusCode === 200) {
        // 响应成功
        let chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      } else {
        reject(
          new Error(`GET ${url} failed: status ${res.statusCode}`)
        );
      }

    }).on("error", reject)

  })

  console.log('data:', data)
  return data


}