const fs = require('fs');
const path = require('path');

// Fonction pour remplacer récursivement dans tous les fichiers
function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remplacer les imports Decimal
        const originalContent = content;
        
        // Supprimer les imports Decimal
        content = content.replace(/import\s*\{[^}]*Decimal[^}]*\}\s*from\s*['"]@prisma\/client\/runtime\/library['"];?\s*\n?/g, '');
        content = content.replace(/import\s*\{[^}]*Decimal[^}]*\}\s*from\s*['"]@prisma\/client['"];?\s*\n?/g, '');
        content = content.replace(/,\s*Decimal\s*as\s*DecimalType/g, '');
        content = content.replace(/Decimal\s*as\s*DecimalType,?/g, '');
        content = content.replace(/,\s*Decimal(?=\s*[}])/g, '');
        content = content.replace(/Decimal,/g, '');
        
        // Remplacer les types Decimal par number
        content = content.replace(/:\s*Decimal(?![a-zA-Z])/g, ': number');
        content = content.replace(/\?:\s*Decimal(?![a-zA-Z])/g, '?: number');
        content = content.replace(/<Decimal>/g, '<number>');
        
        // Remplacer new Prisma.Decimal() par des nombres
        content = content.replace(/new\s+Prisma\.Decimal\s*\(([^)]+)\)/g, (match, value) => {
            // Si c'est déjà un nombre, le retourner tel quel
            if (/^\d+(\.\d+)?$/.test(value.trim())) {
                return value.trim();
            }
            // Si c'est une variable ou expression, utiliser parseFloat
            return `parseFloat(${value}) || 0`;
        });
        
        // Remplacer les méthodes Decimal
        content = content.replace(/\.toNumber\(\)/g, '');
        content = content.replace(/\.toString\(\)/g, '.toString()');
        
        // Nettoyer les lignes vides multiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed: ${filePath}`);
            modified = true;
        }
        
        return modified;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    let totalFixed = 0;
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Ignorer node_modules, .git, etc.
            if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
                totalFixed += processDirectory(fullPath);
            }
        } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
            if (replaceInFile(fullPath)) {
                totalFixed++;
            }
        }
    }
    
    return totalFixed;
}

// Démarrer le processus
console.log('🔄 Starting global Decimal to number conversion...');
const srcPath = path.join(__dirname, 'src');
const totalFixed = processDirectory(srcPath);
console.log(`\n✨ Conversion completed! Fixed ${totalFixed} files.`);