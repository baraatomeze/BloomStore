// Global Variables
let currentUser = null;
let cart = [];
let products = [];
let categories = [];
let loginAttempts = {};
let orders = []; // إضافة مصفوفة الطلبات

// نظام الإشعارات
let notifications = [];

// إحصائيات الزوار
let visitorStats = {
    totalVisitors: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    currentVisitors: 0,
    lastVisit: null,
    visitHistory: []
};

// Users Data (في التطبيق الحقيقي ستكون في قاعدة البيانات)
let users = [
    {
        id: 1,
        name: 'روزان طميزي',
        email: 'bloom.company.ps@gmail.com',
        password: 'Admin123!@#',
        phone: '0566411202',
        role: 'admin',
        twoFactorEnabled: false,
        loginAttempts: 0,
        isLocked: false,
        lockExpiry: null,
        createdAt: new Date(),
        lastLogin: null
    },
    {
        id: 2,
        name: 'مدير فرعي',
        email: 'manager@bloom.com',
        password: 'Manager123!',
        phone: '0566390701',
        role: 'manager',
        twoFactorEnabled: false,
        loginAttempts: 0,
        isLocked: false,
        lockExpiry: null,
        createdAt: new Date(),
        lastLogin: null
    },
    {
        id: 3,
        name: 'مستخدم عادي',
        email: 'user@bloom.com',
        password: 'User123!',
        phone: '0566390702',
        role: 'user',
        twoFactorEnabled: false,
        loginAttempts: 0,
        isLocked: false,
        lockExpiry: null,
        createdAt: new Date(),
        lastLogin: null
    }
];

// إعدادات التوصيل
const SHIPPING_OPTIONS = {
    ramallah: {
        name: 'الضفة الغربية',
        price: 20,
        description: 'توصيل لجميع مناطق الضفة الغربية'
    },
    jerusalem: {
        name: 'القدس',
        price: 35,
        description: 'توصيل لمنطقة القدس'
    },
    inside: {
        name: 'داخل الخط الأخضر',
        price: 75,
        description: 'توصيل لداخل الخط الأخضر'
    }
};

// دالة حساب إجمالي الطلب مع التوصيل
function calculateTotalWithShipping() {
    const subtotal = calculateTotal();
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    
    if (selectedShipping) {
        const shippingPrice = SHIPPING_OPTIONS[selectedShipping.value].price;
        return subtotal + shippingPrice;
    }
    
    return subtotal;
}

// دالة عرض خيارات التوصيل
function showShippingOptions() {
    const shippingContainer = document.getElementById('shippingOptions');
    if (!shippingContainer) return;
    
    shippingContainer.innerHTML = `
        <div class="shipping-section">
            <h3>خيارات التوصيل</h3>
            <div class="shipping-options">
                <div class="shipping-option">
                    <input type="radio" id="shipping-ramallah" name="shipping" value="ramallah" checked>
                    <label for="shipping-ramallah">
                        <span class="shipping-name">${SHIPPING_OPTIONS.ramallah.name}</span>
                        <span class="shipping-price">${SHIPPING_OPTIONS.ramallah.price} ₪</span>
                        <span class="shipping-description">${SHIPPING_OPTIONS.ramallah.description}</span>
                    </label>
                </div>
                
                <div class="shipping-option">
                    <input type="radio" id="shipping-jerusalem" name="shipping" value="jerusalem">
                    <label for="shipping-jerusalem">
                        <span class="shipping-name">${SHIPPING_OPTIONS.jerusalem.name}</span>
                        <span class="shipping-price">${SHIPPING_OPTIONS.jerusalem.price} ₪</span>
                        <span class="shipping-description">${SHIPPING_OPTIONS.jerusalem.description}</span>
                    </label>
                </div>
                
                <div class="shipping-option">
                    <input type="radio" id="shipping-inside" name="shipping" value="inside">
                    <label for="shipping-inside">
                        <span class="shipping-name">${SHIPPING_OPTIONS.inside.name}</span>
                        <span class="shipping-price">${SHIPPING_OPTIONS.inside.price} ₪</span>
                        <span class="shipping-description">${SHIPPING_OPTIONS.inside.description}</span>
                    </label>
                </div>
            </div>
            
            <div class="shipping-summary">
                <div class="subtotal">
                    <span>المجموع الفرعي:</span>
                    <span>${calculateTotal()} ₪</span>
                </div>
                <div class="shipping-cost">
                    <span>تكلفة التوصيل:</span>
                    <span id="shippingCost">${SHIPPING_OPTIONS.ramallah.price} ₪</span>
                </div>
                <div class="total">
                    <span>المجموع الكلي:</span>
                    <span id="totalWithShipping">${calculateTotalWithShipping()} ₪</span>
                </div>
            </div>
        </div>
    `;
    
    // إضافة event listeners لخيارات التوصيل
    const shippingInputs = shippingContainer.querySelectorAll('input[name="shipping"]');
    shippingInputs.forEach(input => {
        input.addEventListener('change', updateShippingTotal);
    });
}

// دالة تحديث إجمالي التوصيل
function updateShippingTotal() {
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    if (selectedShipping) {
        const shippingPrice = SHIPPING_OPTIONS[selectedShipping.value].price;
        const subtotal = calculateTotal();
        const total = subtotal + shippingPrice;
        
        document.getElementById('shippingCost').textContent = `${shippingPrice} ₪`;
        document.getElementById('totalWithShipping').textContent = `${total} ₪`;
    }
}

// Initialize the application
// تحميل البيانات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل الصفحة');
    
    // إعداد الأمان أولاً
    setupSecurity();
    
    // تحميل البيانات المحفوظة
    loadSavedData();
    
    // تحميل المنتجات
    loadProductsFromStorage();
    
    // عرض المنتجات
    displayProducts();
    
    // تحديث عداد السلة
    updateCartDisplay();
    
    // تفعيل شريط التصنيفات
    activateCategoryLink();
    
    // اختبار تسجيل الدخول
    testLogin();
    
    // اختبار البريد الإلكتروني
    testEmailValidation();
    
    // عرض البريد الإلكتروني الفعال
    showActiveEmails();
    
    // فحص النموذج
    checkLoginForm();
    
    // تحديث إحصائيات الزوار
    updateVisitorStats();
    
    // إعداد مؤقت عدم النشاط
    setupInactivityTimer();
    
    console.log('✅ تم تحميل جميع الميزات بنجاح');
});

function initializeApp() {
    loadCategories();
    loadProductsFromStorage();
    updateCartCount();
    checkUserSession();
    loadSavedOrders(); // تحميل الطلبات المحفوظة
}

