import dotenv from 'dotenv'
import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcrypt'
import User from '@models/Users'
import Note from '@models/Note'

dotenv.config()

interface INote extends Document {
  title: string
  description?: string
  imageUrl?: string
  user: mongoose.Schema.Types.ObjectId
}

interface IUser extends Document {
  name: string
  email: string
  password: string
}

async function main(): Promise<void> {
  const MONGO_URI: string | undefined = process.env.MONGO_URI

  if (!MONGO_URI) {
    console.error(
      'Error: MONGO_URI no está definido en las variables de entorno'
    )
    process.exit(1)
  }

  await mongoose.connect(MONGO_URI)
  console.log('Conectado a MongoDB para seed')

  const db = mongoose.connection.db

  if (!db) {
    console.error('Error: No se pudo acceder a la base de datos')
    process.exit(1)
  }

  const collections = await db.listCollections().toArray()
  const names = collections.map(c => c.name)

  if (!names.includes('users')) {
    await db.createCollection('users')
    console.log('Colección "users" creada')
  }

  if (!names.includes('notes')) {
    await db.createCollection('notes')
    console.log('Colección "notes" creada')
  }

  await User.init()
  await Note.init()
  console.log('Índices creados')

  const hashed = await bcrypt.hash('password123', 10)

  const user: IUser = await User.create({
    name: 'Rodrigo Tecuatl',
    email: 'rodrigo@example.com',
    password: hashed
  })

  const note: INote = await Note.create({
    title: 'Nota de ejemplo',
    content: 'Esta es una nota creada en seed script',
    photo: null,
    user: user._id,
    synced: true
  })

  console.log('Seed completado:', {
    userId: user._id,
    noteId: note._id
  })

  await mongoose.disconnect()
  console.log('Desconectado de MongoDB')
}

main().catch((err: unknown) => {
  console.error('Error al ejecutar seed:', err)
  process.exit(1)
})
