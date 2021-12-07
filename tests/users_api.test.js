
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

describe('api/post tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('username requared', async () => {
    const newUser = {
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const test = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    expect(test.body.error).toBe('User validation failed: username: username required')
  })

  test('short username', async () => {
    const newUser = {
      username: 'as',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const test = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    expect(test.body.error).toBe('User validation failed: username: Path `username` (`as`) is shorter than the minimum allowed length (3).')
  })

  test('short password', async () => {
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'sa',
    }

    const test = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
    expect(test.body.error).toBe('Password validation failed: password: Path `password` (`as`) is shorter than the minimum allowed length (3).')
  })
})

afterAll(() => {
  mongoose.connection.close()
})