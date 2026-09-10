import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from '../App';
import { SiteType } from './config/site';

export function render(url: string, siteType: SiteType = 'consulting'): string {
  return renderToString(
    <StaticRouter location={url}>
      <App siteType={siteType} />
    </StaticRouter>
  );
}
