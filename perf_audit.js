import fs from 'fs';
import path from 'path';

const buildPath = '/home/fedora/Volume D:/luxe/beta test/luxe/client/build/static/js';
const files = fs.readdirSync(buildPath);
const mainJs = files.find(f => f.startsWith('main.') && f.endsWith('.js'));

if (mainJs) {
    const stats = fs.statSync(path.join(buildPath, mainJs));
    const sizeKB = stats.size / 1024;
    console.log(`Main Bundle Size: ${sizeKB.toFixed(2)} KB`);
    if (sizeKB < 200) {
        console.log('✅ Performance Aspect: Main bundle is well under 200KB (Gzip will be much smaller)');
    } else {
        console.log('⚠️ Performance Aspect: Main bundle is over 200KB');
    }
} else {
    console.log('❌ Build files not found');
}