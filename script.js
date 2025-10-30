/ بيانات التطبيق
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let images = JSON.parse(localStorage.getItem('images')) || [];
let currentClientId = null;
let currentImageId = null;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    loadClients();
    loadClientSelect();
    renderClientsGrid();
    initEventListeners();
    
    // إضافة عملاء تجريبيين إذا لم يكن هناك عملاء
    if (clients.length === 0) {
        addSampleClients();
    }
}

// تحميل العملاء
function loadClients() {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
        clients = JSON.parse(savedClients);
    }
}

// تحميل الصور
function loadImages() {
    const savedImages = localStorage.getItem('images');
    if (savedImages) {
        images = JSON.parse(savedImages);
    }
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('images', JSON.stringify(images));
}

// تهيئة المستمعين للأحداث
function initEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // النقر على منطقة الرفع
    uploadArea.addEventListener('click', function() {
        if (document.getElementById('clientSelect').value) {
            fileInput.click();
        } else {
            alert('⚠️ الرجاء اختيار عميل أولاً');
        }
    });

    // اختيار الملف
    fileInput.addEventListener('change', handleFileSelect);

    // سحب وإفلات
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#2980b9';
        uploadArea.style.background = 'rgba(255, 255, 255, 1)';
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.background = 'rgba(255, 255, 255, 0.95)';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.background = 'rgba(255, 255, 255, 0.95)';
        
        if (!document.getElementById('clientSelect').value) {
            alert('⚠️ الرجاء اختيار عميل أولاً');
            return;
        }
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    });
}

// إظهار نموذج إضافة عميل
function showAddClientForm() {
    document.getElementById('clientForm').style.display = 'block';
}

// إخفاء نموذج إضافة عميل
function hideClientForm() {
    document.getElementById('clientForm').style.display = 'none';
    // مسح الحقول
    document.getElementById('clientName').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientPhone').value = '';
}

// إضافة عميل جديد
function addNewClient() {
    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();

    if (!name) {
        alert('⚠️ الرجاء إدخال اسم العميل');
        return;
    }

    const newClient = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        joinDate: new Date().toLocaleDateString('ar-SA'),
        imageCount: 0,
        lastUpload: 'لم يتم رفع صور بعد'
    };

    clients.push(newClient);
    saveData();
    renderClientsGrid();
    loadClientSelect();
    hideClientForm();
    
    alert(✅ تم إضافة العميل "${name}" بنجاح);
}

// عرض قائمة العملاء
function renderClientsGrid() {
    const clientsGrid = document.getElementById('clientsGrid');
    
    if (clients.length === 0) {
        clientsGrid.innerHTML = `
            <div class="no-clients">
                <p>👥 لا يوجد عملاء</p>
                <p>انقر على "إضافة عميل جديد" لبدء إدارة العملاء</p>
            </div>
        `;
        return;
    }

    clientsGrid.innerHTML = clients.map(client => `
        <div class="client-card ${currentClientId === client.id ? 'active' : ''}" 
             onclick="selectClient(${client.id})">
            <div class="client-header">
                <div>
                    <div class="client-name">${client.name}</div>
                    <div class="client-email">${client.email || 'لا يوجد بريد إلكتروني'}</div>
                </div>
                <div class="client-status">${getClientStatus(client)}</div>
            </div>
            
            <div class="client-info">
                <div>📞 ${client.phone || 'لا يوجد رقم'}</div>
                <div>📅 انضم في: ${client.joinDate}</div>
                <div>🖼️ عدد الصور: ${client.imageCount}</div>
                <div>🕒 آخر رفع: ${client.lastUpload}</div>
            </div>
            
            <div class="client-actions">
                <button class="action-btn btn-view" onclick="event.stopPropagation(); viewClientGallery(${client.id})">
                    👀 معرض الصور
                </button>
                <button class="action-btn btn-delete" onclick="event.stopPropagation(); deleteClient(${client.id})">
                    🗑️ حذف
                </button>
            </div>
        </div>
    `).join('');
}

// حالة العميل
function getClientStatus(client) {
    if (client.imageCount === 0) {
        return '<span style="color: #e74c3c;">🟡 جديد</span>';
    } else if (client.imageCount > 10) {
        return '<span style="color: #27ae60;">🟢 نشط</span>';
    } else {
        return '<span style="color: #f39c12;">🟠 عادي</span>';
    }
}

// تحميل قائمة العملاء في Select
function loadClientSelect() {
    const clientSelect = document.getElementById('clientSelect');
    clientSelect.innerHTML = '<option value="">-- اختر عميل --</option>' +
        clients.map(client => `
            <option value="${client.id}">${client.name} (${client.imageCount} صورة)</option>
        `).join('');
}

