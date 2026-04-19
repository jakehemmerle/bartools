import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type QueuedPhoto = {
  uri: string;
  id: string;
};

let nextId = 0;
function generateId(): string {
  return `photo-${Date.now()}-${nextId++}`;
}

export type BatchQueueValue = {
  photos: QueuedPhoto[];
  count: number;
  isEmpty: boolean;
  addPhoto: (uri: string) => void;
  addPhotos: (uris: string[]) => void;
  removePhoto: (id: string) => void;
  clear: () => void;
};

/**
 * Encapsulates the photo queue state + mutators. Used directly by
 * `BatchQueueProvider` and, as a local fallback, by `useBatchQueue` when no
 * provider is mounted (e.g. in tests or isolated screens).
 */
function useBatchQueueImpl(): BatchQueueValue {
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

  return useMemo(
    () => ({
      photos,
      count: photos.length,
      isEmpty: photos.length === 0,
      addPhoto,
      addPhotos,
      removePhoto,
      clear,
    }),
    [photos, addPhoto, addPhotos, removePhoto, clear],
  );
}

const BatchQueueContext = createContext<BatchQueueValue | null>(null);

export function BatchQueueProvider({ children }: { children: ReactNode }) {
  const value = useBatchQueueImpl();
  return createElement(BatchQueueContext.Provider, { value }, children);
}

/**
 * Shared photo queue. If a `BatchQueueProvider` is mounted above, returns the
 * shared state so cross-route updates (e.g. inventory scan → capture tab)
 * stay in sync. Otherwise falls back to a screen-local queue.
 */
export function useBatchQueue(): BatchQueueValue {
  const fromContext = useContext(BatchQueueContext);
  const local = useBatchQueueImpl();
  return fromContext ?? local;
}
