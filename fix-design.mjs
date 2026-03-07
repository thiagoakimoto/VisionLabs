import fs from 'fs';
import path from 'path';

const files = [
    'src/figma-exports/app/pages/Features.tsx',
    'src/figma-exports/app/pages/HowItWorks.tsx',
    'src/figma-exports/app/pages/Pricing.tsx'
];

for (const file of files) {
    const fullPath = path.resolve(file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Remove forced Geist font to inherit site's Outfit
    content = content.replace(/font-\['Geist:Regular',sans-serif\]/g, 'font-light');

    // 2. Scale down text sizes
    content = content.replace(/text-\[80px\]/g, 'text-[56px] md:text-[64px]');
    content = content.replace(/text-\[56px\]/g, 'text-[32px] md:text-[40px]');
    content = content.replace(/text-\[40px\]/g, 'text-[28px] md:text-[32px]');
    content = content.replace(/text-\[28px\]/g, 'text-[20px] md:text-[24px]');
    content = content.replace(/text-\[24px\]/g, 'text-[18px] md:text-[20px]');
    content = content.replace(/text-\[20px\]/g, 'text-[16px] md:text-[18px]');
    content = content.replace(/text-\[18px\]/g, 'text-[15px] md:text-[16px]');

    // 3. Scale down line heights
    content = content.replace(/leading-\[70px\]/g, 'leading-[1.2]');
    content = content.replace(/leading-\[56px\]/g, 'leading-[1.3]');
    content = content.replace(/leading-\[52px\]/g, 'leading-[1.3]');
    content = content.replace(/leading-\[40px\]/g, 'leading-[1.4]');
    content = content.replace(/leading-\[36px\]/g, 'leading-[1.4]');
    content = content.replace(/leading-\[32px\]/g, 'leading-[1.5]');
    content = content.replace(/leading-\[28px\]/g, 'leading-[1.5]');
    content = content.replace(/leading-\[24px\]/g, 'leading-[1.6]');

    fs.writeFileSync(fullPath, content, 'utf8');
}

console.log('Design refinements applied successfully.');
