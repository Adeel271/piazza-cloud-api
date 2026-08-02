const router = require('express').Router();
const { body, param } = require('express-validator');

const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const postController = require('../controllers/postController');

const allowedTopics = ['Politics', 'Health', 'Sport', 'Tech'];

// Every endpoint below this line requires a valid JWT.
router.use(authenticate);

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 3, max: 120 }),
    body('message').trim().isLength({ min: 3, max: 2000 }),
    body('topics').isArray({ min: 1 }),
    body('topics.*').isIn(allowedTopics),
    body('expiresAt').isISO8601()
  ],
  validate,
  postController.createPost
);

router.get('/', postController.listPosts);

// Put specific topic routes before /:postId so Express matches them correctly.
router.get(
  '/topic/:topic/expired',
  [param('topic').isIn(allowedTopics)],
  validate,
  postController.expiredByTopic
);
router.get(
  '/topic/:topic/most-active',
  [param('topic').isIn(allowedTopics)],
  validate,
  postController.mostActive
);
router.get(
  '/topic/:topic',
  [param('topic').isIn(allowedTopics)],
  validate,
  postController.byTopic
);

router.get('/:postId', postController.getPost);
router.post('/:postId/like', postController.like);
router.post('/:postId/dislike', postController.dislike);
router.post(
  '/:postId/comments',
  [body('text').trim().isLength({ min: 1, max: 500 })],
  validate,
  postController.comment
);

module.exports = router;
