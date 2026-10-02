import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  buildRouteMeta,
  generateMetaTags,
  generateHomepageMetaTags,
} from './metadata.mjs';
import { SHARED_ROUTES } from './routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distClient = path.resolve(root, 'dist');
const distServer = path.resolve(root, 'dist-server');

async function prerender() {
  const serverEntryPath = pathToFileURL(path.join(distServer, 'entry-server.js')).href;
  const {
    render: renderPage,
    getServicesData,
    getCaseStudiesData,
  } = await import(serverEntryPath);

  // Get data from SSR exports
  const servicesData = getServicesData();
  const caseStudiesData = getCaseStudiesData();

  const render = async (...args) => {
    const html = await renderPage(...args);
    if (html.includes('<!--$!-->') || !html.includes('<h1')) throw new Error('Incomplete pre-rendered page');
    return html;
  };

  // CRITICAL: Read from dist/index.html (Vite-built with CSS/JS links), not source template
  const baseTemplate = await fs.readFile(path.join(distClient, 'index.html'), 'utf-8');

  let hasErrors = false;

  // Generate consulting template
  console.log('\n🔵 Generating consulting site...');
  const consultingMeta = generateHomepageMetaTags('consulting', 'en');
  const consultingTemplate = baseTemplate.replace('<!-- SITE_META -->', consultingMeta);

  // Pre-render consulting homepage
  const consultingAppHtml = await render('/', 'consulting');
  const consultingHtml = consultingTemplate.replace(
    '<div id="root"></div>',
    `<div id="root">${consultingAppHtml}</div>`
  );

  await fs.writeFile(
    path.join(distClient, 'index-consulting.html'),
    consultingHtml,
    'utf-8'
  );
  console.log('✓  index-consulting.html');

  // Generate registration template
  console.log('\n🟢 Generating registration site...');
  const registrationMeta = generateHomepageMetaTags('registration', 'en');
  const registrationTemplate = baseTemplate.replace('<!-- SITE_META -->', registrationMeta);

  // Pre-render registration homepage
  const registrationAppHtml = await render('/', 'registration');
  const registrationHtml = registrationTemplate.replace(
    '<div id="root"></div>',
    `<div id="root">${registrationAppHtml}</div>`
  );

  await fs.writeFile(
    path.join(distClient, 'index-registration.html'),
    registrationHtml,
    'utf-8'
  );
  console.log('✓  index-registration.html');

  // Pre-render shared routes with route-specific metadata
  console.log('\n📄 Generating shared routes...');
  for (const route of SHARED_ROUTES) {
    try {
      // Build route-specific metadata from data sources
      const meta = buildRouteMeta(route, servicesData, caseStudiesData);
      if (!meta) {
        console.error(`✗  ${route}: No metadata defined for this route`);
        process.exitCode = 1;
        hasErrors = true;
        continue;
      }

      const routeMeta = generateMetaTags(route, meta, 'en');
      const sharedTemplate = baseTemplate.replace('<!-- SITE_META -->', routeMeta);

      const appHtml = await render(route, 'consulting');
      const html = sharedTemplate.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`
      );

      const filePath = path.join(distClient, route.slice(1), 'index.html');
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, html, 'utf-8');
      console.log(`✓  ${route}`);
    } catch (err) {
      process.exitCode = 1;
      hasErrors = true;
      console.error(`✗  ${route}:`, err.message);
    }
  }

  if (hasErrors) {
    console.error('\n❌ Pre-rendering completed with errors.');
  } else {
    console.log('\n✅ Pre-rendering complete.\n');
  }

  await fs.rm(distServer, { recursive: true, force: true });
}

prerender();
