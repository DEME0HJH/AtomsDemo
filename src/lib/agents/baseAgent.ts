import { AgentMeta, AgentContext } from './types';

const LLM_TIMEOUT = 120000; // 120 seconds timeout (increased for long code generation)
const MAX_RETRIES = 1;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export abstract class BaseAgent<TOutput> {
  protected meta: AgentMeta;

  constructor(meta: AgentMeta) {
    this.meta = meta;
  }

  get id(): string { return this.meta.id; }
  get name(): string { return this.meta.name; }
  get role(): string { return this.meta.role; }

  /**
   * Core methods to be implemented by each agent
   */
  abstract buildPrompt(ctx: AgentContext): string;
  abstract parseOutput(raw: string): TOutput;
  abstract formatContextForNext(prevCtx: AgentContext, output: TOutput): Record<string, unknown>;

  /**
   * Execute agent: call LLM → parse output → return structured result
   */
  async run(ctx: AgentContext, onChunk?: (text: string) => void): Promise<TOutput> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.meta.systemPrompt },
      { role: 'user', content: this.buildPrompt(ctx) },
    ];

    const rawResponse = await this.callLLM(messages, ctx.apiKey, onChunk);
    return this.parseOutput(rawResponse);
  }

  /**
   * Call LLM API (delegates to /api/generate)
   */
  protected async callLLM(
    messages: ChatMessage[],
    apiKey: string,
    _onChunk?: (text: string) => void
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT);

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            apiKey,
            temperature: this.meta.temperature,
            maxTokens: this.meta.maxTokens,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        const content = data.content || '';

        // Check if response was truncated
        if (data.finishReason === 'length' || data.finish_reason === 'length') {
          console.warn(`[${this.meta.id}] LLM response may be truncated (finish_reason=length)`);
        }

        return content;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('LLM call failed');
  }

  /**
   * Extract JSON from LLM response text with robust recovery strategies
   */
  protected extractJSON(text: string): Record<string, unknown> {
    // Strategy 1: Direct parse
    const directResult = tryParseJSON(text);
    if (directResult) return directResult;

    // Strategy 2: Extract from markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      const blockResult = tryParseJSON(codeBlockMatch[1].trim());
      if (blockResult) return blockResult;
    }

    // Strategy 3: Brace-counting to find exact JSON boundaries
    const braceResult = extractJSONByBraceCounting(text);
    if (braceResult) return braceResult;

    // Strategy 4: Try to repair truncated JSON
    const repairedResult = tryRepairTruncatedJSON(text);
    if (repairedResult) return repairedResult;

    // If we have a markdown code block but all JSON strategies failed,
    // try to manually extract the raw content — it might contain valid data
    // even if JSON parsing fails
    throw new Error(
      `Unable to extract JSON from LLM response (length: ${text.length}). ` +
      `Response starts with: "${text.substring(0, 200)}..."`
    );
  }
}

/**
 * Try to parse a string as JSON, returning null on failure
 */
function tryParseJSON(text: string): Record<string, unknown> | null {
  try {
    const trimmed = text.trim();
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

/**
 * Extract JSON object by counting braces from the first '{' to the matching '}'
 * This is much more reliable than greedy regex for large nested JSON
 */
function extractJSONByBraceCounting(text: string): Record<string, unknown> | null {
  const startIdx = text.indexOf('{');
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  let endIdx = -1;

  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }

  if (endIdx === -1) return null;

  const jsonStr = text.substring(startIdx, endIdx);
  return tryParseJSON(jsonStr);
}

/**
 * Try to repair common JSON issues, especially for truncated LLM responses
 */
function tryRepairTruncatedJSON(text: string): Record<string, unknown> | null {
  // Extract the JSON portion
  let jsonStr = text;

  // If inside a markdown code block, extract it
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*)/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    const startIdx = text.indexOf('{');
    if (startIdx === -1) return null;
    jsonStr = text.substring(startIdx);
  }

  // Now try to repair by:
  // 1. Counting open/close braces
  // 2. Closing unclosed strings
  // 3. Adding missing closing braces

  let repaired = jsonStr;

  // Remove trailing incomplete content (everything after the last valid structural character)
  // Find the last occurrence of }, ], or "
  const lastGoodChars = ['}', ']', '"'].map(char => repaired.lastIndexOf(char));
  const lastGood = Math.max(...lastGoodChars);

  if (lastGood > 0 && lastGood < repaired.length - 1) {
    // Check if we're in the middle of a string or structures
    repaired = repaired.substring(0, lastGood + 1);
  }

  // Balance braces
  let openBraces = 0, openBrackets = 0;
  let inString = false, escapeNext = false;

  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }

  // Close unclosed string
  if (inString) {
    // Find the start of the current string
    let lastUnescapedQuote = -1;
    let es = false;
    for (let i = repaired.length - 1; i >= 0; i--) {
      if (repaired[i] === '\\') { es = !es; continue; }
      if (repaired[i] === '"' && !es) { lastUnescapedQuote = i; break; }
      es = false;
    }
    // If the last quote starts a string but doesn't end it, close it
    if (lastUnescapedQuote >= 0) {
      const after = repaired.substring(lastUnescapedQuote);
      const quoteCount = (after.match(/"/g) || []).length;
      if (quoteCount % 2 === 1) {
        repaired += '"';
      }
    }
  }

  // Close unbalanced brackets and braces
  for (let i = 0; i < openBrackets; i++) repaired += ']';
  for (let i = 0; i < openBraces; i++) repaired += '}';

  return tryParseJSON(repaired);
}
