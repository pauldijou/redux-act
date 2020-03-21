var modules;
var moduleTarget = process.env['MODULE_TARGET'];

if (moduleTarget === 'commonjs') {
  modules = 'commonjs';
} else if (moduleTarget === 'esm') {
  modules = false;
} else {
  throw new Error('Wrong value for MODULE_TARGET: ' + moduleTarget);
}

module.exports = {
  presets: [['@babel/preset-env', { modules: modules }]],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-object-assign'
  ]
};
