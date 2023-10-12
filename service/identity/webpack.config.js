const path = require("path");

const createExport = (framework, output, typings = true) => ({
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
                outDir: output,
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
              framework,
              typings,
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
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".std", ".pss"],
  },
  output: {
    filename: "[name].js",
    path: output,
  },
  mode: process.env.PRODUCTION ? "production" : "development",
  watch: !process.env.PRODUCTION,
  externals: {
    react: "react",
    reactDOM: "react-dom",
  },
  parallelism: 1,
});

module.exports = [
  createExport("native", path.resolve(__dirname, "dist", "native")),
  createExport("react", path.resolve(__dirname, "dist", "react")),
  createExport("preact", path.resolve(__dirname, "dist", "preact")),
];
