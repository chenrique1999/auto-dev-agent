export function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token || token !== `Bearer ${process.env.AGENT_TOKEN}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

