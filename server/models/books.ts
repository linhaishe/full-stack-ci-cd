import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
  genres: [{ type: String }],
});

bookSchema.plugin(uniqueValidator);

bookSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.author && ret.author._id) {
      ret.author.id = ret.author._id.toString();
      delete ret.author._id;
    }
  },
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
