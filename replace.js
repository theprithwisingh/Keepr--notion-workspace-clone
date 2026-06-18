const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
        .replace(/"\/login/g, '"/sign-in')
        .replace(/'\/login/g, "'/sign-in")
        .replace(/"\/signup/g, '"/sign-up')
        .replace(/'\/signup/g, "'/sign-up")
        .replace(/"\/modify-password/g, '"/forgot-password')
        .replace(/'\/modify-password/g, "'/forgot-password");
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated ' + filePath);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    }
}

walk('./app');
walk('./lib');
replaceInFile('./middleware.ts');
