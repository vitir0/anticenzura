
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Улучшенная конфигурация axios
const axiosInstance = axios.create({
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Referer': 'https://www.bing.com/',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-User': '?1'
  }
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🛡️ anticenzura - Обход цензуры</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      background: #000;
      color: #f0f0f0;
      min-height: 100vh;
      overflow: hidden;
    }
    .search-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
      transition: all 0.3s ease;
    }
    .fullscreen-mode .search-container {
      transform: translateY(-100%);
    }
    .logo {
      font-size: 60px;
      margin-bottom: 20px;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }
    h1 {
      font-size: 32px;
      margin-bottom: 30px;
      text-align: center;
      color: #fff;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }
    .search-box {
      display: flex;
      width: 80%;
      max-width: 700px;
      margin-bottom: 20px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
    }
    #urlInput {
      flex: 1;
      padding: 18px 25px;
      font-size: 18px;
      border: none;
      border-radius: 50px 0 0 50px;
      background: rgba(30, 30, 30, 0.9);
      color: #fff;
      outline: none;
      transition: all 0.3s;
    }
    #urlInput:focus {
      background: rgba(40, 40, 40, 0.95);
    }
    input::placeholder {
      color: #777;
    }
    #openBtn {
      padding: 0 35px;
      background: linear-gradient(to bottom, #222, #111);
      color: #fff;
      border: none;
      border-radius: 0 50px 50px 0;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #openBtn:hover {
      background: linear-gradient(to bottom, #333, #222);
    }
    #openBtn:active {
      background: linear-gradient(to bottom, #111, #000);
      transform: translateY(1px);
    }
    .description {
      max-width: 600px;
      text-align: center;
      color: #aaa;
      margin-top: 30px;
      font-size: 16px;
      line-height: 1.6;
    }
    .description strong {
      color: #ddd;
    }
    
    /* Fullscreen mode */
    .proxy-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      flex-direction: column;
      background: #000;
      z-index: 100;
    }
    .fullscreen-mode .proxy-container {
      display: flex;
    }
    .proxy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: rgba(20, 20, 20, 0.9);
      border-bottom: 1px solid #333;
    }
    .current-url {
      font-size: 14px;
      color: #aaa;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 80%;
    }
    #exitBtn {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }
    #exitBtn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    iframe {
      flex: 1;
      width: 100%;
      border: none;
      background: #000;
    }
    
    .loading {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.8);
      z-index: 200;
      display: none;
    }
    .loader {
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid #fff;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    .loading-text {
      font-size: 18px;
      color: #aaa;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      padding: 20px;
      background: rgba(150, 0, 0, 0.8);
      color: white;
      text-align: center;
      z-index: 150;
      display: none;
    }
    
    @media (max-width: 768px) {
      .search-box {
        width: 95%;
      }
      h1 {
        font-size: 24px;
      }
      .logo {
        font-size: 45px;
      }
    }
  </style>
