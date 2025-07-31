"use client"

import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"

import { toast } from "react-toastify"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { useTheme } from "../hooks/useTheme"
import { useLanguage } from "../hooks/useLanguage"
import { Loader2, Download, Eye, ArrowLeft, FileText, Sparkles, X, CreditCard, Lock, Shield, AlertCircle } from "lucide-react"
// Mobile detection utility (copied from CoverLetterPreview.tsx)
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth < 1024; // match lg:hidden
};

interface LocationState {
  sessionId: string
  classicResumeUrl: string
  modernResumeUrl: string
}

// Tap Payment Modal Component
interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  amount: number
  resumeType: 'classic' | 'modern'
  isDarkMode: boolean
  language: string
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  resumeType,
  isDarkMode,
  language
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Format expiry date MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.length <= 19) {
      setCardNumber(formatted)
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    if (formatted.length <= 5) {
      setExpiryDate(formatted)
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 4) {
      setCvv(value)
    }
  }

  const processPayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields')
      return
    }

    // Basic card validation
    const cardNumberClean = cardNumber.replace(/\s/g, '')
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      toast.error(language === 'ar' ? 'رقم البطاقة غير صحيح' : 'Invalid card number')
      return
    }

    const [expMonth, expYear] = expiryDate.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    if (parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
      toast.error(language === 'ar' ? 'تاريخ انتهاء البطاقة غير صحيح' : 'Invalid expiry date')
      return
    }
    
    if (parseInt(expYear) < currentYear || (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
      toast.error(language === 'ar' ? 'البطاقة منتهية الصلاحية' : 'Card has expired')
      return
    }

    if (cvv.length < 3 || cvv.length > 4) {
      toast.error(language === 'ar' ? 'رمز الأمان غير صحيح' : 'Invalid CVV')
      return
    }
    setIsProcessing(true)

    try {
      // Simulate payment processing with realistic timing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate different payment scenarios based on card number
      const lastDigit = cardNumberClean.slice(-1)
      
      // Simulate 90% success rate (fail only if last digit is 0)
      if (lastDigit === '0') {
        throw new Error('Payment declined by bank')
      }
      
      // Simulate successful payment
      toast.success(language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment successful!')
      onPaymentSuccess()
      onClose()
      
      // Reset form
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setCardholderName('')
      
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      
      if (errorMessage.includes('declined')) {
        toast.error(language === 'ar' ? 'تم رفض الدفع من البنك' : 'Payment declined by bank')
      } else {
        toast.error(language === 'ar' ? 'فشل في الدفع. يرجى المحاولة مرة أخرى' : 'Payment failed. Please try again')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
        isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <button
          onClick={onClose}
          disabled={isProcessing}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'الدفع الآمن' : 'Secure Payment'}
            </h2>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'ar' 
              ? `دفع $${amount} لتحميل السيرة الذاتية ${resumeType === 'classic' ? 'الكلاسيكية' : 'العصرية'}`
              : `Pay $${amount} to download your ${resumeType} resume`
            }
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Cardholder Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {language === 'ar' ? 'اسم حامل البطاقة' : 'Cardholder Name'}
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={isProcessing}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-black focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              placeholder={language === 'ar' ? 'أدخل اسم حامل البطاقة' : 'Enter cardholder name'}
            />
          </div>

          {/* Card Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {language === 'ar' ? 'رقم البطاقة' : 'Card Number'}
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              disabled={isProcessing}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-black focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              placeholder="1234 5678 9012 3456"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                disabled={isProcessing}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-black focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {language === 'ar' ? 'رمز الأمان' : 'CVV'}
              </label>
              <input
                type="text"
                value={cvv}
                onChange={handleCvvChange}
                disabled={isProcessing}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-black focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                placeholder="123"
              />
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-2 mb-6 text-green-600">
          <Shield className="w-4 h-4" />
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'ar' ? 'محمي بتشفير SSL 256-bit' : '256-bit SSL Encrypted'}
          </span>
        </div>

        {/* Supported Cards */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{language === 'ar' ? 'البطاقات المدعومة:' : 'Supported:'}</span>
            <span className="font-semibold">VISA</span>
            <span className="font-semibold">MasterCard</span>
            <span className="font-semibold">AMEX</span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={processPayment}
          disabled={isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName}
          className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span>{language === 'ar' ? `ادفع $${amount}` : `Pay $${amount}`}</span>
            </div>
          )}
        </button>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium">
                {language === 'ar' ? 'جاري معالجة الدفع...' : 'Processing payment...'}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {language === 'ar' ? 'يرجى عدم إغلاق هذه النافذة' : 'Please do not close this window'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const PreviewPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { language, toggleLanguage } = useLanguage()
  const [classicPdfUrl, setClassicPdfUrl] = useState<string>("")
  // Mobile screenshot/recording overlay state
  const [showMobileOverlay, setShowMobileOverlay] = useState(false)
  const [modernPdfUrl, setModernPdfUrl] = useState<string>("")
  const [activePreview, setActivePreview] = useState<"classic" | "modern">("classic")
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedResumeType, setSelectedResumeType] = useState<'classic' | 'modern'>('classic')
  const [paymentAmount] = useState(10) // Set your price here

  // Mobile image preview state
  const [isMobile, setIsMobile] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[] | null>(null)
  const [previewImageLoading, setPreviewImageLoading] = useState(false)
  const [previewImageError, setPreviewImageError] = useState<string>("")
  // Full screen image modal state
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null)
  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
    // Only on mobile: show overlay when page loses focus
    if (isMobileDevice()) {
      const handleBlur = () => setShowMobileOverlay(true);
      const handleFocus = () => setShowMobileOverlay(false);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) setShowMobileOverlay(true);
        else setShowMobileOverlay(false);
      });
      return () => {
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', () => {});
      };
    }
  }, []);

  // Screenshot and Screen Recording Protection
  useEffect(() => {
    // Add CSS to prevent screenshots and recordings
    const style = document.createElement('style')
    style.textContent = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        pointer-events: auto !important;
      }
      
      img, video, iframe {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        pointer-events: none;
      }
      
      @media print {
        body { display: none !important; }
      }
    `
    document.head.appendChild(style)

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable key combinations for screenshots and dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C, Ctrl+A, Ctrl+S, Ctrl+P
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && (e.key === 'a' || e.key === 'A')) ||
        (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
        // Print Screen keys
        e.key === 'PrintScreen' ||
        // Windows + Shift + S (Snipping Tool)
        (e.metaKey && e.shiftKey && e.key === 'S') ||
        // Alt + PrintScreen
        (e.altKey && e.key === 'PrintScreen')
      ) {
        e.preventDefault()
        toast.error(String(language) === 'ar' ? 'هذا الإجراء غير مسموح' : 'This action is not allowed')
        return false
      }
    }

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('selectstart', handleSelectStart)

    // Disable print
    window.addEventListener('beforeprint', (e) => {
      e.preventDefault()
      toast.error(String(language) === 'ar' ? 'الطباعة غير مسموحة' : 'Printing is not allowed')
      return false
    })

    // Blur page when window loses focus (prevents screen recording)
    let blurTimeout: number
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = 'blur(10px)'
        document.body.style.userSelect = 'none'
      } else {
        // Add small delay to prevent flashing
        blurTimeout = setTimeout(() => {
          document.body.style.filter = 'none'
        }, 100)
      }
    }

    const handleBlur = () => {
      document.body.style.filter = 'blur(10px)'
    }

    const handleFocus = () => {
      clearTimeout(blurTimeout)
      blurTimeout = setTimeout(() => {
        document.body.style.filter = 'none'
      }, 100)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    // Cleanup function
    return () => {
      document.head.removeChild(style)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      clearTimeout(blurTimeout)
      document.body.style.filter = 'none'
    }
  }, [language])

  // Redirect to home if no state is available
  useEffect(() => {
    if (!state || !state.sessionId) {
      toast.error(String(language) === "ar" ? "لم يتم العثور على معلومات السيرة الذاتية" : "Resume information not found")
      navigate("/")
    }
  }, [state, navigate, language])

  useEffect(() => {
    const downloadResumes = async () => {
      try {
        const API_BASE_URL = "https://a240540ec581.ngrok-free.app"

        // Download Classic Resume
        const classicResponse = await axios.get(
          `${API_BASE_URL}/download?session_id=${state.sessionId}&filename=${state.classicResumeUrl}`,
          {
            responseType: "blob",
            headers: {
              "ngrok-skip-browser-warning": "true",
              Accept: "application/pdf",
            },
          },
        )

        const classicBlob = new Blob([classicResponse.data], { type: "application/pdf" })
        const classicUrl = URL.createObjectURL(classicBlob)
        // Add parameters to hide PDF controls but allow scrolling
        setClassicPdfUrl(`${classicUrl}#toolbar=0&navpanes=0&view=FitH`)

        // Download Modern Resume
        const modernResponse = await axios.get(
          `${API_BASE_URL}/download?session_id=${state.sessionId}&filename=${state.modernResumeUrl}`,
          {
            responseType: "blob",
            headers: {
              "ngrok-skip-browser-warning": "true",
              Accept: "application/pdf",
            },
          },
        )
        const modernBlob = new Blob([modernResponse.data], { type: "application/pdf" })
        const modernUrl = URL.createObjectURL(modernBlob)
        // Add parameters to hide PDF controls but allow scrolling
        setModernPdfUrl(`${modernUrl}#toolbar=0&navpanes=0&view=FitH`)

        // setIsLoading(false) removed (no longer used)
      } catch (error) {
        console.error("Error downloading resumes:", error)
        toast.error(String(language) === "ar" ? "حدث خطأ في تحميل السير الذاتية" : "Error loading resumes")
        // setIsLoading(false) removed (no longer used)
      }
    }

    if (state?.sessionId) {
      downloadResumes()
    }

    // Cleanup function to revoke object URLs
    return () => {
      if (classicPdfUrl) URL.revokeObjectURL(classicPdfUrl.split("#")[0])
      if (modernPdfUrl) URL.revokeObjectURL(modernPdfUrl.split("#")[0])
    }
  }, [state])

  const downloadPdf = (url: string, filename: string) => {
    const link = document.createElement("a")
    // Remove the hash parameters for download
    link.href = url.split("#")[0]
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Fetch preview images for both desktop and mobile automatically when activePreview changes
  // Move fetchImages to a ref so it can be called from retry button
  const fetchImagesRef = React.useRef<() => void>(() => {});
  useEffect(() => {
    setPreviewImageError("");
    setPreviewImageLoading(true);
    setPreviewImages(null);
    const fetchImages = async () => {
      try {
        const filename = activePreview === 'classic' ? state.classicResumeUrl : state.modernResumeUrl;
        const API_BASE_URL = "https://a240540ec581.ngrok-free.app/images";
        const response = await axios.post(
          API_BASE_URL,
          {
            session_id: String(state.sessionId),
            filenames: [filename],
          },
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Content-Type': 'application/json',
            },
            timeout: 30000,
            validateStatus: () => true // Always resolve, handle errors manually
          }
        );
        // Debug: log the response
        console.log('DEBUG /images API response:', response.data);
        if (response.status === 404 || (response.data && response.data.detail && response.data.detail.includes('not found'))) {
          setPreviewImages([]);
          setPreviewImageError(String(language) === 'ar' ? 'ملف السيرة الذاتية غير موجود للمعاينة' : 'Resume file not found for preview');
          return;
        }
        let images: string[] | undefined;
        if (Array.isArray(response.data)) {
          images = response.data;
        } else if (response.data && Array.isArray(response.data.images)) {
          images = response.data.images;
        } else if (Array.isArray(response.data["images"])) {
          images = response.data["images"];
        } else if (typeof response.data === 'object') {
          // Try to extract any array of strings from the object
          const arr = Object.values(response.data).find(v => Array.isArray(v) && v.every(i => typeof i === 'string'));
          if (arr) images = arr as string[];
        }
        if (images && images.length > 0) {
          setPreviewImages(images);
        } else {
          setPreviewImages([]);
          setPreviewImageError(
            (String(language) === 'ar' ? 'لم يتم العثور على صور المعاينة' : 'No preview images found')
          );
        }
      } catch (error) {
        setPreviewImages([]);
        setPreviewImageError(
          (String(language) === 'ar' ? 'حدث خطأ أثناء تحميل الصور' : 'Error loading images')
        );
      } finally {
        setPreviewImageLoading(false);
      }
    };
    fetchImagesRef.current = fetchImages;
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePreview, language, state.classicResumeUrl, state.modernResumeUrl, state.sessionId]);


  // On both desktop and mobile, show payment modal before download
  const handleDownloadClick = (resumeType: 'classic' | 'modern') => {
    setSelectedResumeType(resumeType);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    // Always download PDF after payment, regardless of device
    const url = selectedResumeType === 'classic' ? classicPdfUrl : modernPdfUrl;
    const filename = `${selectedResumeType}-resume.pdf`;
    downloadPdf(url, filename);
    toast.success(String(language) === 'ar' ? 'تم الدفع بنجاح! جاري تحميل السيرة الذاتية...' : 'Payment successful! Downloading your resume...');
    // Redirect to home page after successful payment and download
    setTimeout(() => {
      toast.success(String(language) === 'ar' ? 'شكراً لك! ستتم إعادة توجيهك إلى الصفحة الرئيسية' : 'Thank you! Redirecting to home page...');
      navigate("/", { replace: true });
    }, 2000);
  };

  const handleBackClick = () => {
    navigate("/", { replace: true })
  }

  // Determine font family class based on language
  const fontFamilyClass = String(language) === "ar" ? "font-riwaya" : "font-hagrid"

  return (
    <div
      className={`min-h-screen transition-all duration-300 select-none ${
        isDarkMode
          ? "bg-gradient-to-br from-black via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-white via-gray-50 to-white text-black"
      } ${fontFamilyClass}`}
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <Header
        isDarkMode={isDarkMode}
        language={language}
        toggleDarkMode={toggleDarkMode}
        toggleLanguage={toggleLanguage}
      />

      {/* Mobile Screenshot/Recording Overlay */}
      {isMobile && showMobileOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-lg">
          <div className="text-center text-white p-8 rounded-2xl bg-black bg-opacity-70 border-2 border-red-600 shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            <h2 className="text-2xl font-bold mb-2">{String(language) === 'ar' ? 'تم تعطيل المعاينة مؤقتًا' : 'Preview Disabled'}</h2>
            <p className="text-lg mb-2">{String(language) === 'ar' ? 'لا يمكن التقاط لقطة شاشة أو تسجيل الشاشة لهذا المحتوى.' : 'Screenshot and screen recording are not allowed for this content.'}</p>
            <p className="text-sm opacity-80">{String(language) === 'ar' ? 'يرجى العودة إلى التطبيق لمتابعة المعاينة.' : 'Please return to the app to continue previewing.'}</p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mt-10">
          <button
            onClick={handleBackClick}
            className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
                : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
            }`}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">{String(language) === "ar" ? "العودة" : "Back"}</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="w-8 h-8" />
            <h1 className="text-4xl font-bold">{String(language) === "ar" ? "معاينة السيرة الذاتية" : "Resume Preview"}</h1>
          </div>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {String(language) === "ar"
              ? "اختر النموذج المفضل لديك وقم بتحميله"
              : "Choose your preferred template and download it"}
          </p>
        </div>

        {/* Desktop & Mobile View - Show Images Instead of PDF */}
        <div className="hidden lg:grid lg:grid-cols-2  gap-20 w-[80%] mx-auto">
          {/* Classic Resume Images */}
          <div
            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-900/50 border border-gray-800 hover:border-gray-700"
                : "bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
            }`}
          >
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">
                    {String(language) === "ar" ? "النموذج الكلاسيكي" : "Classic Template"}
                  </h2>
                </div>
                <button
                  onClick={() => handleDownloadClick('classic')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isDarkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">{String(language) === "ar" ? `تحميل - $${paymentAmount}` : `Download - $${paymentAmount}`}</span>
                </button>
              </div>
              <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {String(language) === "ar"
                  ? "تصميم أنيق ومهني للوظائف التقليدية"
                  : "Clean and professional design for traditional roles"}
              </p>
            </div>
            <div className="px-6 pb-6">
              <div className={`w-full min-h-[300px] rounded-xl overflow-hidden border-2 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                {/* Show loading, error, or images for classic */}
                {previewImageLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {String(language) === 'ar' ? 'جاري تحميل المعاينة...' : 'Loading preview...'}
                    </p>
                  </div>
                ) : previewImageError ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                    <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{previewImageError}</p>
                    <button
                      onClick={() => {
                        setPreviewImageError("");
                        setPreviewImageLoading(true);
                        setTimeout(() => fetchImagesRef.current(), 100);
                      }}
                      className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      {String(language) === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                    </button>
                  </div>
                ) : previewImages && previewImages.length > 0 ? (
                  <div className="flex flex-col gap-4 items-center justify-center py-4">
                    {previewImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Resume Preview"
                        className="w-full h-auto md:max-h-[80vh] max-h-[60vh] object-contain rounded cursor-zoom-in"
                        onClick={() => setFullScreenImg(img)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {String(language) === 'ar' ? 'اضغط تحميل لعرض المعاينة' : 'Press Download to preview'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modern Resume Images */}
          <div
            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-900/50 border border-gray-800 hover:border-gray-700"
                : "bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
            }`}
          >
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">{String(language) === "ar" ? "النموذج العصري" : "Modern Template"}</h2>
                </div>
                <button
                  onClick={() => handleDownloadClick('modern')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isDarkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">{String(language) === "ar" ? `تحميل - $${paymentAmount}` : `Download - $${paymentAmount}`}</span>
                </button>
              </div>
              <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {String(language) === "ar"
                  ? "تصميم معاصر وإبداعي للوظائف الحديثة"
                  : "Contemporary and creative design for modern roles"}
              </p>
            </div>
            <div className="px-6 pb-6">
              <div className={`w-full min-h-[300px] rounded-xl overflow-hidden border-2 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                {/* Show loading, error, or images for modern */}
                {previewImageLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {String(language) === 'ar' ? 'جاري تحميل المعاينة...' : 'Loading preview...'}
                    </p>
                  </div>
                ) : previewImageError ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                    <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{previewImageError}</p>
                    <button
                      onClick={() => {
                        setPreviewImageError("");
                        setPreviewImageLoading(true);
                        setTimeout(() => fetchImagesRef.current(), 100);
                      }}
                      className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      {String(language) === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                    </button>
                  </div>
                ) : previewImages && previewImages.length > 0 ? (
                  <div className="flex flex-col gap-4 items-center justify-center py-4">
                    {previewImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Resume Preview"
                        className="w-full h-auto md:max-h-[80vh] max-h-[60vh] object-contain rounded cursor-zoom-in"
                        onClick={() => setFullScreenImg(img)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {String(language) === 'ar' ? 'اضغط تحميل لعرض المعاينة' : 'Press Download to preview'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet View - Tabbed Interface */}
        <div className="lg:hidden">
          {/* Tab Buttons */}
          <div className={`flex rounded-xl p-1 mb-6 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            <button
              onClick={() => setActivePreview("classic")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activePreview === "classic"
                  ? isDarkMode
                    ? "bg-white text-black shadow-lg"
                    : "bg-black text-white shadow-lg"
                  : isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-black"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{String(language) === "ar" ? "كلاسيكي" : "Classic"}</span>
            </button>
            <button
              onClick={() => setActivePreview("modern")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activePreview === "modern"
                  ? isDarkMode
                    ? "bg-white text-black shadow-lg"
                    : "bg-black text-white shadow-lg"
                  : isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-black"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{String(language) === "ar" ? "عصري" : "Modern"}</span>
            </button>
          </div>

          {/* Mobile Image Preview Logic */}
          <div className={`rounded-2xl overflow-hidden ${isDarkMode ? "bg-gray-900/50 border border-gray-800" : "bg-white border border-gray-200 shadow-lg"}`}>
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {activePreview === "classic"
                    ? String(language) === "ar"
                      ? "النموذج الكلاسيكي"
                      : "Classic Template"
                    : String(language) === "ar"
                      ? "النموذج العصري"
                      : "Modern Template"}
                </h2>
                <button
                  onClick={() => handleDownloadClick(activePreview)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isDarkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">{String(language) === "ar" ? `تحميل - $${paymentAmount}` : `Download - $${paymentAmount}`}</span>
                </button>
              </div>
              <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {activePreview === "classic"
                  ? String(language) === "ar"
                    ? "تصميم أنيق ومهني للوظائف التقليدية"
                    : "Clean and professional design for traditional roles"
                  : String(language) === "ar"
                    ? "تصميم معاصر وإبداعي للوظائف الحديثة"
                    : "Contemporary and creative design for modern roles"}
              </p>
            </div>
            <div className="px-6 pb-6">
              <div className={`w-full min-h-[300px] rounded-xl overflow-hidden border-2 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                {/* Show loading, error, or images */}
                {previewImageLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {String(language) === 'ar' ? 'جاري تحميل المعاينة...' : 'Loading preview...'}
                    </p>
                  </div>
                ) : previewImageError ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                    <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{previewImageError}</p>
                    <button
                      onClick={() => {
                        setPreviewImageError("");
                        setPreviewImageLoading(true);
                        setTimeout(() => fetchImagesRef.current(), 100);
                      }}
                      className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      {String(language) === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                    </button>
                  </div>
                ) : previewImages && previewImages.length > 0 ? (
                  <div className="flex flex-col gap-4 items-center justify-center py-4">
                    {previewImages.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Resume Preview"
                        className="w-full h-auto max-h-[60vh] object-contain rounded cursor-zoom-in"
                        onClick={() => setFullScreenImg(img)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {String(language) === 'ar' ? 'اضغط تحميل لعرض المعاينة' : 'Press Download to preview'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full Screen Image Modal for Mobile */}
      {fullScreenImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm"
          onClick={() => setFullScreenImg(null)}
        >
          <img
            src={fullScreenImg}
            alt="Full Screen Resume Preview"
            className="max-w-full max-h-full object-contain rounded shadow-2xl"
            style={{ boxShadow: '0 0 40px 8px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 text-white"
            onClick={() => setFullScreenImg(null)}
            aria-label="Close full screen preview"
            style={{ zIndex: 60 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Payment Modal (shown on both desktop and mobile) */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={paymentAmount}
        resumeType={selectedResumeType}
        isDarkMode={isDarkMode}
        language={String(language)}
      />

      <Footer isDarkMode={isDarkMode} language={language} />
    </div>
  );
}