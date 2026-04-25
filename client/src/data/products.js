// Product data for the e-commerce website

// Product interface/structure
export const Product = {
  id: 0,
  name: '',
  category: '',
  price: '',
  image: '', // Main image
  images: [], // Multiple images array
  badge: '',
  originalPrice: '',
  rating: 0,
  colors: [],
  sizes: [],
  description: ''
};

// New Collection Products
export const newCollectionProducts = [
  {
    id: 1,
    name: "Futuristik Qora Kombinezon",
    category: "Kombinezonlar",
    price: "$299",
    originalPrice: "$399",
    image: "/luxury-black-jacket.jpg",
    images: ["/luxury-black-jacket.jpg"],
    badge: "NEW",
    rating: 4.8,
    colors: ["Qora", "Kulrang", "Oq"],
    sizes: ["S", "M", "L", "XL"],
    description: "Zamonaviy va qulay dizayn"
  },
  {
    id: 2,
    name: "Holografik Elegant Ko'ylak",
    category: "Ko'ylaklar",
    price: "$189",
    image: "/luxury-elegant-dress.jpg",
    images: ["/luxury-elegant-dress.jpg"],
    badge: "NEW",
    rating: 4.9,
    colors: ["Holografik", "Qizil", "Ko'k"],
    sizes: ["S", "M", "L"],
    description: "Elegant va nafis uslub"
  },
  {
    id: 3,
    name: "Premium Yumshoq Sviter",
    category: "Sviterlar",
    price: "$159",
    originalPrice: "$199",
    image: "/luxury-cozy-sweater.jpg",
    images: ["/luxury-cozy-sweater.jpg"],
    badge: "NEW",
    rating: 4.7,
    colors: ["Bej", "Kulrang", "Qizil"],
    sizes: ["S", "M", "L", "XL"],
    description: "Yumshoq va qulay material"
  },
  {
    id: 4,
    name: "Luxury Futuristik Tuflari",
    category: "Tuflilar",
    price: "$249",
    image: "/luxury-futuristic-boots.jpg",
    images: ["/luxury-futuristic-boots.jpg"],
    badge: "NEW",
    rating: 4.6,
    colors: ["Qora", "Kulrang"],
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    description: "Zamonaviy va qulay"
  }
];

// Bestseller Products
export const bestsellerProducts = [
  {
    id: 5,
    name: "Modern Klassik Blazer",
    category: "Blazerlar",
    price: "$279",
    image: "/luxury-tailored-blazer.jpg",
    images: ["/luxury-tailored-blazer.jpg"],
    badge: "BESTSELLER",
    rating: 4.9,
    colors: ["Qora", "Kulrang", "Ko'k"],
    sizes: ["S", "M", "L", "XL"],
    description: "Ish uchun ideal tanasi"
  },
  {
    id: 6,
    name: "Premium Elegant Yubka",
    category: "Yubkalar",
    price: "$129",
    image: "/luxury-elegant-skirt.jpg",
    images: ["/luxury-elegant-skirt.jpg"],
    badge: "BESTSELLER",
    rating: 4.8,
    colors: ["Qora", "Bej", "Ko'k"],
    sizes: ["S", "M", "L"],
    description: "Elegant va nafis"
  },
  {
    id: 7,
    name: "Futuristik Premium Palto",
    category: "Paltolar",
    price: "$399",
    image: "/luxury-premium-coat.jpg",
    images: ["/luxury-premium-coat.jpg"],
    badge: "BESTSELLER",
    rating: 4.9,
    colors: ["Bej", "Qora"],
    sizes: ["S", "M", "L", "XL"],
    description: "Qish uchun eng yaxshi tanas"
  },
  {
    id: 8,
    name: "Modern Elegant Shalvar",
    category: "Shalvarlar",
    price: "$179",
    image: "/luxury-modern-pants.jpg",
    images: ["/luxury-modern-pants.jpg"],
    badge: "BESTSELLER",
    rating: 4.7,
    colors: ["Qora", "Kulrang", "Bej"],
    sizes: ["S", "M", "L", "XL"],
    description: "Zamonaviy va qulay"
  }
];
