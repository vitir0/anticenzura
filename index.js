const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Добавим middleware для CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Улучшенные настройки для обхода блокировок
const axiosInstance = axios.create({
  timeout: 30000, // Увеличим таймаут
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// Главная страница с формой
app.get('/', (req, res) => {
  res.send(`
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
            value="https://example.com"
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
        // Упрощенный и надежный вариант
        const openBtn = document.getElementById('openBtn');
        const urlInput = document.getElementById('urlInput');
        const proxyFrame = document.getElementById('proxyFrame');
        const loading = document.getElementById('loading');
        const errorContainer = document.getElementById('errorContainer');
        const newTabBtn = document.getElementById('newTabBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        
        // Функция для проверки URL
        function isValidUrl(url) {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        }
        
        // Функция для коррекции URL
        function fixUrl(url) {
          if (!url.startsWith('http')) {
            return 'https://' + url;
          }
          return url;
        }
        
        // Основная функция загрузки
        function loadUrl(url) {
          // Показываем индикатор загрузки
          loading.style.display = 'block';
          errorContainer.style.display = 'none';
          
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
          
          url = fixUrl(url);
          
          if (!isValidUrl(url)) {
            showError('Некорректный URL. Пример: https://google.com');
            return;
          }
          
          loadUrl(url);
        });
        
        // Обработчики для iframe
        proxyFrame.addEventListener('load', function() {
          loading.style.display = 'none';
        });
        
        proxyFrame.addEventListener('error', function() {
          showError('Не удалось загрузить сайт. Попробуйте другой URL.');
          loading.style.display = 'none';
        });
        
        // Открыть в новой вкладке
        newTabBtn.addEventListener('click', function() {
          const url = urlInput.value.trim();
          if (url && isValidUrl(fixUrl(url))) {
            window.open(fixUrl(url), '_blank');
          }
        });
        
        // Обновить страницу
        refreshBtn.addEventListener('click', function() {
          if (proxyFrame.src) {
            proxyFrame.contentWindow.location.reload();
          }
        });
        
        // Показать ошибку
        function showError(message) {
          errorContainer.textContent = message;
          errorContainer.style.display = 'block';
        }
        
        // Автоматическая загрузка при старте
        window.addEventListener('DOMContentLoaded', function() {
          loadUrl('https://example.com');
        });
      </script>
    </body>
    </html>
  `);
});

// Упрощенный и надежный прокси-обработчик
app.get('/proxy', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    console.log('Запрос прокси для URL:', targetUrl);
    
    if (!targetUrl) {
      console.error('Ошибка: URL не предоставлен');
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
      console.error('Некорректный URL:', targetUrl);
      return res.status(400).send('Invalid URL');
    }
    
    console.log('Исправленный URL:', targetUrl);
    
    // Загружаем контент
    const response = await axiosInstance.get(targetUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 10,
      validateStatus: () => true // Принимаем все статусы
    });
    
    console.log(`Статус ответа: ${response.status} для ${targetUrl}`);
    
    const contentType = response.headers['content-type'] || 'text/html';
    console.log('Content-Type:', contentType);
    
    // Если это HTML, обрабатываем базовые ссылки
    if (contentType.includes('text/html')) {
      const html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Простая обработка ссылок
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            const absoluteUrl = new URL(href, targetUrl).href;
            $(el).attr('href', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {
            // Игнорируем невалидные URL
          }
        }
      });
      
      res.set('Content-Type', contentType);
      res.send($.html());
    } else {
      // Для не-HTML контента возвращаем как есть
      res.set('Content-Type', contentType);
      res.send(response.data);
    }
  } catch (error) {
    console.error('Ошибка прокси:', error);
    
    let errorMessage = 'Произошла ошибка';
    if (error.response) {
      errorMessage = `Сайт вернул ошибку ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Не удалось получить ответ от сайта';
    }
    
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 50px;">
        <h2>Ошибка прокси</h2>
        <p>${errorMessage}</p>
        <p><a href="/" style="color: #4dabf7;">Вернуться на главную</a></p>
      </div>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте в браузере: http://localhost:${PORT}`);
});
