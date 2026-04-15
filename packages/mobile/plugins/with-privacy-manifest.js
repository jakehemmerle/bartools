const { withDangerousMod } = require('expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = function withPrivacyManifest(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const sourceFile = path.join(projectRoot, 'ios-privacy', 'PrivacyInfo.xcprivacy');
      const iosDir = path.join(config.modRequest.platformProjectRoot, config.modRequest.projectName);
      const targetFile = path.join(iosDir, 'PrivacyInfo.xcprivacy');

      if (fs.existsSync(sourceFile)) {
        fs.mkdirSync(path.dirname(targetFile), { recursive: true });
        fs.copyFileSync(sourceFile, targetFile);
      }

      return config;
    },
  ]);
};
