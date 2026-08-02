/*
  Business rules for Piazza posts.
  The small helper functions near the top keep repeated checks in one place.
  Controllers return HTTP status codes that make test results easy to understand.
*/
const mongoose = require('mongoose');
const Post = require('../models/Post');

function validId(id) { return mongoose.Types.ObjectId.isValid(id); }
function expired(post) { return new Date() >= post.expiresAt; }
function formatPost(post) {
  const data = post.toObject({ virtuals: true });
  data.timeLeftSeconds = Math.max(0, Math.floor((new Date(data.expiresAt) - new Date()) / 1000));
  return data;
}
async function getPostOr404(id, res) {
  if (!validId(id)) { res.status(400).json({ error: 'Invalid post identifier.' }); return null; }
  const post = await Post.findById(id);
  if (!post) { res.status(404).json({ error: 'Post not found.' }); return null; }
  return post;
}

async function createPost(req, res, next) {
  try {
    const expiresAt = new Date(req.body.expiresAt);
    if (expiresAt <= new Date()) return res.status(400).json({ error: 'expiresAt must be in the future.' });
    const post = await Post.create({ ...req.body, topics: [...new Set(req.body.topics)], owner: req.user.id, ownerName: req.user.name, expiresAt });
    res.status(201).json({ post: formatPost(post) });
  } catch (error) { next(error); }
}
async function listPosts(req, res, next) {
  try { const posts = await Post.find().sort({ createdAt: -1 }); res.json({ count: posts.length, posts: posts.map(formatPost) }); } catch (e) { next(e); }
}
async function getPost(req, res, next) {
  try { const post = await getPostOr404(req.params.postId, res); if (post) res.json({ post: formatPost(post) }); } catch (e) { next(e); }
}
async function byTopic(req, res, next) {
  try { const posts = await Post.find({ topics: req.params.topic }).sort({ createdAt: -1 }); res.json({ count: posts.length, posts: posts.map(formatPost) }); } catch (e) { next(e); }
}
async function expiredByTopic(req, res, next) {
  try { const posts = await Post.find({ topics: req.params.topic, expiresAt: { $lte: new Date() } }).sort({ expiresAt: -1 }); res.json({ count: posts.length, posts: posts.map(formatPost) }); } catch (e) { next(e); }
}
async function mostActive(req, res, next) {
  try {
    const posts = await Post.find({ topics: req.params.topic, expiresAt: { $gt: new Date() } });
    if (!posts.length) return res.status(404).json({ error: 'No live posts found for this topic.' });
    posts.sort((a, b) => (b.likes.length + b.dislikes.length) - (a.likes.length + a.dislikes.length));
    res.json({ post: formatPost(posts[0]) });
  } catch (e) { next(e); }
}
async function interact(req, res, next, type) {
  try {
    const post = await getPostOr404(req.params.postId, res); if (!post) return;
    if (expired(post)) return res.status(409).json({ error: 'This post has expired and no longer accepts interactions.' });
    if (String(post.owner) === String(req.user.id)) return res.status(403).json({ error: 'Post owners cannot like or dislike their own posts.' });
    const ownList = type === 'like' ? post.likes : post.dislikes;
    const otherList = type === 'like' ? post.dislikes : post.likes;
    if (ownList.some(x => String(x.user) === String(req.user.id))) return res.status(409).json({ error: `You already ${type}d this post.` });
    const otherIndex = otherList.findIndex(x => String(x.user) === String(req.user.id));
    if (otherIndex >= 0) otherList.splice(otherIndex, 1);
    ownList.push({ user: req.user.id, userName: req.user.name });
    await post.save();
    res.json({ message: `Post ${type} recorded.`, post: formatPost(post) });
  } catch (e) { next(e); }
}
const like = (req, res, next) => interact(req, res, next, 'like');
const dislike = (req, res, next) => interact(req, res, next, 'dislike');
async function comment(req, res, next) {
  try {
    const post = await getPostOr404(req.params.postId, res); if (!post) return;
    if (expired(post)) return res.status(409).json({ error: 'This post has expired and no longer accepts interactions.' });
    post.comments.push({ user: req.user.id, userName: req.user.name, text: req.body.text });
    await post.save();
    res.status(201).json({ message: 'Comment added.', post: formatPost(post) });
  } catch (e) { next(e); }
}
module.exports = { createPost, listPosts, getPost, byTopic, expiredByTopic, mostActive, like, dislike, comment };
