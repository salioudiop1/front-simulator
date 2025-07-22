import { useEffect } from 'react';

const usePreloadImages = (imagePaths = []) => {
  useEffect(() => {
    imagePaths.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [imagePaths]);
};

export default usePreloadImages;
