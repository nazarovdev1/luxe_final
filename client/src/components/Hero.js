import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Shield, Gem, Star, Truck } from 'lucide-react';

const Hero = () => {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const frameCount = 80;
  const animationFrameId = useRef(null);
  const currentFrameRef = useRef(0);



  // Generate frame URL
  const getFrameUrl = useCallback((index) => {
    const paddedIndex = index.toString().padStart(3, '0');
    return `/animatedimage/frame_${paddedIndex}.jpg`;
  }, []);

  // Preload all images for desktop
  useEffect(() => {
    if (!isDesktop) return;

    const images = [];
    let loadedCount = 0;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === frameCount) {
        imagesRef.current = images;
        setImagesLoaded(true);
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.onload = onImageLoad;
      img.onerror = onImageLoad;
      img.src = getFrameUrl(i);
      images.push(img);
    }

    return () => {
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [isDesktop, getFrameUrl]);

  // Draw frame on canvas with crossfade blending for smoothness
  const drawFrame = useCallback((frameIndex, blendAlpha = 0) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[frameIndex];
    const nextImg = imagesRef.current[Math.min(frameIndex + 1, frameCount - 1)];

    if (!canvas || !ctx || !img || !img.complete) return;

    // Set canvas size to viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Helper function to draw image with cover behavior
    const drawImageCover = (image, alpha = 1) => {
      const imgRatio = image.width / image.height;
      const canvasRatio = canvas.width / canvas.height;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = image.width * (canvas.height / image.height);
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = image.height * (canvas.width / image.width);
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw current frame
    drawImageCover(img, 1);

    // Blend with next frame for smooth transition
    if (blendAlpha > 0 && nextImg && nextImg.complete && frameIndex < frameCount - 1) {
      drawImageCover(nextImg, blendAlpha);
    }
  }, []);

  // Constant tempo animation with lerp (scroll sets target, animation plays at fixed 30fps)
  const targetFrameRef = useRef(0);
  const currentExactFrameRef = useRef(0);
  useEffect(() => {
    if (!isDesktop || !imagesLoaded) return;

    drawFrame(0);

    // Update target frame on scroll
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
      targetFrameRef.current = progress * (frameCount - 1);
      setScrollProgress(progress); // Update scroll progress for text animation
    };

    // Smooth animation loop - animates toward target frame with crossfade
    const animate = () => {
      const target = targetFrameRef.current;
      const current = currentExactFrameRef.current;

      // Smooth lerp toward target (0.15 = smoothing factor)
      const smoothing = 0.15;
      const newFrame = current + (target - current) * smoothing;

      // Only update if there's meaningful change
      if (Math.abs(newFrame - current) > 0.001) {
        currentExactFrameRef.current = newFrame;

        const frameIndex = Math.min(Math.floor(newFrame), frameCount - 1);
        const blendAlpha = newFrame - frameIndex;

        currentFrameRef.current = frameIndex;
        drawFrame(frameIndex, blendAlpha);
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationFrameId.current = requestAnimationFrame(animate);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop && imagesLoaded) {
        drawFrame(currentFrameRef.current);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isDesktop, imagesLoaded, drawFrame]);

  const heroFeatures = [
    { icon: Crown, label: 'QUALITY' },
    { icon: Truck, label: '3 SOAT ICHIDA YETKAZIB BERISH' },
    { icon: Shield, label: 'ISHONCHLI SERVIS' },
  ];

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{ height: isDesktop ? '200vh' : '100vh' }}
    >
      {/* Sticky wrapper for desktop */}
      <div
        className={isDesktop ? 'sticky top-0 h-screen overflow-hidden' : 'relative h-full overflow-hidden'}
      >
        {/* Background Image - Mobile */}
        <div
          className="absolute inset-0 bg-cover bg-top bg-no-repeat lg:hidden"
          style={{ backgroundImage: 'url("/heroimg.jpg")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0f]"></div>
        </div>

        {/* Animated Canvas Background - Desktop */}
        {isDesktop && (
          <div className="absolute inset-0 hidden lg:block">
            <div
              className={`absolute inset-0 bg-no-repeat`}
              style={{ backgroundImage: 'url("/heroimg.jpg")', backgroundSize: 'cover', backgroundPosition: '68% 22% !important' }}
            />
            {/* The canvas was removed/disabled temporarily or just rendered behind the primary static image */}
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05060b]/80 via-[#05060b]/45 to-[#05060b]/25"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#06070d] via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_40%,rgba(214,180,124,0.15),transparent_35%)]"></div>
          </div>
        )}

        {/* Floating Atmosphere */}
        <div className="absolute top-1/4 left-1/4 w-44 h-44 bg-[#d6b47c]/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[#324e86]/15 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-end">
          <div className="w-full px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 lg:pb-20">
            <div className="grid lg:grid-cols-[minmax(0,1.2fr)_350px] gap-6 items-end">
              <div className="max-w-4xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-neutral-200 animate-fade-in-up">
                  <Gem className="w-3.5 h-3.5 text-[#d6b47c]" />
                  LUXE Editorial Drop
                </p>

                <h1
                  className="mt-4 text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.88] tracking-tight uppercase animate-fade-in-up"
                  style={{ animationDelay: '0.1s' }}
                >
                  {'PREMIUM'.split('').map((letter, index) => {
                    const totalLetters = 11;
                    const letterProgress = Math.max(0, Math.min(1, (scrollProgress * totalLetters) - index));
                    const r = Math.round(244 - letterProgress * 20);
                    const g = Math.round(241 - letterProgress * 40);
                    const b = Math.round(235 - letterProgress * 70);
                    return (
                      <span
                        key={`p-${index}`}
                        style={{
                          color: `rgb(${r}, ${g}, ${b})`,
                          textShadow: letterProgress > 0.35 ? `0 0 28px rgba(214, 180, 124, ${letterProgress * 0.45})` : 'none',
                          transition: 'color 0.18s ease-out, text-shadow 0.2s ease-out'
                        }}
                      >
                        {letter}
                      </span>
                    );
                  })}
                  <br />
                  {'MODA'.split('').map((letter, index) => {
                    const totalLetters = 11;
                    const letterIndex = 7 + index;
                    const letterProgress = Math.max(0, Math.min(1, (scrollProgress * totalLetters) - letterIndex));
                    const r = Math.round(244 - letterProgress * 20);
                    const g = Math.round(241 - letterProgress * 40);
                    const b = Math.round(235 - letterProgress * 70);
                    return (
                      <span
                        key={`m-${index}`}
                        style={{
                          color: `rgb(${r}, ${g}, ${b})`,
                          textShadow: letterProgress > 0.35 ? `0 0 28px rgba(214, 180, 124, ${letterProgress * 0.45})` : 'none',
                          transition: 'color 0.18s ease-out, text-shadow 0.2s ease-out'
                        }}
                      >
                        {letter}
                      </span>
                    );
                  })}
                </h1>

                <p className="mt-5 max-w-2xl text-sm sm:text-base text-neutral-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Sifatni his qiladiganlar uchun yaratilgan kolleksiya. Premium mato, aniq siluet va e’tibor tortadigan obrazlar. Siz oddiy ko‘rinish uchun emas, ajralib turish uchun yaralgansiz.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <Link
                    to="/products"
                    className="inline-flex content-center items-center justify-center rounded-tr-[30px] rounded-bl-[30px] rounded-tl-none rounded-br-none border-2 border-black bg-white px-8 py-4 text-[14px] sm:text-[15px] font-semibold tracking-[0.08em] uppercase leading-none text-black hover:bg-neutral-100 transition-colors"
                  >
                    Kolleksiyani ko'rish
                  </Link>
                  <Link
                    to="/#home-lookbook"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-black/30 px-5 py-3 text-sm sm:text-base text-white hover:bg-black/45 transition-colors"
                  >
                    Lookbook
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3 max-w-xl lg:hidden">
                  {heroFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.label} className="rounded-xl border border-white/15 bg-black/35 p-2.5">
                        <Icon className="w-4 h-4 text-[#d6b47c]" />
                        <p className="mt-2 text-[11px] leading-tight text-neutral-200">{feature.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#06070d] via-[#06070d]/50 to-transparent pointer-events-none"></div>

        {/* Scroll Indicator */}
        {/* {isDesktop && (
          <div className="absolute bottom-8 right-10 z-20 hidden lg:block">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-3 bg-white/50 rounded-full animate-bounce"></div>
            </div>
          </div>
        )} */}
      </div>
    </section >
  );
};

export default Hero;
