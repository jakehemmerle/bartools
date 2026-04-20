import { Directory, File, Paths } from 'expo-file-system'

const PHOTOS_DIR_NAME = 'photos'

function ensurePhotosDir(): Directory {
  const dir = new Directory(Paths.document, PHOTOS_DIR_NAME)
  if (!dir.exists) dir.create({ intermediates: true })
  return dir
}

// Copy a capture (vision-camera cache or ImagePicker cache) into the app's
// Documents directory so iOS can't evict it before we upload. Returns the new
// file:// URI under Documents/photos/.
export async function persistPhoto(sourceUri: string): Promise<string> {
  const dir = ensurePhotosDir()
  const ext = sourceUri.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
  const dest = new File(dir, filename)
  const src = new File(sourceUri)
  src.copy(dest)
  return dest.uri
}
