const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Улучшенные настройки для обхода блокировок
const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
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
      <title>🚀 Исправленный Веб-Прокси</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
          background: linear-gradient(135deg, #1a2980, #26d0ce);
          color: white;
          min-height: 100vh;
          padding: 20px;
          position: relative;
        }
        .container {
          max-width: 1000px;
          margin: 40px auto;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          position: relative;
          z-index: 10;
        }
        h1 {
          text-align: center;
          margin-bottom: 25px;
          font-size: 2.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .description {
          text-align: center;
          margin-bottom: 30px;
          line-height: 1.6;
          color: #e0e0e0;
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
          transition: all 0.3s;
          border: 2px solid transparent;
        }
        input[type="text"]:focus {
          border-color: #4dabf7;
          background: rgba(0, 0, 0, 0.3);
        }
        input::placeholder {
          color: #aaa;
        }
        button {
          padding: 15px 25px;
          background: linear-gradient(to right, #3494e6, #ec6ead);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          min-width: 150px;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        button:active {
          transform: translateY(1px);
        }
        .note {
          margin-top: 25px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.6;
        }
        .result-container {
          margin-top: 30px;
          position: relative;
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
        #exitFullscreenBtn {
          background: linear-gradient(to right, #ff416c, #ff4b2b);
          display: none;
        }
        .error {
          color: #ff6b6b;
          text-align: center;
          padding: 15px;
          margin-top: 20px;
          border-radius: 8px;
          background: rgba(255, 0, 0, 0.1);
        }
        iframe {
          width: 100%;
          height: 70vh;
          border: none;
          border-radius: 10px;
          background: white;
          display: none;
        }
        .fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          background: black;
          padding: 0;
          margin: 0;
          border-radius: 0;
        }
        .fullscreen iframe {
          height: 100vh;
          border-radius: 0;
        }
        .fullscreen .controls {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 1001;
          width: auto;
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
        @media (max-width: 768px) {
          .form-group {
            flex-direction: column;
          }
          button {
            width: 100%;
          }
          .container {
            padding: 15px;
          }
          h1 {
            font-size: 2rem;
          }
        }
        .video-fallback {
          text-align: center;
          padding: 20px;
          background: rgba(0,0,0,0.5);
          border-radius: 10px;
          margin-top: 20px;
        }
        #contentFrame {
          display: block;
          width: 100%;
          height: 70vh;
          border: none;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Исправленный Веб-Прокси</h1>
        
        <div class="description">
          <p>Полностью переработанный механизм работы!</p>
        </div>

        <div class="form-group">
          <input 
            type="text" 
            id="urlInput" 
            placeholder="https://google.com" 
            required
            autocomplete="off"
            value="https://google.com"
          >
          <button id="openBtn">Открыть</button>
        </div>

        <div class="note">
          <strong>Исправлено:</strong> 
          <ul>
            <li>Работа навигации в Google</li>
            <li>Просмотр YouTube видео</li>
            <li>Устранена циклическая перезагрузка</li>
          </ul>
        </div>

        <div class="loading" id="loading">
          <div class="loader"></div>
          <p>Загружаем сайт, пожалуйста подождите...</p>
        </div>

        <div class="result-container" id="resultContainer">
          <div class="controls">
            <button id="fullscreenBtn">Полный экран</button>
            <button id="exitFullscreenBtn">Выйти из полноэкранного режима</button>
            <button id="newTabBtn">Открыть в новой вкладке</button>
            <button id="refreshBtn">Обновить страницу</button>
            <button id="backBtn">Назад</button>
          </div>
          <iframe id="proxyFrame" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>
          <iframe id="contentFrame" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>
          <div class="video-fallback" id="videoFallback">
            <h3>Для просмотра видео на YouTube:</h3>
            <button id="directVideoBtn">Открыть видео напрямую</button>
          </div>
        </div>

        <div class="error" id="errorContainer"></div>
      </div>

      <script>
        // Элементы DOM
        const openBtn = document.getElementById('openBtn');
        const urlInput = document.getElementById('urlInput');
        const resultContainer = document.getElementById('resultContainer');
        const errorContainer = document.getElementById('errorContainer');
        const proxyFrame = document.getElementById('proxyFrame');
        const contentFrame = document.getElementById('contentFrame');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
        const newTabBtn = document.getElementById('newTabBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const backBtn = document.getElementById('backBtn');
        const loading = document.getElementById('loading');
        const videoFallback = document.getElementById('videoFallback');
        const directVideoBtn = document.getElementById('directVideoBtn');
        
        // Состояние приложения
        let currentUrl = '';
        let isUsingProxy = true;
        let historyStack = [];
        
        // Инициализация
        function init() {
          // Скрыть ненужные элементы
          proxyFrame.style.display = 'none';
          contentFrame.style.display = 'none';
          videoFallback.style.display = 'none';
          errorContainer.style.display = 'none';
        }
        
        // Обработчик кнопки "Открыть"
        openBtn.addEventListener('click', function() {
          const url = urlInput.value.trim();
          
          if (!url) {
            showError('Пожалуйста, введите URL');
            return;
          }
          
          try {
            // Показываем индикатор загрузки
            loading.style.display = 'block';
            errorContainer.style.display = 'none';
            videoFallback.style.display = 'none';
            
            // Проверяем и корректируем URL
            let validUrl = url;
            if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
              validUrl = 'https://' + validUrl;
            }
            
            // Сохраняем текущий URL
            currentUrl = validUrl;
            historyStack.push(validUrl);
            
            // Загружаем страницу
            loadUrl(validUrl);
            
          } catch (err) {
            showError('Некорректный URL. Пример: https://google.com');
            loading.style.display = 'none';
          }
        });
        
        // Функция загрузки URL
        function loadUrl(url, isVideo = false) {
          // Для YouTube используем специальную обработку
          if ((url.includes('youtube.com') || url.includes('youtu.be')) && !isVideo) {
            loadYouTube(url);
            return;
          }
          
          // Используем основной фрейм
          proxyFrame.style.display = 'block';
          contentFrame.style.display = 'none';
          
          // Устанавливаем URL в прокси-фрейм
          proxyFrame.src = '/proxy?url=' + encodeURIComponent(url);
        }
        
        // Загрузка YouTube
        function loadYouTube(url) {
          const videoId = getYouTubeId(url);
          if (videoId) {
            // Показываем видео-фолбэк
            videoFallback.style.display = 'block';
            
            // Прямая загрузка видео
            proxyFrame.style.display = 'none';
            contentFrame.style.display = 'block';
            contentFrame.src = 'https://www.youtube.com/embed/' + videoId;
          } else {
            // Обычная загрузка через прокси
            loadUrl(url);
          }
        }
        
        // Обработчики для фреймов
        proxyFrame.addEventListener('load', function() {
          loading.style.display = 'none';
          errorContainer.style.display = 'none';
          resultContainer.style.display = 'block';
        });
        
        contentFrame.addEventListener('load', function() {
          loading.style.display = 'none';
          errorContainer.style.display = 'none';
          resultContainer.style.display = 'block';
        });
        
        // Обработка ошибок
        proxyFrame.addEventListener('error', function() {
          showError('Не удалось загрузить сайт через прокси. Попробуйте другой URL.');
          loading.style.display = 'none';
        });
        
        // Полноэкранный режим
        fullscreenBtn.addEventListener('click', function() {
          const container = document.querySelector('.container');
          container.classList.add('fullscreen');
          fullscreenBtn.style.display = 'none';
          exitFullscreenBtn.style.display = 'block';
        });
        
        exitFullscreenBtn.addEventListener('click', function() {
          const container = document.querySelector('.container');
          container.classList.remove('fullscreen');
          fullscreenBtn.style.display = 'block';
          exitFullscreenBtn.style.display = 'none';
        });
        
        // Открыть в новой вкладке
        newTabBtn.addEventListener('click', function() {
          window.open(currentUrl, '_blank');
        });
        
        // Обновить страницу
        refreshBtn.addEventListener('click', function() {
          if (contentFrame.style.display === 'block') {
            contentFrame.contentWindow.location.reload();
          } else {
            proxyFrame.contentWindow.location.reload();
          }
        });
        
        // Кнопка "Назад"
        backBtn.addEventListener('click', function() {
          if (historyStack.length > 1) {
            historyStack.pop(); // Удаляем текущий URL
            const prevUrl = historyStack.pop();
            urlInput.value = prevUrl;
            loadUrl(prevUrl);
          }
        });
        
        // Открыть видео напрямую
        directVideoBtn.addEventListener('click', function() {
          if (currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) {
            const videoId = getYouTubeId(currentUrl);
            if (videoId) {
              loading.style.display = 'block';
              const directUrl = 'https://www.youtube.com/embed/' + videoId;
              proxyFrame.style.display = 'none';
              contentFrame.style.display = 'block';
              contentFrame.src = directUrl;
              videoFallback.style.display = 'none';
            }
          }
        });
        
        // Обработка сообщений от iframe
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'navigation') {
            const newUrl = event.data.url;
            currentUrl = newUrl;
            historyStack.push(newUrl);
            loadUrl(newUrl);
          }
        });
        
        // Показать ошибку
        function showError(message) {
          errorContainer.textContent = message;
          errorContainer.style.display = 'block';
          loading.style.display = 'none';
        }
        
        // Получить YouTube ID
        function getYouTubeId(url) {
          const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = url.match(regExp);
          return (match && match[2].length === 11) ? match[2] : null;
        }
        
        // Инициализация при загрузке
        window.addEventListener('DOMContentLoaded', init);
      </script>
    </body>
    </html>
  `);
});

// Прокси-обработчик с исправлениями
app.get('/proxy', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    if (!targetUrl) return res.redirect('/');

    // Автокоррекция URL
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
    
    // Особые обработчики для популярных сайтов
    if (targetUrl.includes('facebook.com')) {
      targetUrl = targetUrl.replace('facebook.com', 'm.facebook.com');
    }
    
    // Обработка Google поиска
    if (targetUrl.includes('google.com/search')) {
      return handleGoogleSearch(res, targetUrl);
    }

    const response = await axiosInstance.get(targetUrl, {
      responseType: 'arraybuffer',
      maxRedirects: 5
    });

    const contentType = response.headers['content-type'] || 'text/html';
    
    if (contentType.includes('text/html')) {
      const html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Корректируем все ссылки
      $('a[href], link[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          try {
            const absoluteUrl = new URL(href, targetUrl).href;
            $(el).attr('href', `javascript:parent.navigateTo('${absoluteUrl}')`);
          } catch (e) {}
        }
      });
      
      // Корректируем ресурсы
      $('script[src], img[src], iframe[src], source[src], track[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('data:')) {
          try {
            const absoluteUrl = new URL(src, targetUrl).href;
            $(el).attr('src', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      // Корректируем CSS
      $('style').each((i, el) => {
        const cssContent = $(el).html();
        const fixedCss = cssContent.replace(/url\(['"]?(.*?)['"]?\)/gi, (match, url) => {
          try {
            const absoluteUrl = new URL(url, targetUrl).href;
            return `url('/proxy?url=${encodeURIComponent(absoluteUrl)}')`;
          } catch (e) {
            return match;
          }
        });
        $(el).html(fixedCss);
      });
      
      // Корректируем формы
      $('form[action]').each((i, el) => {
        const action = $(el).attr('action');
        if (action) {
          try {
            const absoluteUrl = new URL(action, targetUrl).href;
            $(el).attr('action', `javascript:parent.submitForm(this)`);
            $(el).attr('data-action', absoluteUrl);
          } catch (e) {}
        }
      });
      
      // Инжектируем скрипт для обработки навигации
      $('body').append(`
        <script>
          // Глобальная функция для навигации
          function navigateTo(url) {
            window.parent.postMessage({
              type: 'navigation',
              url: url
            }, '*');
          }
          
          // Обработка форм
          function submitForm(form) {
            const url = form.getAttribute('data-action');
            const formData = new FormData(form);
            const params = new URLSearchParams();
            
            for (const [key, value] of formData.entries()) {
              params.append(key, value);
            }
            
            const fullUrl = url + '?' + params.toString();
            navigateTo(fullUrl);
          }
          
          // Перехват кликов
          document.addEventListener('click', function(e) {
            let target = e.target;
            while (target && target.tagName !== 'A') {
              target = target.parentNode;
            }
            
            if (target && target.tagName === 'A' && target.href) {
              e.preventDefault();
              navigateTo(target.href);
            }
          });
        </script>
      `);
      
      res.set('Content-Type', contentType);
      res.send($.html());
    } else {
      // Бинарные данные (изображения, стили и т.д.)
      res.set('Content-Type', contentType);
      res.send(response.data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send(`
      <div style="color: white; text-align: center; padding: 50px; background: rgba(255,0,0,0.2);">
        <h2>Ошибка прокси</h2>
        <p>${error.response?.status || 'Unknown'} - ${error.message}</p>
        <p><a href="/" style="color: #4dabf7;">Вернуться на главную</a></p>
      </div>
    `);
  }
});

// Специальная обработка для Google поиска
async function handleGoogleSearch(res, targetUrl) {
  try {
    const response = await axiosInstance.get(targetUrl);
    const $ = cheerio.load(response.data);
    
    // Корректируем ссылки
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('/url?q=')) {
        const match = href.match(/\/url\?q=([^&]+)/);
        if (match && match[1]) {
          const decodedUrl = decodeURIComponent(match[1]);
          $(el).attr('href', `javascript:parent.navigateTo('${decodedUrl}')`);
        }
      } else if (href && href.startsWith('/search?')) {
        // Обработка ссылок внутри поиска
        const absoluteUrl = new URL(href, 'https://www.google.com').href;
        $(el).attr('href', `javascript:parent.navigateTo('${absoluteUrl}')`);
      }
    });
    
    // Корректируем формы
    $('form[action]').each((i, el) => {
      const action = $(el).attr('action');
      if (action && action.startsWith('/search')) {
        const absoluteUrl = new URL(action, 'https://www.google.com').href;
        $(el).attr('action', `javascript:parent.submitForm(this)`);
        $(el).attr('data-action', absoluteUrl);
      }
    });
    
    // Корректируем ресурсы
    $('img[src], script[src]').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          const absoluteUrl = new URL(src, 'https://www.google.com').href;
          $(el).attr('src', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
        } catch (e) {}
      }
    });
    
    // Инжектируем скрипт для обработки навигации
    $('body').append(`
      <script>
        // Перехват кликов по результатам поиска
        document.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', function(e) {
            if (this.href && this.href.includes('/url?q=')) {
              e.preventDefault();
              navigateTo(this.href);
            }
          });
        });
      </script>
    `);
    
    res.send($.html());
  } catch (error) {
    res.status(500).send(`
      <div style="text-align: center; padding: 30px;">
        <h2>Не удалось загрузить Google</h2>
        <p>Попробуйте снова или используйте другую поисковую систему</p>
      </div>
    `);
  }
}

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте в браузере: http://localhost:${PORT}`);
});
