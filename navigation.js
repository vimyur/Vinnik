let contentCache = {};

function showPage(page) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('Main content element not found!');
        return;
    }

    function showPage(page) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('Main content element not found!');
        return;
    }
    
    // Прокручиваем страницу вверх перед загрузкой
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Загружаем и показываем индикатор загрузки
    loadPageContent('loading')
        .then(loadingHTML => {
            mainContent.innerHTML = loadingHTML;
            
            // После показа loading, загружаем основную страницу
            return loadPageContent(page);
        })
        .then(pageHTML => {
            mainContent.innerHTML = pageHTML;
            updateActiveNavigation(page);
            
        // Дополнительная прокрутка после загрузки контента
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'instant'
            });
        }, 100);
        })
        .catch(error => {
            console.error('Ошибка загрузки страницы:', error);
            loadPageContent('error')
                .then(errorHTML => {
                    mainContent.innerHTML = errorHTML;
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
        });
}
    
    // Загружаем и показываем индикатор загрузки
    loadPageContent('loading')
        .then(loadingHTML => {
            mainContent.innerHTML = loadingHTML;
            
            // После показа loading, загружаем основную страницу
            return loadPageContent(page);
        })
        .then(pageHTML => {
            mainContent.innerHTML = pageHTML;
            updateActiveNavigation(page);
        })
        .catch(error => {
            console.error('Ошибка загрузки страницы:', error);
            loadPageContent('error')
                .then(errorHTML => {
                    mainContent.innerHTML = errorHTML;
                });
        });
}

function loadPageContent(page) {
    if (contentCache[page]) {
        return Promise.resolve(contentCache[page]);
    }
    
    return fetch(`content/${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${page}.html - Status: ${response.status}`);
            }
            return response.text();
        })
        .then(content => {
            if (!content || content.trim() === '') {
                throw new Error('Empty file content');
            }
            contentCache[page] = content;
            return content;
        })
        .catch(error => {
            console.error(`Error loading ${page}.html:`, error);
            throw error;
        });
}

function updateActiveNavigation(page) {
    document.querySelectorAll('.nav-item, .footer-link').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll(`[data-page="${page}"]`).forEach(btn => {
        btn.classList.add('active');
    });
    
    // Особенная логика для заданий
    if (page.startsWith('assignment-')) {
        document.querySelectorAll('[data-page="assignments"]').forEach(btn => {
            btn.classList.add('active');
        });
    }
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
            
            // Логика для кнопки "Задания"
            if (page === 'assignments') {
                showPage('assignments'); // Открываем главную страницу заданий
                window.location.hash = 'assignments';
            } else {
                showPage(page);
                window.location.hash = page;
            }
        }
        
        if (e.target.closest('#logo-home')) {
            e.preventDefault();
            showPage('home');
            window.location.hash = 'home';
        }
    });
    
    window.addEventListener('popstate', function() {
        const page = window.location.hash.replace('#', '') || 'home';
        showPage(page);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
    setupEventListeners();
    
    const hash = window.location.hash.replace('#', '');
    const initialPage = hash || 'home';
    showPage(initialPage);
});