// Authentication Functions
// دالة معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    console.log('محاولة تسجيل دخول:', { email, password });
    
    // التحقق من البيانات وعرض رسائل خطأ محسنة
    const errorMessage = getErrorMessage(email, password);
    if (errorMessage !== 'البريد الإلكتروني أو كلمة المرور غير صحيحة') {
        showMessage(errorMessage, 'error');
        return;
    }
    
    // البحث عن المستخدم
    const user = users.find(u => u.email === email);
    
    if (!user) {
        console.log('المستخدم غير موجود');
        showMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        return;
    }
    
    console.log('تم العثور على المستخدم:', user.name);
    
    // التحقق من كلمة المرور
    if (user.password === password) {
        console.log('كلمة المرور صحيحة');
        
        // التحقق من قفل الحساب
        if (user.isLocked && user.lockExpiry && new Date() < new Date(user.lockExpiry)) {
            const remainingTime = Math.ceil((new Date(user.lockExpiry) - new Date()) / (1000 * 60));
            showMessage(`الحساب مقفل لمدة ${remainingTime} دقيقة`, 'error');
            return;
        }
        
        // إعادة تعيين محاولات الدخول إذا انتهت مدة القفل
        if (user.isLocked && user.lockExpiry && new Date() > new Date(user.lockExpiry)) {
            user.isLocked = false;
            user.lockExpiry = null;
            user.loginAttempts = 0;
        }
        
        // التحقق من الحاجة للمصادقة الثنائية (للمدير الرئيسي فقط)
        if (user.role === 'admin' && BLOOM_CONFIG.security.requireTwoFA.includes('admin')) {
            console.log('المدير الرئيسي يحتاج مصادقة ثنائية');
                show2FAModal(user);
            return;
        }
        
        // تسجيل الدخول الناجح (للمستخدمين الآخرين)
        currentUser = user;
        user.lastLogin = new Date();
        user.loginAttempts = 0;
        user.isLocked = false;
        user.lockExpiry = null;
        
        // حفظ البيانات في sessionStorage فقط (تنتهي عند إغلاق المتصفح)
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        
        localStorage.setItem('bloom_users', JSON.stringify(users));
        
        // إغلاق نافذة تسجيل الدخول
        closeLoginModal();
        
        // تحديث الواجهة
        updateUI();
        
        showMessage(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`, 'success');
        
        // إرسال إشعار للمديرين إذا كان المستخدم ليس مدير
        if (user.role !== 'admin' && user.role !== 'manager') {
            sendNotificationToAdmins(
                'login',
                'تسجيل دخول جديد',
                `قام المستخدم ${user.name} بتسجيل الدخول`,
                { user: user }
            );
        }
    } else {
        console.log('كلمة المرور خاطئة');
        // تسجيل محاولة دخول فاشلة
        user.loginAttempts++;
        
        if (user.loginAttempts >= 5) {
            user.isLocked = true;
            user.lockExpiry = new Date(Date.now() + (30 * 60 * 1000)); // 30 دقيقة
            showMessage('تم قفل الحساب لمدة 30 دقيقة بسبب محاولات الدخول الفاشلة', 'error');
        } else {
            const remainingAttempts = 5 - user.loginAttempts;
            showMessage(`كلمة المرور غير صحيحة. متبقي ${remainingAttempts} محاولات`, 'error');
        }
        
        localStorage.setItem('bloom_users', JSON.stringify(users));
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const phone = document.getElementById('registerPhone').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showMessage(passwordValidation.message, 'error');
        return;
    }
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showMessage('البريد الإلكتروني مستخدم بالفعل', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        email: email,
        password: password,
        name: name,
        phone: phone,
        role: 'user',
        twoFactorEnabled: false,
        loginAttempts: 0,
        isLocked: false,
        lockExpiry: null
    };
    
    users.push(newUser);
    showMessage('تم إنشاء الحساب بنجاح', 'success');
    showTab('login');
}

function authenticateUser(email, password) {
    return users.find(user => user.email === email && user.password === password);
}

function isAccountLocked(email) {
    const attempts = loginAttempts[email];
    if (!attempts) return false;
    
    const now = Date.now();
    const lockTime = attempts.lockTime;
    
    if (now < lockTime) {
        return true;
    } else {
        delete loginAttempts[email];
        return false;
    }
}

function incrementLoginAttempts(email) {
    if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 0, lockTime: null };
    }
    
    loginAttempts[email].count++;
    
    if (loginAttempts[email].count >= 5) {
        // Lock account for 24 hours
        const lockTime = Date.now() + (24 * 60 * 60 * 1000);
        loginAttempts[email].lockTime = lockTime;
        showMessage('تم قفل الحساب لمدة 24 ساعة بسبب محاولات تسجيل دخول خاطئة', 'error');
    }
}

// دالة التحقق من قوة كلمة المرور
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف صغير' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف كبير' };
    }
    
    if (!/\d/.test(password)) {
        return { valid: false, message: 'كلمة المرور يجب أن تحتوي على رقم' };
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
        return { valid: false, message: 'كلمة المرور يجب أن تحتوي على رمز خاص (!@#$%^&*)' };
}

    return { valid: true, message: 'كلمة المرور قوية' };
}

// تحديث دالة show2FAModal لتشمل خيارات متعددة للمصادقة الثنائية
function show2FAModal(user) {
    // التحقق من أن المستخدم مدير رئيسي
    if (user.role !== 'admin') {
        console.log('المصادقة الثنائية متاحة للمدير الرئيسي فقط');
        loginSuccess(user);
        return;
    }
    
    currentUser = user;
    
    // توليد كود تحقق آمن
    const verificationCode = generateSecureVerificationCode();
    currentUser.verificationCode = verificationCode;
    
    // إظهار نافذة المصادقة الثنائية
    const twoFAModal = document.getElementById('twoFAModal');
    const loginModal = document.getElementById('loginModal');
    
    if (twoFAModal && loginModal) {
        loginModal.style.display = 'none';
        twoFAModal.style.display = 'block';
        
        // تحديث نص النافذة مع خيار البريد الإلكتروني فقط
        const modalBody = twoFAModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="twofa-options">
                    <h4 style="color: #602C34; margin-bottom: 20px; text-align: center;">
                        <i class="fas fa-shield-alt"></i>
                        المصادقة الثنائية للمدير الرئيسي
                    </h4>
                    
                    <div class="twofa-methods">
                        <!-- خيار البريد الإلكتروني فقط -->
                        <div class="twofa-method" onclick="select2FAMethod('email')">
                            <div class="method-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="method-info">
                                <h5>البريد الإلكتروني</h5>
                                <p>إرسال كود التحقق عبر البريد الإلكتروني</p>
                                <small>سيتم الإرسال إلى: baraatomeze@gmail.com</small>
                            </div>
                            <div class="method-status">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- نموذج إدخال الكود (مخفي في البداية) -->
                    <div class="verification-form" id="verificationForm" style="display: none;">
                        <div class="method-selected">
                            <span id="selectedMethodName">البريد الإلكتروني</span>
                            <button class="btn-change-method" onclick="show2FAModal(currentUser)">
                                <i class="fas fa-edit"></i>
                                تغيير الطريقة
                            </button>
                        </div>
                        
                        <div class="code-input-container">
                            <label for="twoFACode">أدخل رمز التحقق المكون من 6 أرقام</label>
                            <div class="code-input-group">
                                <input type="text" id="twoFACode" placeholder="000000" maxlength="6" 
                                       style="text-align: center; font-size: 20px; letter-spacing: 8px; font-weight: bold;">
                            </div>
                            <small style="color: #666; display: block; margin-top: 10px;">
                                <i class="fas fa-clock"></i>
                                الكود صالح لمدة 5 دقائق فقط
                            </small>
                            <small style="color: #602C34; display: block; margin-top: 5px;">
                                <i class="fas fa-envelope"></i>
                                تم إرسال الكود إلى: baraatomeze@gmail.com
                            </small>
                            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 10px; margin-top: 10px;">
                                <small style="color: #856404;">
                                    <strong>💡 ملاحظة:</strong> في وضع الاختبار، الكود سيظهر في وحدة تحكم المتصفح (F12 → Console)
                                </small>
                            </div>
                        </div>
                        
                        <div class="verification-actions">
                            <button class="btn-login-submit" onclick="verify2FA()">
                                <i class="fas fa-check"></i>
                                تحقق من الكود
                            </button>
                            <button class="btn-resend" onclick="resendVerificationCode()">
                                <i class="fas fa-redo"></i>
                                إعادة إرسال الكود
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        console.log('تم فتح نافذة المصادقة الثنائية مع خيارات متعددة');
    } else {
        console.error('لم يتم العثور على نوافذ المصادقة');
        showMessage('خطأ في فتح نافذة المصادقة', 'error');
    }
}

// دالة اختيار طريقة المصادقة الثنائية
function select2FAMethod(method) {
    // التحقق من أن المستخدم مدير رئيسي
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('المصادقة الثنائية متاحة للمدير الرئيسي فقط');
        return;
    }
    
    console.log('تم اختيار طريقة المصادقة:', method);
    
    // إخفاء خيارات الطرق
    document.querySelector('.twofa-methods').style.display = 'none';
    
    // إظهار نموذج إدخال الكود
    const verificationForm = document.getElementById('verificationForm');
    verificationForm.style.display = 'block';
    
    // تحديث اسم الطريقة المختارة (البريد الإلكتروني فقط)
    document.getElementById('selectedMethodName').textContent = 'البريد الإلكتروني';
    
    // حفظ الطريقة المختارة
    currentUser.selected2FAMethod = 'email';
    
    // إرسال الكود عبر البريد الإلكتروني
    sendVerificationCode('email');
    
    // التركيز على حقل إدخال الكود
    setTimeout(() => {
        document.getElementById('twoFACode').focus();
    }, 500);
}

// دالة إرسال كود التحقق (البريد الإلكتروني فقط)
function sendVerificationCode(method) {
    // التحقق من أن المستخدم مدير رئيسي
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('المصادقة الثنائية متاحة للمدير الرئيسي فقط');
        return;
    }
    
    const code = currentUser.verificationCode;
    
    // إرسال الكود عبر البريد الإلكتروني فقط
    sendEmailCode(code);
}

// دالة إرسال كود عبر البريد الإلكتروني
async function sendEmailCode(code) {
    console.log('إرسال كود التحقق عبر البريد الإلكتروني:', code);
    
    // التأكد من استخدام البريد الإلكتروني الصحيح للمدير
    const adminEmail = 'bloom.company.ps@gmail.com';
    console.log('إرسال الكود إلى البريد الإلكتروني:', adminEmail);
    
    // محاكاة إرسال البريد الإلكتروني (للاختبار)
    showMessage(`تم إرسال كود التحقق إلى البريد الإلكتروني: ${adminEmail} (صالح لمدة دقيقة واحدة)`, 'success');
    console.log('Email code sent:', code);
    
    // في الإنتاج، سيتم إرسال طلب إلى الخادم
    // try {
    //     const response = await fetch('/api/send-email-code', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ email: adminEmail })
    //     });
    //     
    //     const result = await response.json();
    //     
    //     if (result.success) {
    //         showMessage(`تم إرسال كود التحقق إلى البريد الإلكتروني: ${adminEmail}`, 'success');
    //         console.log('Email sent successfully:', result.messageId);
    //     } else {
    //         showMessage(`فشل في إرسال كود التحقق: ${result.error}`, 'error');
    //         console.error('Email sending failed:', result.error);
    //     }
    // } catch (error) {
    //     console.error('Error sending email:', error);
    //     showMessage('خطأ في إرسال كود التحقق، يرجى المحاولة مرة أخرى', 'error');
    // }
}

// دالة إرسال كود عبر SMS (حقيقي)
async function sendSMSCode(phone, code) {
    console.log('إرسال كود التحقق عبر SMS:', code);
    
    // التأكد من استخدام الرقم الصحيح للمدير
    const adminPhone = '0566411202';
    console.log('إرسال الكود إلى الرقم:', adminPhone);
    
    // محاكاة إرسال SMS (للاختبار)
    showMessage(`تم إرسال كود التحقق عبر SMS إلى الرقم: ${adminPhone}`, 'success');
    console.log('SMS code sent:', code);
    
    // في الإنتاج، سيتم إرسال طلب إلى الخادم
    // try {
    //     const response = await fetch('/api/send-sms-code', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ phoneNumber: adminPhone })
    //     });
    //     
    //     const result = await response.json();
    //     
    //     if (result.success) {
    //         showMessage(`تم إرسال كود التحقق عبر SMS إلى الرقم: ${adminPhone}`, 'success');
    //         console.log('SMS sent successfully:', result.messageId);
    //     } else {
    //         showMessage(`فشل في إرسال كود التحقق: ${result.error}`, 'error');
    //         console.error('SMS sending failed:', result.error);
    //     }
    // } catch (error) {
    //     console.error('Error sending SMS:', error);
    //     showMessage('خطأ في إرسال كود التحقق، يرجى المحاولة مرة أخرى', 'error');
    // }
}

// دالة إرسال كود عبر SMS
async function sendSMSCode(phone, code) {
    console.log('إرسال كود التحقق عبر SMS:', code);
    
    // محاكاة إرسال SMS
    showMessage('تم إرسال كود التحقق عبر رسالة نصية', 'success');
    
    // في التطبيق الحقيقي، سيتم إرسال طلب إلى الخادم
    // fetch('/api/send-sms-code', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ phone: phone, code: code })
    // });
}

// دالة عرض تعليمات تطبيق المصادقة
function showAppInstructions(code) {
    console.log('عرض تعليمات تطبيق المصادقة:', code);
    
    const modalBody = document.querySelector('#twoFAModal .modal-body');
    modalBody.innerHTML = `
        <div class="app-instructions">
            <h4 style="color: #602C34; margin-bottom: 20px;">
                <i class="fas fa-mobile-alt"></i>
                إعداد تطبيق المصادقة
            </h4>
            
            <div class="app-steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h5>قم بتحميل تطبيق المصادقة</h5>
                        <p>Google Authenticator أو Microsoft Authenticator</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h5>أضف حساب جديد</h5>
                        <p>استخدم رمز QR أو أدخل الكود يدوياً</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h5>أدخل الكود من التطبيق</h5>
                        <p>أدخل الكود المكون من 6 أرقام</p>
                    </div>
                </div>
            </div>
            
            <div class="manual-code">
                <h5>الكود اليدوي:</h5>
                <div class="code-display">${code}</div>
                <small>استخدم هذا الكود إذا لم يكن لديك رمز QR</small>
            </div>
            
            <div class="verification-actions">
                <button class="btn-login-submit" onclick="showCodeInput()">
                    <i class="fas fa-arrow-right"></i>
                    التالي
                </button>
            </div>
        </div>
    `;
}

// دالة إظهار حقل إدخال الكود
function showCodeInput() {
    const modalBody = document.querySelector('#twoFAModal .modal-body');
    modalBody.innerHTML = `
        <div class="verification-form">
            <div class="method-selected">
                <span>تطبيق المصادقة</span>
                <button class="btn-change-method" onclick="show2FAModal(currentUser)">
                    <i class="fas fa-edit"></i>
                    تغيير الطريقة
                </button>
            </div>
            
            <div class="code-input-container">
                <label for="twoFACode">أدخل الكود من تطبيق المصادقة</label>
                <div class="code-input-group">
                    <input type="text" id="twoFACode" placeholder="000000" maxlength="6" 
                           style="text-align: center; font-size: 20px; letter-spacing: 8px; font-weight: bold;">
                </div>
                <small style="color: #666; display: block; margin-top: 10px;">
                    <i class="fas fa-clock"></i>
                    الكود يتغير كل 30 ثانية
                </small>
            </div>
            
            <div class="verification-actions">
                <button class="btn-login-submit" onclick="verify2FA()">
                    <i class="fas fa-check"></i>
                    تحقق من الكود
                </button>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        document.getElementById('twoFACode').focus();
    }, 500);
}

