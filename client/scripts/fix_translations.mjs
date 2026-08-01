#!/usr/bin/env node
/**
 * Fix translations.js by:
 *  1. Merging duplicate top-level namespaces (cart, profile, installment, sizeGuide).
 *  2. Adding keys that are used in components but missing from translations.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import parser from '@babel/parser';
import generate from '@babel/generator';
import * as t from '@babel/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TRANSLATIONS_FILE = resolve(__dirname, '..', 'client', 'src', 'data', 'translations.js');

const raw = readFileSync(TRANSLATIONS_FILE, 'utf-8');

// Parse the whole file so we can later regenerate it with the same leading/trailing text.
const ast = parser.parse(raw, {
  sourceType: 'module',
  plugins: ['jsx'],
});

// Find the `const translations = { ... }` declaration
const varDecl = ast.program.body.find(
  (n) => t.isVariableDeclaration(n) && n.declarations[0]?.id?.name === 'translations'
);
if (!varDecl) throw new Error('Could not find translations declaration');

const translationsObj = varDecl.declarations[0].init;
if (!t.isObjectExpression(translationsObj)) throw new Error('translations is not an object literal');

function mergeObjectExpressions(target, source) {
  // target and source are ObjectExpression nodes.
  // For each property in source, if a property with same key already exists in target,
  // deeply merge if both are object expressions; otherwise source wins.
  const targetMap = new Map();
  target.properties.forEach((prop, idx) => {
    if (t.isObjectProperty(prop) || t.isObjectMethod(prop)) {
      const keyName = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
      targetMap.set(keyName, { prop, idx });
    }
  });

  for (const prop of source.properties) {
    if (!t.isObjectProperty(prop)) continue;
    const keyName = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
    if (targetMap.has(keyName)) {
      const existing = targetMap.get(keyName).prop;
      if (t.isObjectExpression(existing.value) && t.isObjectExpression(prop.value)) {
        existing.value = mergeObjectExpressions(existing.value, prop.value);
      } else {
        existing.value = prop.value;
      }
    } else {
      target.properties.push(prop);
      targetMap.set(keyName, { prop, idx: target.properties.length - 1 });
    }
  }
  return target;
}

function dedupeTopLevelNamespaces(langObj) {
  // langObj is an ObjectExpression node representing one language.
  // We need to merge properties that share the same key.
  const groups = new Map();
  const orderedKeys = [];
  for (const prop of langObj.properties) {
    if (!t.isObjectProperty(prop)) continue;
    const keyName = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
    if (!groups.has(keyName)) {
      groups.set(keyName, []);
      orderedKeys.push(keyName);
    }
    groups.get(keyName).push(prop);
  }

  const newProps = [];
  for (const key of orderedKeys) {
    const props = groups.get(key);
    if (props.length === 1) {
      newProps.push(props[0]);
    } else {
      // Merge all occurrences; first occurrence's key node is kept.
      const baseProp = props[0];
      for (let i = 1; i < props.length; i++) {
        const p = props[i];
        if (t.isObjectExpression(baseProp.value) && t.isObjectExpression(p.value)) {
          baseProp.value = mergeObjectExpressions(baseProp.value, p.value);
        } else {
          baseProp.value = p.value;
        }
      }
      newProps.push(baseProp);
    }
  }
  langObj.properties = newProps;
  return langObj;
}

// Run deduplication on each language
for (const langProp of translationsObj.properties) {
  if (t.isObjectProperty(langProp) && t.isObjectExpression(langProp.value)) {
    dedupeTopLevelNamespaces(langProp.value);
  }
}

// Evaluate the fixed object so we can add missing keys as plain JS objects.
const fixedCode = generate.default(ast).code;
// Extract just the object literal and eval it in a sandbox via new Function.
const objectCode = fixedCode.replace(/^[\s\S]*?const\s+translations\s*=\s*/, '').replace(/;?\s*export\s+default\s+translations\s*;?\s*$/, '');
const getObj = new Function(`return ${objectCode}`);
const fixedTranslations = getObj();

const missingKeys = {
  common: {
    category: { uz: 'Kategoriya', ru: 'Категория', en: 'Category' },
  },
  nav: {
    shop: { uz: 'Shop', ru: 'Магазин', en: 'Shop' },
  },
  mobileNav: {
    ariaLabel: { uz: 'Mobil navigatsiya', ru: 'Мобильная навигация', en: 'Mobile navigation' },
  },
  productView: {
    selectSize: { uz: "O'lcham tanlang", ru: 'Выберите размер', en: 'Select size' },
  },
  sizeGuide: {
    open: { uz: "O'lcham jadvali", ru: 'Таблица размеров', en: 'Size guide' },
  },
  premiumHome: {
    look: { uz: 'Look', ru: 'Look', en: 'Look' },
  },
  liveStreams: {
    error: { uz: 'Efirlar yuklanishida xatolik', ru: 'Ошибка загрузки эфиров', en: 'Error loading streams' },
  },
  eco: {
    error: { uz: "Ma'lumotlarni yuklashda xatolik", ru: 'Ошибка загрузки данных', en: 'Error loading data' },
  },
  products: {
    filter: { uz: 'Filtr', ru: 'Фильтр', en: 'Filter' },
  },
};

function setNested(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] && typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [lang, langObj] of Object.entries(fixedTranslations)) {
  for (const [namespace, keys] of Object.entries(missingKeys)) {
    for (const [key, values] of Object.entries(keys)) {
      const path = `${namespace}.${key}`;
      if (!langObj[namespace]) langObj[namespace] = {};
      if (!(key in langObj[namespace])) {
        setNested(langObj, path, values[lang]);
      }
    }
  }
}

// Build final file content
const json = JSON.stringify(fixedTranslations, null, 2);
// Convert JSON back to JS object literal (keys do not need quoting if valid identifiers)
const output = `const translations = ${json};\n\nexport default translations;\n`;
writeFileSync(TRANSLATIONS_FILE, output, 'utf-8');

console.log('translations.js fixed:');
console.log('  - merged duplicate namespaces');
console.log('  - added missing keys:', Object.keys(missingKeys).flatMap(ns => Object.keys(missingKeys[ns])));
