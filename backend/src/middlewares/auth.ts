import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
dotenv.config()

interface AuthRequest extends Request {
  userId?: string
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any {
  const authHeader = req.headers.authorization ?? req.headers.Authorization
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })

  if (typeof authHeader !== 'string') {
    return res.status(401).json({ message: 'Invalid token format' })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer')
    return res.status(401).json({ message: 'Formato de token inválido' })

  const token = parts[1]

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido' })
    req.userId = (decoded as JwtPayload).id
    next()
  })
}
