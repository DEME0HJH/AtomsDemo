/**
 * Vercel REST API deployment integration
 * Docs: https://vercel.com/docs/rest-api
 */

const VERCEL_API = 'https://api.vercel.com';

export interface DeployResult {
  url: string;
  ready: boolean;
  deploymentId?: string;
}

/**
 * Deploy an HTML file to Vercel via the REST API
 * Requires a Vercel access token with deployment scope
 */
export async function deployToVercel(
  htmlContent: string,
  projectName: string,
  token: string
): Promise<DeployResult> {
  if (!token || token.length < 10) {
    throw new Error('Invalid Vercel access token. Get one at https://vercel.com/account/tokens');
  }

  // Step 1: Create deployment
  const fileData = Buffer.from(htmlContent, 'utf-8').toString('base64');

  const response = await fetch(`${VERCEL_API}/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName.replace(/\s+/g, '-').toLowerCase(),
      files: [
        {
          file: 'index.html',
          data: fileData,
        },
      ],
      projectSettings: {
        framework: null,
      },
      target: 'production',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `Vercel API error (${response.status})`;
    try {
      const errJson = JSON.parse(errorText);
      errorMsg = errJson.error?.message || errorMsg;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  const data = await response.json();

  return {
    url: `https://${data.url}`,
    ready: data.ready || false,
    deploymentId: data.id,
  };
}

/**
 * Check deployment status
 */
export async function checkDeploymentStatus(
  deploymentId: string,
  token: string
): Promise<DeployResult> {
  const response = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to check deployment status (${response.status})`);
  }

  const data = await response.json();

  return {
    url: `https://${data.url}`,
    ready: data.readyState === 'READY',
    deploymentId: data.id,
  };
}
