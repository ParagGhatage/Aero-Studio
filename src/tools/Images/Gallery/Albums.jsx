import { useState } from 'react';

import { db } from '../../../db';
import { useGlobalMedia } from '../../../Context/GlobalMediaContext';

export default function Albums({ onSelectAlbum }) {
  const { albums, images } = useGlobalMedia();
  
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedAlbums, setSelectedAlbums] = useState(new Set());

  const handleCreateAlbum = async () => {
    const albumName = window.prompt('Enter a name for the new album:');
    if (!albumName?.trim()) return;
    
    const name = albumName.trim();
    const exists = await db.albums.where('name').equalsIgnoreCase(name).first();
    if (exists) {
      alert('An album with this name already exists.');
      return;
    }
    await db.albums.add({ name, createdAt: Date.now() });
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedAlbums(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected = albums.length > 0 && selectedAlbums.size === albums.length;
  
  const toggleSelectAll = () => {
    setSelectedAlbums(isAllSelected ? new Set() : new Set(albums.map(a => a.id)));
  };

  const deleteAlbums = async (albumIds, albumNames) => {
    await db.transaction('rw', [db.albums, db.images], async () => {
      await db.images.where('album').anyOf(albumNames).modify({ album: 'Default' });
      await db.albums.bulkDelete(albumIds);
    });
  };

  const deleteSingleAlbum = async (album, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${album.name}"? Photos will be moved to "My Photos".`)) {
      await deleteAlbums([album.id], [album.name]);
    }
  };

  const deleteSelectedAlbums = async () => {
    if (window.confirm(`Delete ${selectedAlbums.size} selected album(s)?`)) {
      const albumIds = Array.from(selectedAlbums);
      const albumsToDelete = await db.albums.where('id').anyOf(albumIds).toArray();
      const albumNames = albumsToDelete.map(a => a.name);
      
      await deleteAlbums(albumIds, albumNames);
      setSelectedAlbums(new Set());
    }
  };

  return (
    // Outer container ensures this component fills its parent area
    <div className="flex flex-col h-full w-full overflow-hidden"> 
      
      {/* Header/Toolbar Section - shrink-0 prevents it from being squashed */}
      {albums.length > 0 && (
        <div className="flex justify-start items-center mb-[14px] shrink-0">
          <button 
            className="bg-[#141414] border border-[#2A2A2A] text-[#F5F0EB] px-[11px] py-[7px] rounded-[7px] text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-[#1F1F1F] hover:border-[#555]" 
            onClick={toggleSelectAll}
          >
            <div className={`w-[14px] h-[14px] border rounded-[3px] inline-flex items-center justify-center text-[10px] ${isAllSelected ? 'bg-[#FF5F1F] border-[#FF5F1F]' : 'border-[#888]'}`}>
              {isAllSelected && '✓'}
            </div>
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      )}

      {/* Grid Container - flex-1 and min-h-0 enable internal scrolling */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(174px,1fr))] gap-3 md:gap-[14px] pb-20">
          
          <div 
            className="relative bg-transparent border border-dashed border-[#555] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer aspect-square transition-all duration-200 text-[#FF5F1F] hover:bg-[#FF5F1F]/10 hover:border-[#FF5F1F]" 
            onClick={handleCreateAlbum}
          >
            <div className="text-[30px] mb-2.5">+</div>
            <div className="text-[#F5F0EB] font-semibold text-[13px]">Create New</div>
          </div>

          {albums.map((album) => {
            const imageCount = images.filter(img => img.album === album.name).length;
            const isSelected = selectedAlbums.has(album.id);
            const showCheckbox = isSelected || hoveredId === album.id || selectedAlbums.size > 0;

            return (
              <div 
                key={album.id} 
                className={`relative bg-[#141414] border rounded-lg px-4 pt-6 pb-5 flex flex-col items-center justify-center cursor-pointer aspect-square transition-all duration-200 ${
                  isSelected ? 'border-[#FF5F1F]' : 'border-[#2A2A2A] hover:border-[#FF5F1F]'
                }`}
                onClick={() => selectedAlbums.size > 0 && toggleSelect(album.id, { stopPropagation: () => {} })}
                onDoubleClick={() => selectedAlbums.size === 0 && onSelectAlbum(album.name)}
                onMouseEnter={() => setHoveredId(album.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {showCheckbox && (
                  <div 
                    className={`absolute top-2 left-2 z-10 w-[22px] h-[22px] rounded border-2 flex items-center justify-center ${isSelected ? 'bg-[#FF5F1F] border-[#FF5F1F]' : 'bg-black/40 border-white/80'}`}
                    onClick={(e) => toggleSelect(album.id, e)}
                  >
                    {isSelected && <span className="text-white text-sm font-bold">✓</span>}
                  </div>
                )}

                <div className="w-[58px] h-[48px] mb-4 relative" aria-hidden="true">
                  <span className="block absolute inset-[10px_3px_4px] bg-transparent border-2 border-current rounded-[3px_3px_6px_6px] before:content-[''] before:absolute before:w-[34px] before:h-[12px] before:-left-[2px] before:-top-[12px] before:border-2 before:border-current before:border-b-0 before:rounded-[4px_4px_0_0]" />
                </div>
                
                <div className="text-[#F5F0EB] font-semibold text-[13px] text-center truncate w-full px-2">
                  {album.name}
                </div>
                <div className="text-[#888] text-[11px] mt-[7px]">
                  {imageCount} photo{imageCount !== 1 ? 's' : ''}
                </div>

                {hoveredId === album.id && !isSelected && selectedAlbums.size === 0 && (
                  <button 
                    className="absolute top-1.5 right-1.5 bg-[#0D0D0D]/85 text-[#E24B4A] border border-[#E24B4A]/35 rounded-md w-7 h-7 flex items-center justify-center z-10 hover:bg-[#E24B4A] hover:text-white" 
                    onClick={(e) => deleteSingleAlbum(album, e)}
                  >✕</button>
                )}
              </div>
            );
          })}
        </div>
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
    </div>
  );
}