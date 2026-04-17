import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const dashboardRoot = fileURLToPath(new URL('..', import.meta.url))
const sourceRoot = path.join(dashboardRoot, 'src')

const authoredExtensions = new Set(['.ts', '.tsx', '.css'])
const ignoredDirectories = new Set(['dist', 'node_modules', 'coverage'])
const lineCap = 500

const bannedExactBasenames = new Set(['utils', 'helpers', 'common', 'shared', 'misc', 'temp', 'stuff'])
const bannedSuffixes = ['-utils', '-helpers', '-common', '-shared', '-misc', '-temp', '-stuff']
const bannedPrefixes = ['shared-']
const localImportExtensions = ['.ts', '.tsx', '.css']
const storyAllowedRoots = ['src/components/primitives/', 'src/components/composites/']

const filenameAllowlist = new Set(['src/test/test-utils.tsx'])

const issues = []

await walk(sourceRoot)

if (issues.length > 0) {
  console.error('Code quality enforcement failed:\n')

  for (const issue of issues) {
    console.error(`- ${issue}`)
  }

  process.exit(1)
}

console.log('Code quality enforcement passed.')

async function walk(currentDirectory) {
  const entries = await readdir(currentDirectory, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(currentDirectory, entry.name)

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue
      }

      await walk(entryPath)
      continue
    }

    if (!entry.isFile() || !authoredExtensions.has(path.extname(entry.name))) {
      continue
    }

    await checkFile(entryPath)
  }
}

async function checkFile(filePath) {
  const relativePath = normalizePath(path.relative(dashboardRoot, filePath))
  const fileContents = await readFile(filePath, 'utf8')
  const lineCount = countLines(fileContents)
  const fileStem = path.basename(filePath, path.extname(filePath))

  if (lineCount > lineCap) {
    issues.push(`${relativePath} has ${lineCount} lines; cap is ${lineCap}. Split it into clearer files.`)
  }

  if (!filenameAllowlist.has(relativePath) && isBannedFilename(fileStem)) {
    issues.push(
      `${relativePath} uses a banned generic filename. Rename it to reflect a concrete domain responsibility.`,
    )
  }

  if (isStoryFile(relativePath) && !storyAllowedRoots.some((prefix) => relativePath.startsWith(prefix))) {
    issues.push(
      `${relativePath} is outside the approved Storybook scope. Keep stories inside src/components/primitives or src/components/composites.`,
    )
  }

  if (path.extname(filePath) === '.css') {
    checkCssTokenUsage(relativePath, fileContents)
  }

  const doubleCastMatches = [...fileContents.matchAll(/\bas unknown as\b/g)]

  for (const match of doubleCastMatches) {
    const lineNumber = lineNumberForIndex(fileContents, match.index ?? 0)
    issues.push(`${relativePath}:${lineNumber} uses "as unknown as". Replace it with a validated narrower type path.`)
  }

  if (
    (path.extname(filePath) === '.ts' || path.extname(filePath) === '.tsx') &&
    !isTestLikeFile(relativePath)
  ) {
    checkImportBoundaries(filePath, relativePath, fileContents)
  }
}

