import { getProjectBySlug } from '@/lib/supabase/storage-server';
import { notFound } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/utils';

export const dynamic = 'force-dynamic';

export default async function SharePage({
  params,
}: {
  params: { slug: string };
}) {
  // If Supabase not configured, show a friendly page
  if (!isSupabaseConfigured()) {
    return (
      <html lang="zh-CN">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Atoms — 分享功能</title>
        </head>
        <body style={{
          margin: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: '-apple-system, sans-serif',
        }}>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>⚡ Atoms AI</h1>
            <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 20 }}>
              分享功能需要配置 Supabase 才能使用。
            </p>
            <a href="/"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: '#3b82f6',
                color: 'white',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              返回首页
            </a>
          </div>
        </body>
      </html>
    );
  }

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
