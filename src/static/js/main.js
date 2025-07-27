// QueenCare Website JavaScript

// Global variables
let currentUser = null;
let products = [];
let cart = JSON.parse(localStorage.getItem('queencare_cart')) || [];
let doctors = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
async function initializeApp() {
    await checkAuthStatus();
    await loadProducts();
    await loadDoctors();
    updateCartDisplay();
    setupEventListeners();
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/check-auth');
        const data = await response.json();
        
        if (data.authenticated) {
            const userResponse = await fetch('/api/auth/me');
            const userData = await userResponse.json();
            
            if (userData.user) {
                currentUser = userData.user;
                updateAuthUI(true);
            }
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateAuthUI(false);
    }
}

// Update authentication UI
function updateAuthUI(isAuthenticated) {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    
    if (isAuthenticated && currentUser) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = `مرحباً، ${currentUser.name}`;
    } else {
        loginBtn.style.display = 'inline-block';
        signupBtn.style.display = 'inline-block';
        userMenu.style.display = 'none';
    }
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        products = data.products || [];
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('خطأ في تحميل المنتجات', 'error');
    }
}

// Display products
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('products-grid');
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">لا توجد منتجات متاحة</p>';
        return;
    }
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image_url}" alt="${product.name}" class="product-image" onerror="this.src='/static/images/placeholder.jpg'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)} ل.س</div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        إضافة للسلة
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Format price with thousands separator
function formatPrice(price) {
    return new Intl.NumberFormat('ar-SY').format(price);
}

// Load doctors from API
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors');
        const data = await response.json();
        doctors = data.doctors || [];
        populateDoctorSelect();
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Populate doctor select dropdown
function populateDoctorSelect() {
    const doctorSelect = document.querySelector('select[name="doctor_id"]');
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">اختاري طبيب</option>' +
            doctors.map(doctor => `
                <option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>
            `).join('');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Authentication buttons
    document.getElementById('login-btn').addEventListener('click', () => openModal('login-modal'));
    document.getElementById('signup-btn').addEventListener('click', () => openModal('signup-modal'));
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('skin-analysis-form').addEventListener('submit', handleSkinAnalysis);
    document.getElementById('appointment-form').addEventListener('submit', handleAppointment);
    
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterProducts(e.target.dataset.category));
    });
    
    // Doctor selection change
    const doctorSelect = document.querySelector('select[name="doctor_id"]');
    if (doctorSelect) {
        doctorSelect.addEventListener('change', updateAvailableTimes);
    }
    
    // Navigation links (including footer quick links)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            if (sectionId) {
                // Handle special cases for section IDs
                let targetSectionId = sectionId;
                if (sectionId === 'skin-analysis') {
                    targetSectionId = 'skin-analysis';
                } else if (sectionId === 'appointments') {
                    targetSectionId = 'appointments';
                }
                showSection(sectionId);
            }
        });
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            updateAuthUI(true);
            closeModal('login-modal');
            showMessage('تم تسجيل الدخول بنجاح', 'success');
            e.target.reset();
        } else {
            showMessage(data.error || 'خطأ في تسجيل الدخول', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('خطأ في الاتصال', 'error');
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const signupData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            updateAuthUI(true);
            closeModal('signup-modal');
            showMessage('تم إنشاء الحساب بنجاح', 'success');
            e.target.reset();
        } else {
            showMessage(data.error || 'خطأ في إنشاء الحساب', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('خطأ في الاتصال', 'error');
    }
}

// Handle logout
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        updateAuthUI(false);
        showMessage('تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Filter products by category
function filterProducts(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Filter and display products
    const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
    displayProducts(filteredProducts);
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: 1
        });
    }
    
    localStorage.setItem('queencare_cart', JSON.stringify(cart));
    updateCartDisplay();
    showMessage(`تم إضافة ${product.name} إلى السلة`, 'success');
}

// Update cart display
function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    displayCartItems();
}

