const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Настройки запросов
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  }
});

// Главная страница
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚀 Полнофункциональный Веб-Прокси</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    body {
      background: linear-gradient(135deg, #1a2980, #26d0ce);
      color: white;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1000px;
      margin: 20px auto;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    }
    h1 {
      text-align: center;
      margin-bottom: 20px;
      font-size: 24px;
    }
    .form-group {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    input[type="text"] {
      flex: 1;
      padding: 12px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      outline: none;
    }
    input::placeholder {
      color: #aaa;
    }
    button {
      padding: 12px 20px;
      background: #3494e6;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      min-width: 100px;
    }
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    iframe {
      width: 100%;
      height: 70vh;
      border: none;
      border-radius: 5px;
      background: white;
    }
    .error {
      color: #ff6b6b;
      text-align: center;
      padding: 15px;
      margin-top: 20px;
      border-radius: 5px;
      background: rgba(255, 0, 0, 0.1);
    }
    .loading {
      text-align: center;
      padding: 20px;
      display: none;
    }
    .loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
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
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Полнофункциональный Веб-Прокси</h1>
    
    <div class="form-group">
      <input 
        type="text" 
        id="urlInput" 
        placeholder="https://google.com" 
        autocomplete="off"
        value="https://google.com"
      >
      <button id="openBtn">Открыть</button>
    </div>

    <div class="loading" id="loading">
      <div class="loader"></div>
      <p>Загрузка...</p>
    </div>

    <div class="controls">
      <button id="newTabBtn">Новая вкладка</button>
      <button id="refreshBtn">Обновить</button>
    </div>

    <iframe id="proxyFrame" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>

    <div class="error" id="errorContainer"></div>
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
      
      // Показать ошибку
      function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        loading.style.display = 'none';
      }
      
      // Загрузить URL
      function loadUrl(url) {
        loading.style.display = 'block';
        errorContainer.style.display = 'none';
        
        // Автокоррекция URL
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        
        proxyFrame.src = '/proxy?url=' + encodeURIComponent(url);
      }
      
      // Обработчики событий
      openBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (!url) {
          showError('Введите URL');
          return;
        }
        loadUrl(url);
      });
      
      proxyFrame.addEventListener('load', function() {
        loading.style.display = 'none';
      });
      
      proxyFrame.addEventListener('error', function() {
        showError('Ошибка загрузки сайта');
      });
      
      newTabBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (url) {
          window.open(url, '_blank');
        }
      });
      
      refreshBtn.addEventListener('click', function() {
        proxyFrame.contentWindow.location.reload();
      });
      
      // Загрузить Google по умолчанию
      loadUrl('https://google.com');
    });
  </script>
</body>
</html>
  `);
});

// Обработчик для всех путей
app.get('*', async (req, res) => {
  try {
    // Получаем полный URL из запроса
    const fullUrl = req.originalUrl.substring(1); // Убираем первый слэш
    const decodedUrl = decodeURIComponent(fullUrl);
    
    console.log('Запрос к прокси:', decodedUrl);
    
    // Если это запрос к корню
    if (decodedUrl === '') {
      return res.redirect('/');
    }
    
    // Если это запрос к /proxy?url=...
    if (decodedUrl.startsWith('proxy?')) {
      return handleProxyRequest(req, res);
    }
    
    // Если это прямой запрос к ресурсу
    return handleDirectRequest(res, decodedUrl);
    
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 20px;">
        <h3>Ошибка прокси</h3>
        <p>${error.message}</p>
        <p><a href="/">Вернуться на главную</a></p>
      </div>
    `);
  }
});

// Обработчик прокси-запросов
async function handleProxyRequest(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.redirect('/');

    // Автокоррекция URL
    const finalUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    
    console.log('Проксирование URL:', finalUrl);
    
    // Загружаем контент
    const response = await axiosInstance.get(finalUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: status => status < 500
    });
    
    // Определяем Content-Type
    const contentType = response.headers['content-type'] || 'text/html';
    
    // Если это HTML, обрабатываем ссылки
    if (contentType.includes('text/html')) {
      const html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Обработка всех ссылок
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            const absoluteUrl = new URL(href, finalUrl).href;
            $(el).attr('href', `/${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {
            // Оставляем оригинальную ссылку
          }
        }
      });
      
      // Обработка форм
      $('form[action]').each((i, el) => {
        const action = $(el).attr('action');
        if (action) {
          try {
            const absoluteUrl = new URL(action, finalUrl).href;
            $(el).attr('action', `/${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {
            // Оставляем оригинальный action
          }
        }
      });
      
      // Обработка ресурсов
      $('link[href], script[src], img[src], iframe[src]').each((i, el) => {
        const attr = $(el).attr('href') ? 'href' : 'src';
        const src = $(el).attr(attr);
        if (src) {
          try {
            const absoluteUrl = new URL(src, finalUrl).href;
            $(el).attr(attr, `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {
            // Оставляем оригинальный ресурс
          }
        }
      });
      
      res.set('Content-Type', contentType);
      res.send($.html());
    } else {
      // Для не-HTML контента
      res.set('Content-Type', contentType);
      res.send(response.data);
    }
  } catch (error) {
    console.error('Ошибка проксирования:', error.message);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 20px;">
        <h3>Ошибка прокси</h3>
        <p>${error.message}</p>
        <p><a href="/">Вернуться на главную</a></p>
      </div>
    `);
  }
}

// Обработчик прямых запросов
async function handleDirectRequest(res, decodedUrl) {
  try {
    console.log('Прямой запрос к:', decodedUrl);
    
    // Загружаем контент
    const response = await axiosInstance.get(decodedUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: status => status < 500
    });
    
    // Определяем Content-Type
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    // Отправляем контент
    res.set('Content-Type', contentType);
    res.send(response.data);
  } catch (error) {
    console.error('Ошибка прямого запроса:', error.message);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 20px;">
        <h3>Ошибка загрузки ресурса</h3>
        <p>${error.message}</p>
        <p><a href="/">Вернуться на главную</a></p>
      </div>
    `);
  }
}

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