// دالة إعادة إرسال كود التحقق
function resendVerificationCode() {
    // التحقق من أن المستخدم مدير رئيسي
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('المصادقة الثنائية متاحة للمدير الرئيسي فقط');
        return;
    }
    
    if (currentUser && currentUser.selected2FAMethod) {
        // توليد كود جديد
        const newCode = generateSecureVerificationCode();
        currentUser.verificationCode = newCode;
        
        // إرسال الكود الجديد
        sendVerificationCode(currentUser.selected2FAMethod);
        
        showMessage('تم إرسال كود تحقق جديد', 'success');
    } else {
        showMessage('خطأ في إعادة إرسال الكود', 'error');
    }
}

// ========================================
// دعم HTTPS والأمان
// ========================================

// دالة التحقق من HTTPS
function checkHTTPS() {
    const isSecure = window.location.protocol === 'https:';
    const securityIndicator = document.getElementById('securityIndicator');
    const securityText = document.getElementById('securityText');
    
    if (isSecure) {
        securityIndicator.className = 'security-indicator secure';
        securityText.textContent = 'آمن (HTTPS)';
        securityIndicator.innerHTML = '<i class="fas fa-shield-alt"></i><span>آمن (HTTPS)</span>';
        
        // إضافة فئة للأمان للنماذج
        document.querySelectorAll('form').forEach(form => {
            form.classList.add('secure-form');
        });
        
        console.log('✅ الاتصال آمن عبر HTTPS');
        return true;
    } else {
        securityIndicator.className = 'security-indicator insecure';
        securityText.textContent = 'غير آمن (HTTP)';
        securityIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>غير آمن (HTTP)</span>';
        
        console.warn('⚠️ الاتصال غير آمن - يرجى استخدام HTTPS');
        
        // إظهار تحذير للمستخدم
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            showMessage('تحذير: هذا الاتصال غير آمن. يرجى استخدام HTTPS للحماية الكاملة.', 'warning');
        }
        
        return false;
    }
}

// دالة التحقق من إعدادات الأمان
function checkSecuritySettings() {
    const securityChecks = {
        https: window.location.protocol === 'https:',
        secureCookies: document.cookie.includes('secure'),
        contentSecurityPolicy: document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null,
        xFrameOptions: document.querySelector('meta[http-equiv="X-Frame-Options"]') !== null
    };
    
    console.log('🔒 فحص إعدادات الأمان:', securityChecks);
    
    // إضافة مؤشرات الأمان للصفحة
    addSecurityIndicators(securityChecks);
    
    return securityChecks;
}

