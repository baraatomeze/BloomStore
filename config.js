// ملف تكوين Bloom - إعدادات التطبيق
const BLOOM_CONFIG = {
    // إعدادات التطبيق الأساسية
    app: {
        name: 'Bloom',
        version: '2.0.0',
        description: 'متجر القهوة والهدايا الفاخر',
        language: 'ar',
        direction: 'rtl',
        debug: false
    },

    // إعدادات الأمان
    security: {
        maxLoginAttempts: 5,
        lockDuration: 24 * 60 * 60 * 1000, // 24 ساعة
        verificationCodeExpiry: 1 * 60 * 1000, // 1 دقيقة
        requireTwoFA: ['admin'], // المصادقة الثنائية للمدير الرئيسي فقط
        adminDirectAccess: false, // المدير يحتاج مصادقة ثنائية
        passwordMinLength: 8,
        sessionTimeout: 30 * 60 * 1000, // 30 دقيقة
        adminEmail: 'bloom.company.ps@gmail.com', // إيميل المدير الرئيسي
        
        // إعدادات الأمان الجديدة
        preventRightClick: false, // منع النقر بالزر الأيمن
        preventDevTools: false, // منع أدوات المطور
        enableCSRF: true, // تفعيل حماية CSRF
        enableRateLimiting: true, // تفعيل rate limiting
        enableInputValidation: true, // تفعيل التحقق من المدخلات
        enableInputSanitization: true, // تفعيل تنظيف المدخلات
        enableEncryption: true, // تفعيل تشفير البيانات الحساسة
        
                        // خيارات المصادقة الثنائية (للمدير الرئيسي فقط)
                twoFactorMethods: {
                    email: {
                        enabled: true,
                        name: 'البريد الإلكتروني',
                        description: 'إرسال كود التحقق عبر البريد الإلكتروني',
                        icon: 'fas fa-envelope',
                        color: '#1976d2',
                        forRoles: ['admin'] // للمدير الرئيسي فقط
                    }
                },
        
        // إعدادات HTTPS
        requireHTTPS: true, // إلزامية HTTPS
        showSecurityIndicator: true, // إظهار مؤشر الأمان
        securityWarnings: true, // إظهار تحذيرات الأمان
        autoRedirectHTTPS: false // إعادة توجيه تلقائي لـ HTTPS
    },

    // إعدادات SMS المجاني
    sms: {
        enabled: true,
        provider: 'free',
        adminPhone: '0566411202', // رقم هاتف المدير الرئيسي
        companyPhone: '0568390700', // رقم هاتف الشركة
        freeServices: [
            'TextLocal (Free tier)',
            'MSG91 (Free tier)',
            'Twilio (Free trial)'
        ]
    },

    // إعدادات Google OAuth
    google: {
        enabled: true,
        clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // استبدل بقيمتك
        scope: 'email profile',
        prompt: 'select_account',
        autoSignIn: false
    },

    // إعدادات قاعدة البيانات
    database: {
        type: 'localStorage', // localStorage أو indexedDB
        usersKey: 'bloom_users',
        ordersKey: 'bloom_orders',
        productsKey: 'bloom_products',
        categoriesKey: 'bloom_categories'
    },

    // إعدادات الواجهة
    ui: {
        theme: 'light', // light أو dark
        primaryColor: '#4A0E1E',
        secondaryColor: '#8B4513',
        accentColor: '#DAA520',
        borderRadius: '12px',
        animationDuration: '0.3s',
        showNotifications: true,
        notificationDuration: 5000
    },

    // إعدادات المنتجات
    products: {
        itemsPerPage: 12,
        defaultImage: 'https://via.placeholder.com/300x200/5D4037/ffffff?text=Bloom',
        categories: [
            { id: 1, name: 'أكواب', icon: 'fas fa-mug-hot' },
            { id: 2, name: 'مشروبات باردة', icon: 'fas fa-glass-whiskey' },
            { id: 3, name: 'مشروبات ساخنة', icon: 'fas fa-coffee' },
            { id: 4, name: 'بوكسات حفلات', icon: 'fas fa-gift' },
            { id: 5, name: 'تنظيم حفلات', icon: 'fas fa-birthday-cake' }
        ]
    },

    // إعدادات الطلبات
    orders: {
        statuses: [
            { value: 'pending', label: 'في الانتظار', color: '#FF9800' },
            { value: 'confirmed', label: 'مؤكد', color: '#2196F3' },
            { value: 'shipped', label: 'تم الشحن', color: '#9C27B0' },
            { value: 'delivered', label: 'تم التوصيل', color: '#4CAF50' },
            { value: 'cancelled', label: 'ملغي', color: '#F44336' }
        ],
        autoSave: true,
        saveInterval: 30000 // 30 ثانية
    },

    // إعدادات الإشعارات
    notifications: {
        enabled: true,
        types: {
            success: { icon: 'fas fa-check-circle', sound: 'success.mp3' },
            error: { icon: 'fas fa-exclamation-circle', sound: 'error.mp3' },
            warning: { icon: 'fas fa-exclamation-triangle', sound: 'warning.mp3' },
            info: { icon: 'fas fa-info-circle', sound: 'info.mp3' }
        },
        position: 'top-right',
        maxVisible: 3
    },

    // إعدادات الأداء
    performance: {
        lazyLoading: true,
        imageOptimization: true,
        cacheEnabled: true,
        cacheExpiry: 24 * 60 * 60 * 1000, // 24 ساعة
        debounceDelay: 300
    },

    // إعدادات التطوير
    development: {
        showConsoleLogs: false,
        showPerformanceMetrics: false,
        enableHotReload: false,
        mockData: false
    }
};

