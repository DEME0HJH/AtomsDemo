import { getProjectBySlug } from '@/lib/supabase/storage-server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SharePage({
  params,
}: {
  params: { slug: string };
}) {
  let app;
  try {
    app = await getProjectBySlug(params.slug);
  } catch {
    app = null;
  }

  if (!app) {
    notFound();
  }

  const css = app.code.css || '';
  const html = app.code.html || '';
  const js = app.code.js || '';

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{app.name}</title>
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {js && <script dangerouslySetInnerHTML={{ __html: js }} />}
        <div style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          padding: '8px 14px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'sans-serif',
          zIndex: 9999,
        }}>
          ⚡ Powered by <a href="/" style={{ color: '#60a5fa' }}>Atoms AI</a>
        </div>
      </body>
    </html>
  );
}