// دالة إضافة مؤشرات الأمان
function addSecurityIndicators(securityChecks) {
    const securityInfo = document.createElement('div');
    securityInfo.className = 'security-info';
    securityInfo.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 1000;
        display: none;
    `;
    
    let securityHTML = '<div style="margin-bottom: 5px;"><strong>🔒 حالة الأمان:</strong></div>';
    
    Object.entries(securityChecks).forEach(([check, status]) => {
        const icon = status ? '✅' : '❌';
        const label = {
            https: 'HTTPS',
            secureCookies: 'Cookies آمنة',
            contentSecurityPolicy: 'CSP',
            xFrameOptions: 'X-Frame-Options'
        }[check];
        
        securityHTML += `<div>${icon} ${label}</div>`;
    });
    
    securityInfo.innerHTML = securityHTML;
    document.body.appendChild(securityInfo);
    
    // إظهار معلومات الأمان عند الضغط على مؤشر الأمان
    document.getElementById('securityIndicator').addEventListener('click', () => {
        securityInfo.style.display = securityInfo.style.display === 'none' ? 'block' : 'none';
    });
}

// دالة تحسين الأمان للنماذج
function enhanceFormSecurity() {
    // إضافة CSRF protection
    document.querySelectorAll('form').forEach(form => {
        if (!form.querySelector('input[name="_csrf"]')) {
            const csrfToken = document.createElement('input');
            csrfToken.type = 'hidden';
            csrfToken.name = '_csrf';
            csrfToken.value = generateCSRFToken();
            form.appendChild(csrfToken);
        }
    });
    
    // إضافة rate limiting للنماذج
    addRateLimiting();
}

// دالة توليد CSRF token
function generateCSRFToken() {
    const array = new Uint32Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

// دالة إضافة rate limiting
function addRateLimiting() {
    const formSubmissions = new Map();
    
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            const formId = form.id || 'default';
            const now = Date.now();
            const lastSubmission = formSubmissions.get(formId) || 0;
            
            // حد أقصى 3 عمليات إرسال في الدقيقة
            if (now - lastSubmission < 20000) {
                e.preventDefault();
                showMessage('يرجى الانتظار قبل إرسال طلب آخر', 'warning');
                return false;
            }
            
            formSubmissions.set(formId, now);
        });
    });
}

// دالة تشفير البيانات الحساسة
function encryptSensitiveData(data) {
    // في التطبيق الحقيقي، سيتم استخدام تشفير أقوى
    return btoa(JSON.stringify(data));
}

// دالة فك تشفير البيانات
function decryptSensitiveData(encryptedData) {
    try {
        return JSON.parse(atob(encryptedData));
    } catch (error) {
        console.error('خطأ في فك تشفير البيانات:', error);
        return null;
    }
}

// دالة التحقق من صحة البيانات المدخلة
function validateInput(input, type) {
    const validations = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\+]?[0-9]{10,15}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        name: /^[\u0600-\u06FF\s]{2,50}$/,
        code: /^[0-9]{6}$/
    };
    
    if (validations[type]) {
        return validations[type].test(input);
    }
    
    return true;
}

// دالة تنظيف البيانات المدخلة
function sanitizeInput(input) {
    return input
        .replace(/[<>]/g, '') // منع HTML tags
        .replace(/javascript:/gi, '') // منع JavaScript
        .trim();
}

// دالة إعداد الأمان عند تحميل الصفحة
function setupSecurity() {
    // التحقق من HTTPS
    checkHTTPS();
    
    // فحص إعدادات الأمان
    checkSecuritySettings();
    
    // تحسين أمان النماذج
    enhanceFormSecurity();
    
    // إضافة event listeners للأمان
    setupSecurityEventListeners();
    
    console.log('🔒 تم إعداد الأمان بنجاح');
}

// دالة إعداد event listeners للأمان
function setupSecurityEventListeners() {
    // منع right-click (اختياري)
    document.addEventListener('contextmenu', (e) => {
        if (BLOOM_CONFIG.security.preventRightClick) {
            e.preventDefault();
            showMessage('هذا الإجراء غير مسموح به', 'warning');
        }
    });
    
    // منع F12 و Ctrl+Shift+I
    document.addEventListener('keydown', (e) => {
        if (BLOOM_CONFIG.security.preventDevTools) {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
                showMessage('هذا الإجراء غير مسموح به', 'warning');
            }
        }
    });
    
    // مراقبة تغييرات DOM (حماية من XSS)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // فحص العناصر المضافة بحثاً عن scripts
                        const scripts = node.querySelectorAll('script');
                        if (scripts.length > 0) {
                            console.warn('⚠️ تم اكتشاف scripts مشبوهة');
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

async function verify2FA() {
    // التحقق من أن المستخدم مدير رئيسي
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('المصادقة الثنائية متاحة للمدير الرئيسي فقط');
        loginSuccess(currentUser);
        return;
    }
    
    const code = document.getElementById('twoFACode').value.trim();
    
    if (!code) {
        showMessage('يرجى إدخال كود التحقق', 'error');
        return;
    }
    
    if (code.length !== 6) {
        showMessage('كود التحقق يجب أن يكون 6 أرقام', 'error');
        return;
    }
    
    console.log('الكود المدخل:', code);
    console.log('الكود المطلوب:', currentUser?.verificationCode);
    console.log('الطريقة المختارة:', currentUser?.selected2FAMethod);
    
    // التحقق من الكود المحلي (للاختبار)
    if (currentUser && currentUser.verificationCode && code === currentUser.verificationCode.toString()) {
        console.log('تم التحقق من الكود بنجاح');
            showMessage('تم التحقق بنجاح!', 'success');
            close2FA();
            loginSuccess(currentUser);
        } else {
        console.log('كود التحقق غير صحيح');
            showMessage('رمز المصادقة غير صحيح، يرجى المحاولة مرة أخرى', 'error');
        document.getElementById('twoFACode').value = '';
        document.getElementById('twoFACode').focus();
    }
    
    // في الإنتاج، سيتم إرسال طلب التحقق للخادم
    // try {
    //     // تحديد المعرف حسب الطريقة المختارة
    //     let identifier;
    //     if (currentUser.selected2FAMethod === 'email') {
    //         identifier = 'baraatomeze@gmail.com';
    //     } else if (currentUser.selected2FAMethod === 'sms') {
    //         identifier = '0566411202';
    //     } else {
    //         // للتطبيق، نستخدم الكود المحلي
    //         if (currentUser && currentUser.verificationCode && code === currentUser.verificationCode.toString()) {
    //             showMessage('تم التحقق بنجاح!', 'success');
    //             close2FA();
    //             loginSuccess(currentUser);
    //             return;
    //         } else {
    //             showMessage('رمز المصادقة غير صحيح، يرجى المحاولة مرة أخرى', 'error');
    //             return;
    //         }
    //     }
    //     
    //     // إرسال طلب التحقق للخادم
    //     const response = await fetch('/api/verify-code', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ identifier, code })
    //     });
    //     
    //     const result = await response.json();
    //     
    //     if (result.success) {
    //         console.log('تم التحقق من الكود بنجاح');
    //         showMessage('تم التحقق بنجاح!', 'success');
    //         close2FA();
    //         loginSuccess(currentUser);
    //     } else {
    //         console.log('كود التحقق غير صحيح:', result.error);
    //         showMessage(`رمز المصادقة غير صحيح: ${result.error}`, 'error');
    //     }
    // } catch (error) {
    //     console.error('Error verifying code:', error);
    //     showMessage('خطأ في التحقق من الكود، يرجى المحاولة مرة أخرى', 'error');
    // }
}

function close2FA() {
    document.getElementById('twoFAModal').style.display = 'none';
    document.getElementById('twoFACode').value = '';
    if (currentUser) {
        delete currentUser.verificationCode;
    }
    currentUser = null;
}

// دالة توليد كود تحقق عشوائي
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000); // 6 أرقام
}

// دالة إرسال كود عبر WhatsApp (رسالة حقيقية)
async function sendSMSCode(phone, code) {
    try {
        // استخدام رقم هاتف الشركة لإرسال الكود
        const companyPhone = BLOOM_CONFIG.whatsapp.companyPhone;
        
        // تنظيف رقم هاتف الشركة
        let cleanCompanyPhone = companyPhone.replace(/\D/g, '');
        if (!cleanCompanyPhone.startsWith('970')) {
            cleanCompanyPhone = '970' + cleanCompanyPhone;
        }
        
        // إنشاء رسالة WhatsApp
        const whatsappMessage = `🔐 كود التحقق من Bloom

رمز التحقق الخاص بك هو: **${code}**

هذا الكود صالح لمدة 5 دقائق فقط.
لا تشارك هذا الكود مع أي شخص.

مع تحيات فريق Bloom 🌸`;
        
        // إنشاء رابط WhatsApp مباشر للشركة
        const whatsappUrl = `https://wa.me/${cleanCompanyPhone}?text=${encodeURIComponent(whatsappMessage)}`;
        
        // فتح WhatsApp في نافذة جديدة
        window.open(whatsappUrl, '_blank');
        
        // إظهار رسالة نجاح
        showMessage('تم فتح WhatsApp لإرسال كود التحقق', 'success');
        console.log('تم إنشاء رابط WhatsApp للشركة:', whatsappUrl);
        console.log('رقم هاتف الشركة:', cleanCompanyPhone);
        
        // حفظ الكود في الجلسة مع وقت انتهاء الصلاحية
        sessionStorage.setItem('verificationCode', JSON.stringify({
            code: code,
            phone: cleanCompanyPhone,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 دقائق
        }));
        
        // لا نعرض الكود للمستخدم - سري تماماً
        return true;
        
    } catch (error) {
        console.error('خطأ في إرسال الكود:', error);
        
        // في حالة الفشل، نستخدم طريقة بديلة
        return await sendAlternativeVerification(phone, code);
    }
}

// دالة إرسال بديلة للتحقق (SMS أو Email)
async function sendAlternativeVerification(phone, code) {
    try {
        // محاولة إرسال عبر SMS
        const smsResponse = await fetch('/api/sms/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                phone: phone,
                code: code
            })
        });

        if (smsResponse.ok) {
            showMessage('تم إرسال كود التحقق عبر SMS', 'success');
            return true;
        }

        // إذا فشل SMS، نرسل عبر Email
        const emailResponse = await fetch('/api/email/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                email: currentUser.email,
                code: code
            })
        });
        
        if (emailResponse.ok) {
            showMessage('تم إرسال كود التحقق عبر البريد الإلكتروني', 'success');
            return true;
        }

        throw new Error('فشل في إرسال كود التحقق عبر جميع الطرق');

    } catch (error) {
        console.error('خطأ في الطرق البديلة:', error);
        showMessage('فشل في إرسال كود التحقق، يرجى المحاولة مرة أخرى', 'error');
        return false;
    }
}

// دالة الحصول على رمز المصادقة
function getAuthToken() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.token || sessionStorage.getItem('authToken') || '';
}

// دالة توليد كود تحقق آمن
function generateSecureVerificationCode() {
    // استخدام Crypto API لتوليد كود آمن
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint8Array(6);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte % 10).join('');
    } else {
        // طريقة بديلة إذا لم يكن Crypto API متاحاً
        return Math.floor(100000 + Math.random() * 900000);
    }
}

function loginSuccess(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    showMessage(`مرحباً ${user.name}!`, 'success');
    toggleLogin();
    
    // Show admin panel button for admin/manager
    if (user.role === 'admin' || user.role === 'manager') {
        showAdminButton();
    }
    
    updateUI();
}

// دالة تسجيل الخروج
function logout() {
    // إزالة المستخدم الحالي
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // إفراغ السلة
    cart = [];
    localStorage.removeItem('bloom_cart');
    
    // إغلاق لوحة الإدارة إذا كانت مفتوحة
    closeAdminPanel();
    
    // تحديث الواجهة
    updateUI();
    
    // إعادة تعيين عداد السلة
    updateCartCount();
    
    showMessage('تم تسجيل الخروج بنجاح', 'success');
}

function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (currentUser.role === 'admin' || currentUser.role === 'manager') {
            showAdminButton();
        }
        updateUI();
    }
}


// إضافة معلومات الأمان
function showSecurityInfo() {
    showMessage('المتجر يستخدم HTTPS للتشفير. المدير يدخل مباشرة، والمدير الفرعي يحتاج مصادقة ثنائية عبر البريد الإلكتروني', 'info');
}

// UI Functions
function toggleLogin() {
    const modal = document.getElementById('loginModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        showTab('login');
    }
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        updateCartDisplay();
    }
}

function toggleAdmin() {
    const modal = document.getElementById('adminModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        showAdminTab('products');
        loadAdminData();
    }
}

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to selected tab button
    event.target.classList.add('active');
}

function showAdminTab(tabName) {
    // Hide all admin tabs
    const tabs = document.querySelectorAll('.admin-tabs + .tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all admin tab buttons
    const adminTabButtons = document.querySelectorAll('.admin-tabs .tab-btn');
    adminTabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to selected tab button
    event.target.classList.add('active');
}

function showAdminButton() {
    let adminBtn = document.getElementById('adminBtn');
    if (!adminBtn) {
        adminBtn = document.createElement('button');
        adminBtn.id = 'adminBtn';
        adminBtn.className = 'admin-btn';
        adminBtn.innerHTML = '<i class="fas fa-cog"></i> لوحة الإدارة';
        adminBtn.onclick = toggleAdmin;
        
        const navActions = document.querySelector('.nav-actions');
        navActions.insertBefore(adminBtn, navActions.firstChild);
    }
}

function hideAdminButton() {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.remove();
    }
}

