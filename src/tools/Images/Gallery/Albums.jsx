import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';

export default function Albums({ onSelectAlbum }) {
  // Fetch albums and images to calculate photo counts per album
  const albums = useLiveQuery(() => db.albums.orderBy('createdAt').toArray()) || [];
  const images = useLiveQuery(() => db.images.toArray()) || [];

  const handleCreateAlbum = async () => {
    const albumName = window.prompt('Enter a name for the new album:');
    
    if (albumName && albumName.trim() !== '') {
      const name = albumName.trim();
      
      const exists = await db.albums.where('name').equalsIgnoreCase(name).first();
      if (exists) {
        alert('An album with this name already exists.');
        return;
      }

      await db.albums.add({ 
        name: name, 
        createdAt: Date.now() 
      });
    }
  };

  return (
    <div className="albums-grid">
      {/* Create New Album Card */}
      <div className="album-card album-create-card" onClick={handleCreateAlbum}>
        <div className="album-create-icon">+</div>
        <div className="album-name">Create New Album</div>
      </div>

      {/* Render Existing Albums */}
      {albums.map((album) => {
        const imageCount = images.filter(img => img.album === album.name).length;

        return (
          <div 
            key={album.id} 
            className="album-card"
            onClick={() => onSelectAlbum(album.name)} // Trigger parent selection
          >
            <div className="album-icon">📁</div>
            <div className="album-name">{album.name}</div>
            <div className="album-count">
              {imageCount} image{imageCount !== 1 ? 's' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}