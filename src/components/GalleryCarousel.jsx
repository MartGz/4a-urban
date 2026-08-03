import { useState, useEffect } from "react"
import { API_URL } from "../lib/api"

const GalleryCarousel = () => {
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/gallery`)
      .then((r) => r.json())
      .then((d) => setImages(Array.isArray(d) ? d : []))
      .catch(() => setImages([]))
  }, [])

  if (images.length === 0) return null

  const loop = [...images, ...images]
  const duration = Math.max(15, images.length * 4)

  return (
    <div className="overflow-hidden py-2">
      <div className="animate-marquee" style={{ animationDuration: `${duration}s` }}>
        {loop.map((img, i) => (
          <div
            key={`${img.id}-${i}`}
            className="w-52 h-52 sm:w-60 sm:h-60 shrink-0 rounded-[24px] overflow-hidden border border-white/10 relative group mx-2 bg-black/40"
          >
            <img
              src={`${API_URL}/api/gallery/${img.id}/image`}
              alt={img.caption || "4A Urban"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            {img.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-xs font-urban uppercase tracking-widest">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GalleryCarousel