</head>
<body>
  <div class="search-container">
    <div class="logo">🛡️</div>
    <h1>anticenzura - Обход цензуры</h1>
    
    <div class="search-box">
      <input 
        type="text" 
        id="urlInput" 
        placeholder="Введите URL или поисковый запрос..." 
        autocomplete="off"
        autofocus
      >
      <button id="openBtn">→</button>
    </div>

    <div class="description">
      <strong>Анонимный доступ к интернету без ограничений</strong><br>
      Введите URL сайта (например, "bing.com"). 
      Все поисковые запросы выполняются через Bing
    </div>
  </div>

  <div class="proxy-container" id="proxyContainer">
    <div class="proxy-header">
      <div class="current-url" id="currentUrl"></div>
      <button id="exitBtn">✕</button>
    </div>
    <iframe 
      id="proxyFrame" 
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      referrerpolicy="no-referrer"
    ></iframe>
  </div>

  <div class="loading" id="loading">
    <div class="loader"></div>
    <div class="loading-text">Загрузка через защищенное соединение...</div>
  </div>

  <div class="error" id="errorContainer"></div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const openBtn = document.getElementById('openBtn');
      const urlInput = document.getElementById('urlInput');
      const proxyFrame = document.getElementById('proxyFrame');
      const loading = document.getElementById('loading');
      const errorContainer = document.getElementById('errorContainer');
      const exitBtn = document.getElementById('exitBtn');
      const body = document.body;
      const currentUrl = document.getElementById('currentUrl');
      
      // Показать ошибку
      function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        loading.style.display = 'none';
        
        setTimeout(() => {
          errorContainer.style.display = 'none';
        }, 5000);
      }
      
      // Проверка URL
      function isUrl(str) {
        try {
          new URL(str);
          return true;
        } catch (_) {
          return false;
        }
      }
      
      // Создание поискового URL через Bing
      function createSearchUrl(query) {
        return 'https://www.bing.com/search?q=' + encodeURIComponent(query);
      }
      
      // Переход в полноэкранный режим
      function enterFullscreenMode(url) {
        body.classList.add('fullscreen-mode');
        currentUrl.textContent = url;
      }
      
      // Выход из полноэкранного режима
      function exitFullscreenMode() {
        body.classList.remove('fullscreen-mode');
        proxyFrame.src = 'about:blank';
      }
      
      // Загрузка URL
      function loadUrl(input) {
        loading.style.display = 'flex';
        errorContainer.style.display = 'none';
        
        let targetUrl = input.trim();
        
        if (!targetUrl) {
          showError('Введите URL или поисковый запрос');
          return;
        }
        
        // Автокоррекция URL
        if (!targetUrl.startsWith('http') && !targetUrl.includes('://')) {
          targetUrl = 'https://' + targetUrl;
        }
        
        // Если это не URL, а поисковый запрос
        if (!isUrl(targetUrl)) {
          targetUrl = createSearchUrl(targetUrl);
        }
        
        // Показываем URL в интерфейсе
        currentUrl.textContent = targetUrl;
        
        // Входим в полноэкранный режим
        enterFullscreenMode(targetUrl);
        
        // Загружаем контент через специальный прокси
        proxyFrame.src = '/proxy-frame?url=' + encodeURIComponent(targetUrl);
      }
      
      // Обработчики событий
      openBtn.addEventListener('click', function() {
        const input = urlInput.value;
        loadUrl(input);
      });
      
      urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          const input = urlInput.value;
          loadUrl(input);
        }
      });
      
      proxyFrame.addEventListener('load', function() {
        loading.style.display = 'none';
      });
      
      proxyFrame.addEventListener('error', function() {
        showError('Ошибка загрузки сайта. Возможно, ресурс заблокирован или недоступен.');
      });
      
      exitBtn.addEventListener('click', exitFullscreenMode);
      
      // Загрузка Bing при фокусе
      urlInput.addEventListener('focus', function() {
        if (!urlInput.value) {
          urlInput.placeholder = 'Поиск через Bing...';
        }
      });
      
      // Загрузка Bing по умолчанию при клике на лого
      document.querySelector('.logo').addEventListener('click', function() {
        urlInput.value = '';
        loadUrl('https://www.bing.com');
      });
    });
  </script>
