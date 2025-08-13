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
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
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
      <title>🚀 Улучшенный Веб-Прокси</title>
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
          display: none;
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
          display: none;
          text-align: center;
          padding: 20px;
          background: rgba(0,0,0,0.5);
          border-radius: 10px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Улучшенный Веб-Прокси</h1>
        
        <div class="description">
          <p>Теперь с поддержкой YouTube и Google поиска!</p>
        </div>

        <form id="proxyForm">
          <div class="form-group">
            <input 
              type="text" 
              id="urlInput" 
              placeholder="https://google.com" 
              required
              autocomplete="off"
              value="https://google.com"
            >
            <button type="submit">Открыть</button>
          </div>
        </form>

        <div class="note">
          <strong>Советы для YouTube:</strong> 
          <ul>
            <li>Используйте кнопку "Открыть видео" под плеером</li>
            <li>Для мобильных устройств лучше использовать m.youtube.com</li>
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
          </div>
          <iframe 
            id="proxyFrame" 
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          ></iframe>
          <div class="video-fallback" id="videoFallback">
            <h3>Видео не загружается?</h3>
            <button id="directVideoBtn">Открыть видео напрямую</button>
          </div>
        </div>

        <div class="error" id="errorContainer"></div>
      </div>

      <script>
        const proxyForm = document.getElementById('proxyForm');
        const urlInput = document.getElementById('urlInput');
        const resultContainer = document.getElementById('resultContainer');
        const errorContainer = document.getElementById('errorContainer');
        const proxyFrame = document.getElementById('proxyFrame');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
        const newTabBtn = document.getElementById('newTabBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const loading = document.getElementById('loading');
        const videoFallback = document.getElementById('videoFallback');
        const directVideoBtn = document.getElementById('directVideoBtn');
        
        // Сохраняем текущий URL для навигации
        let currentUrl = '';
        
        // Обработка отправки формы
        proxyForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const url = urlInput.value.trim();
          
          if (!url) {
            showError('Пожалуйста, введите URL');
            return;
          }
          
          try {
            // Показываем индикатор загрузки
            loading.style.display = 'block';
            errorContainer.style.display = 'none';
            resultContainer.style.display = 'none';
            videoFallback.style.display = 'none';
            
            // Проверяем и корректируем URL
            let validUrl = url;
            if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
              validUrl = 'https://' + validUrl;
            }
            currentUrl = validUrl;
            
            // Для YouTube используем мобильную версию
            if (validUrl.includes('youtube.com') || validUrl.includes('youtu.be')) {
              validUrl = validUrl
                .replace('www.youtube.com', 'm.youtube.com')
                .replace('youtube.com', 'm.youtube.com')
                .replace('youtu.be', 'm.youtube.com/watch?v=');
            }
            
            // Устанавливаем iframe
            proxyFrame.src = '/proxy?url=' + encodeURIComponent(validUrl);
            
          } catch (err) {
            showError('Некорректный URL. Пример: https://google.com');
            loading.style.display = 'none';
          }
        });
        
        // Обработчики для iframe
        proxyFrame.addEventListener('load', function() {
          loading.style.display = 'none';
          resultContainer.style.display = 'block';
          errorContainer.style.display = 'none';
          
          // Показываем видео-фолбэк для YouTube
          if (currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) {
            videoFallback.style.display = 'block';
          }
          
          resultContainer.scrollIntoView({ behavior: 'smooth' });
        });
        
        proxyFrame.addEventListener('error', function() {
          showError('Не удалось загрузить сайт. Попробуйте другой URL.');
          loading.style.display = 'none';
        });
        
        // Полноэкранный режим
        fullscreenBtn.addEventListener('click', function() {
          const container = document.querySelector('.container');
          const iframeContainer = document.getElementById('resultContainer');
          
          container.classList.add('fullscreen');
          iframeContainer.classList.add('fullscreen');
          fullscreenBtn.style.display = 'none';
          exitFullscreenBtn.style.display = 'block';
        });
        
        exitFullscreenBtn.addEventListener('click', function() {
          const container = document.querySelector('.container');
          const iframeContainer = document.getElementById('resultContainer');
          
          container.classList.remove('fullscreen');
          iframeContainer.classList.remove('fullscreen');
          fullscreenBtn.style.display = 'block';
          exitFullscreenBtn.style.display = 'none';
        });
        
        // Открыть в новой вкладке
        newTabBtn.addEventListener('click', function() {
          window.open(currentUrl, '_blank');
        });
        
        // Обновить страницу
        refreshBtn.addEventListener('click', function() {
          proxyFrame.contentWindow.location.reload();
        });
        
        // Открыть видео напрямую
        directVideoBtn.addEventListener('click', function() {
          if (currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) {
            const videoId = getYouTubeId(currentUrl);
            if (videoId) {
              const directUrl = 'https://www.youtube.com/embed/' + videoId;
              proxyFrame.src = directUrl;
            }
          }
        });
        
        // Обработка сообщений от iframe
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'navigation') {
            const newUrl = event.data.url;
            currentUrl = newUrl;
            proxyFrame.src = '/proxy?url=' + encodeURIComponent(newUrl);
          }
        });
        
        function showError(message) {
          errorContainer.textContent = message;
          errorContainer.style.display = 'block';
          resultContainer.style.display = 'none';
        }
        
        function getYouTubeId(url) {
          const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          const match = url.match(regExp);
          return (match && match[2].length === 11) ? match[2] : null;
        }
      </script>
    </body>
    </html>
  `);
});

// Прокси-обработчик с улучшенной поддержкой Google и YouTube
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
            $(el).attr('href', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
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
            $(el).attr('action', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      // Для YouTube заменяем iframe на прямой видео-тег
      if (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')) {
        $('body').prepend(`
          <div style="text-align:center;padding:20px;background:#000;">
            <h2 style="color:#fff;">YouTube через прокси</h2>
            <p style="color:#aaa;">Если видео не загружается, используйте кнопку "Открыть видео"</p>
          </div>
        `);
      }
      
      // Инжектируем скрипт для обработки динамической навигации
      $('body').append(`
        <script>
          // Перехват кликов
          document.addEventListener('click', function(e) {
            let target = e.target;
            while (target && target.tagName !== 'A') {
              target = target.parentNode;
            }
            
            if (target && target.tagName === 'A' && target.href) {
              e.preventDefault();
              window.parent.postMessage({
                type: 'navigation',
                url: target.href
              }, '*');
            }
          });
          
          // Перехват форм
          document.addEventListener('submit', function(e) {
            if (e.target.tagName === 'FORM') {
              e.preventDefault();
              const form = e.target;
              const formData = new FormData(form);
              const url = new URL(form.action);
              
              // Создаем URL с параметрами
              for (const [key, value] of formData.entries()) {
                url.searchParams.append(key, value);
              }
              
              window.parent.postMessage({
                type: 'navigation',
                url: url.href
              }, '*');
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
        ${error.response?.status === 400 ? `
          <p>Сайт заблокировал запрос через прокси. Попробуйте:</p>
          <ul style="text-align: left; max-width: 500px; margin: 20px auto;">
            <li>Мобильную версию сайта (m.example.com)</li>
            <li>HTTP вместо HTTPS (если сайт поддерживает)</li>
            <li>Другой сайт</li>
          </ul>
        ` : ''}
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
          $(el).attr('href', `/proxy?url=${encodeURIComponent(decodedUrl)}`);
        }
      } else if (href && href.startsWith('/search?')) {
        // Обработка ссылок внутри поиска
        const absoluteUrl = new URL(href, 'https://www.google.com').href;
        $(el).attr('href', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
      }
    });
    
    // Корректируем формы
    $('form[action]').each((i, el) => {
      const action = $(el).attr('action');
      if (action && action.startsWith('/search')) {
        const absoluteUrl = new URL(action, 'https://www.google.com').href;
        $(el).attr('action', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
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
              window.parent.postMessage({
                type: 'navigation',
                url: this.href
              }, '*');
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
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; 
          background: #4285F4; color: white; text-decoration: none;">
          Попробовать снова
        </a>
      </div>
    `);
  }
}

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте в браузере: http://localhost:${PORT}`);
});
