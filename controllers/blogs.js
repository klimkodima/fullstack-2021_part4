
const middleware = require('../utils/middleware')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')



blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).send('Blog not found')
  }
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  blog.comments =  blog.comments.concat(request.body.comment)
  const updatedBlod = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlod.toJSON())
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user =  await User.findById(request.user)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  savedBlog.populate('user', { username: 1, name: 1, })
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() !== request.user.toString() ) {
    response.status(401).send({ error:'only the creator can delete blogs' })
    return
  }
  const user =  await User.findById(blog.user)
  user.blogs = user.blogs.filter(b => b.toString() !== request.params.id.toString())
  await blog.remove()
  await user.save()

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body
  const updatedBlod = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlod.toJSON())
})


module.exports = blogsRouter