import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';

export default function Albums({ onSelectAlbum }) {
  const albums = useLiveQuery(() => db.albums.orderBy('createdAt').toArray()) || [];
  const images = useLiveQuery(() => db.images.toArray()) || [];
  
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedAlbums, setSelectedAlbums] = useState(new Set());

  const handleCreateAlbum = async () => {
    const albumName = window.prompt('Enter a name for the new album:');
    if (albumName && albumName.trim() !== '') {
      const name = albumName.trim();
      const exists = await db.albums.where('name').equalsIgnoreCase(name).first();
      if (exists) {
        alert('An album with this name already exists.');
        return;
      }
      await db.albums.add({ name: name, createdAt: Date.now() });
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedAlbums);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAlbums(next);
  };

  // --- NEW: Select All Logic ---
  const isAllSelected = albums.length > 0 && selectedAlbums.size === albums.length;
  
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAlbums(new Set()); // Deselect all
    } else {
      setSelectedAlbums(new Set(albums.map(a => a.id))); // Select all
    }
  };

  const deleteSelectedAlbums = async () => {
    if (window.confirm(`Delete ${selectedAlbums.size} album(s)? The photos inside will NOT be deleted, they will be returned to "My Photos".`)) {
      const albumIds = Array.from(selectedAlbums);
      const albumsToDelete = await db.albums.where('id').anyOf(albumIds).toArray();
      const albumNames = albumsToDelete.map(a => a.name);

      const imagesToUpdate = await db.images.where('album').anyOf(albumNames).toArray();
      await Promise.all(imagesToUpdate.map(img => db.images.update(img.id, { album: 'Default' })));

      await db.albums.bulkDelete(albumIds);
      setSelectedAlbums(new Set());
    }
  };

  return (
    <>
      {albums.length > 0 && (
        <div className="grid-toolbar">
          <button className={`select-all-btn ${isAllSelected ? 'active' : ''}`} onClick={toggleSelectAll}>
            <div className="select-all-checkbox">{isAllSelected && '✓'}</div>
            {isAllSelected ? 'Deselect All' : 'Select All Albums'}
          </button>
        </div>
      )}

      <div className="albums-grid">
        <div className="album-card album-create-card" onClick={handleCreateAlbum}>
          <div className="album-create-icon">+</div>
          <div className="album-name">Create New Album</div>
        </div>

        {albums.map((album) => {
          const imageCount = images.filter(img => img.album === album.name).length;
          const isSelected = selectedAlbums.has(album.id);
          const showCheckbox = isSelected || hoveredId === album.id || selectedAlbums.size > 0;

          return (
            <div 
              key={album.id} 
              className={`album-card ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (selectedAlbums.size > 0) toggleSelect(album.id, { stopPropagation: () => {} });
                else onSelectAlbum(album.name);
              }}
              onMouseEnter={() => setHoveredId(album.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ borderColor: isSelected ? '#FF5F1F' : '' }}
            >
              {showCheckbox && (
                <div 
                  className={`checkbox-wrapper ${isSelected ? 'checked' : 'unchecked'}`}
                  onClick={(e) => toggleSelect(album.id, e)}
                >
                  {isSelected && <span className="check-icon">✓</span>}
                </div>
              )}

              <div className="album-icon">📁</div>
              <div className="album-name">{album.name}</div>
              <div className="album-count">
                {imageCount} image{imageCount !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {selectedAlbums.size > 0 && (
        <div className="action-bar">
          <button className="action-bar-cancel" onClick={() => setSelectedAlbums(new Set())}>✕</button>
          <span className="action-bar-text">{selectedAlbums.size} selected</span>
          <button className="action-bar-btn" onClick={deleteSelectedAlbums}>Delete Albums</button>
        </div>
      )}
    </>
  );
}