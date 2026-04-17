const { withXcodeProject } = require('expo/config-plugins');
const path = require('path');
const fs = require('fs');

const FILE_NAME = 'PrivacyInfo.xcprivacy';

function findGroupKey(proj, groupName) {
  const groups = proj.hash.project.objects['PBXGroup'];
  for (const key of Object.keys(groups)) {
    if (key.endsWith('_comment')) continue;
    const g = groups[key];
    if (!g || typeof g !== 'object') continue;
    if (g.name === groupName || g.path === groupName) return key;
  }
  return null;
}

// Manually add a resource file to PBXFileReference + PBXBuildFile + the
// project's Resources build phase + a parent group, bypassing xcode npm lib's
// addResourceFile (which crashes when no PBXGroup named "Resources" exists).
function addPlainResourceFile(proj, basename, targetUuid, groupKey) {
  const fileRefUuid = proj.generateUuid();
  const buildFileUuid = proj.generateUuid();

  const fileRefSection = proj.hash.project.objects.PBXFileReference;
  fileRefSection[fileRefUuid] = {
    isa: 'PBXFileReference',
    lastKnownFileType: 'text.xml',
    path: `"${basename}"`,
    sourceTree: '"<group>"',
  };
  fileRefSection[`${fileRefUuid}_comment`] = basename;

  const groups = proj.hash.project.objects.PBXGroup;
  const group = groups[groupKey];
  group.children = group.children || [];
  group.children.push({ value: fileRefUuid, comment: basename });

  const buildFileSection = proj.hash.project.objects.PBXBuildFile;
  buildFileSection[buildFileUuid] = {
    isa: 'PBXBuildFile',
    fileRef: fileRefUuid,
    fileRef_comment: basename,
  };
  buildFileSection[`${buildFileUuid}_comment`] = `${basename} in Resources`;

  const buildPhases = proj.hash.project.objects.PBXResourcesBuildPhase;
  for (const key of Object.keys(buildPhases)) {
    if (key.endsWith('_comment')) continue;
    const phase = buildPhases[key];
    if (!phase || typeof phase !== 'object') continue;
    phase.files = phase.files || [];
    phase.files.push({ value: buildFileUuid, comment: `${basename} in Resources` });
    break;
  }
}

module.exports = function withPrivacyManifest(config) {
  return withXcodeProject(config, async (cfg) => {
    const proj = cfg.modResults;
    const projectRoot = cfg.modRequest.projectRoot;
    const sourceFilePath = path.join(projectRoot, 'ios-privacy', FILE_NAME);
    const targetDir = path.join(cfg.modRequest.platformProjectRoot, cfg.modRequest.projectName);
    const targetFilePath = path.join(targetDir, FILE_NAME);

    fs.copyFileSync(sourceFilePath, targetFilePath);

    const groupName = cfg.modRequest.projectName;
    const groupKey = findGroupKey(proj, groupName);
    if (groupKey && !proj.hasFile(`${groupName}/${FILE_NAME}`)) {
      const targetUuid = proj.getFirstTarget().uuid;
      addPlainResourceFile(proj, FILE_NAME, targetUuid, groupKey);
    }

    return cfg;
  });
};
