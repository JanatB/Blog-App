
// The Blog Router - endpoint '/api/blog'

const blogRouter = require('express').Router()
const blogModel = require('../models/blog')
const userModel = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

blogRouter.get('/', async (req, res) => {
  const allBlogs = await blogModel.find({}).populate('user', {username: 1, name: 1})
  res.json(allBlogs)

})

blogRouter.get('/:id', async (req, res) => {
  const ID = req.params.id;
  const blogFound = await blogModel.findById(ID)
  res.status(200).json(blogFound)
})

// Verify the token and then proceed
blogRouter.post('/', async (req, res) => {
  const body = req.body;

  // Verifying Token
  let token = '';
  const authorization = req.get('authorization')

  if (authorization == undefined){
    return res.status(400).json({ error: 'Invalid token.' })
  }

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7) // excludes the 'bearer' part with the substring
  }
  const decodedToken = jwt.verify(token, config.SECRET)
  
  // Getting user
  const user = await userModel.findById(decodedToken.id)

  // Creating New Blog
  const newBlog = new blogModel({
    title: body.title,
    description: body.description,
    author: body.author,
    content: body.content,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await newBlog.save()

  // Updating the user's 'blogs' array
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  res.status(200).json(savedBlog)

})

module.exports = blogRouter;