// اختيار عميل
function selectClient(clientId) {
    currentClientId = clientId;
    renderClientsGrid();
    loadClientImages();
    
    const client = clients.find(c => c.id === clientId);
    document.getElementById('currentClientInfo').textContent = 
        العميل: ${client.name} - ${client.imageCount} صورة;
    
    // تحديث Select
    document.getElementById('clientSelect').value = clientId;
}

// عرض معرض العميل
function viewClientGallery(clientId) {
    selectClient(clientId);
    // التمرير إلى قسم المعرض
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
}

// حذف عميل
function deleteClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    
    if (confirm(⚠️ هل أنت متأكد من حذف العميل "${client.name}" وجميع صوره؟)) {
        // حذف صور العميل
        images = images.filter(img => img.clientId !== clientId);
        // حذف العميل
        clients = clients.filter(c => c.id !== clientId);
        
        saveData();
        renderClientsGrid();
        loadClientSelect();
        loadClientImages();
        
        alert('✅ تم حذف العميل وجميع صوره');
    }
}

// البحث عن العملاء
function searchClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const clientCards = document.querySelectorAll('.client-card');
    
    clientCards.forEach(card => {
        const clientName = card.querySelector('.client-name').textContent.toLowerCase();
        if (clientName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// معالجة اختيار الملف
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
}

// معالجة الملفات
function handleFiles(files) {
    const clientId = parseInt(document.getElementById('clientSelect').value);
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
        alert('⚠️ الرجاء اختيار عميل صحيح');
        return;
    }

    const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
            alert(❌ الملف "${file.name}" ليس صورة);
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert(❌ حجم الصورة "${file.name}" كبير جداً (الحد الأقصى 10MB));
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) return;

    showUploadProgress();
    let uploadedCount = 0;

    validFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newImage = {
                id: Date.now() + index,
                clientId: clientId,
                clientName: client.name,
                src: e.target.result,
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type,
                uploadDate: new Date().toLocaleString('ar-SA'),
                isFavorite: false,
                views: 0
            };

            images.push(newImage);
            uploadedCount++;

            // تحديث عداد صور العميل
            client.imageCount++;
            client.lastUpload = new Date().toLocaleString('ar-SA');

            // تحديث شريط التقدم
            updateProgress((uploadedCount / validFiles.length) * 100);

            if (uploadedCount === validFiles.length) {
                // الانتهاء من الرفع
                setTimeout(() => {
                    saveData();
                    hideUploadProgress();
                    renderClientsGrid();
                    loadClientSelect();
                    loadClientImages();
                    
                    alert(✅ تم رفع ${uploadedCount} صورة للعميل ${client.name});
                    document.getElementById('fileInput').value = '';
                }, 500);
            }
        };
        reader.readAsDataURL(file);
    });
}

// إدارة تقدم الرفع
function showUploadProgress() {
    document.getElementById('uploadProgress').style.display = 'block';
    updateProgress(0);
}

function hideUploadProgress() {
    document.getElementById('uploadProgress').style.display = 'none';
}

function updateProgress(percent) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = Math.round(percent) + '%';
}

// تحميل صور العميل
function loadClientImages() {
    if (!currentClientId) {
        document.getElementById('imagesGrid').innerHTML = `
            <div class="no-images">
                <p>👈 اختر عميلاً من القائمة لعرض صوره</p>
            </div>
        `;
        return;
    }

    const clientImages = images.filter(img => img.clientId === currentClientId);
    
    if (clientImages.length === 0) {
        document.getElementById('imagesGrid').innerHTML = `
            <div class="no-images">
                <p>📷 لا توجد صور لهذا العميل بعد</p>
                <p>استخدم قسم "رفع الصور" لإضافة صور جديدة</p>
            </div>
        `;
        return;
    }

    renderImages(clientImages);
}