// دالة تحديث واجهة المستخدم
function updateUI() {
    const loginBtn = document.querySelector('.login-btn');
    const adminBtn = document.getElementById('adminBtn');
    const visitorCounterBar = document.querySelector('.visitor-counter-bar');
    
    // إخفاء عداد الزوار افتراضياً
    if (visitorCounterBar) {
        visitorCounterBar.style.display = 'none';
    }
    
    if (currentUser) {
        // إخفاء زر تسجيل الدخول وإظهار قائمة المستخدم
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
        
        // إظهار زر لوحة الإدارة للمديرين فقط
        if (adminBtn) {
            if (currentUser.role === 'admin' || currentUser.role === 'manager') {
                adminBtn.style.display = 'block';
    } else {
                adminBtn.style.display = 'none';
            }
        }
        
        // إظهار عداد الزوار للمديرين فقط
        if (visitorCounterBar) {
            if (currentUser.role === 'admin' || currentUser.role === 'manager') {
                visitorCounterBar.style.display = 'flex';
            } else {
                visitorCounterBar.style.display = 'none';
            }
        }
        
        // إظهار قائمة المستخدم
        showUserMenu();
        
        showMessage(`مرحباً ${currentUser.name}!`, 'success');
    } else {
        // إظهار زر تسجيل الدخول وإخفاء زر لوحة الإدارة
        if (loginBtn) {
            loginBtn.style.display = 'flex';
        }
        
        if (adminBtn) {
            adminBtn.style.display = 'none';
        }
        
        // إخفاء عداد الزوار للمستخدمين غير المسجلين
        if (visitorCounterBar) {
            visitorCounterBar.style.display = 'none';
        }
        
        // إخفاء قائمة المستخدم
        hideUserMenu();
    }
}

// دالة إظهار قائمة المستخدم
function showUserMenu() {
    if (!currentUser) {
        return;
    }
    
    // إزالة القائمة الموجودة إن وجدت
    hideUserMenu();
    
    const userMenu = `
        <div class="user-menu">
            <div class="user-info">
                <i class="fas fa-user-circle"></i>
                <span>${currentUser.name}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="menu-items">
                <button onclick="showProfile()">
                    <i class="fas fa-user"></i>
                    الملف الشخصي
        </button>
                <button onclick="showChangePasswordModal()">
                    <i class="fas fa-key"></i>
                    تغيير كلمة المرور
                </button>
                <button onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    تسجيل الخروج
                </button>
            </div>
        </div>
    `;
    
    // إضافة القائمة للشريط
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.insertAdjacentHTML('beforeend', userMenu);
    }
}

// دالة إخفاء قائمة المستخدم
function hideUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.remove();
    }
}

// دوال السلة
function showCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        updateCartDisplay();
        cartModal.style.display = 'block';
    }
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

// دالة تحديث عرض السلة
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
        cartTotal.innerHTML = '<p>المجموع: 0 شيكل</p>';
        return;
    }
    
    const cartHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.price} شيكل</p>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity(${item.id}, -1)" class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="quantity-btn">+</button>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">حذف</button>
                </div>
            </div>
        </div>
    `).join('');
    
    cartItems.innerHTML = cartHTML;
    cartTotal.innerHTML = `<p>المجموع: ${calculateTotal()} شيكل</p>`;
}

// دالة تحديث الكمية
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('bloom_cart', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCount();
        }
    }
}

// دالة إزالة من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('bloom_cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
    showMessage('تم إزالة المنتج من السلة', 'success');
}

// دالة حساب المجموع
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// دالة تحديث عدد العناصر في السلة
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// دالة إضافة منتج إلى السلة
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showMessage('المنتج غير موجود', 'error');
        return;
    }
    
    // التحقق من المخزون
    if (product.stock !== undefined && product.stock <= 0) {
        showMessage('المنتج غير متوفر في المخزون', 'error');
        return;
    }
    
    // التحقق من وجود المنتج في السلة
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        // التحقق من المخزون
        if (product.stock !== undefined && existingItem.quantity >= product.stock) {
            showMessage('لا يمكن إضافة المزيد من هذا المنتج', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // حفظ السلة
    localStorage.setItem('bloom_cart', JSON.stringify(cart));
    
    // تحديث العرض
    updateCartDisplay();
    updateCartCount();
    
    showMessage('تم إضافة المنتج إلى السلة', 'success');
}

function checkout() {
    if (cart.length === 0) {
        showMessage('السلة فارغة', 'error');
        return;
    }
    
    // إغلاق نافذة السلة
    closeCart();
    
    // عرض نافذة إتمام الطلب
    showOrderModal();
}

// دالة إغلاق نافذة تسجيل الدخول
function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
}

// دالة عرض نافذة تسجيل الدخول
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
    }
}

// دالة إغلاق نافذة الطلب
function closeOrderModal() {
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
        orderModal.style.display = 'none';
    }
}

// دالة عرض لوحة الإدارة
function showAdminPanel() {
    if (!currentUser) {
        showMessage('يجب تسجيل الدخول أولاً', 'error');
        return;
    }
    
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
        showMessage('ليس لديك صلاحية للوصول للوحة الإدارة', 'error');
        return;
    }
    
    // إظهار نافذة لوحة الإدارة
    const adminPanelModal = document.getElementById('adminPanelModal');
    
    if (adminPanelModal) {
        // تحميل البيانات
        loadOrders();
        loadProducts();
        loadUsers();
        loadStats();
        
        // تحديث عداد الزوار
        updateVisitorCounter();
        
        adminPanelModal.style.display = 'block';
    } else {
        showMessage('خطأ في تحميل لوحة الإدارة', 'error');
    }
}

// دالة إغلاق لوحة الإدارة
function closeAdminPanel() {
    const adminPanelModal = document.getElementById('adminPanelModal');
    if (adminPanelModal) {
        adminPanelModal.style.display = 'none';
    }
}

// دالة إنشاء لوحة الإدارة
function createAdminPanel() {
    // استخدام النافذة الموجودة في HTML
    const adminPanelModal = document.getElementById('adminPanelModal');
    
    if (adminPanelModal) {
        // تحميل البيانات
        loadOrders();
        loadProducts();
        loadUsers();
        loadStats();
        
        // تحديث عداد الزوار
        updateVisitorCounter();
        
        // إظهار النافذة
        adminPanelModal.style.display = 'block';
    }
}

// دالة تبديل علامات التبويب في لوحة الإدارة
function showAdminTab(tabName) {
    // إخفاء جميع علامات التبويب
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // إزالة التفعيل من جميع الأزرار
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // تفعيل علامة التبويب المطلوبة
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // تفعيل الزر المطلوب
    const targetBtn = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}

// دالة إرسال إشعار للمديرين
function sendNotificationToAdmins(type, title, message, data = {}) {
    const adminUsers = users.filter(user => user.role === 'admin' || user.role === 'manager');
    
    adminUsers.forEach(admin => {
        const notification = {
            id: Date.now() + Math.random(),
            type: type,
            title: title,
            message: message,
            data: data,
            timestamp: new Date(),
            read: false,
            userId: admin.id
        };
        
        notifications.push(notification);
        
        // إظهار الإشعار في الواجهة إذا كان المدير مسجل دخول
        if (currentUser && currentUser.id === admin.id) {
            showNotification(notification);
        }
        
        // إرسال إشعار WhatsApp
        if (admin.phone) {
            sendWhatsAppNotification(notification, admin);
        }
        
        // إرسال إشعار بريد إلكتروني
        if (admin.email) {
            sendEmailNotification(notification, admin);
        }
    });
    
    // حفظ الإشعارات
    localStorage.setItem('bloom_notifications', JSON.stringify(notifications));
}

// دالة إظهار الإشعار في الواجهة
function showNotification(notification) {
    // إنشاء عنصر الإشعار
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification notification-${notification.type}`;
    notificationElement.innerHTML = `
        <div class="notification-header">
            <i class="fas ${getNotificationIcon(notification.type)}"></i>
            <span class="notification-title">${notification.title}</span>
            <button class="notification-close" onclick="closeNotification(this)">&times;</button>
            </div>
        <div class="notification-body">
            <p>${notification.message}</p>
            <small>${new Date(notification.timestamp).toLocaleString('ar-SA')}</small>
            </div>
    `;
    
    // إضافة الإشعار للصفحة
    document.body.appendChild(notificationElement);
    
    // إزالة الإشعار بعد 10 ثواني
    setTimeout(() => {
        if (notificationElement.parentNode) {
            notificationElement.remove();
        }
    }, 10000);
}

// دالة الحصول على أيقونة الإشعار
function getNotificationIcon(type) {
    switch (type) {
        case 'order': return 'fa-shopping-cart';
        case 'user': return 'fa-user';
        case 'product': return 'fa-box';
        case 'system': return 'fa-cog';
        default: return 'fa-bell';
    }
}

// دالة إغلاق الإشعار
function closeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.remove();
    }
}