// Display cart items
function displayCartItems() {
    const emptyCart = document.getElementById('empty-cart');
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.style.display = 'none';
        return;
    }
    
    emptyCart.style.display = 'none';
    cartItems.style.display = 'block';
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartItems.innerHTML = `
        <div class="cart-items-list">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image_url}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>السعر: ${formatPrice(item.price)} ل.س</p>
                        <div class="quantity-controls">
                            <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>الكمية: ${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">حذف</button>
                </div>
            `).join('')}
        </div>
        <div class="cart-total">
            <h3>المجموع الكلي: ${formatPrice(totalPrice)} ل.س</h3>
            <div class="checkout-section">
                <h4>طريقة الدفع:</h4>
                <select id="payment-method" required>
                    <option value="">اختاري طريقة الدفع</option>
                    <option value="cash_on_delivery">الدفع عند الاستلام</option>
                    <option value="syriatel_cash">سيرياتيل كاش</option>
                    <option value="bank_al_baraka">بنك البركة</option>
                </select>
                <button onclick="checkout()" class="btn-primary">إتمام الطلب</button>
            </div>
        </div>
    `;
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('queencare_cart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('queencare_cart', JSON.stringify(cart));
    updateCartDisplay();
    showMessage('تم حذف المنتج من السلة', 'success');
}

// Checkout
async function checkout() {
    if (!currentUser) {
        showMessage('يجب تسجيل الدخول أولاً', 'error');
        openModal('login-modal');
        return;
    }
    
    const paymentMethod = document.getElementById('payment-method').value;
    if (!paymentMethod) {
        showMessage('يرجى اختيار طريقة الدفع', 'error');
        return;
    }
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
        products: cart,
        total_price: totalPrice,
        payment_method: paymentMethod
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            cart = [];
            localStorage.removeItem('queencare_cart');
            updateCartDisplay();
            showMessage('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً', 'success');
        } else {
            showMessage(data.error || 'خطأ في إرسال الطلب', 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showMessage('خطأ في الاتصال', 'error');
    }
}

// Handle skin analysis
async function handleSkinAnalysis(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const age = formData.get('age');
    const issues = formData.getAll('issues');
    const routine = formData.get('routine');
    
    // Simple rule-based skin analysis
    let skinType = 'مختلطة';
    let recommendations = [];
    
    if (issues.includes('oiliness')) {
        skinType = 'دهنية';
        recommendations.push('Salicylic Acid', 'TTO (Tea Tree Oil)');
    } else if (issues.includes('dryness')) {
        skinType = 'جافة';
        recommendations.push('Hyaluronic Acid Serum', 'Body Lotion');
    }
    
    if (issues.includes('acne')) {
        recommendations.push('Salicylic Acid', 'TTO (Tea Tree Oil)');
    }
    
    if (issues.includes('dark-spots')) {
        recommendations.push('Vitamin C Serum', 'Liquorice Lotion');
    }
    
    if (issues.includes('wrinkles')) {
        recommendations.push('Vitamin C Serum', 'Hyaluronic Acid Serum');
    }
    
    // Remove duplicates
    recommendations = [...new Set(recommendations)];
    
    // Get recommended products
    const recommendedProducts = products.filter(product => 
        recommendations.some(rec => product.name.includes(rec))
    );
    
    displayAnalysisResults(skinType, recommendedProducts);
}

// Display skin analysis results
function displayAnalysisResults(skinType, recommendedProducts) {
    const resultsDiv = document.getElementById('analysis-results');
    
    resultsDiv.innerHTML = `
        <h3>نتائج تحليل البشرة</h3>
        <p><strong>نوع بشرتك:</strong> ${skinType}</p>
        <h4>المنتجات المناسبة لك:</h4>
        <div class="recommended-products">
            ${recommendedProducts.map(product => `
                <div class="recommended-product">
                    <img src="${product.image_url}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <h5>${product.name}</h5>
                        <p>${formatPrice(product.price)} ل.س</p>
                        <button onclick="addToCart(${product.id})" class="btn-primary">إضافة للسلة</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Update available times based on selected doctor
function updateAvailableTimes() {
    const doctorSelect = document.querySelector('select[name="doctor_id"]');
    const timeSelect = document.querySelector('select[name="time"]');
    
    const selectedDoctorId = parseInt(doctorSelect.value);
    const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
    
    if (selectedDoctor) {
        const availableTimes = JSON.parse(selectedDoctor.available_times);
        timeSelect.innerHTML = '<option value="">اختاري الوقت</option>' +
            availableTimes.map(time => `<option value="${time}">${time}</option>`).join('');
    } else {
        timeSelect.innerHTML = '<option value="">اختاري الوقت</option>';
    }
}

// Handle appointment booking
async function handleAppointment(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('يجب تسجيل الدخول أولاً', 'error');
        openModal('login-modal');
        return;
    }
    
    const formData = new FormData(e.target);
    const appointmentData = {
        doctor_id: parseInt(formData.get('doctor_id')),
        appointment_datetime: `${formData.get('date')}T${formData.get('time')}:00`,
        payment_method: formData.get('payment_method'),
        notes: formData.get('notes')
    };
    
    // Get doctor name for confirmation
    const selectedDoctor = doctors.find(d => d.id === appointmentData.doctor_id);
    const doctorName = selectedDoctor ? selectedDoctor.name : 'غير محدد';
    
    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show detailed confirmation message
            const confirmationMessage = `
                ✅ تم حجز الموعد بنجاح!
                
                📋 تفاصيل الموعد:
                👩‍⚕️ الطبيب: ${doctorName}
                📅 التاريخ: ${formData.get('date')}
                🕐 الوقت: ${formData.get('time')}
                💳 طريقة الدفع: ${getPaymentMethodName(formData.get('payment_method'))}
                
                📞 سيتم التواصل معك قريباً لتأكيد الموعد
            `;
            
            showAppointmentConfirmation(confirmationMessage);
            e.target.reset();
            
            // Reset time dropdown
            const timeSelect = document.querySelector('select[name="time"]');
            timeSelect.innerHTML = '<option value="">اختاري الوقت</option>';
            
        } else {
            showMessage(data.error || 'خطأ في حجز الموعد', 'error');
        }
    } catch (error) {
        console.error('Appointment error:', error);
        showMessage('خطأ في الاتصال', 'error');
    }
}

// Show appointment confirmation modal
function showAppointmentConfirmation(message) {
    // Create confirmation modal if it doesn't exist
    let confirmationModal = document.getElementById('appointment-confirmation-modal');
    if (!confirmationModal) {
        confirmationModal = document.createElement('div');
        confirmationModal.id = 'appointment-confirmation-modal';
        confirmationModal.className = 'modal';
        confirmationModal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('appointment-confirmation-modal')">&times;</span>
                <div id="confirmation-message" class="confirmation-message"></div>
                <button class="btn-primary" onclick="closeModal('appointment-confirmation-modal')" style="margin-top: 20px;">حسناً</button>
            </div>
        `;
        document.body.appendChild(confirmationModal);
    }
    
    // Update message and show modal
    document.getElementById('confirmation-message').innerHTML = message.replace(/\n/g, '<br>');
    openModal('appointment-confirmation-modal');
}

