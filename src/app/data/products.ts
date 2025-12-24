export interface Product {
  id: string | number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  images: string[];
  category: string;
  categoryAr: string;
  rating: number;
  reviews: number;
  stock: number;
}

export const products: Product[] = [
  // Home & Kitchen Tools
  {
    id: 1,
    name: "Kitchen Tool Set 13 Pieces",
    nameAr: "مجموعة أدوات المطبخ 13 قطعة",
    description: "Complete kitchen tool set with non-stick handles, includes utensils for cooking and baking.",
    descriptionAr: "مجموعة أدوات مطبخ كاملة مع مقابض غير لاصقة، تشمل أدوات للطهي والخبز.",
    price: 24.99,
    images: [
      "https://images.unsplash.com/photo-1578500494198-246f612d03b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Home & Kitchen",
    categoryAr: "المنزل والمطبخ",
    rating: 4.6,
    reviews: 234,
    stock: 45
  },
  {
    id: 2,
    name: "Cleaning Brush Set 5 Pieces",
    nameAr: "مجموعة فرش التنظيف 5 قطع",
    description: "Durable cleaning brushes with ergonomic handles for all household cleaning needs.",
    descriptionAr: "فرش تنظيف متينة مع مقابض مريحة لجميع احتياجات التنظيف المنزلي.",
    price: 12.75,
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Home & Kitchen",
    categoryAr: "المنزل والمطبخ",
    rating: 4.4,
    reviews: 156,
    stock: 87
  },
  {
    id: 3,
    name: "Storage Container Set 6 Pieces",
    nameAr: "مجموعة صناديق التخزين 6 قطع",
    description: "Airtight storage containers perfect for kitchen organization and food preservation.",
    descriptionAr: "صناديق تخزين محكمة الغلق مثالية لتنظيم المطبخ والحفاظ على الطعام.",
    price: 18.99,
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Home & Kitchen",
    categoryAr: "المنزل والمطبخ",
    rating: 4.5,
    reviews: 198,
    stock: 63
  },
  
  // Travel Accessories
  {
    id: 4,
    name: "Travel Packing Cubes 8 Pieces",
    nameAr: "مكعبات تنظيم السفر 8 قطع",
    description: "Lightweight packing cubes with prints, perfect for organizing luggage and suitcases.",
    descriptionAr: "مكعبات تنظيم خفيفة الوزن مع طبعات، مثالية لتنظيم الأمتعة والحقائب.",
    price: 16.99,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Travel Accessories",
    categoryAr: "اكسسوارات السفر",
    rating: 4.7,
    reviews: 312,
    stock: 52
  },
  {
    id: 5,
    name: "Travel Bottles Set 10 Pieces",
    nameAr: "مجموعة قوارير السفر 10 قطع",
    description: "Leak-proof travel bottles with carrying case, TSA approved for air travel.",
    descriptionAr: "قوارير سفر مانعة للتسرب مع حقيبة حمل، معتمدة من إدارة الأمن النقل.",
    price: 19.99,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Travel Accessories",
    categoryAr: "اكسسوارات السفر",
    rating: 4.6,
    reviews: 287,
    stock: 38
  },
  {
    id: 6,
    name: "Travel Pillow Memory Foam",
    nameAr: "وسادة السفر بالرغوة",
    description: "Comfortable memory foam neck pillow with carry pouch for long flights and journeys.",
    descriptionAr: "وسادة عنق مريحة من رغوة الذاكرة مع حقيبة حمل للرحلات الطويلة.",
    price: 22.50,
    images: [
      "https://images.unsplash.com/photo-1584622181563-430f63602d4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Travel Accessories",
    categoryAr: "اكسسوارات السفر",
    rating: 4.5,
    reviews: 203,
    stock: 44
  },

  // Mobile Phone Accessories
  {
    id: 7,
    name: "Phone Case Protective Silicone",
    nameAr: "حافظة الهاتف السيليكون الواقية",
    description: "Durable silicone phone case with shock protection, available for all major phone models.",
    descriptionAr: "حافظة هاتف سيليكون متينة مع حماية من الصدمات، متوفرة لجميع نماذج الهاتف.",
    price: 7.99,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Mobile Accessories",
    categoryAr: "اكسسوارات الجوال",
    rating: 4.4,
    reviews: 521,
    stock: 156
  },
  {
    id: 8,
    name: "USB-C Charging Cable 2M",
    nameAr: "كابل شحن USB-C بطول 2 متر",
    description: "High-speed USB-C cable for fast charging and data transfer with durable braided design.",
    descriptionAr: "كابل USB-C عالي السرعة للشحن السريع ونقل البيانات مع تصميم محبوك متين.",
    price: 5.99,
    images: [
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Mobile Accessories",
    categoryAr: "اكسسوارات الجوال",
    rating: 4.5,
    reviews: 634,
    stock: 187
  },
  {
    id: 9,
    name: "Phone Stand Adjustable",
    nameAr: "حامل الهاتف القابل للتعديل",
    description: "Universal phone stand, angle adjustable for all devices, folds for portability.",
    descriptionAr: "حامل هاتف عالمي، قابل لتعديل الزاوية لجميع الأجهزة، قابل للطي للحمل.",
    price: 8.75,
    images: [
      "https://images.unsplash.com/photo-1617638924268-5e0b5a9d9c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Mobile Accessories",
    categoryAr: "اكسسوارات الجوال",
    rating: 4.6,
    reviews: 445,
    stock: 98
  },
  {
    id: 10,
    name: "Tempered Glass Screen Protector",
    nameAr: "واقي شاشة من الزجاج المقسى",
    description: "High hardness tempered glass screen protector with easy application kit.",
    descriptionAr: "واقي شاشة من الزجاج المقسى بقسوة عالية مع مجموعة التطبيق السهل.",
    price: 4.99,
    images: [
      "https://images.unsplash.com/photo-1511707267537-b85faf00021e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Mobile Accessories",
    categoryAr: "اكسسوارات الجوال",
    rating: 4.3,
    reviews: 723,
    stock: 213
  },
  {
    id: 11,
    name: "Portable Mobile Charger 20000mAh",
    nameAr: "شاحن محمول 20000 مللي أمبير",
    description: "Fast charging portable power bank with dual USB ports and LED display.",
    descriptionAr: "مصدر طاقة محمول للشحن السريع مع منافذ USB مزدوجة وشاشة LED.",
    price: 19.99,
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Mobile Accessories",
    categoryAr: "اكسسوارات الجوال",
    rating: 4.7,
    reviews: 512,
    stock: 67
  },

  // Card Games & Toys
  {
    id: 12,
    name: "UNO Card Game Classic",
    nameAr: "لعبة أونو الكلاسيكية",
    description: "Classic UNO card game for family fun, fun for all ages, easy to learn.",
    descriptionAr: "لعبة أونو الكلاسيكية للمتعة العائلية، ممتعة لجميع الأعمار، سهلة التعلم.",
    price: 9.99,
    images: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Games & Toys",
    categoryAr: "الألعاب والألعاب",
    rating: 4.5,
    reviews: 298,
    stock: 72
  },
  {
    id: 13,
    name: "Educational Card Game for Kids",
    nameAr: "لعبة بطاقات تعليمية للأطفال",
    description: "Fun learning card game teaching numbers, colors, and vocabulary for children.",
    descriptionAr: "لعبة بطاقات تعليمية ممتعة تعلم الأرقام والألوان والمفردات للأطفال.",
    price: 7.50,
    images: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Games & Toys",
    categoryAr: "الألعاب والألعاب",
    rating: 4.6,
    reviews: 187,
    stock: 94
  },
  {
    id: 14,
    name: "Memory Match Card Game",
    nameAr: "لعبة مطابقة الذاكرة",
    description: "Classic memory matching game that develops concentration and memory skills.",
    descriptionAr: "لعبة مطابقة الذاكرة الكلاسيكية التي تطور مهارات التركيز والذاكرة.",
    price: 6.99,
    images: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Games & Toys",
    categoryAr: "الألعاب والألعاب",
    rating: 4.4,
    reviews: 156,
    stock: 118
  },

  // Electronics & Smart Devices
  {
    id: 15,
    name: "LED Desk Lamp with USB Charging",
    nameAr: "مصباح مكتب LED مع شحن USB",
    description: "Adjustable LED desk lamp with USB charging port, eye-protecting technology.",
    descriptionAr: "مصباح مكتب LED قابل للتعديل مع منفذ شحن USB، تقنية حماية العين.",
    price: 15.99,
    images: [
      "https://images.unsplash.com/photo-1565636192335-14e9e4d13868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Electronics",
    categoryAr: "الإلكترونيات",
    rating: 4.6,
    reviews: 267,
    stock: 52
  },
  {
    id: 16,
    name: "Wireless Bluetooth Speaker",
    nameAr: "مكبر صوت لاسلكي بلوتوث",
    description: "Compact waterproof Bluetooth speaker with 10+ hour battery life.",
    descriptionAr: "مكبر صوت بلوتوث مضغوط مقاوم للماء مع بطارية لأكثر من 10 ساعات.",
    price: 21.50,
    images: [
      "https://images.unsplash.com/photo-1589003077984-894e133814c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Electronics",
    categoryAr: "الإلكترونيات",
    rating: 4.7,
    reviews: 389,
    stock: 41
  },
  {
    id: 17,
    name: "Wireless Mouse 2.4GHz",
    nameAr: "الفأرة اللاسلكية 2.4GHz",
    description: "Ergonomic wireless mouse with silent click, adjustable DPI for office use.",
    descriptionAr: "فأرة لاسلكية مريحة مع نقرات صامتة، DPI قابل للتعديل لاستخدام المكتب.",
    price: 9.99,
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Electronics",
    categoryAr: "الإلكترونيات",
    rating: 4.5,
    reviews: 478,
    stock: 103
  },
  {
    id: 18,
    name: "Mechanical Gaming Keyboard RGB",
    nameAr: "لوحة مفاتيح الألعاب الميكانيكية RGB",
    description: "Gaming keyboard with RGB lighting and mechanical switches for gaming and typing.",
    descriptionAr: "لوحة مفاتيح الألعاب مع إضاءة RGB ومفاتيح ميكانيكية للألعاب والكتابة.",
    price: 34.99,
    images: [
      "https://images.unsplash.com/photo-1587829191301-dcbb701d0b3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Electronics",
    categoryAr: "الإلكترونيات",
    rating: 4.7,
    reviews: 423,
    stock: 28
  },
  {
    id: 19,
    name: "Smart Watch Fitness Tracker",
    nameAr: "ساعة ذكية لتتبع اللياقة",
    description: "Smartwatch with heart rate monitor, sleep tracking, and multiple sports modes.",
    descriptionAr: "ساعة ذكية مع مراقب نبضات القلب وتتبع النوم وأوضاع رياضية متعددة.",
    price: 39.99,
    images: [
      "https://images.unsplash.com/photo-1505941335774-efc4cb1f1cf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Electronics",
    categoryAr: "الإلكترونيات",
    rating: 4.6,
    reviews: 356,
    stock: 24
  },
  {
    id: 20,
    name: "USB Hub 7-Port with Power",
    nameAr: "مركز USB 7 منافذ مع الطاقة",
    description: "High-speed USB 3.0 hub with individual power switches, perfect for workspace.",
    descriptionAr: "مركز USB 3.0 عالي السرعة مع مفاتيح طاقة فردية، مثالي لمساحة العمل.",
    price: 16.99,
    images: [
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    ],
    category: "Electronics",
    categoryAr: "الإلكترونيات",
    rating: 4.6,
    reviews: 289,
    stock: 45
  }
];
