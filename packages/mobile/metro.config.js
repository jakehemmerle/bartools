const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Let Metro walk up directory trees inside node_modules/.bun/ so each
// package resolves its own transitive deps from bun's nested store.
// Without this, bun monorepos fail on any transitive require().
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
