const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

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
  const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🚀 Рабочий Веб-Прокси</title>
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
      margin: 40px auto;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    h1 {
      text-align: center;
      margin-bottom: 25px;
    }
    .form-group {
      margin-bottom: 25px;
      display: flex;
      gap: 10px;
    }
    input[type="text"] {
      flex: 1;
      padding: 15px;
      font-size: 18px;
      border: none;
      border-radius: 50px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      outline: none;
    }
    input::placeholder {
      color: #aaa;
    }
    button {
      padding: 15px 25px;
      background: #3494e6;
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 18px;
      cursor: pointer;
    }
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    .controls button {
      flex: 1;
      min-width: 120px;
    }
    iframe {
      width: 100%;
      height: 70vh;
      border: none;
      border-radius: 10px;
      background: white;
    }
    .loading {
      display: none;
      text-align: center;
      padding: 20px;
    }
    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 2s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      color: #ff6b6b;
      text-align: center;
      padding: 15px;
      margin-top: 20px;
      border-radius: 8px;
      background: rgba(255, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Рабочий Веб-Прокси</h1>
    
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
      <p>Загружаем сайт, пожалуйста подождите...</p>
    </div>

    <div class="controls">
      <button id="newTabBtn">Открыть в новой вкладке</button>
      <button id="refreshBtn">Обновить страницу</button>
    </div>

    <iframe id="proxyFrame" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>

    <div class="error" id="errorContainer"></div>
  </div>

  <script>
    // Элементы страницы
    const openBtn = document.getElementById('openBtn');
    const urlInput = document.getElementById('urlInput');
    const proxyFrame = document.getElementById('proxyFrame');
    const loading = document.getElementById('loading');
    const errorContainer = document.getElementById('errorContainer');
    const newTabBtn = document.getElementById('newTabBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Текущий URL
    let currentUrl = 'https://google.com';
    
    // Функция для загрузки URL
    function loadUrl(url) {
      // Показываем индикатор загрузки
      loading.style.display = 'block';
      errorContainer.style.display = 'none';
      
      // Обновляем текущий URL
      currentUrl = url;
      urlInput.value = url;
      
      // Устанавливаем URL в iframe
      proxyFrame.src = '/proxy?url=' + encodeURIComponent(url);
    }
    
    // Обработчик кнопки "Открыть"
    openBtn.addEventListener('click', function() {
      let url = urlInput.value.trim();
      if (!url) {
        showError('Пожалуйста, введите URL');
        return;
      }
      
      // Автокоррекция URL
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      try {
        new URL(url);
        loadUrl(url);
      } catch (e) {
        showError('Некорректный URL. Пример: https://google.com');
      }
    });
    
    // Обработчики для iframe
    proxyFrame.addEventListener('load', function() {
      loading.style.display = 'none';
      
      try {
        // Вставляем скрипт для обработки навигации
        const scriptContent = '<script>' +
          'document.addEventListener("click", function(e) {' +
          '  let target = e.target;' +
          '  while (target && target.tagName !== "A") {' +
          '    target = target.parentNode;' +
          '  }' +
          '  if (target && target.tagName === "A" && target.href) {' +
          '    e.preventDefault();' +
          '    window.parent.postMessage({' +
          '      type: "navigate",' +
          '      url: target.href' +
          '    }, "*");' +
          '  }' +
          '});' +
          'document.addEventListener("submit", function(e) {' +
          '  if (e.target.tagName === "FORM") {' +
          '    e.preventDefault();' +
          '    const form = e.target;' +
          '    const formData = new FormData(form);' +
          '    const url = new URL(form.action);' +
          '    for (const [key, value] of formData.entries()) {' +
          '      url.searchParams.append(key, value);' +
          '    }' +
          '    window.parent.postMessage({' +
          '      type: "navigate",' +
          '      url: url.href' +
          '    }, "*");' +
          '  }' +
          '});' +
          '<\\/script>';
        
        // Внедряем скрипт в iframe
        const iframeDoc = proxyFrame.contentDocument || proxyFrame.contentWindow.document;
        const scriptElement = iframeDoc.createElement('div');
        scriptElement.innerHTML = scriptContent;
        iframeDoc.body.appendChild(scriptElement);
      } catch (e) {
        console.error('Ошибка при внедрении скрипта:', e);
      }
    });
    
    proxyFrame.addEventListener('error', function() {
      showError('Не удалось загрузить сайт. Попробуйте другой URL.');
      loading.style.display = 'none';
    });
    
    // Обработка навигационных сообщений
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'navigate') {
        try {
          const newUrl = new URL(event.data.url);
          loadUrl(newUrl.href);
        } catch (e) {
          showError('Некорректный URL для навигации');
        }
      }
    });
    
    // Открыть в новой вкладке
    newTabBtn.addEventListener('click', function() {
      window.open(currentUrl, '_blank');
    });
    
    // Обновить страницу
    refreshBtn.addEventListener('click', function() {
      if (proxyFrame.contentWindow) {
        proxyFrame.contentWindow.location.reload();
      }
    });
    
    // Показать ошибку
    function showError(message) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
    }
    
    // Автоматическая загрузка Google при старте
    window.addEventListener('DOMContentLoaded', function() {
      loadUrl('https://google.com');
    });
  </script>
</body>
</html>
  `;
  
  res.send(htmlContent);
});

// Прокси-обработчик
app.get('/proxy', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    console.log('Запрос прокси для URL:', targetUrl);
    
    if (!targetUrl) {
      return res.status(400).send('URL is required');
    }

    // Автокоррекция URL
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // Проверка валидности URL
    try {
      new URL(targetUrl);
    } catch (e) {
      return res.status(400).send('Invalid URL');
    }
    
    // Загружаем контент
    const response = await axiosInstance.get(targetUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: () => true
    });
    
    const contentType = response.headers['content-type'] || 'text/html';
    
    // Если это HTML, обрабатываем ссылки и формы
    if (contentType.includes('text/html')) {
      const html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Обработка ссылок
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            const absoluteUrl = new URL(href, targetUrl).href;
            $(el).attr('href', absoluteUrl);
          } catch (e) {
            console.log('Ошибка обработки ссылки:', href);
          }
        }
      });
      
      // Обработка форм
      $('form[action]').each((i, el) => {
        const action = $(el).attr('action');
        if (action) {
          try {
            const absoluteUrl = new URL(action, targetUrl).href;
            $(el).attr('action', absoluteUrl);
          } catch (e) {
            console.log('Ошибка обработки формы:', action);
          }
        }
      });
      
      // Обработка ресурсов
      $('link[href], script[src], img[src], iframe[src]').each((i, el) => {
        const attr = $(el).attr('href') ? 'href' : 'src';
        const src = $(el).attr(attr);
        if (src) {
          try {
            const absoluteUrl = new URL(src, targetUrl).href;
            $(el).attr(attr, `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {
            console.log('Ошибка обработки ресурса:', src);
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
    console.error('Ошибка прокси:', error);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 50px;">
        <h2>Ошибка прокси</h2>
        <p>${error.message}</p>
        <p><a href="/" style="color: #4dabf7;">Вернуться на главную</a></p>
      </div>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
