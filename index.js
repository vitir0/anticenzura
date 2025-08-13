const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Главная страница с формой
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Бесплатный Веб-Прокси</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
          color: white;
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 40px auto;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
        }
        input[type="text"] {
          width: 100%;
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
          width: 100%;
          padding: 15px;
          background: linear-gradient(to right, #3494e6, #ec6ead);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
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
        .features {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          margin: 30px 0;
        }
        .feature {
          text-align: center;
          padding: 15px;
          width: 30%;
          min-width: 200px;
        }
        .feature i {
          font-size: 2.5rem;
          margin-bottom: 15px;
          color: #4dabf7;
        }
        .result-container {
          margin-top: 30px;
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
        @media (max-width: 600px) {
          .container {
            padding: 20px;
            margin: 20px auto;
          }
          h1 {
            font-size: 2rem;
          }
          .feature {
            width: 100%;
            margin-bottom: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✨ Бесплатный Веб-Прокси</h1>
        
        <div class="description">
          <p>Открывайте любые сайты через наш сервер. Просто введите URL ниже:</p>
        </div>

        <form id="proxyForm">
          <div class="form-group">
            <input 
              type="text" 
              id="urlInput" 
              placeholder="https://example.com" 
              required
              autocomplete="off"
            >
          </div>
          <button type="submit">Открыть через прокси</button>
        </form>

        <div class="features">
          <div class="feature">
            <div>🔒 Безопасно</div>
          </div>
          <div class="feature">
            <div>⚡ Быстро</div>
          </div>
          <div class="feature">
            <div>💡 Бесплатно</div>
          </div>
        </div>

        <div class="note">
          <strong>Примечание:</strong> Некоторые сайты могут блокировать доступ через прокси. 
          Для лучшей работы используйте HTTPS-ссылки.
        </div>

        <div class="result-container" id="resultContainer">
          <iframe 
            id="proxyFrame" 
            style="width:100%; height:70vh; border:none; border-radius:10px; background:white;"
          ></iframe>
        </div>

        <div class="error" id="errorContainer"></div>
      </div>

      <script>
        document.getElementById('proxyForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const urlInput = document.getElementById('urlInput').value.trim();
          const resultContainer = document.getElementById('resultContainer');
          const errorContainer = document.getElementById('errorContainer');
          const proxyFrame = document.getElementById('proxyFrame');
          
          if (!urlInput) {
            showError('Пожалуйста, введите URL');
            return;
          }
          
          try {
            // Проверяем и корректируем URL
            let validUrl = urlInput;
            if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
              validUrl = 'https://' + validUrl;
            }
            new URL(validUrl); // Проверка валидности URL
            
            // Показываем iframe
            proxyFrame.src = '/proxy?url=' + encodeURIComponent(validUrl);
            resultContainer.style.display = 'block';
            errorContainer.style.display = 'none';
            
            // Прокрутка к результату
            resultContainer.scrollIntoView({ behavior: 'smooth' });
            
          } catch (err) {
            showError('Некорректный URL. Пример правильного URL: https://google.com');
          }
        });
        
        function showError(message) {
          const errorContainer = document.getElementById('errorContainer');
          errorContainer.textContent = message;
          errorContainer.style.display = 'block';
          document.getElementById('resultContainer').style.display = 'none';
        }
      </script>
    </body>
    </html>
  `);
});

// Прокси-обработчик
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.redirect('/');

    // Загружаем контент с целевого сайта
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'] || 'text/html';
    
    // Обработка HTML
    if (contentType.includes('text/html')) {
      const html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Корректируем все ссылки
      $('a[href], link[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            const absoluteUrl = new URL(href, targetUrl).href;
            $(el).attr('href', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
      });
      
      // Корректируем ресурсы
      $('script[src], img[src], iframe[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          try {
            const absoluteUrl = new URL(src, targetUrl).href;
            $(el).attr('src', `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
          } catch (e) {}
        }
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
        <p>${error.message}</p>
        <p><a href="/" style="color: #4dabf7;">Вернуться на главную</a></p>
      </div>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте в браузере: http://localhost:${PORT}`);
});
