const { withXcodeProject } = require('expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = function withPrivacyManifest(config) {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const sourceFilePath = path.join(projectRoot, 'ios-privacy', 'PrivacyInfo.xcprivacy');
    const targetDir = path.join(config.modRequest.platformProjectRoot, config.modRequest.projectName);
    const targetFilePath = path.join(targetDir, 'PrivacyInfo.xcprivacy');

    // Copy the file
    fs.copyFileSync(sourceFilePath, targetFilePath);

    // Add to Xcode project if not already there
    const groupName = config.modRequest.projectName;
    const group = xcodeProject.pbxGroupByName(groupName);
    if (group && !xcodeProject.hasFile('PrivacyInfo.xcprivacy')) {
      xcodeProject.addResourceFile('PrivacyInfo.xcprivacy', { target: xcodeProject.getFirstTarget().uuid });
    }

    return config;
  });
};
