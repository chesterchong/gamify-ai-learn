import prisma from '../db/prisma.js'

/**
 * Must run after requireAuth. Allows users with role or professionalRole "admin".
 */
async function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, professionalRole: true },
    })

    const isAdmin =
      user?.role?.toLowerCase() === 'admin' ||
      user?.professionalRole?.toLowerCase() === 'admin'

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    return next()
  } catch (err) {
    return next(err)
  }
}

export default requireAdmin
