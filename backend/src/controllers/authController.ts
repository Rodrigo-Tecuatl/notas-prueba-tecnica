import { Request, Response } from 'express'
import { Document } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '@models/Users'

interface IUser extends Document {
  name: string
  email: string
  password: string
}

interface AuthRequestBody {
  name?: string
  email?: string
  password?: string
}

export const register = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response
) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Usuario ya registrado' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user: IUser = await User.create({ name, email, password: hashed })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d'
    })

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error en registro' })
  }
}

export const login = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response
) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d'
    })

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error en login' })
  }
}
