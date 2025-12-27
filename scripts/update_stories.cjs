const fs = require('fs');
const path = require('path');

const BASE_PATH = "c:/temp/lexiflow-premium/frontend/src/components";

function extractPropsFromComponent(componentPath) {
    try {
        const content = fs.readFileSync(componentPath, 'utf-8');
        // Simple regex to find interface or type
        const interfaceMatch = content.match(/interface\s+(\w+Props)\s*\{([\s\S]*?)\}/);
        if (interfaceMatch) {
            const propsName = interfaceMatch[1];
            const propsContent = interfaceMatch[2];
            // Extract prop names and types
            const props = {};
            const propMatches = propsContent.matchAll(/(\w+)\??:\s*([^;]+);/g);
            for (const match of propMatches) {
                const propName = match[1];
                const propType = match[2].trim();
                props[propName] = getDefaultValueForType(propType);
            }
            return props;
        }
        // If no interface, try to find React.FC or similar
        const fcMatch = content.match(/React\.FC<(\w+)>/);
        if (fcMatch) {
            // Assume it's the props type
            return {}; // Placeholder
        }
        return {};
    } catch (e) {
        console.error(`Error reading ${componentPath}: ${e}`);
        return {};
    }
}

function getDefaultValueForType(type) {
    if (type.includes('string')) return 'Sample Text';
    if (type.includes('number')) return 42;
    if (type.includes('boolean')) return true;
    if (type.includes('ReactNode') || type.includes('JSX.Element')) return '<div>Sample Content</div>';
    if (type.includes('[]') || type.includes('Array')) return [];
    if (type.includes('Date')) return new Date().toISOString();
    return {}; // Object or unknown
}

function updateStoryFile(storyPath, componentName, props) {
    const args = JSON.stringify(props, null, 2);
    const content = `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${getTitleFromPath(storyPath)}',
  component: ${componentName},
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {
  args: ${args},
};
`;
    fs.writeFileSync(storyPath, content);
}

function getTitleFromPath(storyPath) {
    const relative = path.relative(BASE_PATH, storyPath);
    const parts = relative.split(path.sep);
    const category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const subPath = parts.slice(1, -1).join('/');
    const component = path.basename(storyPath, '.stories.tsx');
    return subPath ? `${category}/${subPath}/${component}` : `${category}/${component}`;
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== 'stories' && f !== '__tests__') {
                walkDir(dirPath, callback);
            }
        } else {
            callback(path.join(dir, f));
        }
    });
}

function main() {
    walkDir(BASE_PATH, (filePath) => {
        if (filePath.endsWith('.stories.tsx')) {
            const dir = path.dirname(filePath);
            const componentName = path.basename(filePath, '.stories.tsx');
            const componentFile = path.join(dir, `${componentName}.tsx`);
            
            if (fs.existsSync(componentFile)) {
                console.log(`Updating story for ${componentName}`);
                const props = extractPropsFromComponent(componentFile);
                updateStoryFile(filePath, componentName, props);
            }
        }
    });
}

main();
