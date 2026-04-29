import React, { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Search, Loader2, Palette, Wand2, Image as ImageIcon } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const VisualSearch = ({ onClose }) => {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [palette, setPalette] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('upload')
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [])

  const processFile = (file) => {
    setImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
    setResults([])
    setPalette(null)
  }

  const startCamera = async () => {
    try {
      setMode('camera')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setMode('upload')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) {
        processFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }))
        stopCamera()
        setMode('upload')
      }
    }, 'image/jpeg', 0.8)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) processFile(file)
  }, [])

  const handleSearch = async () => {
    if (!image) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)

      const { data } = await axios.post('/api/visual-search/search', formData, {
        params: { limit: 12 }
      })

      if (data.success) {
        setResults(data.data)
        if (data.queryPalette) setPalette(data.queryPalette)
      }
    } catch (error) {
      console.error('Visual search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null)
    setPreview(null)
    setResults([])
    setPalette(null)
  }

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        processFile(item.getAsFile())
        break
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
      onPaste={handlePaste}
    >
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <Camera size={24} className="text-[#d6b47c]" />
            <div>
              <h2 className="text-white font-medium text-lg">Visual Qidiruv</h2>
              <p className="text-[#a0a0a0] text-sm">Rasm orqali qidirish</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#a0a0a0] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {!preview && mode === 'upload' && (
            <div
              className="border border-dashed border-[#404040] rounded-2xl p-16 text-center hover:border-[#d6b47c] transition-colors cursor-pointer bg-[#111111]"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex flex-col items-center gap-6">
                <ImageIcon size={48} className="text-[#d6b47c]" />
                <div>
                  <h3 className="text-white text-lg font-medium mb-1">Rasmni yuklang yoki bu yerga tashlang</h3>
                  <p className="text-[#707070] text-sm">O'zingizga yoqqan kiyimni rasmga oling va biz uni topamiz</p>
                </div>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Upload size={16} />
                    Fayl tanlash
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startCamera()
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-[#404040] text-white rounded-lg text-sm font-medium hover:border-white transition-colors"
                  >
                    <Camera size={16} />
                    Kamerani ochish
                  </button>
                </div>
                <p className="text-[#505050] text-xs mt-2 font-mono">
                  Ctrl+V bosib nusxalangan rasmni qo'yishingiz mumkin
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {mode === 'camera' && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-auto sm:h-[60vh] border border-[#2a2a2a]">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-black/50 flex justify-center gap-6 items-center">
                <button
                  onClick={() => {
                    stopCamera()
                    setMode('upload')
                  }}
                  className="px-5 py-2.5 bg-transparent border border-[#404040] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a2a] transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-transparent border-4 border-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-white" />
                </button>
                <div className="w-[105px]" />
              </div>
            </div>
          )}

          {preview && mode === 'upload' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 bg-[#111111] border border-[#2a2a2a] p-5 rounded-2xl">
                <div className="relative w-full sm:w-56 h-56 rounded-xl overflow-hidden flex-shrink-0 border border-[#2a2a2a]">
                  <img src={preview} alt="Search" className="w-full h-full object-cover" />
                  <button
                    onClick={reset}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-5">
                  {!results.length && !loading && (
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Rasm tayyor</h3>
                      <p className="text-[#a0a0a0] text-sm mb-5">Biz ushbu rasmdagi ranglar va uslubga mos kiyimlarni qidiramiz.</p>
                      <button
                        onClick={handleSearch}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#d6b47c] text-black rounded-lg font-medium hover:bg-[#c4a36b] transition-colors"
                      >
                        <Search size={18} />
                        Qidirishni boshlash
                      </button>
                    </div>
                  )}
                  {loading && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Loader2 size={20} className="animate-spin text-[#d6b47c]" />
                        <span className="text-white font-medium">Tahlil qilinmoqda...</span>
                      </div>
                      <div className="w-full max-w-xs h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#d6b47c] w-1/2 animate-[pulse_1s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  )}

                  {palette && (
                    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
                      <div className="flex items-center gap-2 mb-3">
                        <Palette size={16} className="text-[#d6b47c]" />
                        <span className="text-white text-sm">Asosiy ranglar</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {palette.map((color, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5">
                            <div
                              className="w-8 h-8 rounded-full border border-[#2a2a2a]"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-[#707070] text-[10px] font-mono">{color.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {results.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-medium text-lg flex items-center gap-2">
                      <Wand2 size={18} className="text-[#d6b47c]" />
                      {results.length} ta o'xshash mahsulot
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {results.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => {
                          onClose()
                          navigate(`/product/${product._id}`)
                        }}
                        className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden cursor-pointer hover:border-[#d6b47c] transition-colors group"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
                          <img
                            src={product.mainImage || product.images?.[0]?.url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.similarity && (
                            <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[#d6b47c] text-[10px] font-medium border border-[#2a2a2a]">
                              {Math.round(product.similarity * 100)}% mos
                            </div>
                          )}
                        </div>
                        <div className="p-3 border-t border-[#2a2a2a]">
                          <p className="text-white text-sm line-clamp-1 mb-1 group-hover:text-[#d6b47c] transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[#d6b47c] font-medium text-sm">
                            {product.price?.toLocaleString()} UZS
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VisualSearch