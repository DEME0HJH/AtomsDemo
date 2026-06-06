import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, templateType, apiKey } = body;

    if (!prompt) {
      return NextResponse.json({ error: '缺少 prompt 参数' }, { status: 400 });
    }

    // 优先使用前端传来的 apiKey，否则回退到服务端环境变量
    const key = apiKey || process.env.DEEPSEEK_API_KEY || '';
    if (!key) {
      return NextResponse.json(
        { error: '未配置 API Key。请在应用界面中点击 🔑 按钮配置，或在 .env.local 中设置 DEEPSEEK_API_KEY。' },
        { status: 401 }
      );
    }

    const baseUrl = process.env.DEEPSEEK_BASE_URL || DEFAULT_DEEPSEEK_BASE_URL;

    const systemPrompt = `你是一个专业的前端开发工程师。请根据用户需求生成一个完整的单页面应用。

要求：
1. 生成包含 HTML、CSS、JavaScript 的完整应用
2. 所有代码写在一个 HTML 文件中，内联 CSS（<style>标签中）和 JS（<script>标签中）
3. 界面要美观现代，使用合适的配色和布局
4. 应用要有完整的交互功能
5. 使用 localStorage 保存用户数据（如果需要）
6. 响应式设计，适配不同屏幕

请严格按照以下 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "name": "应用名称（简短中文）",
  "description": "应用描述",
  "html": "HTML 结构代码",
  "css": "CSS 样式代码",
  "js": "JavaScript 交互代码"
}

用户需求描述：${prompt}`;

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', response.status, errorText);
      return NextResponse.json(
        { error: `API 调用失败 (${response.status})：请检查 API Key 是否正确` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 尝试从返回内容中提取 JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1].trim());
        } catch {
          return NextResponse.json(
            { error: 'AI 返回格式不正确，请重试', rawContent: content.substring(0, 500) },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'AI 返回格式不正确，请重试', rawContent: content.substring(0, 500) },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      name: parsed.name || '生成应用',
      description: parsed.description || prompt,
      html: parsed.html || '',
      css: parsed.css || '',
      js: parsed.js || '',
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: '服务器内部错误，请重试' },
      { status: 500 }
    );
  }
}