// دالة إرسال إشعار WhatsApp
function sendWhatsAppNotification(notification, admin) {
    const message = `🔔 ${notification.title}

${notification.message}

⏰ ${new Date(notification.timestamp).toLocaleString('ar-SA')}

🔗 ${window.location.origin}`;

    const whatsappUrl = `https://wa.me/${admin.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// دالة إرسال إشعار بريد إلكتروني
function sendEmailNotification(notification, admin) {
    // في التطبيق الحقيقي، سيتم إرسال البريد الإلكتروني عبر السيرفر
    console.log(`إشعار بريد إلكتروني لـ ${admin.email}: ${notification.title} - ${notification.message}`);
    
    // محاكاة إرسال البريد الإلكتروني
    showMessage(`تم إرسال إشعار بريد إلكتروني لـ ${admin.email}`, 'info');
}

function completeOrder() {
    const name = document.getElementById('orderName').value;
    const phone = document.getElementById('orderPhone').value;
    const address = document.getElementById('orderAddress').value;
    
    if (!name || !phone || !address) {
        showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showMessage('السلة فارغة', 'error');
        return;
    }
    
    // الحصول على خيار التوصيل المحدد
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    const shippingOption = selectedShipping ? SHIPPING_OPTIONS[selectedShipping.value] : SHIPPING_OPTIONS.ramallah;
    
    const order = {
        id: Date.now(),
        userId: currentUser ? currentUser.id : null,
        userName: name,
        userPhone: phone,
        userEmail: currentUser ? currentUser.email : '',
        items: [...cart],
        subtotal: calculateTotal(),
        shippingCost: shippingOption.price,
        shippingArea: shippingOption.name,
        total: calculateTotalWithShipping(),
        status: 'pending',
        orderDate: new Date(),
        deliveryAddress: address
    };
    
    // حفظ الطلب
    orders.push(order);
    localStorage.setItem('bloom_orders', JSON.stringify(orders));
    
    // إرسال إشعار للمديرين
    sendNotificationToAdmins(
        'order',
        'طلب جديد',
        `تم استلام طلب جديد من ${name} بمبلغ ${order.total} ₪`,
        { order: order }
    );
    
    // إفراغ السلة
    cart = [];
    localStorage.setItem('bloom_cart', JSON.stringify(cart));
    
    // إغلاق نافذة الطلب
    closeOrderModal();
    
    // تحديث الواجهة
    updateCartDisplay();
    
    showMessage('تم إتمام الطلب بنجاح! سنتواصل معك قريباً', 'success');
}

// دالة عرض نافذة إضافة منتج
function showAddProductModal() {
    const modal = `
        <div class="modal" id="addProductModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>إضافة منتج جديد</h3>
                    <button class="close-btn" onclick="closeAddProductModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addProductForm" onsubmit="addProduct(event)">
                        <div class="form-group">
                            <label for="productName">اسم المنتج *</label>
                            <input type="text" id="productName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="productDescription">وصف المنتج *</label>
                            <textarea id="productDescription" rows="3" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="productPrice">السعر (شيكل) *</label>
                            <input type="number" id="productPrice" min="0" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="productCategory">الفئة *</label>
                            <select id="productCategory" required>
                                <option value="">اختر الفئة</option>
                                <option value="أكواب">أكواب</option>
                                <option value="مشروبات باردة">مشروبات باردة</option>
                                <option value="مشروبات ساخنة">مشروبات ساخنة</option>
                                <option value="بوكسات حفلات">بوكسات حفلات</option>
                                <option value="تنظيم حفلات">تنظيم حفلات</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="productStock">المخزون *</label>
                            <input type="number" id="productStock" min="0" value="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="productImage">صورة المنتج *</label>
                            <input type="file" id="productImage" accept="image/*" required onchange="previewImage(this)">
                            <small class="form-help">يجب أن تكون الصورة بصيغة JPG أو PNG</small>
                        </div>
                        
                        <div id="imagePreview" class="image-preview" style="display: none;">
                            <img id="previewImg" src="" alt="معاينة الصورة">
                            <button type="button" class="btn-remove-image" onclick="removeImage()">&times;</button>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" onclick="closeAddProductModal()" class="btn-cancel">إلغاء</button>
                            <button type="submit" class="btn-login-submit">إضافة المنتج</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    document.getElementById('addProductModal').style.display = 'block';
}

// دالة إغلاق نافذة إضافة منتج
function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.remove();
    }
}

// دالة معاينة الصورة
function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            const img = document.getElementById('previewImg');
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// دالة إزالة الصورة
function removeImage() {
    const input = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');
    input.value = '';
    preview.style.display = 'none';
}

// دالة إضافة منتج
function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const stock = parseInt(document.getElementById('productStock').value);
    const imageFile = document.getElementById('productImage').files[0];
    
    if (!imageFile) {
        showMessage('يرجى اختيار صورة للمنتج', 'error');
        return;
    }
    
    // تحويل الصورة إلى Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const newProduct = {
            id: Date.now(),
            name: name,
            description: description,
            price: price,
            category: category,
            stock: stock,
            image: e.target.result
        };
        
        products.push(newProduct);
        localStorage.setItem('bloom_products', JSON.stringify(products));
        
        closeAddProductModal();
        loadProducts();
    displayProducts(products);
    
    showMessage('تم إضافة المنتج بنجاح', 'success');
        
        // إرسال إشعار للمديرين
        sendNotificationToAdmins(
            'product',
            'منتج جديد',
            `تم إضافة منتج جديد: ${name}`,
            { product: newProduct }
        );
    };
    reader.readAsDataURL(imageFile);
}

// دالة عرض نافذة إضافة مستخدم
function showAddUserModal() {
    const modal = `
        <div class="modal" id="addUserModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>إضافة مستخدم جديد</h3>
                    <button class="close-btn" onclick="closeAddUserModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addUserForm" onsubmit="addUser(event)">
                        <div class="form-group">
                            <label for="userName">الاسم الكامل *</label>
                            <input type="text" id="userName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="userEmail">البريد الإلكتروني *</label>
                            <input type="email" id="userEmail" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="userPhone">رقم الهاتف *</label>
                            <input type="tel" id="userPhone" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="userPassword">كلمة المرور *</label>
                            <input type="password" id="userPassword" required onkeyup="validatePasswordStrength(this.value)">
                            <div id="passwordStrength" class="password-requirements"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="userRole">الدور *</label>
                            <select id="userRole" required>
                                <option value="">اختر الدور</option>
                                <option value="user">مستخدم</option>
                                <option value="manager">مدير فرعي</option>
                                <option value="admin">مدير</option>
                            </select>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" onclick="closeAddUserModal()" class="btn-cancel">إلغاء</button>
                            <button type="submit" class="btn-login-submit">إضافة المستخدم</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    document.getElementById('addUserModal').style.display = 'block';
}

// دالة إغلاق نافذة إضافة مستخدم
function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.remove();
    }
}

// دالة إضافة مستخدم
function addUser(event) {
    event.preventDefault();
    
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    
    // التحقق من قوة كلمة المرور
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showMessage(passwordValidation.message, 'error');
        return;
    }
    
    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        showMessage('البريد الإلكتروني مستخدم بالفعل', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        phone: phone,
        role: role,
        twoFactorEnabled: false,
        loginAttempts: 0,
        isLocked: false,
        lockExpiry: null,
        createdAt: new Date(),
        lastLogin: null
    };
    
    users.push(newUser);
    localStorage.setItem('bloom_users', JSON.stringify(users));
    
    closeAddUserModal();
    loadUsers();
    
    showMessage('تم إضافة المستخدم بنجاح', 'success');
    
    // إرسال إشعار للمديرين
    sendNotificationToAdmins(
        'user',
        'مستخدم جديد',
        `تم إضافة مستخدم جديد: ${name} (${getUserRoleText(role)})`,
        { user: newUser }
    );
}

// دالة التحقق من قوة كلمة المرور
function validatePasswordStrength(password) {
    const strengthDiv = document.getElementById('passwordStrength');
    if (!strengthDiv) return;
    
    const validation = validatePassword(password);
    strengthDiv.innerHTML = validation.message;
    strengthDiv.className = `password-requirements ${validation.valid ? 'valid' : 'invalid'}`;
}

// دوال تعديل وحذف (مؤقتة)
function editProduct(productId) {
    showMessage('ميزة التعديل قيد التطوير', 'info');
}

function editUser(userId) {
    showMessage('ميزة التعديل قيد التطوير', 'info');
}

// دالة إخفاء عداد الزوار افتراضياً
function hideVisitorCounter() {
    const visitorCounterBar = document.querySelector('.visitor-counter-bar');
    if (visitorCounterBar) {
        visitorCounterBar.style.display = 'none';
    }
}



// دوال المنتجات
function loadProducts() {
    const productsList = document.getElementById('productsList');
    if (!productsList) {
        return;
    }
    
    if (products.length === 0) {
        productsList.innerHTML = '<p class="no-data">لا توجد منتجات حالياً</p>';
        return;
    }
    
    const productsHTML = products.map(product => `
        <div class="product-item">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p><strong>السعر:</strong> ${product.price} شيكل</p>
                <p><strong>الفئة:</strong> ${product.category}</p>
                <p><strong>المخزون:</strong> ${product.stock || 0}</p>
            </div>
            <div class="product-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">
                    تعديل
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">
                    حذف
                </button>
            </div>
        </div>
    `).join('');
    
    productsList.innerHTML = productsHTML;
}

function loadCategories() {
    categories = [
        { id: 1, name: 'أكواب', icon: 'fas fa-mug-hot' },
        { id: 2, name: 'مشروبات باردة', icon: 'fas fa-glass-whiskey' },
        { id: 3, name: 'مشروبات ساخنة', icon: 'fas fa-coffee' },
        { id: 4, name: 'بوكسات حفلات', icon: 'fas fa-gift' },
        { id: 5, name: 'تنظيم حفلات', icon: 'fas fa-birthday-cake' }
    ];
}

function displayProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        grid.innerHTML = '<p class="no-products">لا توجد منتجات متاحة</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${product.price} شيكل</div>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
            إضافة إلى السلة
        </button>
    `;
    
    return card;
}

function filterByCategory(categoryName) {
    if (categoryName === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === categoryName);
        displayProducts(filteredProducts);
    }
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayProducts(products);
        return;
    }
    
    const searchResults = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    
    if (searchResults.length === 0) {
        showMessage('لم يتم العثور على منتجات تطابق البحث', 'info');
    }
    
    displayProducts(searchResults);
}

