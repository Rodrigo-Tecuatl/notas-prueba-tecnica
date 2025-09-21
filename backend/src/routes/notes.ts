import express from 'express'
import { authMiddleware as auth } from '@middlewares/auth'
import { upload } from '@middlewares/upload'
import {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote
} from '@controllers/noteController'

export const router = express.Router()

router.post('/', auth, upload.single('image'), createNote)
router.get('/', auth, listNotes)
router.get('/:id', auth, getNote)
router.put('/:id', auth, upload.single('image'), updateNote)
router.delete('/:id', auth, deleteNote)
