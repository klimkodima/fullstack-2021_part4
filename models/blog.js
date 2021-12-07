const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: { type: String, minlength: 10, required: [true, 'Title required'] },
  author: { type: String, minlength: 3, required: [true, 'Author required'] },
  url: { type: String, minlength: 3, required: [true, 'URL required'], unique: true },
  likes:{
    type: Number,
    validate: {
      validator: function (v) {
        return /^\d{0,10}$/.test(v)
      },
      message: props => `${props.value} is not a valid like. It  is requaired from 0 to 10 numbers !`
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  versionKey: false,
  useCreateIndex: true
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog