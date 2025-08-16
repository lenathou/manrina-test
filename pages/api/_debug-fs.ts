import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'node:fs';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const canWriteTmp = (() => {
    try {
      fs.writeFileSync('/tmp/.probe', 'ok');
      return true;
    } catch {
      return false;
    }
  })();

  const canWriteCwd = (() => {
    try {
      fs.writeFileSync('.probe', 'ok');
      return true;
    } catch {
      return false;
    }
  })();

  const diagnostics = {
    vercel: !!process.env.VERCEL,
    canWriteTmp,
    canWriteCwd,
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    platform: process.platform,
    tmpDir: process.env.TMPDIR || '/tmp'
  };

  res.status(200).json(diagnostics);
}