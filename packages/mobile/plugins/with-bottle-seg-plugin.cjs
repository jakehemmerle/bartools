const { withDangerousMod, withXcodeProject } = require('expo/config-plugins');
const path = require('path');
const fs = require('fs');

const SWIFT_FILE = 'BottleSegFrameProcessor.swift';
const OBJC_FILE = 'BottleSegFrameProcessor.m';
const MODEL_DIR_NAME = 'yolo26n-seg.mlpackage';

function copyDirRecursive(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function withCopySources(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const platformRoot = cfg.modRequest.platformProjectRoot;
      const projectName = cfg.modRequest.projectName;
      const targetDir = path.join(platformRoot, projectName);

      const swiftSrc = path.join(projectRoot, 'plugins', 'native', SWIFT_FILE);
      const objcSrc = path.join(projectRoot, 'plugins', 'native', OBJC_FILE);
      const modelSrc = path.join(projectRoot, 'assets', 'models', MODEL_DIR_NAME);

      if (!fs.existsSync(swiftSrc)) throw new Error(`[bottleSeg] missing ${swiftSrc}`);
      if (!fs.existsSync(objcSrc)) throw new Error(`[bottleSeg] missing ${objcSrc}`);
      if (!fs.existsSync(modelSrc)) throw new Error(`[bottleSeg] missing ${modelSrc}`);

      fs.copyFileSync(swiftSrc, path.join(targetDir, SWIFT_FILE));
      fs.copyFileSync(objcSrc, path.join(targetDir, OBJC_FILE));

      const modelDst = path.join(targetDir, MODEL_DIR_NAME);
      if (fs.existsSync(modelDst)) fs.rmSync(modelDst, { recursive: true, force: true });
      copyDirRecursive(modelSrc, modelDst);

      return cfg;
    },
  ]);
}

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

function withRegisterInXcode(config) {
  return withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;
    const groupName = cfg.modRequest.projectName;
    const groupKey = findGroupKey(proj, groupName);
    if (!groupKey) {
      console.warn(`[bottleSeg] PBXGroup ${groupName} not found — skipping registration`);
      return cfg;
    }
    const targetUuid = proj.getFirstTarget().uuid;

    const swiftPath = `${groupName}/${SWIFT_FILE}`;
    const objcPath = `${groupName}/${OBJC_FILE}`;
    const modelPath = `${groupName}/${MODEL_DIR_NAME}`;

    if (!proj.hasFile(swiftPath)) {
      proj.addSourceFile(swiftPath, { target: targetUuid }, groupKey);
    }
    if (!proj.hasFile(objcPath)) {
      proj.addSourceFile(objcPath, { target: targetUuid }, groupKey);
    }
    if (!proj.hasFile(modelPath)) {
      addFolderResource(proj, modelPath, targetUuid, groupKey);
    }
    return cfg;
  });
}

// Adds a directory-bundle (e.g. .mlpackage, .bundle) as a "folder reference"
// resource. Bypasses xcode npm lib's broken correctForResourcesPath which
// crashes when no "Resources" PBXGroup exists.
function addFolderResource(proj, filePath, targetUuid, groupKey) {
  const basename = filePath.split('/').pop();
  const fileRefUuid = proj.generateUuid();
  const buildFileUuid = proj.generateUuid();

  // PBXFileReference entry — folder reference (Xcode bundles whole dir).
  // path includes the parent dir ("BarBack/foo.mlpackage") because the BarBack
  // group has no path attribute, so paths are relative to project root.
  const fileRefSection = proj.hash.project.objects.PBXFileReference;
  fileRefSection[fileRefUuid] = {
    isa: 'PBXFileReference',
    lastKnownFileType: 'folder',
    name: `"${basename}"`,
    path: `"${filePath}"`,
    sourceTree: '"<group>"',
  };
  fileRefSection[`${fileRefUuid}_comment`] = basename;

  // Add to the BarBack group's children
  const groups = proj.hash.project.objects.PBXGroup;
  const group = groups[groupKey];
  group.children = group.children || [];
  group.children.push({ value: fileRefUuid, comment: basename });

  // PBXBuildFile entry references the fileRef
  const buildFileSection = proj.hash.project.objects.PBXBuildFile;
  buildFileSection[buildFileUuid] = {
    isa: 'PBXBuildFile',
    fileRef: fileRefUuid,
    fileRef_comment: basename,
  };
  buildFileSection[`${buildFileUuid}_comment`] = `${basename} in Resources`;

  // Add buildFile to PBXResourcesBuildPhase for the target
  const buildPhases = proj.hash.project.objects.PBXResourcesBuildPhase;
  for (const key of Object.keys(buildPhases)) {
    if (key.endsWith('_comment')) continue;
    const phase = buildPhases[key];
    if (!phase || typeof phase !== 'object') continue;
    phase.files = phase.files || [];
    phase.files.push({ value: buildFileUuid, comment: `${basename} in Resources` });
    break; // only main target's resources phase
  }
}

module.exports = function withBottleSegPlugin(config) {
  config = withCopySources(config);
  config = withRegisterInXcode(config);
  return config;
};
