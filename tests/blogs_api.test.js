const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let token = null

beforeAll( async() => {
  await User.deleteMany({})
  const newUser = {
    username: 'mluukkai',
    name: 'Matti Luukkainen',
    password: 'salainen',
  }

  await api.post('/api/users').send(newUser)
  const response = await api.post('/api/login')
    .send({ 'username': newUser.username, 'password': newUser.password })
  token = response.body.token
})

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    await api.post('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .send(blog)
  }
})

describe('api/get tests', () => {
  test(' all blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  }, 10000)

  test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
    expect(response.body[0].id).toBeDefined()
  })
})

describe('api/post tests', () => {
  test('request to the /api/blogs url successfully creates a new blog post', async () => {
    const newBlog = {
      title: 'Mary Poppendieck blog 2',
      author: 'Mary Poppendieck5',
      url: '/mary_poppendieck/5',
      likes: 2
    }

    await api.post('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsAfter = await Blog.find({})
    expect(blogsAfter.length).toBe(helper.initialBlogs.length + 1)
  })

  test('the default value likes property is 0', async () => {
    const newBlog = {
      title: 'Mary Poppendieck blog 2',
      author: 'Mary Poppendieck5',
      url: '/mary_poppendieck/5'
    }

    await api.post('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await Blog.find({})
    expect(blogsAfter[blogsAfter.length - 1].likes).toBe(0)
  })

  test('status is 400 when missing the title and url properties from the request data ', async () => {
    const notTitleBlog = {
      author: 'Mary Poppendieck5',
      url: '/mary_poppendieck/5'
    }

    const notUrlBlog = {
      title: 'Mary Poppendieck blog 2',
      author: 'Mary Poppendieck5'
    }

    await api.post('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .send(notTitleBlog)
      .expect(400)

    await api.post('/api/blogs')
      .set('Authorization', 'Bearer ' + token)
      .send(notUrlBlog)
      .expect(400)
  })

  test('status is 401 when user is unauthorized ', async () => {
    const newBlog = {
      title: 'Mary Poppendieck blog 2',
      author: 'Mary Poppendieck5',
      url: '/mary_poppendieck/5',
      likes: 2
    }

    await api.post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('api/put tests', () => {
  test('succeeds  if url  is updated', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]
    blogToUpdate.url = 'https://react.com/'

    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', 'Bearer ' + token)
      .send(blogToUpdate.toJSON())

    const blogsAtEnd = await Blog.find({})

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtEnd[0].url).toBe(blogToUpdate.url)
  })
})

describe('api/delete tests', () => {
  test('succeeds with status code 204 if blog deleted', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]
    await api.delete(`/api/blogs/${ blogToDelete.id }`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204)

    const blogsAtEnd = await Blog.find({})

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})