// Get payment method display name
function getPaymentMethodName(method) {
    const paymentMethods = {
        'cash_on_delivery': 'الدفع عند الاستلام',
        'syriatel_cash': 'سيرياتيل كاش',
        'bank_al_baraka': 'بنك البركة'
    };
    return paymentMethods[method] || method;
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Also show the section if it's hidden
        showSection(sectionId);
    }
}



// Show specific section and hide others
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Handle special cases for section IDs
    let targetSectionId = sectionId;
    if (sectionId === 'analysis') {
        targetSectionId = 'skin-analysis';
    } else if (sectionId === 'appointment') {
        targetSectionId = 'appointments';
    }
    
    // Show the requested section
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Special handling for articles section
        if (targetSectionId === 'articles') {
            loadArticlesContent();
        }
        
        // Scroll to the section
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        // If section doesn't exist, show home section as fallback
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.style.display = 'block';
            homeSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    // Update active navigation link
    document.querySelectorAll('.nav-links a, footer a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Load articles content
function loadArticlesContent() {
    const articlesSection = document.getElementById('articles');
    if (!articlesSection) {
        // Create articles section if it doesn't exist
        const articlesHTML = `
            <section id="articles" class="articles-section">
                <div class="container">
                    <h2 class="section-title">المقالات الطبية</h2>
                    <p class="section-description">معلومات طبية موثوقة حول العناية بالبشرة والعلاجات التجميلية</p>
                    
                    <div class="articles-grid">
                        <article class="article-card">
                            <div class="article-header">
                                <h3>💉 حقن الفيلر - دليل شامل</h3>
                            </div>
                            <div class="article-content">
                                <h4>ما هو الفيلر؟</h4>
                                <p>الفيلر هو مادة طبية تُحقن تحت الجلد لملء التجاعيد والخطوط الدقيقة، وإعادة الحجم المفقود للوجه، وتحسين ملامح الوجه بشكل طبيعي.</p>
                                
                                <h4>أنواع الفيلر:</h4>
                                <ul>
                                    <li><strong>حمض الهيالورونيك:</strong> الأكثر شيوعاً وأماناً، قابل للذوبان</li>
                                    <li><strong>الكولاجين:</strong> طبيعي ولكن مؤقت المفعول</li>
                                    <li><strong>هيدروكسي أباتيت الكالسيوم:</strong> طويل المدى</li>
                                </ul>
                                
                                <h4>المناطق المناسبة للحقن:</h4>
                                <ul>
                                    <li>الشفاه لزيادة الحجم والتحديد</li>
                                    <li>الخدود لاستعادة الامتلاء</li>
                                    <li>تحت العينين لعلاج الهالات</li>
                                    <li>خطوط الابتسامة والتجاعيد</li>
                                    <li>الذقن لتحسين الشكل</li>
                                </ul>
                                
                                <h4>ما بعد الحقن:</h4>
                                <ul>
                                    <li>تجنب التدليك لمدة 24 ساعة</li>
                                    <li>تجنب الرياضة الشاقة لمدة يومين</li>
                                    <li>استخدام كمادات باردة للتورم</li>
                                    <li>تجنب أشعة الشمس المباشرة</li>
                                </ul>
                                
                                <h4>المخاطر والآثار الجانبية:</h4>
                                <ul>
                                    <li>تورم وكدمات مؤقتة</li>
                                    <li>حساسية نادرة</li>
                                    <li>عدم تماثل إذا لم يتم بخبرة</li>
                                </ul>
                            </div>
                        </article>
                        
                        <article class="article-card">
                            <div class="article-header">
                                <h3>💫 البوتوكس - العلاج الأمثل للتجاعيد</h3>
                            </div>
                            <div class="article-content">
                                <h4>ما هو البوتوكس؟</h4>
                                <p>البوتوكس هو بروتين طبيعي مُنقى يُستخدم لإرخاء العضلات المسؤولة عن تكوين التجاعيد، مما يؤدي إلى نعومة الجلد ومظهر أكثر شباباً.</p>
                                
                                <h4>المناطق المناسبة للعلاج:</h4>
                                <ul>
                                    <li><strong>الجبهة:</strong> لعلاج خطوط الجبهة الأفقية</li>
                                    <li><strong>بين الحاجبين:</strong> لعلاج خطوط العبوس</li>
                                    <li><strong>حول العينين:</strong> لعلاج خطوط الضحك</li>
                                    <li><strong>الرقبة:</strong> لشد عضلات الرقبة</li>
                                </ul>
                                
                                <h4>مدة المفعول:</h4>
                                <p>يبدأ المفعول خلال 3-7 أيام ويستمر لمدة 3-6 أشهر، ويمكن إعادة الحقن بأمان.</p>
                                
                                <h4>التحضير للجلسة:</h4>
                                <ul>
                                    <li>تجنب الأسبرين ومضادات التخثر</li>
                                    <li>تجنب الكحول قبل 24 ساعة</li>
                                    <li>إخبار الطبيب عن أي أدوية</li>
                                </ul>
                                
                                <h4>ما بعد الحقن:</h4>
                                <ul>
                                    <li>تجنب الاستلقاء لمدة 4 ساعات</li>
                                    <li>تجنب التدليك أو الضغط</li>
                                    <li>تجنب الرياضة لمدة 24 ساعة</li>
                                    <li>تجنب الحرارة العالية</li>
                                </ul>
                            </div>
                        </article>
                        
                        <article class="article-card">
                            <div class="article-header">
                                <h3>🌟 العناية بالبشرة - أساسيات الجمال</h3>
                            </div>
                            <div class="article-content">
                                <h4>روتين العناية اليومي:</h4>
                                
                                <h5>الصباح:</h5>
                                <ol>
                                    <li><strong>التنظيف:</strong> استخدمي منظف لطيف مناسب لنوع بشرتك</li>
                                    <li><strong>التونر:</strong> لتوازن درجة حموضة البشرة</li>
                                    <li><strong>السيروم:</strong> فيتامين سي للحماية من الأكسدة</li>
                                    <li><strong>المرطب:</strong> حسب نوع البشرة</li>
                                    <li><strong>واقي الشمس:</strong> SPF 30 أو أعلى</li>
                                </ol>
                                
                                <h5>المساء:</h5>
                                <ol>
                                    <li><strong>إزالة المكياج:</strong> بمنظف زيتي أو ماء ميسيلار</li>
                                    <li><strong>التنظيف العميق:</strong> منظف مائي</li>
                                    <li><strong>التقشير:</strong> 2-3 مرات أسبوعياً</li>
                                    <li><strong>السيروم:</strong> الريتينول أو حمض الهيالورونيك</li>
                                    <li><strong>المرطب الليلي:</strong> أغنى من النهاري</li>
                                </ol>
                                
                                <h4>نصائح حسب نوع البشرة:</h4>
                                
                                <h5>البشرة الدهنية:</h5>
                                <ul>
                                    <li>استخدمي منتجات خالية من الزيوت</li>
                                    <li>حمض الساليسيليك للتقشير</li>
                                    <li>قناع الطين أسبوعياً</li>
                                </ul>
                                
                                <h5>البشرة الجافة:</h5>
                                <ul>
                                    <li>مرطبات غنية بالسيراميد</li>
                                    <li>تجنبي الماء الساخن</li>
                                    <li>استخدمي زيوت طبيعية</li>
                                </ul>
                                
                                <h5>البشرة الحساسة:</h5>
                                <ul>
                                    <li>منتجات خالية من العطور</li>
                                    <li>اختبري المنتج قبل الاستخدام</li>
                                    <li>تجنبي التقشير القاسي</li>
                                </ul>
                                
                                <h4>مكونات مهمة للعناية:</h4>
                                <ul>
                                    <li><strong>فيتامين سي:</strong> مضاد أكسدة ومفتح</li>
                                    <li><strong>الريتينول:</strong> مضاد للشيخوخة</li>
                                    <li><strong>حمض الهيالورونيك:</strong> ترطيب مكثف</li>
                                    <li><strong>النياسيناميد:</strong> تقليل المسام</li>
                                    <li><strong>أحماض AHA/BHA:</strong> تقشير لطيف</li>
                                </ul>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        `;
        
        // Insert articles section after the home section
        const homeSection = document.getElementById('home');
        homeSection.insertAdjacentHTML('afterend', articlesHTML);
    }
    
    // Show articles section
    document.getElementById('articles').style.display = 'block';
}

// Initialize sections on page load
document.addEventListener('DOMContentLoaded', function() {
    // Show home section by default
    showSection('home');
});

