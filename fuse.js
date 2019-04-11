const { FuseBox, WebIndexPlugin } = require("fuse-box");
const fuse = FuseBox.init({
  target: "browser@es5",
  homeDir: "src",
  output: "dist/$name.js",
  useTypescriptCompiler: true,
  plugins: [
    WebIndexPlugin({
      template : "index.html"
    })
  ]
});
fuse.dev(); // launch http server
fuse
  .bundle("bundle")
  .instructions(" > src/index.js")
  .hmr()
  .watch();
fuse.run();
