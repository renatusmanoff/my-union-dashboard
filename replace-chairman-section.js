const fs = require('fs');

const filePath = './app/dashboard/super-admin/organizations/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Заменяем раздел Chairman Data
const oldSection = `                {/* Chairman Data */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold mb-4">Данные администратора организации</h4>`;

const newSection = `                {/* Chairman Data - Only for creating new organization */}
                {!editingOrg && (
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold mb-4">Данные администратора организации</h4>`;

if (content.includes(oldSection)) {
  content = content.replace(oldSection, newSection);
  
  // Добавляем закрывающую скобку перед кнопками
  const endSection = `                  </div>
                </div>

                <div className="flex space-x-3">`;
  
  const newEndSection = `                  </div>
                </div>
                )}

                <div className="flex space-x-3">`;
  
  content = content.replace(endSection, newEndSection);
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Chairman Data section wrapped with !editingOrg condition');
} else {
  console.log('❌ Could not find Chairman Data section');
}
