import mongoose, { Document, Schema } from 'mongoose'

interface INote extends Document {
  title: string
  description?: string
  imageUrl?: string
  user: mongoose.Schema.Types.ObjectId
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

export default mongoose.model<INote>('Note', noteSchema)
