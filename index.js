const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация axios для имитации реального браузера
const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Referer': 'https://www.google.com/',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-User': '?1'
  }
});

// Middleware для статических файлов
app.use('/assets', express.static('public'));

// Главная страница
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚀 Freedom Proxy - Обход блокировок</title>
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
    <h1>Freedom Proxy - Обход блокировок</h1>
    
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
      <strong>100% рабочий доступ к Instagram, YouTube и другим сайтам</strong><br>
      Просто введите адрес или поисковый запрос и нажмите стрелку
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
      
      function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        loading.style.display = 'none';
        
        setTimeout(() => {
          errorContainer.style.display = 'none';
        }, 5000);
      }
      
      function isUrl(str) {
        try {
          new URL(str);
          return true;
        } catch (_) {
          return false;
        }
      }
      
      function createSearchUrl(query) {
        return 'https://www.bing.com/search?q=' + encodeURIComponent(query);
      }
      
      function enterFullscreenMode(url) {
        body.classList.add('fullscreen-mode');
        currentUrl.textContent = url;
      }
      
      function exitFullscreenMode() {
        body.classList.remove('fullscreen-mode');
        proxyFrame.src = 'about:blank';
      }
      
      function loadUrl(input) {
        loading.style.display = 'flex';
        errorContainer.style.display = 'none';
        
        let targetUrl = input.trim();
        
        if (!targetUrl) {
          showError('Введите URL или поисковый запрос');
          return;
        }
        
        if (!targetUrl.startsWith('http') && !targetUrl.includes('://')) {
          targetUrl = 'https://' + targetUrl;
        }
        
        if (!isUrl(targetUrl)) {
          targetUrl = createSearchUrl(targetUrl);
        }
        
        currentUrl.textContent = targetUrl;
        enterFullscreenMode(targetUrl);
        
        // Используем прямой доступ через iframe
        proxyFrame.src = '/direct?url=' + encodeURIComponent(targetUrl);
      }
      
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
        showError('Ошибка загрузки сайта. Попробуйте другой URL или повторите позже.');
      });
      
      exitBtn.addEventListener('click', exitFullscreenMode);
      
      // Загрузка Bing при клике на лого
      document.querySelector('.logo').addEventListener('click', function() {
        urlInput.value = 'https://www.bing.com';
        loadUrl('https://www.bing.com');
      });
    });
  </script>
</body>
</html>
  `);
});

// Прямой доступ к сайтам через iframe
app.get('/direct', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.redirect('/');
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <base href="${targetUrl}">
      <meta charset="UTF-8">
      <meta name="referrer" content="no-referrer">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
      <script>
        // Перенаправление на целевой URL
        window.location.href = "${targetUrl}";
      </script>
    </head>
    <body>
      <iframe 
        src="${targetUrl}"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        referrerpolicy="no-referrer"
      ></iframe>
    </body>
    </html>
  `);
});

// Прокси для ресурсов
app.get('/proxy-resource', async (req, res) => {
  try {
    const targetUrl = decodeURIComponent(req.query.url);
    const response = await axiosInstance.get(targetUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': new URL(targetUrl).origin,
        'Origin': new URL(targetUrl).origin
      }
    });
    
    const contentType = response.headers['content-type'];
    res.set('Content-Type', contentType);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error loading resource');
  }
});

// Обработчик для всех остальных запросов
app.get('*', async (req, res) => {
  try {
    const originalUrl = req.originalUrl.substring(1);
    const targetUrl = decodeURIComponent(originalUrl);
    
    if (targetUrl === '') return res.redirect('/');
    
    console.log('Проксирование URL:', targetUrl);
    
    const response = await axiosInstance.get(targetUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': new URL(targetUrl).origin,
        'Origin': new URL(targetUrl).origin
      }
    });
    
    const contentType = response.headers['content-type'] || 'text/html';
    
    if (contentType.includes('text/html')) {
      let html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Удаление проблемных тегов
      $('meta[http-equiv="Content-Security-Policy"]').remove();
      $('meta[http-equiv="X-Frame-Options"]').remove();
      
      // Добавление базового тега
      $('head').prepend(`<base href="${targetUrl}">`);
      
      // Обработка ссылок
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            const absoluteUrl = new URL(href, targetUrl).href;
            $(el).attr('href', `/${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      // Обработка форм
      $('form[action]').each((i, el) => {
        const action = $(el).attr('action');
        if (action) {
          try {
            const absoluteUrl = new URL(action, targetUrl).href;
            $(el).attr('action', `/${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      // Обработка ресурсов
      const resourceAttrs = ['src', 'href', 'srcset', 'data-src', 'content'];
      $('*').each((i, el) => {
        const $el = $(el);
        resourceAttrs.forEach(attr => {
          const value = $el.attr(attr);
          if (value) {
            try {
              // Обработка srcset
              if (attr === 'srcset') {
                const newValue = value.split(',').map(part => {
                  const [url, descriptor] = part.trim().split(/\s+/);
                  try {
                    const absoluteUrl = new URL(url, targetUrl).href;
                    return `/proxy-resource?url=${encodeURIComponent(absoluteUrl)}${descriptor ? ' ' + descriptor : ''}`;
                  } catch (e) {
                    return part;
                  }
                }).join(', ');
                $el.attr(attr, newValue);
              } else {
                const absoluteUrl = new URL(value, targetUrl).href;
                $el.attr(attr, `/proxy-resource?url=${encodeURIComponent(absoluteUrl)}`);
              }
            } catch (e) {}
          }
        });
      });
      
      // Специальные фиксы для Instagram
      if (targetUrl.includes('instagram.com')) {
        $('head').append(`
          <script>
            // Фикс для Instagram
            document.addEventListener('DOMContentLoaded', function() {
              // Принудительная перезагрузка ресурсов
              setTimeout(() => {
                document.querySelectorAll('img, video, source').forEach(el => {
                  if (el.src) el.src = el.src + '?t=' + Date.now();
                  if (el.srcset) el.srcset = el.srcset;
                });
              }, 1000);
              
              // Обход блокировки скриптов
              const originalCreateElement = document.createElement;
              document.createElement = function(tagName) {
                const el = originalCreateElement.call(document, tagName);
                if (tagName.toLowerCase() === 'script') {
                  el.setAttribute('crossorigin', 'anonymous');
                }
                return el;
              };
            });
          </script>
        `);
      }
      
      // Специальные фиксы для YouTube
      if (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')) {
        $('head').append(`
          <script>
            // Фикс для YouTube
            document.addEventListener('DOMContentLoaded', function() {
              // Перехват кликов
              document.addEventListener('click', function(e) {
                let target = e.target;
                while (target && target.tagName !== 'A' && target.tagName !== 'BUTTON') {
                  target = target.parentNode;
                }
                
                if (target && target.href) {
                  e.preventDefault();
                  window.location.href = target.href;
                }
              });
              
              // Принудительная загрузка плеера
              setTimeout(() => {
                const players = document.querySelectorAll('video, iframe');
                players.forEach(player => {
                  player.src = player.src;
                });
              }, 1500);
            });
          </script>
        `);
      }
      
      res.set('Content-Type', contentType);
      res.send($.html());
    } else {
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
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log('Для доступа к Instagram: http://localhost:' + PORT + '/https://instagram.com');
  console.log('Для доступа к YouTube: http://localhost:' + PORT + '/https://youtube.com');
});
