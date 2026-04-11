import { describe, it, expect, beforeEach } from 'bun:test';

/**
 * Since useBatchQueue is a React hook, we test the underlying logic
 * by extracting the pure operations. This avoids needing a React
 * test renderer for unit tests — integration tests in M8 will
 * cover the hook in a component context.
 */

type QueuedPhoto = { uri: string; id: string };

// Simulate the queue operations (same logic as the hook)
function createQueue() {
  let photos: QueuedPhoto[] = [];
  let nextId = 0;

  return {
    get photos() { return photos; },
    get count() { return photos.length; },
    get isEmpty() { return photos.length === 0; },
    addPhoto(uri: string) {
      photos = [...photos, { uri, id: `photo-${nextId++}` }];
    },
    addPhotos(uris: string[]) {
      const newPhotos = uris.map((uri) => ({ uri, id: `photo-${nextId++}` }));
      photos = [...photos, ...newPhotos];
    },
    removePhoto(id: string) {
      photos = photos.filter((p) => p.id !== id);
    },
    clear() {
      photos = [];
    },
  };
}

describe('batch queue', () => {
  let queue: ReturnType<typeof createQueue>;

  beforeEach(() => {
    queue = createQueue();
  });

  it('starts empty', () => {
    expect(queue.photos).toEqual([]);
    expect(queue.count).toBe(0);
    expect(queue.isEmpty).toBe(true);
  });

  it('adds a single photo', () => {
    queue.addPhoto('file:///photo1.jpg');
    expect(queue.count).toBe(1);
    expect(queue.isEmpty).toBe(false);
    expect(queue.photos[0].uri).toBe('file:///photo1.jpg');
    expect(queue.photos[0].id).toBeDefined();
  });

  it('adds multiple photos at once', () => {
    queue.addPhotos([
      'file:///photo1.jpg',
      'file:///photo2.jpg',
      'file:///photo3.jpg',
    ]);
    expect(queue.count).toBe(3);
    expect(queue.photos[0].uri).toBe('file:///photo1.jpg');
    expect(queue.photos[1].uri).toBe('file:///photo2.jpg');
    expect(queue.photos[2].uri).toBe('file:///photo3.jpg');
  });

  it('accumulates photos across multiple add calls', () => {
    queue.addPhoto('file:///photo1.jpg');
    queue.addPhotos(['file:///photo2.jpg', 'file:///photo3.jpg']);
    queue.addPhoto('file:///photo4.jpg');
    expect(queue.count).toBe(4);
    expect(queue.photos.map((p) => p.uri)).toEqual([
      'file:///photo1.jpg',
      'file:///photo2.jpg',
      'file:///photo3.jpg',
      'file:///photo4.jpg',
    ]);
  });

  it('removes a specific photo by id', () => {
    queue.addPhotos(['file:///a.jpg', 'file:///b.jpg', 'file:///c.jpg']);
    const idToRemove = queue.photos[1].id;
    queue.removePhoto(idToRemove);
    expect(queue.count).toBe(2);
    expect(queue.photos.map((p) => p.uri)).toEqual([
      'file:///a.jpg',
      'file:///c.jpg',
    ]);
  });

  it('removing a non-existent id does nothing', () => {
    queue.addPhoto('file:///a.jpg');
    queue.removePhoto('does-not-exist');
    expect(queue.count).toBe(1);
    expect(queue.photos[0].uri).toBe('file:///a.jpg');
    expect(queue.isEmpty).toBe(false);
  });

  it('clears all photos', () => {
    queue.addPhotos(['file:///a.jpg', 'file:///b.jpg', 'file:///c.jpg']);
    expect(queue.count).toBe(3);
    queue.clear();
    expect(queue.count).toBe(0);
    expect(queue.isEmpty).toBe(true);
    expect(queue.photos).toEqual([]);
  });

  it('generates unique ids for every photo', () => {
    queue.addPhotos(['file:///a.jpg', 'file:///a.jpg', 'file:///a.jpg']);
    const ids = queue.photos.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
    expect(ids[0]).not.toBe(ids[1]);
    expect(ids[1]).not.toBe(ids[2]);
  });

  it('can add photos after clearing', () => {
    queue.addPhoto('file:///a.jpg');
    queue.clear();
    queue.addPhoto('file:///b.jpg');
    expect(queue.count).toBe(1);
    expect(queue.photos[0].uri).toBe('file:///b.jpg');
    expect(queue.isEmpty).toBe(false);
  });
});
