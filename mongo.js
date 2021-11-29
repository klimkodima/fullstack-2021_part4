const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstackopenkd:${password}@cluster0.0kl8e.mongodb.net/blog?retryWrites=true&w=majority`

const options = { keepAlive: 1, useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(url, options)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
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

const blog = new Blog({
  'title': 'Mary Poppendieck blog',
  'author': 'Mary Poppendieck',
  'url': '/mary_poppendieck',
  'likes': 2
})

blog.save().then(() => {
  console.log('blog saved!')
  mongoose.connection.close()
})


Blog.find({}).then(result => {
  result.forEach(blog => {
    console.log(blog)
  })
  mongoose.connection.close()
})