function checkCssTokenUsage(relativePath, fileContents) {
  if (relativePath === 'src/index.css') {
    return
  }

  const rawColorMatches = [...fileContents.matchAll(/#[0-9A-Fa-f]{3,8}\b|rgba?\([^)]*\)/g)]

  for (const match of rawColorMatches) {
    const lineNumber = lineNumberForIndex(fileContents, match.index ?? 0)
    issues.push(
      `${relativePath}:${lineNumber} uses raw color literal "${match[0]}". Route styles must consume named theme tokens from src/index.css.`,
    )
  }
}

function countLines(fileContents) {
  return fileContents.split(/\r?\n/).length
}

function isBannedFilename(fileStem) {
  return (
    bannedExactBasenames.has(fileStem) ||
    bannedSuffixes.some((suffix) => fileStem.endsWith(suffix)) ||
    bannedPrefixes.some((prefix) => fileStem.startsWith(prefix))
  )
}

function isStoryFile(relativePath) {
  return /\.(stories|story)\.(ts|tsx)$/.test(relativePath)
}

function isTestLikeFile(relativePath) {
  return relativePath.startsWith('src/test/') || /\.(test|spec)\.(ts|tsx)$/.test(relativePath)
}

function checkImportBoundaries(filePath, relativePath, fileContents) {
  const sourceCategory = classifyModule(relativePath)

  if (!sourceCategory) {
    return
  }

  const specifiers = getStaticModuleSpecifiers(filePath, fileContents)

  for (const specifier of specifiers) {
    if (!specifier.startsWith('.')) {
      continue
    }

    const resolvedPath = resolveLocalImport(filePath, specifier)

    if (!resolvedPath) {
      continue
    }

    const targetRelativePath = normalizePath(path.relative(dashboardRoot, resolvedPath))
    const targetCategory = classifyModule(targetRelativePath)
    const issue = describeBoundaryViolation(
      relativePath,
      sourceCategory,
      specifier,
      targetRelativePath,
      targetCategory,
    )

    if (issue) {
      issues.push(issue)
    }
  }
}

function getStaticModuleSpecifiers(filePath, fileContents) {
  const scriptKind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(filePath, fileContents, ts.ScriptTarget.Latest, true, scriptKind)
  const specifiers = []

  for (const statement of sourceFile.statements) {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      specifiers.push(statement.moduleSpecifier.text)
    }
  }

  return specifiers
}

function resolveLocalImport(filePath, specifier) {
  const basePath = path.resolve(path.dirname(filePath), specifier)
  const candidates = [basePath]

  for (const extension of localImportExtensions) {
    candidates.push(`${basePath}${extension}`)
    candidates.push(path.join(basePath, `index${extension}`))
  }

  return candidates.find((candidate) => existsSync(candidate))
}

function classifyModule(relativePath) {
  if (relativePath.startsWith('src/components/primitives/')) {
    return 'primitives'
  }

  if (relativePath.startsWith('src/components/shell/')) {
    return 'shell'
  }

  if (relativePath.startsWith('src/components/')) {
    return 'components'
  }

  if (relativePath.startsWith('src/features/')) {
    return 'features'
  }

  if (relativePath.startsWith('src/lib/')) {
    return 'lib'
  }

  if (relativePath.startsWith('src/app/theme/')) {
    return 'theme'
  }

  if (relativePath.startsWith('src/app/')) {
    return 'app'
  }

  if (relativePath.startsWith('src/test/')) {
    return 'test'
  }

  return null
}

function describeBoundaryViolation(
  sourcePath,
  sourceCategory,
  specifier,
  targetPath,
  targetCategory,
) {
  if (!targetCategory) {
    return null
  }

  if (sourceCategory === 'lib' && ['app', 'theme', 'components', 'features', 'test'].includes(targetCategory)) {
    return `${sourcePath} imports ${specifier} (${targetPath}). lib modules must stay UI-free and may only depend on lib or external packages.`
  }

  if (sourceCategory === 'primitives' && !['primitives', 'theme'].includes(targetCategory)) {
    return `${sourcePath} imports ${specifier} (${targetPath}). primitive components may only depend on other primitives or app theme tokens.`
  }

  if (sourceCategory === 'features' && ['app', 'test'].includes(targetCategory)) {
    return `${sourcePath} imports ${specifier} (${targetPath}). feature code must not reach up into app orchestration or test utilities.`
  }

  if (sourceCategory === 'app' && targetCategory === 'test') {
    return `${sourcePath} imports ${specifier} (${targetPath}). app code must not depend on test utilities.`
  }

  return null
}

function lineNumberForIndex(fileContents, index) {
  return fileContents.slice(0, index).split(/\r?\n/).length
}

function normalizePath(value) {
  return value.split(path.sep).join('/')
}
