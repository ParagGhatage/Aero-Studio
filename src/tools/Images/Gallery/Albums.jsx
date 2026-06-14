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

  const isAllSelected = albums.length > 0 && selectedAlbums.size === albums.length;
  
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAlbums(new Set());
    } else {
      setSelectedAlbums(new Set(albums.map(a => a.id)));
    }
  };

  // Safe individual delete handler
  const deleteSingleAlbum = async (album, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${album.name}"? Photos will be returned to "My Photos".`)) {
      // Unassign images, then delete the album
      await db.images.where('album').equals(album.name).modify({ album: 'Default' });
      await db.albums.delete(album.id);
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
        <div className="flex justify-start items-center mb-[14px]">
          <button 
            className="bg-[#141414] border border-[#2A2A2A] text-[#F5F0EB] px-[11px] py-[7px] rounded-[7px] text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-[#1F1F1F] hover:border-[#555]" 
            onClick={toggleSelectAll}
          >
            <div className={`w-[14px] h-[14px] border rounded-[3px] inline-flex items-center justify-center text-[10px] transition-all duration-200 ${
              isAllSelected ? 'bg-[#FF5F1F] border-[#FF5F1F] text-white' : 'border-[#888]'
            }`}>
              {isAllSelected && '✓'}
            </div>
            {isAllSelected ? 'Deselect All' : 'Select All Albums'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(174px,1fr))] gap-3 md:gap-[14px]">
        
        {/* Create Album Card */}
        <div 
          className="relative bg-transparent border border-dashed border-[#555] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer aspect-square transition-all duration-200 text-[#FF5F1F] hover:bg-[#FF5F1F]/10 hover:border-[#FF5F1F] hover:scale-[1.02]" 
          onClick={handleCreateAlbum}
        >
          <div className="text-[30px] mb-2.5 leading-none">+</div>
          <div className="text-[#F5F0EB] font-semibold text-[13px] leading-tight text-center">Create New Album</div>
        </div>

        {/* Album Cards */}
        {albums.map((album) => {
          const imageCount = images.filter(img => img.album === album.name).length;
          const isSelected = selectedAlbums.has(album.id);
          const showCheckbox = isSelected || hoveredId === album.id || selectedAlbums.size > 0;

          return (
            <div 
              key={album.id} 
              className={`relative bg-[#141414] border rounded-lg px-4 pt-6 pb-5 flex flex-col items-center justify-center cursor-pointer aspect-square transition-all duration-200 hover:bg-[#181818] hover:border-[#FF5F1F] hover:scale-[1.02] ${
                isSelected ? 'border-[#FF5F1F] scale-[1.02]' : 'border-[#2A2A2A]'
              }`}
              onClick={() => {
                if (selectedAlbums.size > 0) toggleSelect(album.id, { stopPropagation: () => {} });
              }}
              onDoubleClick={() => {
                if (selectedAlbums.size === 0) onSelectAlbum(album.name);
              }}
              onMouseEnter={() => setHoveredId(album.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {showCheckbox && (
                <div 
                  className={`absolute top-2 left-2 z-10 w-[22px] h-[22px] rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${
                    isSelected ? 'bg-[#FF5F1F] border-[#FF5F1F]' : 'bg-black/40 border-white/80'
                  }`}
                  onClick={(e) => toggleSelect(album.id, e)}
                >
                  {isSelected && <span className="text-white text-sm font-bold leading-none">✓</span>}
                </div>
              )}

              <div className="w-[58px] h-[48px] mb-4 relative" aria-hidden="true">
                {/* CSS-based folder icon converted to Tailwind before/after properties */}
                <span className="block absolute box-border inset-[10px_3px_4px] bg-transparent border-2 border-current rounded-[3px_3px_6px_6px] shadow-[0_10px_18px_rgba(0,0,0,0.22)] text-white/90 before:content-[''] before:block before:absolute before:box-border before:w-[34px] before:h-[12px] before:-left-[2px] before:-top-[12px] before:bg-transparent before:border-2 before:border-current before:border-b-0 before:rounded-[4px_4px_0_0]" />
              </div>
              
              <div className="text-[#F5F0EB] font-semibold text-[13px] leading-[1.25] text-center max-w-full break-words">
                {album.name}
              </div>
              <div className="text-[#888] text-[11px] mt-[7px]">
                {imageCount} image{imageCount !== 1 ? 's' : ''}
              </div>

              {/* Individual Hover Delete Button */}
              {hoveredId === album.id && !isSelected && selectedAlbums.size === 0 && (
                <button 
                  className="absolute top-1.5 right-1.5 bg-[#0D0D0D]/85 text-[#E24B4A] border border-[#E24B4A]/35 rounded-md w-7 h-7 text-sm cursor-pointer flex items-center justify-center transition-all duration-200 z-10 hover:bg-[#E24B4A] hover:text-white" 
                  onClick={(e) => deleteSingleAlbum(album, e)}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      {selectedAlbums.size > 0 && (
        <div className="fixed bottom-[18px] md:bottom-[30px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] md:w-auto bg-[#1F1F1F] border border-[#333] rounded-[30px] px-[14px] md:px-6 py-2.5 md:py-3 flex justify-between md:justify-center items-center gap-5 z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.6)] box-border">
          <button 
            className="bg-transparent text-[#888] border-none text-base cursor-pointer flex items-center justify-center p-1 transition-colors duration-200 hover:text-[#F5F0EB]" 
            onClick={() => setSelectedAlbums(new Set())}
          >
            ✕
          </button>
          <span className="text-[#F5F0EB] text-sm font-medium">
            {selectedAlbums.size} selected
          </span>
          <button 
            className="bg-[#E24B4A] text-white border border-[#E24B4A] px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-[#ff4d4f] hover:border-[#ff4d4f]" 
            onClick={deleteSelectedAlbums}
          >
            Delete Albums
          </button>
        </div>
      )}
    </>
  );
}