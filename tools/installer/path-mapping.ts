interface PathMapping {
  [key: string]: string
}

export const PATH_MAPPING: PathMapping = {
  // Old structure -> New structure mappings
  'lib/board-service': 'services/board-api',
  'lib/board-mcp': 'services/board-mcp',
  'lib/installer': 'tools/installer',
  'lib/sync': 'tools/sync',
  'lib/components': 'tools/cli',
  'lib/services': 'shared/lib',
  'lib/utils': 'shared/lib',
  data: 'infrastructure/data',
  scripts: 'infrastructure/scripts'
}

export function getNewPath(oldPath: string): string {
  for (const [oldPattern, newPattern] of Object.entries(PATH_MAPPING)) {
    if (oldPath.includes(oldPattern)) {
      return oldPath.replace(oldPattern, newPattern)
    }
  }
  return oldPath
}

export function getOldPath(newPath: string): string {
  for (const [oldPattern, newPattern] of Object.entries(PATH_MAPPING)) {
    if (newPath.includes(newPattern)) {
      return newPath.replace(newPattern, oldPattern)
    }
  }
  return newPath
}
