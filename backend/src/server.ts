import express, { Request, Response, json } from 'express'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { router as authRouter } from '@routes/auth'
import { router as notesRouter } from '@routes/notes'
import os from 'os'

dotenv.config()

const PORT: number = Number(process.env.PORT) ?? 3000

const app = express()
app.use(json())
app.use('/uploads', express.static(path.join('uploads')))
app.disable('x-powered-by')

app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = ['http://localhost:3000', 'https://myapp.com']

      if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      return callback(
        new Error('CORS policy violation: Origin not allowed'),
        false
      )
    }
  })
)

const uploadsDir = path.join('uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bienvenidos a mi APIres de notas' })
})

app.use('/api/auth', authRouter)
app.use('/api/notes', notesRouter)

function getLocalIPs() {
  const nets = os.networkInterfaces()
  const results: string[] = []

  for (const name of Object.keys(nets)) {
    const netsInterface = nets[name]
    if (!netsInterface) continue

    for (const net of netsInterface) {
      // sólo IPv4
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address)
      }
    }
  }
  return results
}

// const MONGO_URI: string | undefined = process.env.MONGO_URI

// if (!MONGO_URI) {
//   console.error('Error: MONGO_URI no está definido en las variables de entorno')
//   process.exit(1)
// }

// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log('Conectado a MongoDB')
//     app.listen(PORT, () =>
//       console.log(`Servidor corriendo en http://localhost:${PORT}`)
//     )
//   })
//   .catch(err => {
//     console.error('Error conectando a MongoDB:', err)
//     process.exit(1)
//   })

async function start() {
  const MONGO_URI: string | undefined = process.env.MONGO_URI
  const HOST = '0.0.0.0'

  if (!MONGO_URI) {
    console.error(
      'Error: MONGO_URI no está definido en las variables de entorno'
    )
    process.exit(1)
  }
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Conectado a MongoDB')

    const server = app.listen(PORT, HOST, () => {
      const ips = getLocalIPs()
      console.log(`Servidor escuchando en http://${HOST}:${PORT} (bind)`)
      if (ips.length) {
        ips.forEach(ip =>
          console.log(`Accesible desde LAN en: http://${ip}:${PORT}`)
        )
      } else {
        console.log('No se detectaron IPs locales (¿estás en una red?)')
      }
      console.log('Ruta ping -> GET /ping')
    })

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(
          `Puerto ${PORT} en uso (EADDRINUSE). ¿Otro proceso está corriendo?`
        )
      } else {
        console.error('Error en server:', err)
      }
      process.exit(1)
    })
  } catch (err) {
    console.error('Error arrancando app:', err)
    process.exit(1)
  }
}

start()
