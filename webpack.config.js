const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    handler: path.resolve(
      __dirname,
      './src/handler.ts',
    ),
  },
  externals: [
    nodeExternals({
      modulesFromFile: {
        exclude: [ 'dependencies' ],
        include: [ 'devDependencies' ],
      },
    }),
  ],
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
}