// عرض الصور
function renderImages(imagesToRender) {
    const imagesGrid = document.getElementById('imagesGrid');
    
    imagesGrid.innerHTML = imagesToRender.map(image => `
        <div class="image-card" onclick="openImageModal(${image.id})">
            <img src="${image.src}" alt="${image.name}" loading="lazy">
            <div class="image-info">
                <div class="image-name">${image.name}</div>
                <div class="image-meta">
                    <span>${image.size}</span>
                    <span class="favorite-star" onclick="event.stopPropagation(); toggleImageFavorite(${image.id})">
                        ${image.isFavorite ? '⭐' : '☆'}
                    </span>
                </div>
                <div class="image-meta">
                    <span>${image.uploadDate}</span>
                    <span>👁️ ${image.views}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// فتح نافذة المعاينة
function openImageModal(imageId) {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    // زيادة عدد المشاهدات
    image.views++;
    saveData();

    currentImageId = imageId;
    document.getElementById('modalImage').src = image.src;
    
    // تفاصيل الصورة
    document.getElementById('imageDetails').innerHTML = `
        <h3>${image.name}</h3>
        <p><strong>العميل:</strong> ${image.clientName}</p>
        <p><strong>الحجم:</strong> ${image.size}</p>
        <p><strong>نوع الملف:</strong> ${image.type}</p>
        <p><strong>تاريخ الرفع:</strong> ${image.uploadDate}</p>
        <p><strong>عدد المشاهدات:</strong> ${image.views}</p>
        <p><strong>مفضلة:</strong> ${image.isFavorite ? 'نعم ⭐' : 'لا'}</p>
    `;
    
    document.getElementById('imageModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// إغلاق نافذة المعاينة
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentImageId = null;
}

// تحميل الصورة
function downloadImage() {
    if (!currentImageId) return;
    
    const image = images.find(img => img.id === currentImageId);
    const link = document.createElement('a');
    link.href = image.src;
    link.download = image.name;
    link.click();
    
    alert📥 تم تحميل الصورة: ${image.name}`);
}

// تبديل التفضيل
function toggleFavorite() {
    if (!currentImageId) return;
    toggleImageFavorite(currentImageId);
    closeModal();
}

function toggleImageFavorite(imageId) {
    const image = images.find(img => img.id === imageId);
    if (image) {
        image.isFavorite = !image.isFavorite;
        saveData();
        loadClientImages(); // إعادة تحميل الصور
    }
}

// حذف الصورة
function deleteImage() {
    if (!currentImageId) return;
    
    const image = images.find(img => img.id === currentImageId);
    if (confirm(⚠️ هل أنت متأكد من حذف الصورة "${image.name}"؟)) {
        // حذف الصورة
        images = images.filter(img => img.id !== currentImageId);
        
        // تحديث عداد صور العميل
        const client = clients.find(c => c.id === image.clientId);
        if (client) {
            client.imageCount--;
        }
        
        saveData();
        loadClientImages();
        closeModal();
        renderClientsGrid();
        loadClientSelect();
        
        alert('✅ تم حذف الصورة بنجاح');
    }
}

// مشاركة الصورة
function shareImage() {
    if (!currentImageId) return;
    
    const image = images.find(img => img.id === currentImageId);
    if (navigator.share) {
        navigator.share({
            title: صورة ${image.clientName},
            text: شاهد هذه الصورة من معرض ${image.clientName},
            url: image.src
        });
    } else {
        // نسخ رابط الصورة
        navigator.clipboard.writeText(image.src)
            .then(() => alert('📋 تم نسخ رابط الصورة'))
            .catch(() => alert('❌ تعذر نسخ الرابط'));
    }
}

// تصفية الصور
function filterImages(type) {
    if (!currentClientId) return;
    
    const clientImages = images.filter(img => img.clientId === currentClientId);
    let filteredImages = clientImages;

    switch (type) {
        case 'recent':
            filteredImages = clientImages.sort((a, b) => b.id - a.id).slice(0, 20);
            break;
        case 'favorites':
            filteredImages = clientImages.filter(img => img.isFavorite);
            break;
    }

    // تحديث أزرار التصفية
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderImages(filteredImages);
}

// تنسيق حجم الملف
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// إضافة عملاء تجريبيين
function addSampleClients() {
    const sampleClients = [
        {
            id: 1,
            name: 'أحمد محمد',
            email: 'ahmed@example.com',
            phone: '0551234567',
            joinDate: new Date().toLocaleDateString('ar-SA'),
            imageCount: 8,
            lastUpload: new Date().toLocaleString('ar-SA')
        },
        {
            id: 2,
            name: 'فاطمة عبدالله',
            email: 'fatima@example.com',
            phone: '0507654321',
            joinDate: new Date().toLocaleDateString('ar-SA'),
            imageCount: 12,
            lastUpload: new Date().toLocaleString('ar-SA')
        },
        {
            id: 3,
            name: 'شركة التقنية المحدودة',
            email: 'tech@company.com',
            phone: '0112345678',
            joinDate: new Date().toLocaleDateString('ar-SA'),
            imageCount: 25,
            lastUpload: new Date().toLocaleString('ar-SA')
        }
    ];

    clients.push(...sampleClients);
    saveData();
}

// إغلاق المودال بالزر Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// إغلاق المودال بالنقر خارج الصورة
document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});
 
 <h1> email:</h1>
 <p> youssefmaddouri2025</p>