// دوال مساعدة للإعدادات
const ConfigHelper = {
    // الحصول على قيمة إعداد
    get: (key) => {
        const keys = key.split('.');
        let value = BLOOM_CONFIG;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    },

    // تعيين قيمة إعداد
    set: (key, value) => {
        const keys = key.split('.');
        let config = BLOOM_CONFIG;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in config)) {
                config[keys[i]] = {};
            }
            config = config[keys[i]];
        }
        
        config[keys[keys.length - 1]] = value;
    },

    // التحقق من وجود إعداد
    has: (key) => {
        return ConfigHelper.get(key) !== undefined;
    },

    // الحصول على جميع الإعدادات
    getAll: () => {
        return JSON.parse(JSON.stringify(BLOOM_CONFIG));
    },

    // حفظ الإعدادات في localStorage
    save: () => {
        try {
            localStorage.setItem('bloom_config', JSON.stringify(BLOOM_CONFIG));
            return true;
        } catch (error) {
            console.error('فشل في حفظ الإعدادات:', error);
            return false;
        }
    },

    // تحميل الإعدادات من localStorage
    load: () => {
        try {
            const saved = localStorage.getItem('bloom_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(BLOOM_CONFIG, parsed);
                return true;
            }
            return false;
        } catch (error) {
            console.error('فشل في تحميل الإعدادات:', error);
            return false;
        }
    },

    // إعادة تعيين الإعدادات للقيم الافتراضية
    reset: () => {
        localStorage.removeItem('bloom_config');
        location.reload();
    }
};

// تحميل الإعدادات المحفوظة عند بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    ConfigHelper.load();
    
    // تطبيق الإعدادات على الواجهة
    if (BLOOM_CONFIG.ui.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // تفعيل وضع التطوير إذا كان مفعلاً
    if (BLOOM_CONFIG.development.showConsoleLogs) {
        console.log('Bloom Config Loaded:', BLOOM_CONFIG);
    }
});

// تصدير الإعدادات للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BLOOM_CONFIG, ConfigHelper };
} else {
    window.BLOOM_CONFIG = BLOOM_CONFIG;
    window.ConfigHelper = ConfigHelper;
}
