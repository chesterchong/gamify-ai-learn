function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  req.user = {
    id: req.session.userId,
    role: req.session.role,
    professionalRole: req.session.professionalRole,
  }
  return next()
}

export default requireAuth
