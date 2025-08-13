const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  }
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🛡️ Freedom Proxy - Обход цензуры</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      background: linear-gradient(135deg, #000000, #1a1a1a);
      color: #f0f0f0;
      min-height: 100vh;
      padding: 20px;
      background-attachment: fixed;
    }
    .container {
      max-width: 1000px;
      margin: 20px auto;
      background: rgba(10, 10, 10, 0.95);
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
      border: 1px solid #333;
    }
    header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid #333;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 5px;
      color: #fff;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }
    .subtitle {
      color: #bbb;
      font-size: 16px;
      margin-bottom: 15px;
    }
    .form-group {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    input[type="text"] {
      flex: 1;
      padding: 14px;
      font-size: 16px;
      border: 1px solid #333;
      border-radius: 6px;
      background: rgba(30, 30, 30, 0.9);
      color: #fff;
      outline: none;
      transition: all 0.3s;
    }
    input[type="text"]:focus {
      border-color: #555;
      box-shadow: 0 0 0 2px rgba(100, 100, 100, 0.3);
    }
    input::placeholder {
      color: #777;
    }
    button {
      padding: 14px 22px;
      background: linear-gradient(to bottom, #222, #111);
      color: #fff;
      border: 1px solid #333;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      min-width: 100px;
      transition: all 0.3s;
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    }
    button:hover {
      background: linear-gradient(to bottom, #333, #222);
      border-color: #444;
    }
    button:active {
      background: linear-gradient(to bottom, #111, #000);
      transform: translateY(1px);
    }
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    iframe {
      width: 100%;
      height: 70vh;
      border: 1px solid #333;
      border-radius: 6px;
      background: #000;
    }
    .error {
      color: #ff4d4d;
      text-align: center;
      padding: 15px;
      margin-top: 20px;
      border-radius: 6px;
      background: rgba(255, 0, 0, 0.1);
      border: 1px solid rgba(255, 0, 0, 0.2);
      display: none;
    }
    .loading {
      text-align: center;
      padding: 20px;
      display: none;
    }
    .loader {
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid #fff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .logo {
      font-size: 36px;
      margin-bottom: 10px;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }
    .info {
      background: rgba(30, 30, 30, 0.7);
      border-left: 4px solid #555;
      padding: 12px;
      margin-top: 20px;
      border-radius: 0 6px 6px 0;
      font-size: 14px;
      color: #aaa;
    }
    .info strong {
      color: #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">🛡️</div>
      <h1>Freedom Proxy</h1>
      <div class="subtitle">Анонимный доступ к интернету без ограничений</div>
    </header>
    
    <div class="form-group">
      <input 
        type="text" 
        id="urlInput" 
        placeholder="Введите URL или поисковый запрос..." 
        autocomplete="off"
      >
      <button id="openBtn">Перейти</button>
    </div>

    <div class="loading" id="loading">
      <div class="loader"></div>
      <p>Загрузка контента через защищенное соединение...</p>
    </div>

    <div class="controls">
      <button id="newTabBtn">Открыть напрямую</button>
      <button id="refreshBtn">Обновить</button>
    </div>

    <iframe id="proxyFrame" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>

    <div class="error" id="errorContainer"></div>
    
    <div class="info">
      <strong>Как использовать:</strong> Введите URL сайта или поисковый запрос (например, "как приготовить яйца"). 
      Все запросы автоматически направляются через защищенное соединение.
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const openBtn = document.getElementById('openBtn');
      const urlInput = document.getElementById('urlInput');
      const proxyFrame = document.getElementById('proxyFrame');
      const loading = document.getElementById('loading');
      const errorContainer = document.getElementById('errorContainer');
      const newTabBtn = document.getElementById('newTabBtn');
      const refreshBtn = document.getElementById('refreshBtn');
      
      function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        loading.style.display = 'none';
      }
      
      function isUrl(str) {
        try {
          new URL(str);
          return true;
        } catch (_) {
          return false;
        }
      }
      
      function isSearchQuery(str) {
        return !isUrl(str) && str.trim().length > 0;
      }
      
      function createGoogleSearchUrl(query) {
        return 'https://www.google.com/search?q=' + encodeURIComponent(query);
      }
      
      function loadUrl(input) {
        loading.style.display = 'block';
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
        if (isSearchQuery(targetUrl)) {
          targetUrl = createGoogleSearchUrl(targetUrl);
        }
        
        proxyFrame.src = '/proxy?url=' + encodeURIComponent(targetUrl);
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
        showError('Ошибка загрузки сайта. Возможно, ресурс заблокирован или недоступен.');
      });
      
      newTabBtn.addEventListener('click', function() {
        const input = urlInput.value.trim();
        if (!input) return;
        
        let targetUrl = input;
        if (isSearchQuery(targetUrl)) {
          targetUrl = createGoogleSearchUrl(targetUrl);
        } else if (!targetUrl.startsWith('http')) {
          targetUrl = 'https://' + targetUrl;
        }
        
        window.open(targetUrl, '_blank');
      });
      
      refreshBtn.addEventListener('click', function() {
        if (proxyFrame.src && proxyFrame.src !== 'about:blank') {
          proxyFrame.contentWindow.location.reload();
        }
      });
    });
  </script>
</body>
</html>
  `);
});

app.get('*', async (req, res) => {
  try {
    const fullUrl = req.originalUrl.substring(1);
    const decodedUrl = decodeURIComponent(fullUrl);
    
    console.log('Запрос к прокси:', decodedUrl);
    
    if (decodedUrl === '') {
      return res.redirect('/');
    }
    
    if (decodedUrl.startsWith('proxy?')) {
      return handleProxyRequest(req, res);
    }
    
    return handleDirectRequest(res, decodedUrl);
    
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 20px; background: rgba(0,0,0,0.8);">
        <h3>Ошибка прокси</h3>
        <p>${error.message}</p>
        <p><a href="/" style="color: #4da6ff;">Вернуться на главную</a></p>
      </div>
    `);
  }
});

