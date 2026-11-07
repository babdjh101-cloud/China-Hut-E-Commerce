/**
 * China Hut E-Commerce Constants
 * Calming Luxury Botanical Visual Identity
 */

export const BRAND_CONFIG = {
  name: 'China Hut',
  tagline: 'সেরা পণ্য, সুলভ মূল্য',
  logoUrl: '/assets/images/logo/china_hut_logo.png',
  colors: {
    deepBurgundy: '#65051F',
    royalMaroon: '#850D22',
    luxuryGold: '#D6A638',
    champagneGold: '#E9CD78',
    warmIvory: '#FFF8ED',
    softCream: '#F3E9D7',
    darkText: '#20040B',
    mutedText: '#6B4F55',
  },
  contact: {
    phone: '+8801756702194',
    whatsapp: '8801756702194',
    whatsappDisplay: '+8801756702194',
    email: 'razibulh02@gmail.com',
    address: 'Mohiskhola, Narail, Bangladesh, 7500',
    googleMapsUrl: 'https://maps.google.com/?q=Mohiskhola,+Narail,+Bangladesh,+7500',
  },
  video: {
    heading: 'পণ্যটি সম্পর্কে বিস্তারিত দেখুন',
    subtitle: 'ভিডিওতে পণ্যটি সম্পর্কে আরও জানুন।',
    youtubeUrl: '', 
    mp4Url: '/assets/videos/products/southmoon_demo.mp4',
    thumbnailUrl: '/assets/images/products/southmoon_box_and_bottle.png',
  },
};

export const INITIAL_PRODUCT = {
  id: 'southmoon-lipoma-spray-50ml',
  name: 'SouthMoon Lipoma Removal Spray',
  slug: 'southmoon-lipoma-removal-spray',
  brand: 'SouthMoon',
  volume: '50ml / 1.69 fl oz',
  price: 830,
  originalPrice: 1050,
  baseDeliveryCharge: 0,
  stock: 250,
  isAvailable: true,
  sku: 'SM-LRS-50ML',
  packagingClaims: [
    'Nodular discomfort',
    'Fat lump removal',
    'Lipolysis',
  ],
  description:
    'SouthMoon Lipoma Removal Spray (50ml) ত্বকের বাহ্যিক নডুলার অস্বস্তি ও ফ্যাটি লাম্প পরিচর্যার একটি সুবিধাজনক ও মৃদু স্প্রে ফর্মুলেশন।',
  specifications: [
    { label: 'Brand', value: 'SouthMoon' },
    { label: 'Product Name', value: 'Lipoma Removal Spray' },
    { label: 'Net Volume', value: '50ml / 1.69 fl oz' },
    { label: 'Application', value: 'External Use Only (বাহ্যিক ব্যবহার)' },
    { label: 'Formulation', value: 'Gentle Topical Spray' },
    { label: 'Origin', value: 'Imported (China)' },
  ],
  usageInstructions: [
    'ব্যবহারের আগে ত্বক পরিষ্কার ও শুষ্ক করে নিন।',
    'বোতলটি আলতো করে ঝাঁকিয়ে নিন।',
    '১০-১৫ সেমি দূর থেকে দিনে ২-৩ বার স্প্রে করে আলতো ম্যাসাজ করুন।',
  ],
  legalDisclaimer:
    'গুরুত্বপূর্ণ তথ্য: এটি কোনো প্রেসক্রিপশন অ্যান্টিবায়োটিক বা সার্জিক্যাল বিকল্প নয়। পণ্যের প্যাকেজিংয়ে উল্লেখিত তথ্যানুযায়ী বাহ্যিক পরিচর্যার জন্য তৈরি।',
  primaryImage: '/assets/images/products/southmoon_box_and_bottle.png',
  images: [
    {
      id: 'img-box-bottle',
      url: '/assets/images/products/southmoon_box_and_bottle.png',
      alt: 'SouthMoon Lipoma Removal Spray 50ml Box and Bottle Set',
      title: 'বক্স ও স্প্রে বোতল (অফিসিয়াল সেট)',
      caption: 'SouthMoon 50ml Complete Package with Box & Spray Bottle',
    },
    {
      id: 'img-bottle-solo',
      url: '/assets/images/products/southmoon_bottle_solo.png',
      alt: 'SouthMoon Lipoma Removal Spray 50ml Solo Bottle View',
      title: '৫০ মিলি স্প্রে বোতল (ক্লোজ-আপ ভিউ)',
      caption: 'Compact 50ml / 1.69 fl oz Spray Bottle with Clear Protective Cap',
    },
  ],
};

export const ORDER_STATUS_LABELS: Record<string, { labelEn: string; labelBn: string; colorClass: string }> = {
  pending: { labelEn: 'Pending', labelBn: 'অপেক্ষমাণ', colorClass: 'bg-[#F3E9D7] text-[#65051F]' },
  confirmed: { labelEn: 'Confirmed', labelBn: 'নিশ্চিত', colorClass: 'bg-[#D6A638]/25 text-[#65051F]' },
  processing: { labelEn: 'Processing', labelBn: 'প্রক্রিয়াধীন', colorClass: 'bg-[#E9CD78]/40 text-[#65051F]' },
  shipped: { labelEn: 'Shipped', labelBn: 'কুরিয়ারে প্রেরিত', colorClass: 'bg-[#850D22]/20 text-[#65051F]' },
  delivered: { labelEn: 'Delivered', labelBn: 'ডেলিভার্ড', colorClass: 'bg-[#65051F] text-white' },
  cancelled: { labelEn: 'Cancelled', labelBn: 'বাতিল', colorClass: 'bg-rose-100 text-rose-800' },
};
