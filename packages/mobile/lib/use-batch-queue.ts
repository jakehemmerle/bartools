import { useState, useCallback } from 'react';

export type QueuedPhoto = {
  uri: string;
  id: string;
};

let nextId = 0;
function generateId(): string {
  return `photo-${Date.now()}-${nextId++}`;
}

export function useBatchQueue() {
  const [photos, setPhotos] = useState<QueuedPhoto[]>([]);

  const addPhoto = useCallback((uri: string) => {
    setPhotos((prev) => [...prev, { uri, id: generateId() }]);
  }, []);

  const addPhotos = useCallback((uris: string[]) => {
    const newPhotos = uris.map((uri) => ({ uri, id: generateId() }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => {
    setPhotos([]);
  }, []);

  return {
    photos,
    count: photos.length,
    isEmpty: photos.length === 0,
    addPhoto,
    addPhotos,
    removePhoto,
    clear,
  };
}