async function handleProxyRequest(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.redirect('/');

    const finalUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    
    console.log('Проксирование URL:', finalUrl);
    
    const response = await axiosInstance.get(finalUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: status => status < 500
    });
    
    const contentType = response.headers['content-type'] || 'text/html';
    
    if (contentType.includes('text/html')) {
      const html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            const absoluteUrl = new URL(href, finalUrl).href;
            $(el).attr('href', `/${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      $('form[action]').each((i, el) => {
        const action = $(el).attr('action');
        if (action) {
          try {
            const absoluteUrl = new URL(action, finalUrl).href;
            $(el).attr('action', `/${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      $('link[href], script[src], img[src], iframe[src]').each((i, el) => {
        const attr = $(el).attr('href') ? 'href' : 'src';
        const src = $(el).attr(attr);
        if (src) {
          try {
            const absoluteUrl = new URL(src, finalUrl).href;
            $(el).attr(attr, `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      res.set('Content-Type', contentType);
      res.send($.html());
    } else {
      res.set('Content-Type', contentType);
      res.send(response.data);
    }
  } catch (error) {
    console.error('Ошибка проксирования:', error.message);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 20px; background: rgba(0,0,0,0.8);">
        <h3>Ошибка прокси</h3>
        <p>${error.message}</p>
        <p><a href="/" style="color: #4da6ff;">Вернуться на главную</a></p>
      </div>
    `);
  }
}

async function handleDirectRequest(res, decodedUrl) {
  try {
    console.log('Прямой запрос к:', decodedUrl);
    
    const response = await axiosInstance.get(decodedUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: status => status < 500
    });
    
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    res.set('Content-Type', contentType);
    res.send(response.data);
  } catch (error) {
    console.error('Ошибка прямого запроса:', error.message);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 20px; background: rgba(0,0,0,0.8);">
        <h3>Ошибка загрузки ресурса</h3>
        <p>${error.message}</p>
        <p><a href="/" style="color: #4da6ff;">Вернуться на главную</a></p>
      </div>
    `);
  }
}

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
