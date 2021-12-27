const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url:1, title: 1, author: 1, id:1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { password, name, username } = request.body
  if ( !password || password.length < 3) {
    return response.status(400).send({ error: 'Password validation failed: password: Path `password` (`as`) is shorter than the minimum allowed length (3).' })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username: username,
    name: name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.json(savedUser)
})

module.exports = usersRouter