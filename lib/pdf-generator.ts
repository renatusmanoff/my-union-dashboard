import puppeteer from 'puppeteer';

export async function generateApplicationPDF(application: any): Promise<string> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // HTML шаблон для заявления
    const html = generateApplicationHTML(application);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Генерируем PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await browser.close();
    
    // Сохраняем PDF в папку public/documents
    const fs = await import('fs');
    const path = await import('path');
    
    const fileName = `application_${application.id}_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'public', 'documents', fileName);
    
    // Создаем папку если её нет
    const documentsDir = path.join(process.cwd(), 'public', 'documents');
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, pdfBuffer);
    
    // Возвращаем URL для доступа к файлу
    return `/documents/${fileName}`;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Не удалось сгенерировать PDF заявления');
  }
}

function generateApplicationHTML(application: any): string {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Заявление на вступление в профсоюз</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 14px;
          line-height: 1.6;
          color: #000;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .header p {
          font-size: 12px;
          margin: 5px 0;
        }
        .application-title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin: 30px 0;
          text-decoration: underline;
        }
        .content {
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          text-decoration: underline;
        }
        .field {
          margin-bottom: 8px;
        }
        .field-label {
          font-weight: bold;
          display: inline-block;
          width: 200px;
        }
        .field-value {
          display: inline-block;
        }
        .address-block {
          margin-left: 20px;
        }
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .signature-line {
          border-bottom: 1px solid #000;
          width: 200px;
          height: 20px;
          margin-top: 30px;
        }
        .date-section {
          text-align: right;
          margin-top: 30px;
        }
        .footer {
          margin-top: 50px;
          font-size: 12px;
          text-align: center;
          color: #666;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${application.organizationName}</h1>
        <p>Заявление на вступление в профсоюз</p>
      </div>

      <div class="application-title">
        ЗАЯВЛЕНИЕ
      </div>

      <div class="content">
        <p style="text-indent: 20px; margin-bottom: 20px;">
          Прошу принять меня в члены профсоюза <strong>${application.organizationName}</strong>.
        </p>

        <div class="section">
          <div class="section-title">1. ЛИЧНЫЕ ДАННЫЕ</div>
          
          <div class="field">
            <span class="field-label">Фамилия:</span>
            <span class="field-value">${application.lastName}</span>
          </div>
          
          <div class="field">
            <span class="field-label">Имя:</span>
            <span class="field-value">${application.firstName}</span>
          </div>
          
          ${application.middleName ? `
          <div class="field">
            <span class="field-label">Отчество:</span>
            <span class="field-value">${application.middleName}</span>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="field-label">Дата рождения:</span>
            <span class="field-value">${formatDate(application.dateOfBirth)}</span>
          </div>
          
          <div class="field">
            <span class="field-label">Пол:</span>
            <span class="field-value">${application.gender === 'MALE' ? 'Мужской' : 'Женский'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. КОНТАКТНАЯ ИНФОРМАЦИЯ</div>
          
          <div class="field">
            <span class="field-label">Телефон:</span>
            <span class="field-value">${application.phone}</span>
          </div>
          
          ${application.additionalPhone ? `
          <div class="field">
            <span class="field-label">Доп. телефон:</span>
            <span class="field-value">${application.additionalPhone}</span>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="field-label">Email:</span>
            <span class="field-value">${application.email}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. АДРЕС ПРОЖИВАНИЯ</div>
          
          <div class="address-block">
            <div class="field">
              <span class="field-label">Индекс:</span>
              <span class="field-value">${application.addressIndex}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Регион:</span>
              <span class="field-value">${application.addressRegion}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Муниципальное образование:</span>
              <span class="field-value">${application.addressMunicipality}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Населенный пункт:</span>
              <span class="field-value">${application.addressLocality}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Улица:</span>
              <span class="field-value">${application.addressStreet}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Дом/Здание:</span>
              <span class="field-value">${application.addressHouse}</span>
            </div>
            
            ${application.addressApartment ? `
            <div class="field">
              <span class="field-label">Квартира:</span>
              <span class="field-value">${application.addressApartment}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">4. ОБРАЗОВАНИЕ И ТРУДОВАЯ ДЕЯТЕЛЬНОСТЬ</div>
          
          <div class="field">
            <span class="field-label">Образование:</span>
            <span class="field-value">${application.education}</span>
          </div>
          
          ${Array.isArray(application.specialties) && application.specialties.length > 0 ? `
          <div class="field">
            <span class="field-label">Специальности:</span>
            <span class="field-value">${application.specialties.join(', ')}</span>
          </div>
          ` : ''}
          
          ${Array.isArray(application.positions) && application.positions.length > 0 ? `
          <div class="field">
            <span class="field-label">Должности:</span>
            <span class="field-value">${application.positions.join(', ')}</span>
          </div>
          ` : ''}
        </div>

        ${application.children && Array.isArray(application.children) && application.children.length > 0 ? `
        <div class="section">
          <div class="section-title">5. ДЕТИ</div>
          ${application.children.map((child: any, index: number) => `
            <div class="field">
              <span class="field-label">Ребенок ${index + 1}:</span>
              <span class="field-value">${child.name}, дата рождения: ${formatDate(new Date(child.dateOfBirth))}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${Array.isArray(application.hobbies) && application.hobbies.length > 0 ? `
        <div class="section">
          <div class="section-title">6. УВЛЕЧЕНИЯ</div>
          <div class="field">
            <span class="field-value">${application.hobbies.join(', ')}</span>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">7. ОБЯЗАТЕЛЬСТВА</div>
          <p style="text-indent: 20px; margin-bottom: 15px;">
            Обязуюсь соблюдать Устав профсоюза, выполнять решения руководящих органов профсоюза, 
            участвовать в деятельности профсоюзной организации, своевременно уплачивать членские взносы.
          </p>
        </div>
      </div>

      <div class="date-section">
        <p>Дата подачи заявления: <strong>${formatDate(application.applicationDate)}</strong></p>
      </div>

      <div class="signature-section">
        <div>
          <p>Заявитель:</p>
          <div class="signature-line"></div>
          <p style="font-size: 12px; margin-top: 5px;">
            ${application.lastName} ${application.firstName} ${application.middleName || ''}
          </p>
        </div>
        
        <div>
          <p>Председатель профсоюзной организации:</p>
          <div class="signature-line"></div>
          <p style="font-size: 12px; margin-top: 5px;">(подпись, дата)</p>
        </div>
      </div>

      <div class="footer">
        <p>Данное заявление сгенерировано автоматически системой MyUnion Dashboard</p>
        <p>Дата генерации: ${formatDate(new Date())}</p>
      </div>
    </body>
    </html>
  `;
}

// Функция для генерации PDF из HTML строки
export async function generatePDFFromHTML(html: string, fileName: string): Promise<string> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await browser.close();
    
    // Сохраняем PDF
    const fs = await import('fs');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'public', 'documents', fileName);
    
    // Создаем папку если её нет
    const documentsDir = path.join(process.cwd(), 'public', 'documents');
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, pdfBuffer);
    
    return `/documents/${fileName}`;
    
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw new Error('Не удалось сгенерировать PDF');
  }
}
