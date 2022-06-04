process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const environment = require('./environment')


// TODO (jimmy): remove this if it hotreloads
// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// // const devServer = {
// //   port: 3000,
// //   client: { overlay: false },
// //   liveReload: true,
// // };

// // //plugins
// // environment.plugins.append(
// //   'ReactRefreshWebpackPlugin',
// //   new ReactRefreshWebpackPlugin({
// //     overlay: {
// //       sockPort: devServer.port
// //     }
// //   })
// // )

module.exports = environment.toWebpackConfig()
