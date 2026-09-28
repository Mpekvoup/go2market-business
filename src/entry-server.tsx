import React from 'react';
import { renderHtml } from './render-html';
import { StaticRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { App } from '../App';
import { SiteType } from './config/site';

export function render(url: string, siteType: SiteType = 'consulting'): Promise<string> {
  return renderHtml(
    <ThemeProvider>
      <StaticRouter location={url}>
        <App siteType={siteType} />
      </StaticRouter>
    </ThemeProvider>
  );
}
