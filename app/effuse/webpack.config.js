const HtmlWebpackPlugin = require("html-webpack-plugin");
const VirtualModulesPlugin = require("webpack-virtual-modules");
const CopyPlugin = require("copy-webpack-plugin");
const { favicons } = require("favicons");
const { Compilation, sources } = require("webpack");
const path = require("path");
const isProd = process.env.PROD === "true";

const config = {
  SSO_BASE: process.env.SSO_BASE,
};

module.exports = async () => {
  const response = await favicons(
    path.resolve(__dirname, "asset-src/app-icon.png"),
    {
      appName: "Effuse",
      appShortName: "Effuse",
      appDescription: "The privacy focused chat for gamers",
      developerName: "Ipheion",
      developerURL: "https://github.com/Iph3i0n",
      lang: "en-GB",
      background: "#f8f9f9",
      theme_color: "#f8f9f9",
      appleStatusBarStyle: "black-translucent",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "https://app.effuse.cloud/",
      version: "1.0",
    }
  );

  return {
    entry: {
      index: "./src/ui.ts",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  outDir: "dist/ui",
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.std$/,
          use: [
            {
              loader: "@ipheion/wholemeal/dist/std-loader",
              options: {
                framework: "native",
                typings: false,
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.pss$/,
          use: "@ipheion/wholemeal/dist/pss-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["css-loader"],
        },
        {
          test: /\.ttf$/,
          use: ["file-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".std", ".pss"],
    },
    output: {
      filename: "[contenthash].js",
      path: path.resolve(__dirname, "dist/ui"),
    },
    mode: process.env.PRODUCTION ? "production" : "development",
    externals: {
      react: "react",
      reactDOM: "react-dom",
    },
    parallelism: 1,
    plugins: [
      new HtmlWebpackPlugin({
        title: "Effuse",
        inject: false,
        meta: {
          viewport:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
        },
        templateContent: ({ htmlWebpackPlugin }) => `
        <html>
          <head>
            ${htmlWebpackPlugin.tags.headTags}
            ${response.html.join("")}
            <script src="/index.js"></script>
            <style>
              html,
              body {
                height: 100%;
              }
              body {
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <effuse-start></effuse-start>
            ${htmlWebpackPlugin.tags.bodyTags}
          </body>
        </html>
      `,
      }),
      new VirtualModulesPlugin({
        "node_modules/effuse-config.js": `module.exports = ${JSON.stringify(
          config
        )};`,
      }),
      async (compiler) => {
        compiler.hooks.thisCompilation.tap("Copy Icons", (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: "Copy Icons",
              stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
            },
            async (assets) => {
              for (const file of response.files)
                compilation.emitAsset(
                  file.name,
                  new sources.RawSource(file.contents)
                );

              for (const image of response.images)
                compilation.emitAsset(
                  image.name,
                  new sources.RawSource(image.contents)
                );
            }
          );
        });
      },
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "../../lib/bakery/dist/native"),
            to: ".",
          },
        ],
      }),
    ],
    mode: isProd ? "production" : "development",
    ...(!isProd
      ? {
          devServer: {
            port: 3001,
            historyApiFallback: true,
          },
        }
      : {}),
    watch: !isProd,
  };
};