// دالة تحميل البيانات المحفوظة
function loadSavedData() {
    // تحميل المستخدمين
    const savedUsers = localStorage.getItem('bloom_users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
    
    // تحميل المنتجات
    loadProductsFromStorage();
    
    // تحميل السلة
    const savedCart = localStorage.getItem('bloom_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    // تحميل الطلبات
    const savedOrders = localStorage.getItem('bloom_orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
    
    // تحميل المستخدم الحالي من sessionStorage (تنتهي عند إغلاق المتصفح)
    const savedCurrentUser = sessionStorage.getItem('currentUser');
    if (savedCurrentUser) {
        currentUser = JSON.parse(savedCurrentUser);
    }
    
    // تحميل الإحصائيات
    const savedStats = localStorage.getItem('bloom_visitor_stats');
    if (savedStats) {
        visitorStats = JSON.parse(savedStats);
    }
    
    // تحميل الإشعارات
    const savedNotifications = localStorage.getItem('bloom_notifications');
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
    }
}

// دالة عرض الرسائل
function showMessage(message, type = 'info') {
    // إزالة الرسائل الموجودة
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <span>${message}</span>
            <button class="message-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // إزالة الرسالة تلقائياً بعد 5 ثوان
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// دالة مسح بيانات المستخدم الحالي
function clearCurrentUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    cart = [];
    localStorage.removeItem('bloom_cart');
}

// مستمع لحدث إغلاق الصفحة
window.addEventListener('beforeunload', function() {
    // مسح بيانات المستخدم الحالي عند إغلاق الصفحة
    localStorage.removeItem('currentUser');
    localStorage.removeItem('bloom_cart');
});

// مستمع لحدث عدم النشاط
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(function() {
        // تسجيل الخروج تلقائياً بعد 30 دقيقة من عدم النشاط
        if (currentUser) {
            clearCurrentUser();
            updateUI();
            showMessage('تم تسجيل الخروج تلقائياً بسبب عدم النشاط', 'info');
        }
    }, 30 * 60 * 1000); // 30 دقيقة
}

// إعادة تعيين المؤقت عند أي نشاط
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// دالة تحميل المستخدم المحفوظ (للمدير فقط)
function loadSavedUser() {
    // لا نحمّل أي مستخدم تلقائياً - يجب تسجيل الدخول يدوياً دائماً
    return false;
}

// دالة عرض الملف الشخصي
function showProfile() {
    if (!currentUser) return;
    
    const modal = `
        <div class="modal" id="profileModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>الملف الشخصي</h3>
                    <button class="close-btn" onclick="closeProfileModal()">&times;</button>
            </div>
                <div class="modal-body">
                    <div class="profile-info">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
            </div>
                        <div class="profile-details">
                            <h4>${currentUser.name}</h4>
                            <p><strong>البريد الإلكتروني:</strong> ${currentUser.email}</p>
                            <p><strong>الهاتف:</strong> ${currentUser.phone}</p>
                            <p><strong>الدور:</strong> ${getUserRoleText(currentUser.role)}</p>
                            <p><strong>تاريخ الإنشاء:</strong> ${new Date(currentUser.createdAt).toLocaleDateString('ar-SA')}</p>
                            <p><strong>آخر تسجيل دخول:</strong> ${currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString('ar-SA') : 'لم يسجل دخول بعد'}</p>
            </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn-change-password" onclick="showChangePasswordModal()">
                            <i class="fas fa-key"></i>
                            تغيير كلمة المرور
                        </button>
                    </div>
                </div>
            </div>
            </div>
        `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    document.getElementById('profileModal').style.display = 'block';
}

// دالة إغلاق نافذة الملف الشخصي
function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.remove();
    }
}

// دالة الحصول على دور المستخدم
function getUserRole(role) {
    switch (role) {
        case 'admin': return 'مدير';
        case 'manager': return 'مدير فرعي';
        case 'user': return 'مستخدم';
        default: return role;
    }
}

// دالة عرض نافذة تغيير كلمة المرور
function showChangePasswordModal() {
    const modal = `
        <div class="modal" id="changePasswordModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تغيير كلمة المرور</h3>
                    <button class="close-btn" onclick="closeChangePasswordModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="changePasswordForm" onsubmit="changePassword(event)">
                        <div class="form-group">
                            <label for="currentPassword">كلمة المرور الحالية *</label>
                            <input type="password" id="currentPassword" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="newPassword">كلمة المرور الجديدة *</label>
                            <input type="password" id="newPassword" required onkeyup="validatePasswordStrength(this.value)">
                            <div id="passwordStrength" class="password-requirements"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirmPassword">تأكيد كلمة المرور الجديدة *</label>
                            <input type="password" id="confirmPassword" required>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" onclick="closeChangePasswordModal()" class="btn-cancel">إلغاء</button>
                            <button type="submit" class="btn-login-submit">تغيير كلمة المرور</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    document.getElementById('changePasswordModal').style.display = 'block';
}

// دالة إغلاق نافذة تغيير كلمة المرور
function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.remove();
    }
}

// دالة تغيير كلمة المرور
function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // التحقق من كلمة المرور الحالية
    if (currentPassword !== currentUser.password) {
        showMessage('كلمة المرور الحالية غير صحيحة', 'error');
        return;
    }
    
    // التحقق من تطابق كلمتي المرور الجديدتين
    if (newPassword !== confirmPassword) {
        showMessage('كلمتا المرور الجديدتان غير متطابقتين', 'error');
        return;
    }
    
    // التحقق من قوة كلمة المرور الجديدة
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        showMessage(passwordValidation.message, 'error');
        return;
    }
    
    // تحديث كلمة المرور
    currentUser.password = newPassword;
    
    // تحديث المستخدم في المصفوفة
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('bloom_users', JSON.stringify(users));
    }
    
    // حفظ المستخدم الحالي
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    closeChangePasswordModal();
    showMessage('تم تغيير كلمة المرور بنجاح', 'success');
}

// دالة تحميل الطلبات في لوحة الإدارة
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) {
        return;
    }
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-data">لا توجد طلبات حالياً</p>';
        return;
    }
    
    const ordersHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <h4>طلب رقم #${order.id}</h4>
                <span class="order-status ${order.status}">${getOrderStatusText(order.status)}</span>
            </div>
            <div class="order-details">
                <div class="customer-info">
                    <p><strong>العميل:</strong> ${order.customerName}</p>
                    <p><strong>الهاتف:</strong> ${order.customerPhone}</p>
                    <p><strong>العنوان:</strong> ${order.customerAddress}</p>
                    <p><strong>منطقة التوصيل:</strong> ${order.shippingArea}</p>
            </div>
            <div class="order-items">
                    <h5>المنتجات:</h5>
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <span>${item.name}</span>
                            <span>${item.quantity} × ${item.price} شيكل</span>
                            <span>${item.total} شيكل</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <p><strong>المجموع الفرعي:</strong> ${order.subtotal} شيكل</p>
                    <p><strong>تكلفة التوصيل:</strong> ${order.shippingCost} شيكل</p>
                    <p><strong>المجموع الكلي:</strong> ${order.total} شيكل</p>
                    <p><strong>تاريخ الطلب:</strong> ${new Date(order.orderDate).toLocaleDateString('ar-SA')}</p>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn-status" onclick="updateOrderStatus(${order.id}, 'processing')">
                    معالجة
                </button>
                <button class="btn-status" onclick="updateOrderStatus(${order.id}, 'shipped')">
                    تم الشحن
                </button>
                <button class="btn-status" onclick="updateOrderStatus(${order.id}, 'delivered')">
                    تم التوصيل
                </button>
                <button class="btn-delete" onclick="deleteOrder(${order.id})">
                    حذف
                </button>
            </div>
        </div>
    `).join('');
    
    ordersList.innerHTML = ordersHTML;
}

// دالة تحميل المستخدمين في لوحة الإدارة
function loadUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) {
        return;
    }
    
    if (users.length === 0) {
        usersList.innerHTML = '<p class="no-data">لا توجد مستخدمين حالياً</p>';
        return;
    }
    
    const usersHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <h4>${user.name}</h4>
                <p><strong>البريد الإلكتروني:</strong> ${user.email}</p>
                <p><strong>الهاتف:</strong> ${user.phone}</p>
                <p><strong>الدور:</strong> ${getUserRoleText(user.role)}</p>
                <p><strong>تاريخ الإنشاء:</strong> ${new Date(user.createdAt).toLocaleDateString('ar-SA')}</p>
                <p><strong>آخر تسجيل دخول:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-SA') : 'لم يسجل دخول بعد'}</p>
            </div>
            <div class="user-actions">
                <button class="btn-edit" onclick="editUser(${user.id})">
                    تعديل
                </button>
                <button class="btn-delete" onclick="deleteUser(${user.id})">
                    حذف
                </button>
            </div>
        </div>
    `).join('');
    
    usersList.innerHTML = usersHTML;
}

// دالة تحميل الإحصائيات في لوحة الإدارة
function loadStats() {
    const statsContent = document.getElementById('statsContent');
    if (!statsContent) {
        return;
    }
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    
    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="stat-info">
                    <h3>${totalOrders}</h3>
                    <p>إجمالي الطلبات</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="stat-info">
                    <h3>${totalRevenue} شيكل</h3>
                    <p>إجمالي الإيرادات</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <h3>${pendingOrders}</h3>
                    <p>الطلبات المعلقة</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>${completedOrders}</h3>
                    <p>الطلبات المكتملة</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3>${users.length}</h3>
                    <p>إجمالي المستخدمين</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="stat-info">
                    <h3>${products.length}</h3>
                    <p>إجمالي المنتجات</p>
                </div>
            </div>
        </div>
    `;
    
    statsContent.innerHTML = statsHTML;
    
    // تحديث عداد الزوار في لوحة الإدارة
    updateVisitorCounter();
}

// دوال مساعدة
function getOrderStatusText(status) {
    switch (status) {
        case 'pending': return 'معلق';
        case 'processing': return 'قيد المعالجة';
        case 'shipped': return 'تم الشحن';
        case 'delivered': return 'تم التوصيل';
        case 'cancelled': return 'ملغي';
        default: return 'غير محدد';
    }
}

function getUserRoleText(role) {
    switch (role) {
        case 'admin': return 'مدير';
        case 'manager': return 'مدير فرعي';
        case 'user': return 'مستخدم';
        default: return 'غير محدد';
    }
}

// دالة تحديث حالة الطلب
function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('bloom_orders', JSON.stringify(orders));
        loadOrders();
        showMessage(`تم تحديث حالة الطلب #${orderId} إلى ${getOrderStatusText(newStatus)}`, 'success');
    }
}

// دالة حذف الطلب
function deleteOrder(orderId) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('bloom_orders', JSON.stringify(orders));
        loadOrders();
        showMessage('تم حذف الطلب بنجاح', 'success');
    }
}

