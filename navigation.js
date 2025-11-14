// navigation.js
console.log('=== NAVIGATION.JS LOADED SUCCESSFULLY ===');

let contentCache = {};

function showPage(page) {
    console.log('Showing page:', page);
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('Main content element not found!');
        return;
    }
    
    // Показываем индикатор загрузки
    mainContent.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Загрузка...</p>
        </div>
    `;
    
    loadPageContent(page)
        .then(content => {
            mainContent.innerHTML = content;
            updateActiveNavigation(page);
        })
        .catch(error => {
            console.error('Error loading page:', error);
            mainContent.innerHTML = getErrorPage();
        });
}

function loadPageContent(page) {
    // Используем кэш если есть
    if (contentCache[page]) {
        return Promise.resolve(contentCache[page]);
    }
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `content/${page}.html`, true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                // Для file:// protocol статус может быть 0, для http:// - 200
                if (xhr.status === 200 || xhr.status === 0) {
                    if (xhr.responseText && xhr.responseText.trim() !== '') {
                        console.log(`Successfully loaded ${page}.html`);
                        contentCache[page] = xhr.responseText;
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error('Empty file content'));
                    }
                } else {
                    reject(new Error(`Failed to load ${page}.html - Status: ${xhr.status}`));
                }
            }
        };
        
        xhr.onerror = function() {
            reject(new Error(`Network error loading ${page}.html`));
        };
        
        // Таймаут на случай если файл не существует
        setTimeout(() => {
            if (xhr.readyState !== 4) {
                xhr.abort();
                reject(new Error(`Timeout loading ${page}.html`));
            }
        }, 2000);
        
        xhr.send();
    });
}

function getErrorPage() {
    return `
        <div class="page error-page active">
            <section class="hero-section">
                <div class="hero-content">
                    <div class="container">
                        <h1 class="hero-title">Ошибка загрузки</h1>
                        <p class="hero-description">
                            Не удалось загрузить содержимое страницы. Проверьте наличие файлов в папке content/
                        </p>
                        <button class="btn btn-primary" data-page="home">
                            На главную
                        </button>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function updateActiveNavigation(page) {
    document.querySelectorAll('.nav-item, .footer-link').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll(`[data-page="${page}"]`).forEach(btn => {
        btn.classList.add('active');
    });
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMobile = document.getElementById('nav-mobile');
    
    if (mobileMenuBtn && navMobile) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMobile.classList.toggle('active');
        });
        
        const mobileLinks = navMobile.querySelectorAll('.nav-item');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMobile.classList.remove('active');
            });
        });
    }
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.matches('.nav-item, .footer-link, [data-page]')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
            window.location.hash = page;
        }
        
        if (e.target.closest('#logo-home')) {
            e.preventDefault();
            showPage('home');
            window.location.hash = 'home';
        }
    });
    
    // Обработка браузерной навигации
    window.addEventListener('popstate', function() {
        const page = window.location.hash.replace('#', '') || 'home';
        showPage(page);
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Navigation');
    
    setupMobileMenu();
    setupEventListeners();
    
    // Показываем страницу из хэша или главную
    const hash = window.location.hash.replace('#', '');
    const initialPage = hash || 'home';
    showPage(initialPage);
    
    console.log('Navigation initialized successfully!');
});