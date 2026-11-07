import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Search,
  Phone,
  MessageCircle,
  RefreshCw,
  LogOut,
  Lock,
  Mail,
  Shield,
  Eye,
  ChevronDown,
  Layers,
  ArrowLeft,
  DollarSign,
  Video,
  Plus,
  Trash2,
  Edit,
  Upload,
  Play,
  Settings as SettingsIcon,
  ShoppingBag,
  ExternalLink,
  Film,
  Check,
  Pause,
  SlidersHorizontal,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getSupabaseStatus } from '../../lib/supabase';
import { Order, OrderStatus, Product, VideoItem, VideoCategory } from '../../types';
import { fetchAdminOrders, updateOrderStatus } from '../../services/orderService';
import {
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../../services/productService';
import {
  fetchAllVideos,
  createVideo,
  publishVideo,
  unpublishVideo,
  deleteVideo,
  uploadVideoFile,
} from '../../services/videoService';
import { formatBDT, toBengaliNumber } from '../../lib/currency';
import { BRAND_CONFIG, ORDER_STATUS_LABELS } from '../../config/constants';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'dashboard' | 'products' | 'videos' | 'orders' | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Authentication
  const [sessionUser, setSessionUser] = useState<{ email: string; id: string } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'SouthMoon',
    volume: '50ml / 1.69 fl oz',
    price: 830,
    originalPrice: 1050,
    deliveryCharge: 0,
    stock: 250,
    isAvailable: true,
    sku: 'SM-LRS-50ML',
    description: '',
    imageUrl: '',
  });
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [productActionSuccess, setProductActionSuccess] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Videos State
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoForm, setVideoForm] = useState<{
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    category: VideoCategory;
    isPublished: boolean;
  }>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: 'product',
    isPublished: false,
  });
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [videoActionSuccess, setVideoActionSuccess] = useState('');

  // 1. Session check on mount
  useEffect(() => {
    if (!isOpen) return;

    async function checkAuth() {
      setIsLoadingAuth(true);
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setSessionUser({
              email: data.session.user.email || 'Admin',
              id: data.session.user.id,
            });
            loadAllData();
          } else {
            setSessionUser(null);
          }
        } catch (err) {
          console.warn('Session check warning:', err);
        }
      }
      setIsLoadingAuth(false);
    }

    checkAuth();
  }, [isOpen]);

  const loadAllData = async () => {
    loadOrders();
    loadProducts();
    loadVideos();
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const list = await fetchAdminOrders();
      setOrders(list);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const list = await fetchAllProducts();
      setProducts(list);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const list = await fetchAllVideos();
      setVideos(list);
    } catch (err) {
      console.error('Error loading videos:', err);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    if (!isSupabaseConfigured || !supabase) {
      setAuthError('Supabase credentials not configured in environment.');
      setIsLoggingIn(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        setAuthError(error.message || 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');
        setIsLoggingIn(false);
        return;
      }

      if (data.user) {
        setSessionUser({
          email: data.user.email || loginEmail,
          id: data.user.id,
        });
        loadAllData();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে।';
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSessionUser(null);
  };

  // Order Handlers
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
    setUpdatingOrderId(null);
  };

  // Product Handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'SouthMoon',
      volume: '50ml / 1.69 fl oz',
      price: 830,
      originalPrice: 1050,
      deliveryCharge: 0,
      stock: 250,
      isAvailable: true,
      sku: `SM-LRS-${Math.floor(100 + Math.random() * 900)}`,
      description: 'SouthMoon Lipoma Removal Spray (50ml) ত্বকের বাহ্যিক নডুলার অস্বস্তি ও ফ্যাটি লাম্প পরিচর্যার একটি সুবিধাজনক ও মৃদু স্প্রে ফর্মুলেশন।',
      imageUrl: '/assets/images/products/southmoon_box_and_bottle.png',
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      volume: prod.volume,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price + 500,
      deliveryCharge: prod.deliveryCharge,
      stock: prod.stock,
      isAvailable: prod.isAvailable,
      sku: prod.sku,
      description: prod.description,
      imageUrl: prod.images[0]?.url || '/assets/images/products/southmoon_box_and_bottle.png',
    });
    setIsProductModalOpen(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProductImage(true);
    try {
      const url = await uploadProductImage(file);
      setProductForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploadingProductImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    const images = [
      {
        id: `img-${Date.now()}`,
        productId: editingProduct?.id || 'prod-custom',
        url: productForm.imageUrl || '/assets/images/products/southmoon_box_and_bottle.png',
        altText: productForm.name,
        isPrimary: true,
        displayOrder: 0,
      },
    ];

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        volume: productForm.volume.trim(),
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        deliveryCharge: Number(productForm.deliveryCharge),
        stock: Number(productForm.stock),
        isAvailable: Boolean(productForm.isAvailable),
        sku: productForm.sku.trim(),
        description: productForm.description.trim(),
        images,
      });
      setProductActionSuccess('পণ্য সফলভাবে আপডেট করা হয়েছে!');
    } else {
      const slug = productForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50);
      const newId = `prod-${Date.now()}`;
      await createProduct({
        id: newId,
        name: productForm.name.trim(),
        slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
        brand: productForm.brand.trim(),
        volume: productForm.volume.trim(),
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        deliveryCharge: Number(productForm.deliveryCharge),
        stock: Number(productForm.stock),
        isAvailable: Boolean(productForm.isAvailable),
        sku: productForm.sku.trim(),
        packagingClaims: ['Nodular discomfort', 'Fat lump removal', 'Lipolysis'],
        description: productForm.description.trim(),
        specifications: [
          { label: 'Brand', value: productForm.brand },
          { label: 'Volume', value: productForm.volume },
          { label: 'Origin', value: 'Imported' },
        ],
        usageInstructions: [
          'ব্যবহারের আগে ত্বক পরিষ্কার ও শুষ্ক করে নিন।',
          '১০-১৫ সেমি দূর থেকে দিনে ২-৩ বার স্প্রে করুন।',
        ],
        images,
      });
      setProductActionSuccess('নতুন পণ্য সফলভাবে যুক্ত করা হয়েছে!');
    }

    setIsProductModalOpen(false);
    loadProducts();
    setTimeout(() => setProductActionSuccess(''), 4000);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete.id);
    setProductToDelete(null);
    setProductActionSuccess('পণ্যটি সফলভাবে মুছে ফেলা হয়েছে!');
    loadProducts();
    setTimeout(() => setProductActionSuccess(''), 4000);
  };

  // Video Handlers
  const openAddVideoModal = () => {
    setVideoForm({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '/assets/images/products/southmoon_box_and_bottle.png',
      category: 'product',
      isPublished: false,
    });
    setUploadProgress(0);
    setIsVideoModalOpen(true);
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('mp4') && !file.name.endsWith('.mp4')) {
      alert('অনুগ্রহ করে শুধুমাত্র MP4 ফরম্যাটের ভিডিও নির্বাচন করুন।');
      return;
    }

    setIsUploadingVideo(true);
    setUploadProgress(10);
    try {
      const result = await uploadVideoFile(file, (p) => setUploadProgress(p));
      setVideoForm((prev) => ({
        ...prev,
        videoUrl: result.url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
      setUploadProgress(100);
    } catch (err) {
      console.error('Video upload failed:', err);
      alert('ভিডিও আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.videoUrl.trim()) return;

    await createVideo({
      title: videoForm.title.trim(),
      description: videoForm.description.trim(),
      videoUrl: videoForm.videoUrl.trim(),
      thumbnailUrl: videoForm.thumbnailUrl.trim(),
      category: videoForm.category,
      isPublished: videoForm.isPublished,
    });

    setIsVideoModalOpen(false);
    setVideoActionSuccess('ভিডিও সফলভাবে সংরক্ষিত হয়েছে!');
    loadVideos();
    setTimeout(() => setVideoActionSuccess(''), 4000);
  };

  const handleTogglePublishVideo = async (vid: VideoItem) => {
    if (vid.isPublished) {
      await unpublishVideo(vid.id);
      setVideoActionSuccess(`'${vid.title}' আনপাবলিশ করা হয়েছে।`);
    } else {
      await publishVideo(vid.id);
      setVideoActionSuccess(`'${vid.title}' মূল ওয়েবসাইটে পাবলিশ করা হয়েছে!`);
    }
    loadVideos();
    setTimeout(() => setVideoActionSuccess(''), 4000);
  };

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    await deleteVideo(videoToDelete.id, videoToDelete.videoUrl);
    setVideoToDelete(null);
    setVideoActionSuccess('ভিডিও সফলভাবে ডিলিট করা হয়েছে!');
    loadVideos();
    setTimeout(() => setVideoActionSuccess(''), 4000);
  };

  if (!isOpen) return null;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const query = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.phone.includes(query) ||
      o.address.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Analytics Metrics
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0),
    0
  );
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const publishedVideo = videos.find((v) => v.isPublished);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#FFF8ED] sm:bg-black/75 sm:backdrop-blur-sm flex justify-center items-center sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFF8ED] text-[#20040B] w-full h-full sm:h-[95vh] sm:max-h-[900px] sm:max-w-6xl sm:rounded-3xl border-0 sm:border-2 sm:border-[#D6A638]/50 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="bg-[#65051F] text-[#FFF8ED] px-4 sm:px-6 py-3 border-b border-[#D6A638]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8ED] p-1 flex items-center justify-center border border-[#D6A638] shrink-0">
              <img
                src={BRAND_CONFIG.logoUrl}
                alt="China Hut"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  China Hut Admin Portal
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D6A638] text-[#65051F]">
                  /admin
                </span>
              </div>
              <p className="text-[11px] text-[#E9CD78]">
                {sessionUser ? sessionUser.email : 'প্রবেশদ্বার'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-[#D6A638] hover:bg-[#E9CD78] text-[#65051F] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="ওয়েবসাইটে ফিরে যান"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ওয়েবসাইটে যান</span>
            </button>
            {sessionUser && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFF8ED] text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/20 cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5 text-[#E9CD78]" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Global Success Banner */}
        {(productActionSuccess || videoActionSuccess) && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{productActionSuccess || videoActionSuccess}</span>
            </div>
            <button
              onClick={() => {
                setProductActionSuccess('');
                setVideoActionSuccess('');
              }}
              className="p-1 hover:bg-emerald-700 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {isLoadingAuth ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#65051F] p-8">
              <div className="w-8 h-8 border-3 border-[#65051F]/30 border-t-[#65051F] rounded-full animate-spin" />
              <span className="text-sm font-bold">অথেন্টিকেশন যাচাই করা হচ্ছে...</span>
            </div>
          ) : !sessionUser ? (
            /* Login Screen */
            <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
              <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D6A638]/40 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-[#65051F] text-[#D6A638] flex items-center justify-center mx-auto border-2 border-[#D6A638] shadow-md">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black font-display text-[#65051F]">
                    অ্যাডমিন লগইন
                  </h3>
                  <p className="text-xs text-[#6B4F55]">
                    অর্ডার, প্রোডাক্ট ও ভিডিও কন্ট্রোল করতে Supabase অ্যাডমিন ক্রেডেনশিয়াল দিন।
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#65051F] mb-1">
                      ইমেইল ঠিকানা
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="babdjh101@gmail.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E9CD78] text-xs sm:text-sm focus:border-[#65051F] focus:outline-none bg-[#FFF8ED]/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#65051F] mb-1">
                      পাসওয়ার্ড
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E9CD78] text-xs sm:text-sm focus:border-[#65051F] focus:outline-none bg-[#FFF8ED]/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 rounded-xl font-black text-sm text-[#FFF8ED] bg-[#65051F] hover:bg-[#850D22] shadow-md border border-[#D6A638]/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>যাচাই হচ্ছে...</span>
                      </>
                    ) : (
                      <span>লগইন করুন</span>
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center border-t border-[#E9CD78]/40">
                  <span className="text-[11px] text-[#6B4F55]">
                    🔒 Supabase PostgreSQL RLS সুরক্ষিত
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Logged-In Admin Layout with 5 Sidebar Tabs */
            <>
              {/* Sidebar Navigation */}
              <aside className="w-full md:w-56 bg-[#F3E9D7] border-b md:border-b-0 md:border-r border-[#D6A638]/40 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible shrink-0">
                {[
                  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: TrendingUp },
                  { id: 'products', label: 'প্রোডাক্টস', icon: ShoppingBag, count: products.length },
                  { id: 'videos', label: 'ভিডিও ম্যানেজমেন্ট', icon: Film, count: videos.length },
                  { id: 'orders', label: 'অর্ডার তালিকা', icon: Package, count: pendingOrders.length },
                  { id: 'settings', label: 'সেটিংস', icon: SettingsIcon },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as AdminTab)}
                      className={`flex-1 md:flex-none flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#65051F] text-[#FFF8ED] shadow-xs'
                          : 'text-[#65051F] hover:bg-[#EADBC5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#D6A638]' : 'text-[#65051F]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive
                              ? 'bg-[#D6A638] text-[#65051F]'
                              : 'bg-white/80 text-[#65051F] border border-[#D6A638]/40'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </aside>

              {/* Tab Content Body */}
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FFF8ED] space-y-6">
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black font-display text-[#65051F]">
                          ড্যাশবোর্ড ওভারভিউ
                        </h3>
                        <p className="text-xs text-[#6B4F55]">
                          China Hut স্টোরের সাম্প্রতিক পারফরম্যান্স ও পরিসংখ্যান।
                        </p>
                      </div>
                      <button
                        onClick={loadAllData}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#D6A638] text-xs font-bold text-[#65051F] hover:bg-[#F3E9D7] flex items-center gap-2 self-start cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#D6A638]" />
                        <span>ডাটা রিফ্রেশ করুন</span>
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-[#D6A638]/50 shadow-xs">
                        <span className="text-[11px] font-bold text-[#6B4F55] uppercase block">
                          মোট অর্ডার
                        </span>
                        <span className="text-2xl font-black text-[#65051F] font-mono mt-1 block">
                          {orders.length}
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-[#D6A638]/50 shadow-xs">
                        <span className="text-[11px] font-bold text-[#850D22] uppercase block">
                          অপেক্ষমাণ (Pending)
                        </span>
                        <span className="text-2xl font-black text-[#850D22] font-mono mt-1 block">
                          {pendingOrders.length}
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-[#D6A638]/50 shadow-xs">
                        <span className="text-[11px] font-bold text-emerald-700 uppercase block">
                          ডেলিভার্ড
                        </span>
                        <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                          {deliveredOrders.length}
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-[#D6A638]/50 shadow-xs">
                        <span className="text-[11px] font-bold text-[#65051F] uppercase block">
                          মোট বিক্রয় বিল
                        </span>
                        <span className="text-xl font-black text-[#65051F] font-mono mt-1 block">
                          {formatBDT(totalRevenue)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Highlights: Active Product & Published Video */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Active Product Card */}
                      <div className="bg-[#F3E9D7] p-4 rounded-2xl border border-[#D6A638]/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#65051F] flex items-center gap-1.5">
                            <ShoppingBag className="w-4 h-4 text-[#D6A638]" /> সক্রিয় প্রোডাক্ট
                          </span>
                          <button
                            onClick={() => setActiveTab('products')}
                            className="text-[11px] text-[#65051F] font-bold underline cursor-pointer"
                          >
                            ম্যানেজ করুন ↗
                          </button>
                        </div>
                        {products[0] ? (
                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E9CD78]">
                            <img
                              src={products[0].images[0]?.url || '/assets/images/products/southmoon_box_and_bottle.png'}
                              alt={products[0].name}
                              className="w-12 h-12 object-contain rounded-lg border border-stone-200"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-[#20040B] truncate">
                                {products[0].name}
                              </h4>
                              <p className="text-[11px] font-mono text-[#65051F] font-bold">
                                মূল্য: {formatBDT(products[0].price)} · স্টক: {products[0].stock} পিস
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-500">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
                        )}
                      </div>

                      {/* Published Video Card */}
                      <div className="bg-[#F3E9D7] p-4 rounded-2xl border border-[#D6A638]/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#65051F] flex items-center gap-1.5">
                            <Film className="w-4 h-4 text-[#D6A638]" /> ওয়েবসাইটে প্রকাশিত ভিডিও
                          </span>
                          <button
                            onClick={() => setActiveTab('videos')}
                            className="text-[11px] text-[#65051F] font-bold underline cursor-pointer"
                          >
                            ম্যানেজ করুন ↗
                          </button>
                        </div>
                        {publishedVideo ? (
                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E9CD78]">
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white shrink-0">
                              <Play className="w-5 h-5 fill-white text-[#D6A638]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-[#20040B] truncate">
                                {publishedVideo.title}
                              </h4>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                বর্তমানে সক্রিয় MP4
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-500">কোনো ভিডিও পাবলিশ করা নেই।</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PRODUCT MANAGEMENT TAB */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black font-display text-[#65051F]">
                          প্রোডাক্ট ম্যানেজমেন্ট
                        </h3>
                        <p className="text-xs text-[#6B4F55]">
                          নতুন প্রোডাক্ট যোগ করুন, মূল্য, স্টক এবং ছবি হালনাগাদ করুন।
                        </p>
                      </div>
                      <button
                        onClick={openAddProductModal}
                        className="px-4 py-2.5 rounded-xl bg-[#65051F] hover:bg-[#850D22] text-[#FFF8ED] text-xs font-bold transition-all flex items-center gap-2 self-start cursor-pointer shadow-sm border border-[#D6A638]/40"
                      >
                        <Plus className="w-4 h-4 text-[#D6A638]" />
                        <span>নতুন প্রোডাক্ট যোগ করুন</span>
                      </button>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-white rounded-2xl border border-[#D6A638]/50 p-4 shadow-xs space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="relative aspect-square max-h-48 rounded-xl bg-[#FFF8ED] border border-[#E9CD78] overflow-hidden flex items-center justify-center p-2">
                              <img
                                src={prod.images[0]?.url || '/assets/images/products/southmoon_box_and_bottle.png'}
                                alt={prod.name}
                                className="max-h-full max-w-full object-contain"
                              />
                              <div className="absolute top-2 left-2 flex gap-1">
                                {prod.isAvailable ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                                    সক্রিয় (Active)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-500 text-white shadow-xs">
                                    নিষ্ক্রিয় (Inactive)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-black text-sm text-[#20040B] line-clamp-1">
                                {prod.name}
                              </h4>
                              <p className="text-[11px] text-[#6B4F55] font-medium line-clamp-2 mt-0.5">
                                {prod.description}
                              </p>
                            </div>

                            <div className="bg-[#F3E9D7] p-2.5 rounded-xl text-xs space-y-1 font-mono">
                              <div className="flex justify-between">
                                <span className="text-[#6B4F55]">বিক্রয় মূল্য:</span>
                                <span className="font-bold text-[#65051F]">{formatBDT(prod.price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#6B4F55]">বর্তমান স্টক:</span>
                                <span className="font-bold text-[#20040B]">{prod.stock} পিস</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#6B4F55]">ডেলিভারি চার্জ:</span>
                                <span>{formatBDT(prod.deliveryCharge)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-[#E9CD78]/40">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-[#F3E9D7] hover:bg-[#EADBC5] text-[#65051F] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>সম্পাদনা</span>
                            </button>
                            <button
                              onClick={() => setProductToDelete(prod)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                              title="ডিলিট করুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. VIDEO MANAGEMENT TAB */}
                {activeTab === 'videos' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black font-display text-[#65051F]">
                          ভিডিও ম্যানেজমেন্ট
                        </h3>
                        <p className="text-xs text-[#6B4F55]">
                          MP4 ভিডিও আপলোড করুন, প্রিভিউ দেখুন এবং মূল ওয়েবসাইটে পাবলিশ করুন।
                        </p>
                      </div>
                      <button
                        onClick={openAddVideoModal}
                        className="px-4 py-2.5 rounded-xl bg-[#65051F] hover:bg-[#850D22] text-[#FFF8ED] text-xs font-bold transition-all flex items-center gap-2 self-start cursor-pointer shadow-sm border border-[#D6A638]/40"
                      >
                        <Upload className="w-4 h-4 text-[#D6A638]" />
                        <span>নতুন MP4 ভিডিও আপলোড</span>
                      </button>
                    </div>

                    {/* Videos Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((vid) => (
                        <div
                          key={vid.id}
                          className="bg-white rounded-2xl border border-[#D6A638]/50 p-4 shadow-xs space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            {/* Video Preview Box */}
                            <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center group">
                              <video
                                src={vid.videoUrl}
                                poster={vid.thumbnailUrl || '/assets/images/products/southmoon_box_and_bottle.png'}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => setPreviewVideo(vid)}
                                className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center text-white transition-all cursor-pointer"
                              >
                                <div className="w-10 h-10 rounded-full bg-[#D6A638] text-[#65051F] flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-[#65051F] ml-0.5" />
                                </div>
                              </button>
                              <div className="absolute top-2 left-2">
                                {vid.isPublished ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                                    ওয়েবসাইটে লাইভ (Published)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-600 text-white shadow-xs">
                                    ড্রাফট (Unpublished)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-black text-sm text-[#20040B] line-clamp-1">
                                {vid.title}
                              </h4>
                              {vid.description && (
                                <p className="text-[11px] text-[#6B4F55] line-clamp-2 mt-0.5">
                                  {vid.description}
                                </p>
                              )}
                              <span className="inline-block mt-1 text-[10px] font-mono bg-[#F3E9D7] text-[#65051F] px-2 py-0.5 rounded-md font-bold">
                                {vid.category === 'product' ? 'পণ্য ভিডিও' : 'প্রচারমূলক ভিডিও'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-[#E9CD78]/40">
                            <button
                              onClick={() => handleTogglePublishVideo(vid)}
                              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                vid.isPublished
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {vid.isPublished ? 'আনপাবলিশ' : 'ওয়েবসাইটে পাবলিশ করুন'}
                            </button>
                            <button
                              onClick={() => setVideoToDelete(vid)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                              title="ভিডিও ডিলিট করুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. ORDER MANAGEMENT TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black font-display text-[#65051F]">
                          গ্রাহক অর্ডার তালিকা
                        </h3>
                        <p className="text-xs text-[#6B4F55]">
                          সকল অর্ডারের লাইভ স্ট্যাটাস আপডেট ও গ্রাহক যোগাযোগ।
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={loadOrders}
                          className="px-3.5 py-2 rounded-xl bg-white border border-[#D6A638] text-xs font-bold text-[#65051F] hover:bg-[#F3E9D7] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                          <span>রিফ্রেশ</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          placeholder="অর্ডার আইডি, নাম বা ফোন নম্বর খুঁজুন..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9CD78] bg-white text-xs focus:border-[#65051F] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                        {[
                          { id: 'all', label: 'সকল' },
                          { id: 'pending', label: 'অপেক্ষমাণ' },
                          { id: 'confirmed', label: 'নিশ্চিত' },
                          { id: 'shipped', label: 'কুরিয়ার' },
                          { id: 'delivered', label: 'ডেলিভার্ড' },
                          { id: 'cancelled', label: 'বাতিল' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setOrderStatusFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              orderStatusFilter === tab.id
                                ? 'bg-[#65051F] text-[#FFF8ED]'
                                : 'bg-[#F3E9D7] text-[#65051F] hover:bg-[#EADBC5]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-2xl border border-[#D6A638]/40 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F3E9D7] text-[#65051F] border-b border-[#E9CD78]/60 font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                              <th className="py-3 px-3.5">অর্ডার আইডি</th>
                              <th className="py-3 px-3.5">গ্রাহক</th>
                              <th className="py-3 px-3.5">ঠিকানা</th>
                              <th className="py-3 px-3.5">পরিমাণ ও বিল</th>
                              <th className="py-3 px-3.5">স্ট্যাটাস</th>
                              <th className="py-3 px-3.5 text-right">রশিদ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F3E9D7]">
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-[#6B4F55]">
                                  কোনো অর্ডার পাওয়া যায়নি।
                                </td>
                              </tr>
                            ) : (
                              filteredOrders.map((ord) => {
                                const statusMeta = ORDER_STATUS_LABELS[ord.status] || {
                                  labelBn: ord.status,
                                  colorClass: 'bg-stone-100 text-stone-700',
                                };
                                return (
                                  <tr key={ord.id} className="hover:bg-[#FFF8ED]/60 transition-colors">
                                    <td className="py-3 px-3.5 font-mono font-bold text-[#65051F]">
                                      <span>{ord.orderNumber}</span>
                                      <span className="block text-[10px] text-[#6B4F55] font-sans font-normal mt-0.5">
                                        {new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3.5">
                                      <span className="font-bold text-[#20040B] block">{ord.customerName}</span>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <a
                                          href={`tel:${ord.phone}`}
                                          className="text-[11px] font-mono text-[#65051F] hover:underline flex items-center gap-0.5"
                                        >
                                          <Phone className="w-2.5 h-2.5 text-[#D6A638]" /> {ord.phone}
                                        </a>
                                        <a
                                          href={`https://wa.me/88${ord.phone.replace(/[^0-9]/g, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1 rounded bg-[#25D366] text-white hover:opacity-90"
                                          title="WhatsApp মেসেজ দিন"
                                        >
                                          <MessageCircle className="w-2.5 h-2.5 fill-white text-[#25D366]" />
                                        </a>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3.5 max-w-[200px]">
                                      <span className="text-[#6B4F55] line-clamp-2">{ord.address}</span>
                                    </td>
                                    <td className="py-3 px-3.5 font-mono">
                                      <span className="font-bold text-[#65051F]">
                                        {toBengaliNumber(ord.quantity)} বোতল
                                      </span>
                                      <span className="block font-black text-xs text-[#20040B] mt-0.5">
                                        {formatBDT(ord.totalAmount)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3.5">
                                      <select
                                        value={ord.status}
                                        disabled={updatingOrderId === ord.id}
                                        onChange={(e) =>
                                          handleStatusChange(ord.id, e.target.value as OrderStatus)
                                        }
                                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border border-[#D6A638]/40 focus:outline-none cursor-pointer ${statusMeta.colorClass}`}
                                      >
                                        <option value="pending">অপেক্ষমাণ (Pending)</option>
                                        <option value="confirmed">নিশ্চিত (Confirmed)</option>
                                        <option value="processing">প্রক্রিয়াধীন (Processing)</option>
                                        <option value="shipped">কুরিয়ারে প্রেরিত (Shipped)</option>
                                        <option value="delivered">ডেলিভার্ড (Delivered)</option>
                                        <option value="cancelled">বাতিল (Cancelled)</option>
                                      </select>
                                    </td>
                                    <td className="py-3 px-3.5 text-right">
                                      <button
                                        onClick={() => setSelectedOrder(ord)}
                                        className="px-2.5 py-1 rounded-lg bg-[#F3E9D7] hover:bg-[#EADBC5] text-[#65051F] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>রশিদ</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black font-display text-[#65051F]">
                        সিস্টেম ও ব্র্যান্ড সেটিংস
                      </h3>
                      <p className="text-xs text-[#6B4F55]">
                        China Hut স্টোরের ডেভলপমেন্ট ও ডাটাবেজ ইন্টিগ্রেশন স্ট্যাটাস।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Supabase Connection Details */}
                      <div className="bg-white p-5 rounded-2xl border border-[#D6A638]/50 shadow-xs space-y-3">
                        <h4 className="font-bold text-sm text-[#65051F] flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#D6A638]" /> Supabase সংযোগ স্থিতি
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">প্রজেক্ট ইউআরএল:</span>
                            <span className="font-mono font-bold text-[#20040B] truncate max-w-[200px]">
                              {getSupabaseStatus().url}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">পাবলিক Anon কী:</span>
                            <span className="font-bold text-emerald-700">সংযুক্ত (Active)</span>
                          </div>
                          <div className="flex justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">বর্তমান অ্যাডমিন আইডি:</span>
                            <span className="font-mono text-[11px] text-[#65051F] truncate max-w-[180px]">
                              {sessionUser?.id || 'a6fd20fa-169c-4eef-bab8-c1342094cba0'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Brand & Store Contact Info */}
                      <div className="bg-white p-5 rounded-2xl border border-[#D6A638]/50 shadow-xs space-y-3">
                        <h4 className="font-bold text-sm text-[#65051F] flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-[#D6A638]" /> যোগাযোগের তথ্য
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">হটলাইন / WhatsApp:</span>
                            <span className="font-mono font-bold text-[#20040B]">
                              {BRAND_CONFIG.contact.whatsappDisplay}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">সাপোর্ট ইমেইল:</span>
                            <span className="font-bold text-[#20040B]">
                              {BRAND_CONFIG.contact.email}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">ঠিকানা:</span>
                            <span className="font-medium text-right max-w-[200px]">
                              {BRAND_CONFIG.contact.address}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </>
          )}
        </div>

        {/* --- MODALS --- */}

        {/* 1. Add / Edit Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#FFF8ED] rounded-3xl max-w-lg w-full p-6 border-2 border-[#D6A638] shadow-2xl relative my-8">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F3E9D7] text-[#65051F]"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-black text-lg text-[#65051F] border-b border-[#E9CD78]/60 pb-2">
                {editingProduct ? 'প্রোডাক্ট সম্পাদনা করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}
              </h4>

              <form onSubmit={handleSaveProduct} className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#65051F] mb-1">প্রোডাক্টের নাম *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="SouthMoon Lipoma Removal Spray"
                    className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#65051F] mb-1">বিক্রয় মূল্য (৳) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#65051F] mb-1">আসল মূল্য (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#65051F] mb-1">স্টক (পিস) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#65051F] mb-1">ডেলিভারি চার্জ (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.deliveryCharge}
                      onChange={(e) => setProductForm({ ...productForm, deliveryCharge: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#65051F] mb-1">ছবি আপলোড বা লিংক</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                      placeholder="/assets/images/products/..."
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E9CD78] bg-white text-xs"
                    />
                    <label className="px-3 py-2 rounded-xl bg-[#F3E9D7] hover:bg-[#EADBC5] text-[#65051F] font-bold cursor-pointer shrink-0 border border-[#D6A638]">
                      {isUploadingProductImage ? 'আপলোড...' : 'ফাইল বাছুন'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#65051F] mb-1">বিবরণ</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isAvailableCheck"
                    checked={productForm.isAvailable}
                    onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-[#65051F]"
                  />
                  <label htmlFor="isAvailableCheck" className="font-bold text-[#20040B] cursor-pointer">
                    পণ্যটি ওয়েবসাইটে কেনার জন্য সক্রিয় (Active) থাকবে
                  </label>
                </div>

                <div className="pt-3 border-t border-[#E9CD78]/60 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#65051F] hover:bg-[#850D22] text-[#FFF8ED] font-bold transition-all shadow-xs"
                  >
                    {editingProduct ? 'আপডেট সংরক্ষণ করুন' : 'প্রোডাক্ট সংরক্ষণ করুন'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold"
                  >
                    বাতিল
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Upload Video Modal */}
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#FFF8ED] rounded-3xl max-w-lg w-full p-6 border-2 border-[#D6A638] shadow-2xl relative my-8">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F3E9D7] text-[#65051F]"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-black text-lg text-[#65051F] border-b border-[#E9CD78]/60 pb-2">
                নতুন MP4 ভিডিও আপলোড করুন
              </h4>

              <form onSubmit={handleSaveVideo} className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#65051F] mb-1">ভিডিওর শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="সাউথমুন লাইপোমা স্প্রে প্যাকেজিং ও ডেমো"
                    className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#65051F] mb-1">MP4 ভিডিও ফাইল নির্বাচন করুন *</label>
                  <div className="border-2 border-dashed border-[#D6A638] rounded-2xl p-4 text-center bg-white/60 space-y-2">
                    <Film className="w-8 h-8 text-[#D6A638] mx-auto" />
                    <div>
                      <label className="px-3.5 py-1.5 rounded-xl bg-[#65051F] text-white font-bold cursor-pointer inline-block hover:bg-[#850D22]">
                        {isUploadingVideo ? `আপলোড হচ্ছে (${uploadProgress}%)...` : 'MP4 ফাইল নির্বাচন করুন'}
                        <input
                          type="file"
                          accept="video/mp4"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-stone-500 mt-1">
                        শুধুমাত্র MP4 ফরম্যাট সমর্থিত।
                      </p>
                    </div>

                    {isUploadingVideo && (
                      <div className="w-full bg-stone-200 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-[#D6A638] h-2 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}

                    {videoForm.videoUrl && (
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-mono truncate">
                        ভিডিও প্রস্তুত: {videoForm.videoUrl}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#65051F] mb-1">ক্যাটাগরি</label>
                  <select
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value as VideoCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white font-bold text-xs"
                  >
                    <option value="product">পণ্য পরিচিতি ভিডিও (Product Video)</option>
                    <option value="promotional">প্রচারমূলক অফার ভিডিও (Promotional Video)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#65051F] mb-1">সংক্ষিপ্ত বিবরণ</label>
                  <textarea
                    rows={2}
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    placeholder="ভিডিও সম্পর্কে গ্রাহককে জানান..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E9CD78] bg-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPublishNow"
                    checked={videoForm.isPublished}
                    onChange={(e) => setVideoForm({ ...videoForm, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#65051F]"
                  />
                  <label htmlFor="isPublishNow" className="font-bold text-[#20040B] cursor-pointer">
                    আপলোডের পর এখনই মূল ওয়েবসাইটে পাবলিশ করুন
                  </label>
                </div>

                <div className="pt-3 border-t border-[#E9CD78]/60 flex gap-2">
                  <button
                    type="submit"
                    disabled={isUploadingVideo || !videoForm.videoUrl}
                    className="flex-1 py-2.5 rounded-xl bg-[#65051F] hover:bg-[#850D22] text-[#FFF8ED] font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    ভিডিও সংরক্ষণ করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold"
                  >
                    বাতিল
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Video Real-Time Player Preview Modal */}
        {previewVideo && (
          <div className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#FFF8ED] rounded-3xl max-w-2xl w-full p-5 border-2 border-[#D6A638] shadow-2xl relative space-y-3">
              <button
                onClick={() => setPreviewVideo(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F3E9D7] text-[#65051F] z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-black text-base text-[#65051F] truncate pr-8">
                {previewVideo.title}
              </h4>

              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-[#D6A638]">
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#6B4F55]">
                  স্ট্যাটাস:{' '}
                  {previewVideo.isPublished ? (
                    <span className="text-emerald-700 font-bold">ওয়েবসাইটে সক্রিয়</span>
                  ) : (
                    <span className="text-stone-500 font-medium">ড্রাফট</span>
                  )}
                </span>
                <button
                  onClick={() => {
                    handleTogglePublishVideo(previewVideo);
                    setPreviewVideo(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#65051F] text-white font-bold"
                >
                  {previewVideo.isPublished ? 'আনপাবলিশ করুন' : 'এখনই ওয়েবসাইটে পাবলিশ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Product Deletion Confirmation Modal */}
        {productToDelete && (
          <div className="fixed inset-0 z-70 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-rose-300 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-black text-base text-[#20040B]">
                  আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি মুছে ফেলতে চান?
                </h4>
                <p className="text-xs text-stone-500 font-mono">
                  {productToDelete.name} ({productToDelete.sku})
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleConfirmDeleteProduct}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  হ্যাঁ, ডিলিট করুন
                </button>
                <button
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs"
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Video Deletion Confirmation Modal */}
        {videoToDelete && (
          <div className="fixed inset-0 z-70 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-rose-300 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-black text-base text-[#20040B]">
                  আপনি কি নিশ্চিতভাবে এই ভিডিওটি ডিলিট করতে চান?
                </h4>
                <p className="text-xs text-stone-500">
                  {videoToDelete.title}
                </p>
                <p className="text-[11px] text-rose-600 font-medium">
                  এটি ডাটাবেজ এবং স্টোরেজ উভয় জায়গা থেকেই স্থায়ীভাবে মুছে ফেলা হবে।
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleConfirmDeleteVideo}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  হ্যাঁ, ডিলিট করুন
                </button>
                <button
                  onClick={() => setVideoToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs"
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Selected Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#FFF8ED] rounded-3xl max-w-md w-full p-6 border-2 border-[#D6A638] shadow-2xl relative">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F3E9D7] text-[#65051F]"
              >
                <X className="w-4 h-4" />
              </button>

              <h4 className="font-black text-lg text-[#65051F] border-b border-[#E9CD78]/60 pb-2">
                অর্ডার রশিদ: {selectedOrder.orderNumber}
              </h4>

              <div className="py-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6B4F55]">গ্রাহকের নাম:</span>
                  <span className="font-bold text-[#20040B]">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B4F55]">মোবাইল:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{selectedOrder.phone}</span>
                    <a
                      href={`tel:${selectedOrder.phone}`}
                      className="px-2 py-0.5 rounded bg-[#65051F] text-white text-[10px]"
                    >
                      কল
                    </a>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4F55]">পূর্ণ ঠিকানা:</span>
                  <span className="font-medium text-right max-w-[220px]">{selectedOrder.address}</span>
                </div>
                <div className="flex justify-between border-t border-[#E9CD78]/40 pt-2">
                  <span className="text-[#6B4F55]">বোতল সংখ্যা:</span>
                  <span className="font-bold">{selectedOrder.quantity} টি</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4F55]">ডেলিভারি চার্জ:</span>
                  <span className="font-bold">
                    {selectedOrder.deliveryCharge === 0 ? 'ফ্রি (৳০)' : formatBDT(selectedOrder.deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#65051F] border-t border-[#E9CD78]/60 pt-2">
                  <span>সর্বমোট বিল:</span>
                  <span className="font-mono">{formatBDT(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/88${selectedOrder.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `হ্যালো ${selectedOrder.customerName}, China Hut থেকে আপনার অর্ডার (${selectedOrder.orderNumber}) প্রসঙ্গে যোগাযোগ করছি।`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                  <span>গ্রাহককে WhatsApp মেসেজ পাঠান</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
