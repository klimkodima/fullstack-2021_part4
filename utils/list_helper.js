const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = blogs => 1

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favouriteBlog = (blogs) => {
  const favouriteBlog = _.maxBy(blogs, 'likes')
  return({
    author: favouriteBlog.author,
    likes: favouriteBlog.likes,
    title: favouriteBlog.title
  })

}
const mostBlogs = (blogs) => {
  let result = _.map(_.countBy(blogs, 'author'), (val, key) => ({
    author: key, blogs: val
  }))

  return _.maxBy(result, 'blogs')
}

const mostLikes = (blogs) => {
  const result = _.map(_.groupBy(blogs, 'author'),
    (val, key) => ({
      author: key, likes: _.sumBy(val, 'likes')
    }))
  return _.maxBy(result, 'likes')
}

module.exports = {
  dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes
}