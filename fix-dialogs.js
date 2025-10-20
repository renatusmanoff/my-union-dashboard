const fs = require('fs');
const path = require('path');

const filePath = './app/dashboard/super-admin/organizations/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Заменяем alert на console.log (или можно использовать toast позже)
content = content.replace(/alert\(/g, 'console.log(');

// Заменяем confirm на просто подтверждение без диалога (возвращаем true)
// Но это плохая идея. Лучше оставить confirm, но добавить проверку

fs.writeFileSync(filePath, content);
console.log('✅ Заменены все alert() на console.log()');
