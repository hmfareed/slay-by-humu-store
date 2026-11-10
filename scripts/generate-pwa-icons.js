const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Generating official PWA icons from Logo/Slaybyhumu logo.jpg...');

const pythonScript = `
from PIL import Image, ImageFilter, ImageDraw
import os

source_path = 'Logo/Slaybyhumu logo.jpg'
out_dir = 'my-ecommerce-frontend/public/icons'
os.makedirs(out_dir, exist_ok=True)

img = Image.open(source_path)
w, h = img.size

def generate_square_icon(canvas_size, target_size, feather_blur=70):
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (6, 5, 5, 255))
    cx = canvas_size // 2
    cy = canvas_size // 2
    paste_x = cx - 771
    paste_y = cy - 458
    
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rectangle([180, 120, w - 180, h - 120], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather_blur))
    
    canvas.paste(img, (paste_x, paste_y), mask)
    return canvas.resize((target_size, target_size), Image.Resampling.LANCZOS)

# 1. Standard 512x512
icon_512 = generate_square_icon(1350, 512)
icon_512.save(os.path.join(out_dir, 'icon-512x512.png'), optimize=True)

# 2. Standard 192x192
icon_192 = generate_square_icon(1350, 192)
icon_192.save(os.path.join(out_dir, 'icon-192x192.png'), optimize=True)

# 3. Apple Touch Icon 180x180
icon_apple = generate_square_icon(1350, 180)
icon_apple.save(os.path.join(out_dir, 'apple-touch-icon.png'), optimize=True)

# 4. Maskable 512x512 (canvas size 1600 so content is safely within 80% circle)
icon_maskable = generate_square_icon(1600, 512)
icon_maskable.save(os.path.join(out_dir, 'icon-maskable-512x512.png'), optimize=True)

# 5. Favicon ICO (multi-size 16, 32, 48)
icon_48 = generate_square_icon(1350, 48)
icon_48.save('my-ecommerce-frontend/public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
icon_48.save('my-ecommerce-frontend/app/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
`;

execSync(`python -c "${pythonScript.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

console.log('Official icons generated successfully.');