</body>
</html>
  `);
});

// Новый обработчик для iframe
app.get('/proxy-frame', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.redirect('/');

    const finalUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    
    // Загружаем HTML
    const response = await axiosInstance.get(finalUrl, {
      responseType: 'text',
      maxRedirects: 10,
      validateStatus: () => true
    });
    
    let html = response.data;
    
    // Создаем базовый тег для правильного разрешения относительных путей
    const baseTag = `<base href="${finalUrl}">`;
    
    // Удаляем существующие CSP и X-Frame-Options
    html = html
      .replace(/<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '')
      .replace(/<meta[^>]+http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');
    
    // Добавляем базовый тег после head
    html = html.replace(/<head(.*?)>/i, `<head$1>${baseTag}`);
    
    // Добавляем скрипт для обработки ссылок
    const linkHandlerScript = `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          // Обработка всех ссылок
          document.addEventListener('click', function(e) {
            let target = e.target;
            while (target && target.tagName !== 'A') {
              target = target.parentNode;
            }
            
            if (target && target.tagName === 'A' && target.href) {
              e.preventDefault();
              window.top.postMessage({
                type: 'NAVIGATE',
                url: target.href
              }, '*');
            }
          });
          
          // Обработка форм
          document.addEventListener('submit', function(e) {
            if (e.target.tagName === 'FORM') {
              e.preventDefault();
              const form = e.target;
              const url = form.action || window.location.href;
              const method = form.method || 'GET';
              
              if (method.toUpperCase() === 'GET') {
                window.top.postMessage({
                  type: 'NAVIGATE',
                  url: url + (url.includes('?') ? '&' : '?' + new URLSearchParams(new FormData(form))
                }, '*');
              } else {
                // Для POST запросов создаем скрытый iframe
                const iframe = document.createElement('iframe');
                iframe.name = 'form-submit-iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                form.target = 'form-submit-iframe';
                form.submit();
                
                iframe.onload = function() {
                  window.top.postMessage({
                    type: 'NAVIGATE',
                    url: iframe.contentWindow.location.href
                  }, '*');
                  document.body.removeChild(iframe);
                };
              }
            }
          });
        });
      </script>
    `;
    
    // Добавляем скрипт перед закрывающим тегом body
    if (html.includes('</body>')) {
      html = html.replace('</body>', linkHandlerScript + '</body>');
    } else {
      html += linkHandlerScript;
    }
    
    res.set('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    res.status(500).send(`
      <html>
        <body style="color: white; background: black; padding: 20px; text-align: center;">
          <h3>Ошибка прокси</h3>
          <p>${error.message}</p>
          <p><a href="/" style="color: #4da6ff;">Вернуться на главную</a></p>
        </body>
      </html>
    `);
  }
});

// Обработчик для ресурсов
app.get('/proxy-resource', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Invalid URL');

    const response = await axiosInstance.get(targetUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: () => true
    });
    
    // Определяем Content-Type
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    // Устанавливаем заголовки CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Content-Type', contentType);
    res.send(response.data);
    
  } catch (error) {
    res.status(500).send('Error loading resource');
  }
});

// Обработчик для всех путей
app.get('*', async (req, res) => {
  try {
    const fullUrl = req.originalUrl.substring(1);
    const decodedUrl = decodeURIComponent(fullUrl);
    
    if (decodedUrl === '') {
      return res.redirect('/');
    }
    
    // Прямые запросы к ресурсам
    if (decodedUrl.startsWith('proxy-resource?')) {
      return handleDirectRequest(res, decodedUrl);
    }
    
    // Для всех остальных запросов используем iframe прокси
    return handleProxyRequest(req, res);
    
  } catch (error) {
    res.status(500).send(`
      <html>
        <body style="color: white; background: black; padding: 20px; text-align: center;">
          <h3>Ошибка прокси</h3>
          <p>${error.message}</p>
          <p><a href="/" style="color: #4da6ff;">Вернуться на главную</a></p>
        </body>
      </html>
    `);
  }
});

// Улучшенный обработчик прокси
async function handleProxyRequest(req, res) {
  try {
    const targetUrl = req.originalUrl.replace('/proxy?url=', '');
    if (!targetUrl) return res.redirect('/');

    const finalUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    
    const response = await axiosInstance.get(finalUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: () => true
    });
    
    const contentType = response.headers['content-type'] || 'text/html';
    
    // Для HTML используем специальную обработку
    if (contentType.includes('text/html')) {
      let html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Удаляем проблемные теги
      $('meta[http-equiv="Content-Security-Policy"], meta[http-equiv="content-security-policy"]').remove();
      $('meta[http-equiv="X-Frame-Options"]').remove();
      
      // Добавляем базовый тег
      $('head').prepend(`<base href="${finalUrl}">`);
      
      // Обработка всех ссылок
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            const absoluteUrl = new URL(href, finalUrl).href;
            $(el).attr('href', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      // Обработка форм
      $('form[action]').each((i, el) => {
        const action = $(el).attr('action');
        if (action) {
          try {
            const absoluteUrl = new URL(action, finalUrl).href;
            $(el).attr('action', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      // Обработка ресурсов
      const resourceAttrs = ['src', 'href', 'srcset', 'data-src', 'content', 'poster'];
      
      $('*').each((i, el) => {
        const $el = $(el);
        resourceAttrs.forEach(attr => {
          const value = $el.attr(attr);
          if (value) {
            try {
              // Особый случай для srcset
              if (attr === 'srcset') {
                const newValue = value.split(',').map(part => {
                  const [url, descriptor] = part.trim().split(/\s+/);
                  try {
                    const absoluteUrl = new URL(url, finalUrl).href;
                    return `/proxy-resource?url=${encodeURIComponent(absoluteUrl)}${descriptor ? ' ' + descriptor : ''}`;
                  } catch (e) {
                    return part;
                  }
                }).join(', ');
                $el.attr(attr, newValue);
              } else {
                try {
                  const absoluteUrl = new URL(value, finalUrl).href;
                  $el.attr(attr, `/proxy-resource?url=${encodeURIComponent(absoluteUrl)}`);
                } catch (e) {}
              }
            } catch (e) {
              // Игнорируем ошибки
            }
          }
        });
      });
      
      // Фикс для Instagram
      if (finalUrl.includes('instagram.com')) {
        $('head').append(`
          <meta name="referrer" content="no-referrer">
          <script>
            // Фикс для загрузки контента
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(function() {
                document.querySelectorAll('img, video').forEach(el => {
                  if (el.src) el.src = el.src;
                  if (el.srcset) el.srcset = el.srcset;
                });
              }, 1000);
            });
          </script>
        `);
      }
      
      res.set('Content-Type', contentType);
      res.send($.html());
    } else {
      // Для не-HTML контента
      res.set('Content-Type', contentType);
      res.send(response.data);
    }
  } catch (error) {
    res.status(500).send(`
      <html>
        <body style="color: white; background: black; padding: 20px; text-align: center;">
          <h3>Ошибка прокси</h3>
          <p>${error.message}</p>
          <p><a href="/" style="color: #4da6ff;">Вернуться на главную</a></p>
        </body>
      </html>
    `);
  }
}

// Обработчик прямых запросов к ресурсам
async function handleDirectRequest(res, decodedUrl) {
  try {
    const urlParam = decodedUrl.split('url=')[1];
    const targetUrl = decodeURIComponent(urlParam);
    
    const response = await axiosInstance.get(targetUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: () => true
    });
    
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    res.set('Content-Type', contentType);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error loading resource');
  }
}

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