// دالة حذف المنتج
function deleteProduct(productId) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('bloom_products', JSON.stringify(products));
        loadProducts();
        displayProducts(products);
        showMessage('تم حذف المنتج بنجاح', 'success');
    }
}

// دالة حذف المستخدم
function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('bloom_users', JSON.stringify(users));
        loadUsers();
        showMessage('تم حذف المستخدم بنجاح', 'success');
    }
}

// دالة تحديث الطلبات
function refreshOrders() {
    loadOrders();
    showMessage('تم تحديث الطلبات', 'success');
}

// دالة تحميل المنتجات من localStorage
function loadProductsFromStorage() {
    // تحميل المنتجات من localStorage أو استخدام منتجات افتراضية
    const savedProducts = localStorage.getItem('bloom_products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // منتجات افتراضية
        products = [
            {
                id: 1,
                name: 'كوب قهوة فاخر',
                description: 'كوب قهوة فاخر مصنوع من السيراميك عالي الجودة، مثالي للقهوة العربية والتركية',
                price: 45,
                category: 'أكواب',
                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
            },
            {
                id: 2,
                name: 'عصير برتقال طازج',
                description: 'عصير برتقال طازج 100% مع قطع البرتقال الطبيعية',
                price: 25,
                category: 'مشروبات باردة',
                image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop'
            },
            {
                id: 3,
                name: 'قهوة تركية',
                description: 'قهوة تركية أصلية مع الهيل والزعفران',
                price: 35,
                category: 'مشروبات ساخنة',
                image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
            },
            {
                id: 4,
                name: 'بوكس هدايا عيد الميلاد',
                description: 'بوكس هدايا مميز يحتوي على مشروبات وحلويات',
                price: 120,
                category: 'بوكسات حفلات',
                image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=300&fit=crop'
            },
            {
                id: 5,
                name: 'خدمة تنظيم حفلة عيد ميلاد',
                description: 'خدمة شاملة لتنظيم حفلة عيد الميلاد مع الديكورات والمشروبات',
                price: 500,
                category: 'تنظيم حفلات',
                image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop'
            }
        ];
        localStorage.setItem('bloom_products', JSON.stringify(products));
    }
    
    displayProducts(products);
}





// دالة إصلاح المشاكل المحتملة
function fixCommonIssues() {
    // التأكد من وجود المدير في مصفوفة المستخدمين
    if (!users || users.length === 0) {
        users = [
            {
                id: 1,
                name: 'روزان طميزي',
                email: 'bloom.company.ps@gmail.com',
                password: 'Admin123!@#',
                phone: '0566411202',
                role: 'admin',
                twoFactorEnabled: false,
                loginAttempts: 0,
                isLocked: false,
                lockExpiry: null,
                createdAt: new Date(),
                lastLogin: null
            },
            {
                id: 2,
                name: 'مدير فرعي',
                email: 'manager@bloom.com',
                password: 'Manager123!',
                phone: '0566390701',
                role: 'manager',
                twoFactorEnabled: false,
                loginAttempts: 0,
                isLocked: false,
                lockExpiry: null,
                createdAt: new Date(),
                lastLogin: null
            },
            {
                id: 3,
                name: 'مستخدم عادي',
                email: 'user@bloom.com',
                password: 'User123!',
                phone: '0566390702',
                role: 'user',
                twoFactorEnabled: false,
                loginAttempts: 0,
                isLocked: false,
                lockExpiry: null,
                createdAt: new Date(),
                lastLogin: null
            }
        ];
        localStorage.setItem('bloom_users', JSON.stringify(users));
    }
    
    // التأكد من وجود المنتجات
    if (!products || products.length === 0) {
        loadProductsFromStorage();
    }
    
    // التأكد من وجود الطلبات
    if (!orders) {
        orders = [];
        localStorage.setItem('bloom_orders', JSON.stringify(orders));
    }
    
    // التأكد من وجود الإحصائيات
    if (!visitorStats) {
        visitorStats = {
            totalVisitors: 0,
            uniqueVisitors: 0,
            pageViews: 0,
            currentVisitors: 0,
            lastVisit: null,
            visitHistory: []
        };
        localStorage.setItem('bloom_visitor_stats', JSON.stringify(visitorStats));
    }
}

// دالة تفعيل شريط التصنيفات
function activateCategoryLink() {
    const categoryLinks = document.querySelectorAll('.category-link');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        categoryLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // تفعيل النقر على الروابط
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const navHeight = document.querySelector('.categories-nav').offsetHeight;
                const totalOffset = headerHeight + navHeight + 20;
                
                window.scrollTo({
                    top: targetSection.offsetTop - totalOffset,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// دالة تحديث عداد الزوار
function updateVisitorCounter() {
    const currentVisitorsElement = document.getElementById('currentVisitors');
    const activeUsersElement = document.getElementById('activeUsers');
    const totalViewsElement = document.getElementById('totalViews');
    const totalVisitorsElement = document.getElementById('totalVisitors');
    
    if (currentVisitorsElement) {
        currentVisitorsElement.textContent = visitorStats.currentVisitors;
    }
    
    if (activeUsersElement) {
        activeUsersElement.textContent = users.filter(user => user.lastLogin && 
            new Date() - new Date(user.lastLogin) < 30 * 60 * 1000).length;
    }
    
    if (totalViewsElement) {
        totalViewsElement.textContent = visitorStats.pageViews;
    }
    
    if (totalVisitorsElement) {
        totalVisitorsElement.textContent = visitorStats.totalVisitors;
    }
}

// دالة اختبار تسجيل الدخول
function testLogin() {
    console.log('اختبار تسجيل الدخول...');
    console.log('المستخدمين المتاحين:', users);
    
    // اختبار المدير
    const admin = users.find(u => u.role === 'admin');
    if (admin) {
        console.log('معلومات المدير:', {
            email: admin.email,
            password: admin.password,
            name: admin.name
        });
    }
    
    // اختبار المدير الفرعي
    const manager = users.find(u => u.role === 'manager');
    if (manager) {
        console.log('معلومات المدير الفرعي:', {
            email: manager.email,
            password: manager.password,
            name: manager.name
        });
    }
}



// دالة مسح البيانات المحفوظة
function clearStoredData() {
    console.log('مسح البيانات المحفوظة...');
    
    // مسح البيانات من localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('bloom_users');
    localStorage.removeItem('bloom_orders');
    localStorage.removeItem('bloom_products');
    localStorage.removeItem('bloom_visitor_stats');
    localStorage.removeItem('rememberMe');
    
    // مسح البيانات من sessionStorage
    sessionStorage.removeItem('currentUser');
    
    // إعادة تحميل الصفحة
    location.reload();
}



// دالة فحص النموذج
function checkLoginForm() {
    console.log('=== فحص نموذج تسجيل الدخول ===');
    
    const loginForm = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const submitButton = document.querySelector('.btn-login-submit');
    
    if (!loginForm) {
        console.log('❌ النموذج غير موجود');
        return;
    }
    
    if (!loginEmail) {
        console.log('❌ حقل البريد الإلكتروني غير موجود');
        return;
    }
    
    if (!loginPassword) {
        console.log('❌ حقل كلمة المرور غير موجود');
        return;
    }
    
    if (!submitButton) {
        console.log('❌ زر الإرسال غير موجود');
        return;
    }
    
    console.log('✅ النموذج موجود');
    console.log('✅ حقل البريد الإلكتروني موجود');
    console.log('✅ حقل كلمة المرور موجود');
    console.log('✅ زر الإرسال موجود');
    
    // فحص event listener
    console.log('فحص event listener للنموذج...');
    
    // إزالة event listeners القديمة
    const newForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newForm, loginForm);
    
    // إضافة event listener جديد
    newForm.addEventListener('submit', function(e) {
        console.log('تم استقبال حدث submit');
        handleLogin(e);
    });
    
    console.log('✅ تم إضافة event listener جديد للنموذج');
}

// دالة التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// دالة التحقق من أن البريد الإلكتروني فعال
function isEmailActive(email) {
    // قائمة بالبريد الإلكتروني الفعال للمدير
    const activeEmails = [
        'baraatomeze@gmail.com',
        'manager@bloom.com',
        'user@bloom.com'
    ];
    
    return activeEmails.includes(email);
}

// دالة اختبار البريد الإلكتروني
function testEmailValidation() {
    console.log('=== اختبار التحقق من البريد الإلكتروني ===');
    
    const testEmails = [
        'baraatomeze@gmail.com',
        'manager@bloom.com',
        'user@bloom.com',
        'invalid-email',
        'test@test',
        'nonexistent@example.com'
    ];
    
    testEmails.forEach(email => {
        const isValid = validateEmail(email);
        const isActive = isEmailActive(email);
        
        console.log(`البريد الإلكتروني: ${email}`);
        console.log(`صحيح الشكل: ${isValid ? '✅' : '❌'}`);
        console.log(`فعال في النظام: ${isActive ? '✅' : '❌'}`);
        console.log('---');
    });
}

// دالة عرض البريد الإلكتروني الفعال
function showActiveEmails() {
    console.log('=== البريد الإلكتروني الفعال في النظام ===');
    
    const activeEmails = [
        'baraatomeze@gmail.com',
        'manager@bloom.com',
        'user@bloom.com'
    ];
    
    console.log('البريد الإلكتروني المسموح به:');
    activeEmails.forEach((email, index) => {
        console.log(`${index + 1}. ${email}`);
    });
    
    return activeEmails;
}

// دالة تحسين رسائل الخطأ
function getErrorMessage(email, password) {
    if (!email) {
        return 'يرجى إدخال البريد الإلكتروني';
    }
    
    if (!password) {
        return 'يرجى إدخال كلمة المرور';
    }
    
    if (!validateEmail(email)) {
        return 'البريد الإلكتروني غير صحيح';
    }
    
    if (!isEmailActive(email)) {
        return 'البريد الإلكتروني غير مسجل في النظام';
    }
    
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
}





