import puppeteer from 'puppeteer';
import { MembershipApplication, Organization, User } from '@prisma/client';

export async function generateApplicationPDF(application: unknown): Promise<string> {
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
    
    const fileName = `application_${(application as { id: string }).id}_${Date.now()}.pdf`;
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

function generateApplicationHTML(application: unknown): string {
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
        <h1>${(application as { [key: string]: unknown }).organizationName}</h1>
        <p>Заявление на вступление в профсоюз</p>
      </div>

      <div class="application-title">
        ЗАЯВЛЕНИЕ
      </div>

      <div class="content">
        <p style="text-indent: 20px; margin-bottom: 20px;">
          Прошу принять меня в члены профсоюза <strong>${(application as { [key: string]: unknown }).organizationName}</strong>.
        </p>

        <div class="section">
          <div class="section-title">1. ЛИЧНЫЕ ДАННЫЕ</div>
          
          <div class="field">
            <span class="field-label">Фамилия:</span>
            <span class="field-value">${(application as { [key: string]: unknown }).lastName}</span>
          </div>
          
          <div class="field">
            <span class="field-label">Имя:</span>
            <span class="field-value">${(application as { [key: string]: unknown }).firstName}</span>
          </div>
          
          ${(application as { [key: string]: unknown }).middleName ? `
          <div class="field">
            <span class="field-label">Отчество:</span>
            <span class="field-value">${(application as { [key: string]: unknown }).middleName}</span>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="field-label">Дата рождения:</span>
             <span class="field-value">${formatDate((application as { [key: string]: unknown }).dateOfBirth as Date)}</span>
          </div>
          
          <div class="field">
            <span class="field-label">Пол:</span>
            <span class="field-value">${(application as { [key: string]: unknown }).gender === 'MALE' ? 'Мужской' : 'Женский'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. КОНТАКТНАЯ ИНФОРМАЦИЯ</div>
          
          <div class="field">
            <span class="field-label">Телефон:</span>
            <span class="field-value">${(application as { [key: string]: unknown }).phone}</span>
          </div>
          
          ${(application as { [key: string]: unknown }).additionalPhone ? `
          <div class="field">
            <span class="field-label">Доп. телефон:</span>
            <span class="field-value">${(application as { [key: string]: unknown }).additionalPhone}</span>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="field-label">Email:</span>
            <span class="field-value">${(application as { [key: string]: unknown }).email}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. АДРЕС ПРОЖИВАНИЯ</div>
          
          <div class="address-block">
            <div class="field">
              <span class="field-label">Индекс:</span>
              <span class="field-value">${(application as { [key: string]: unknown }).addressIndex}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Регион:</span>
              <span class="field-value">${(application as { [key: string]: unknown }).addressRegion}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Муниципальное образование:</span>
              <span class="field-value">${(application as { [key: string]: unknown }).addressMunicipality}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Населенный пункт:</span>
              <span class="field-value">${(application as { [key: string]: unknown }).addressLocality}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Улица:</span>
              <span class="field-value">${(application as { [key: string]: unknown }).addressStreet}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Дом/Здание:</span>
              <span class="field-value">${(application as { [key: string]: unknown }).addressHouse}</span>
            </div>
            
            ${(application as { [key: string]: unknown }).addressApartment ? `
            <div class="field">
              <span class="field-label">Квартира:</span>
              <span class="field-value">${(application as { [key: string]: unknown }).addressApartment}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">4. ОБРАЗОВАНИЕ И ТРУДОВАЯ ДЕЯТЕЛЬНОСТЬ</div>
          
          <div class="field">
            <span class="field-label">Образование:</span>
            <span class="field-value">${(application as { [key: string]: unknown }).education}</span>
          </div>
          
           ${Array.isArray((application as { [key: string]: unknown }).specialties) && ((application as { [key: string]: unknown }).specialties as unknown[]).length > 0 ? `
          <div class="field">
            <span class="field-label">Специальности:</span>
            <span class="field-value">${((application as { [key: string]: unknown }).specialties as string[]).join(', ')}</span>
          </div>
          ` : ''}
          
          ${Array.isArray((application as { [key: string]: unknown }).positions) && ((application as { [key: string]: unknown }).positions as unknown[]).length > 0 ? `
          <div class="field">
            <span class="field-label">Должности:</span>
            <span class="field-value">${((application as { [key: string]: unknown }).positions as string[]).join(', ')}</span>
          </div>
          ` : ''}
        </div>

        ${(application as { [key: string]: unknown }).children && Array.isArray((application as { [key: string]: unknown }).children) && ((application as { [key: string]: unknown }).children as unknown[]).length > 0 ? `
        <div class="section">
          <div class="section-title">5. ДЕТИ</div>
          ${((application as { [key: string]: unknown }).children as unknown[]).map((child: unknown, index: number) => `
            <div class="field">
              <span class="field-label">Ребенок ${index + 1}:</span>
              <span class="field-value">${(child as { name: string; dateOfBirth: string }).name}, дата рождения: ${formatDate(new Date((child as { name: string; dateOfBirth: string }).dateOfBirth))}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${Array.isArray((application as { [key: string]: unknown }).hobbies) && ((application as { [key: string]: unknown }).hobbies as unknown[]).length > 0 ? `
        <div class="section">
          <div class="section-title">6. УВЛЕЧЕНИЯ</div>
          <div class="field">
            <span class="field-value">${((application as { [key: string]: unknown }).hobbies as string[]).join(', ')}</span>
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
         <p>Дата подачи заявления: <strong>${formatDate((application as { [key: string]: unknown }).applicationDate as Date)}</strong></p>
      </div>

      <div class="signature-section">
        <div>
          <p>Заявитель:</p>
          <div class="signature-line"></div>
          <p style="font-size: 12px; margin-top: 5px;">
            ${(application as { [key: string]: unknown }).lastName} ${(application as { [key: string]: unknown }).firstName} ${(application as { [key: string]: unknown }).middleName || ''}
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

// Интерфейс для данных генерации документов
interface MembershipDocumentData {
  application: MembershipApplication;
  organization: Organization & { chairman?: User | null };
  chairman?: User | null;
}

// Интерфейс для результата генерации
interface GeneratedDocument {
  type: 'MEMBERSHIP_APPLICATION' | 'CONSENT_PERSONAL_DATA' | 'PAYMENT_DEDUCTION';
  fileName: string;
  filePath: string;
}

// Генерация трех документов для заявления на вступление в профсоюз
export async function generateMembershipDocuments(data: MembershipDocumentData): Promise<GeneratedDocument[]> {
  const { application, organization, chairman } = data;
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const documents: GeneratedDocument[] = [];
    
    // 1. Заявление на вступление в профсоюз
    const membershipApplicationHTML = generateMembershipApplicationHTML(application, organization, chairman);
    const membershipApplicationPDF = await generatePDFFromHTMLWithBrowser(browser, membershipApplicationHTML);
    const membershipApplicationFileName = `membership_application_${application.id}_${Date.now()}.pdf`;
    const membershipApplicationPath = await savePDF(membershipApplicationPDF, membershipApplicationFileName);
    
    documents.push({
      type: 'MEMBERSHIP_APPLICATION',
      fileName: membershipApplicationFileName,
      filePath: membershipApplicationPath
    });
    
    // 2. Согласие на обработку персональных данных
    const consentHTML = generateConsentHTML(application, organization, chairman);
    const consentPDF = await generatePDFFromHTMLWithBrowser(browser, consentHTML);
    const consentFileName = `consent_personal_data_${application.id}_${Date.now()}.pdf`;
    const consentPath = await savePDF(consentPDF, consentFileName);
    
    documents.push({
      type: 'CONSENT_PERSONAL_DATA',
      fileName: consentFileName,
      filePath: consentPath
    });
    
    // 3. Заявление на удержание взносов
    const paymentHTML = generatePaymentDeductionHTML(application, organization, chairman);
    const paymentPDF = await generatePDFFromHTMLWithBrowser(browser, paymentHTML);
    const paymentFileName = `payment_deduction_${application.id}_${Date.now()}.pdf`;
    const paymentPath = await savePDF(paymentPDF, paymentFileName);
    
    documents.push({
      type: 'PAYMENT_DEDUCTION',
      fileName: paymentFileName,
      filePath: paymentPath
    });
    
    await browser.close();
    
    return documents;
    
  } catch (error) {
    console.error('Error generating membership documents:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw new Error(`Не удалось сгенерировать документы: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Вспомогательная функция для генерации PDF из HTML
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generatePDFFromHTMLWithBrowser(browser: any, html: string): Promise<Buffer> {
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
  
  await page.close();
  return pdfBuffer;
}

// Вспомогательная функция для сохранения PDF
async function savePDF(pdfBuffer: Buffer, fileName: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');
  
  const documentsDir = path.join(process.cwd(), 'public', 'documents');
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }
  
  const filePath = path.join(documentsDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);
  
  return `/documents/${fileName}`;
}

// Генерация HTML для заявления на вступление в профсоюз
function generateMembershipApplicationHTML(application: MembershipApplication, organization: Organization, chairman?: User | null): string {
  const chairmanName = chairman ? `${chairman.lastName} ${chairman.firstName} ${chairman.middleName || ''}`.trim() : organization.chairmanName || 'Председатель';
  const applicantName = `${application.lastName} ${application.firstName} ${application.middleName || ''}`.trim();
  const currentDate = new Date().toLocaleDateString('ru-RU');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Заявление на вступление в профсоюз</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5; margin: 0; padding: 20px; }
        .header { text-align: right; margin-bottom: 30px; }
        .title { text-align: center; font-weight: bold; font-size: 16px; margin: 30px 0; }
        .content { margin: 20px 0; }
        .signature { margin-top: 50px; }
        .date { margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        Председателю первичной профсоюзной организации<br>
        ${organization.name}<br>
        ${chairmanName}
      </div>
      
      <div class="header">
        от ${applicantName}
      </div>
      
      <div class="title">ЗАЯВЛЕНИЕ</div>
      
      <div class="content">
        Прошу принять меня в ${organization.name} «${currentDate}».
      </div>
      
      <div class="content">
        С уставом ${organization.name} ознакомлен(а) и обязуюсь исполнять.
      </div>
      
      <div class="date">
        «${currentDate}»
      </div>
      
      <div class="signature">
        Личная подпись _________________
      </div>
    </body>
    </html>
  `;
}

// Генерация HTML для согласия на обработку персональных данных
function generateConsentHTML(application: MembershipApplication, organization: Organization, chairman?: User | null): string {
  const chairmanName = chairman ? `${chairman.lastName} ${chairman.firstName} ${chairman.middleName || ''}`.trim() : organization.chairmanName || 'Председатель';
  const applicantName = `${application.lastName} ${application.firstName} ${application.middleName || ''}`.trim();
  const currentDate = new Date().toLocaleDateString('ru-RU');
  
  // Парсим адрес и формируем строку адреса
  let addressString = '';
  try {
    const address = typeof application.address === 'string' ? JSON.parse(application.address) : application.address;
    const addressParts = [
      address.index,
      address.region,
      address.locality,
      address.street,
      address.house ? `д. ${address.house}` : '',
      address.apartment ? `кв. ${address.apartment}` : ''
    ].filter(part => part && part.trim() !== '');
    
    addressString = addressParts.join(', ');
  } catch (error) {
    console.error('Error parsing address:', error);
    addressString = 'адрес не указан';
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Согласие на обработку персональных данных</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5; margin: 0; padding: 20px; }
        .title { text-align: center; font-weight: bold; font-size: 16px; margin: 30px 0; }
        .content { margin: 20px 0; text-align: justify; }
        .signature { margin-top: 50px; }
        .date { margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="title">Согласие на обработку персональных данных</div>
      
      <div class="content">
        Я, ${applicantName}, дата рождения: ${application.dateOfBirth.toLocaleDateString('ru-RU')}, 
        зарегистрированный(ая) по адресу: ${addressString}, даю согласие на обработку 
        моих персональных данных:
      </div>
      
      <div class="content">
        - фамилия, имя, отчество;<br>
        - год, месяц, дата рождения;<br>
        - адрес проживания;<br>
        - сведения об образовании и профессиональной деятельности;<br>
        - сведения о составе семьи;<br>
        - и иные сведения, необходимые для предоставления услуг от:
      </div>
      
      <div class="content">
        Наименование профсоюзной организации: ${organization.name}<br>
        Председатель профсоюзной организации: ${chairmanName}
      </div>
      
      <div class="content">
        Настоящее согласие является бессрочным и вступает в силу с момента его подписания.
      </div>
      
      <div class="content">
        Процесс подписания данного Согласия на обработку персональных данных выполнен в электронной форме 
        и считается подписанным в момент установки символа в <strong>чекбоке</strong>.
      </div>
      
      <div class="content">
        Согласие может быть отозвано в любое время на основании письменного заявления субъекта персональных данных.
      </div>
      
      <div class="date">
        ${currentDate}
      </div>
      
      <div class="signature">
        Личная подпись _________________
      </div>
    </body>
    </html>
  `;
}

// Генерация HTML для заявления на удержание взносов
function generatePaymentDeductionHTML(application: MembershipApplication, organization: Organization, chairman?: User | null): string {
  const chairmanName = chairman ? `${chairman.lastName} ${chairman.firstName} ${chairman.middleName || ''}`.trim() : organization.chairmanName || 'Председатель';
  const applicantName = `${application.lastName} ${application.firstName} ${application.middleName || ''}`.trim();
  const currentDate = new Date().toLocaleDateString('ru-RU');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Заявление на удержание взносов</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5; margin: 0; padding: 20px; }
        .header { text-align: right; margin-bottom: 30px; }
        .title { text-align: center; font-weight: bold; font-size: 16px; margin: 30px 0; }
        .content { margin: 20px 0; text-align: justify; }
        .signature { margin-top: 50px; }
      </style>
    </head>
    <body>
      <div class="header">
        Руководителю (главному врачу, директору)<br>
        ${organization.name}<br>
        ${chairmanName}
      </div>
      
      <div class="header">
        от ${applicantName}
      </div>
      
      <div class="title">ЗАЯВЛЕНИЕ</div>
      
      <div class="content">
        На основании ст.28 Федерального закона «О профессиональных союзах, их правах и гарантиях деятельности» 
        прошу ежемесячно удерживать из моей заработной платы членские профсоюзные взносы в размере 1% 
        (один процент) и перечислять их на счет профсоюзной организации с ${currentDate}.
      </div>
      
      <div class="signature">
        Подпись _________________
      </div>
    </body>
    </html>
  `;
}
