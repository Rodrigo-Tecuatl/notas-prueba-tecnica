import Note from '@models/Note'
import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express'

interface AuthRequest extends Request {
  userId?: string
  file?: Express.Multer.File
}

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body

    if (!title)
      return res.status(400).json({ message: 'El título es obligatorio' })

    let imageUrl = null
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
    }

    const note = await Note.create({
      title,
      description,
      imageUrl,
      user: req.userId
    })
    res.status(201).json(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error creando nota' })
  }
}

export const listNotes = async (req: AuthRequest, res: Response) => {
  try {
    // listar solo las notas del usuario autenticado
    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 })
    res.json(notes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error listando notas' })
  }
}

export const getNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const note = await Note.findOne({ _id: id, user: req.userId })
    if (!note) return res.status(404).json({ message: 'Nota no encontrada' })
    res.json(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error obteniendo nota' })
  }
}

export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { title, description } = req.body

    const note = await Note.findOne({ _id: id, user: req.userId })
    if (!note) return res.status(404).json({ message: 'Nota no encontrada' })

    // manejar reemplazo de imagen
    if (req.file) {
      // borrar imagen anterior si existe
      if (note.imageUrl) {
        const prevPath = path.join(__dirname, '../../', note.imageUrl)
        if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath)
      }
      note.imageUrl = `/uploads/${req.file.filename}`
    }

    if (title !== undefined) note.title = title
    if (description !== undefined) note.description = description

    await note.save()
    res.json(note)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error actualizando nota' })
  }
}
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const note = await Note.findOne({ _id: id, user: req.userId })
    if (!note) return res.status(404).json({ message: 'Nota no encontrada' })
    if (note.imageUrl) {
      const imgPath = path.join(__dirname, '../..', note.imageUrl)
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
    }
    await note.deleteOne()
    res.json({ message: 'Nota eliminada' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error eliminando nota' })
  }
}
