import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ImageCarousel = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const FullScreenModal = () => {
    if (!isModalOpen) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[99999] flex flex-col overflow-hidden bg-black"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}
        onClick={closeModal}
      >
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black to-transparent p-4">
          <div className="max-w-[70%] truncate font-medium text-white">{productName}</div>
          <button
            onClick={closeModal}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/22"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="relative flex flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
         <img
           src={images[currentIndex]}
           alt={`${productName} - rasm ${currentIndex + 1}`}
           className="h-auto max-h-[60vh] w-auto max-w-[70vw] object-contain"
         />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-sm transition-colors hover:bg-white/24 md:left-6"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-sm transition-colors hover:bg-white/24 md:right-6"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center justify-center gap-4">
            <span className="rounded-full bg-white/12 px-3 py-1 text-sm text-white">
              {currentIndex + 1} / {images.length}
            </span>

            {images.length > 1 && (
              <div
                className="scrollbar-hide flex max-w-[60vw] gap-2 overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(index);
                    }}
                    className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                      index === currentIndex
                        ? 'scale-110 shadow-[0_0_0_2px_rgba(214,180,124,0.6),0_0_18px_rgba(214,180,124,0.35)]'
                        : 'opacity-70 shadow-[0_8px_20px_rgba(0,0,0,0.55)] hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
<div className="group relative cursor-pointer" onClick={openModal}>
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#090f1b] shadow-[inset_0_0_18px_rgba(255,255,255,0.04)]">
          <img
           src={images[currentIndex]}
           alt={`${productName} - rasm ${currentIndex + 1}`}
           className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
         />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/48 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/48 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1 text-sm text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-7 flex space-x-2 overflow-x-auto pb-2 pt-1 pl-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                index === currentIndex
                  ? 'scale-110 shadow-[0_0_0_2px_rgba(214,180,124,0.58),0_0_18px_rgba(214,180,124,0.33)]'
                  : 'opacity-75 shadow-[0_10px_22px_rgba(0,0,0,0.45)] hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`${productName} Luxx.uz - thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <FullScreenModal />
    </>
  );
};

export default ImageCarousel;
