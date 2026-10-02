/**
 * Unit tests for metadata processing functions.
 * Tests the actual functions from metadata.mjs module.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  getCanonicalUrl,
  buildRouteMeta,
  generateMetaTags,
  generateHomepageMetaTags,
  COMPANY_NAME,
  SITES,
} from './metadata.mjs';

// Mock data for testing
const mockServicesData = [
  {
    slug: 'incorporation',
    title: { en: 'Company Incorporation', ru: 'Регистрация компании' },
    subtitle: { en: 'Register your business in Qatar', ru: 'Зарегистрируйте бизнес в Катаре' }
  },
  {
    slug: 'b2b-lead-generation',
    title: { en: 'B2B Lead Generation', ru: 'B2B генерация лидов' },
    subtitle: { en: 'Fill your pipeline with qualified meetings', ru: 'Наполните воронку встречами' }
  }
];

const mockCaseStudiesData = [
  {
    slug: 'caring-hands',
    company: { en: 'Caring Hands', ru: 'Caring Hands' },
    subtitle: { en: 'Premium Home Nursing Operator in Qatar', ru: 'Премиальный оператор домашнего ухода' }
  },
  {
    slug: 'sidr-technology',
    company: { en: 'Sidr Technology', ru: 'Sidr Technology' },
    subtitle: { en: 'UK Software Consultancy Entering Qatar', ru: 'Британская компания выходит на рынок Катара' }
  }
];

describe('escapeHtml', () => {
  test('escapes ampersand', () => {
    assert.equal(escapeHtml('Tom & Jerry'), 'Tom &amp; Jerry');
  });

  test('escapes less than', () => {
    assert.equal(escapeHtml('a < b'), 'a &lt; b');
  });

  test('escapes greater than', () => {
    assert.equal(escapeHtml('a > b'), 'a &gt; b');
  });

  test('escapes double quotes', () => {
    assert.equal(escapeHtml('say "hello"'), 'say &quot;hello&quot;');
  });

  test('escapes single quotes', () => {
    assert.equal(escapeHtml("it's fine"), 'it&#39;s fine');
  });

  test('escapes multiple special characters', () => {
    assert.equal(
      escapeHtml('<script>alert("XSS & more")</script>'),
      '&lt;script&gt;alert(&quot;XSS &amp; more&quot;)&lt;/script&gt;'
    );
  });
});

describe('getCanonicalUrl', () => {
  test('root path gets trailing slash', () => {
    assert.equal(getCanonicalUrl('/'), 'https://consulting.go2market.qa/');
  });

  test('non-root path has no trailing slash', () => {
    assert.equal(getCanonicalUrl('/privacy'), 'https://consulting.go2market.qa/privacy');
  });

  test('nested path has no trailing slash', () => {
    assert.equal(
      getCanonicalUrl('/services/incorporation'),
      'https://consulting.go2market.qa/services/incorporation'
    );
  });
});

describe('buildRouteMeta', () => {
  test('returns static route metadata for /case-studies', () => {
    const meta = buildRouteMeta('/case-studies', mockServicesData, mockCaseStudiesData);
    assert.ok(meta);
    assert.equal(meta.title.en, 'Case Studies');
    assert.ok(meta.description.en.length > 0);
  });

  test('returns static route metadata for /privacy', () => {
    const meta = buildRouteMeta('/privacy', mockServicesData, mockCaseStudiesData);
    assert.ok(meta);
    assert.equal(meta.title.en, 'Privacy Policy');
  });

  test('returns static route metadata for /terms', () => {
    const meta = buildRouteMeta('/terms', mockServicesData, mockCaseStudiesData);
    assert.ok(meta);
    assert.equal(meta.title.en, 'Terms of Service');
  });

  test('returns service metadata from servicesData', () => {
    const meta = buildRouteMeta('/services/incorporation', mockServicesData, mockCaseStudiesData);
    assert.ok(meta);
    assert.equal(meta.title.en, 'Company Incorporation');
    assert.equal(meta.description.en, 'Register your business in Qatar');
  });

  test('returns case study metadata from caseStudiesData', () => {
    const meta = buildRouteMeta('/case-studies/caring-hands', mockServicesData, mockCaseStudiesData);
    assert.ok(meta);
    assert.equal(meta.title.en, 'Caring Hands Case Study');
    assert.ok(meta.description.en.includes('Caring Hands'));
  });

  test('returns null for unknown route', () => {
    const meta = buildRouteMeta('/unknown-page', mockServicesData, mockCaseStudiesData);
    assert.equal(meta, null);
  });

  test('returns null for unknown service', () => {
    const meta = buildRouteMeta('/services/unknown-service', mockServicesData, mockCaseStudiesData);
    assert.equal(meta, null);
  });

  test('returns null for unknown case study', () => {
    const meta = buildRouteMeta('/case-studies/unknown-case', mockServicesData, mockCaseStudiesData);
    assert.equal(meta, null);
  });
});

describe('generateMetaTags', () => {
  test('generates complete meta tags HTML', () => {
    const meta = {
      title: { en: 'Test Page', ru: 'Тестовая страница' },
      description: { en: 'Test description', ru: 'Тестовое описание' }
    };
    const html = generateMetaTags('/test', meta, 'en');

    assert.ok(html.includes('<title>Test Page | G2M International</title>'));
    assert.ok(html.includes('content="Test description"'));
    assert.ok(html.includes('href="https://consulting.go2market.qa/test"'));
    assert.ok(html.includes('property="og:url"'));
    assert.ok(html.includes('property="og:title"'));
    assert.ok(html.includes('name="twitter:title"'));
  });

  test('escapes special characters in title', () => {
    const meta = {
      title: { en: 'Tom & Jerry\'s "Adventure"', ru: 'Приключения' },
      description: { en: 'Normal description', ru: 'Описание' }
    };
    const html = generateMetaTags('/test', meta, 'en');

    assert.ok(html.includes('Tom &amp; Jerry&#39;s &quot;Adventure&quot;'));
  });

  test('throws for null meta', () => {
    assert.throws(
      () => generateMetaTags('/test', null, 'en'),
      /No metadata defined for route/
    );
  });

  test('title without company name gets suffix added', () => {
    const meta = {
      title: { en: 'Just a Page', ru: 'Страница' },
      description: { en: 'Description', ru: 'Описание' }
    };
    const html = generateMetaTags('/test', meta, 'en');

    assert.ok(html.includes('<title>Just a Page | G2M International</title>'));
  });

  test('title with company name is not double-suffixed', () => {
    const meta = {
      title: { en: 'Page | G2M International', ru: 'Страница' },
      description: { en: 'Description', ru: 'Описание' }
    };
    const html = generateMetaTags('/test', meta, 'en');

    assert.ok(html.includes('<title>Page | G2M International</title>'));
    assert.ok(!html.includes('G2M International | G2M International'));
  });
});

describe('generateHomepageMetaTags', () => {
  test('generates consulting homepage meta tags', () => {
    const html = generateHomepageMetaTags('consulting', 'en');

    assert.ok(html.includes('<title>Business Consulting in Qatar'));
    assert.ok(html.includes('href="https://consulting.go2market.qa/"'));
    assert.ok(html.includes('consulting.go2market.qa/images/hero'));
  });

  test('generates registration homepage meta tags', () => {
    const html = generateHomepageMetaTags('registration', 'en');

    assert.ok(html.includes('<title>Company Registration in Qatar'));
    assert.ok(html.includes('href="https://registration.go2market.qa/"'));
    assert.ok(html.includes('registration.go2market.qa/images/hero'));
  });

  test('throws for unknown site', () => {
    assert.throws(
      () => generateHomepageMetaTags('unknown', 'en'),
      /Unknown site/
    );
  });
});

describe('module exports verification', () => {
  test('COMPANY_NAME is exported correctly', () => {
    assert.equal(COMPANY_NAME, 'G2M International');
  });

  test('SITES has consulting and registration configs', () => {
    assert.ok(SITES.consulting);
    assert.ok(SITES.registration);
    assert.ok(SITES.consulting.domain.includes('consulting'));
    assert.ok(SITES.registration.domain.includes('registration'));
  });
});
