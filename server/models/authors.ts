import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
    default: 0,
  },
  bookCount: {
    type: Number,
    default: 0,
  },
});

schema.plugin(uniqueValidator);

schema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const Author = mongoose.model('Author', schema);

export default Author;
