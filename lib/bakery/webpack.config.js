const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const webpack = require("webpack");

module.exports = {
  entry: {
    index: "./src/index.ts",
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
    "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
    "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
    "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
    "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
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
                outDir: path.resolve(__dirname, "dist"),
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.std$/,
        use: "@ipheion/wholemeal/dist/std-loader",
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
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: process.env.PRODUCTION ? "production" : "development",
  externals: {
    react: "react",
    reactDOM: "react-dom",
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      include: /src/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }),
    new webpack.ProgressPlugin({
      activeModules: true,
    }),
  ],
  parallelism: 1,
};
