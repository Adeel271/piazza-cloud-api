/*
  Piazza coursework demonstration runner.
  Start the API first, then run: npm run test:coursework
  Node.js 18+ is required because this script uses the built-in fetch API.
*/
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const runId = Date.now();
const password = 'Coursework123!';
const tokens = {};
const postIds = {};
let passed = 0;
let failed = 0;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(method, path, token, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function test(number, description, action) {
  try {
    await action();
    passed += 1;
    console.log(`PASS TC${number}: ${description}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL TC${number}: ${description}`);
    console.error(`  ${error.message}`);
  }
}

function userEmail(name) {
  return `${name.toLowerCase()}.${runId}@piazza.test`;
}

async function registerAndLogin(name) {
  const registration = await request('POST', '/api/auth/register', null, {
    name,
    email: userEmail(name),
    password
  });
  assert(registration.status === 201, `Expected registration 201, received ${registration.status}`);

  const login = await request('POST', '/api/auth/login', null, {
    email: userEmail(name),
    password
  });
  assert(login.status === 200, `Expected login 200, received ${login.status}`);
  assert(login.data.token, 'Login response did not contain a token');
  tokens[name] = login.data.token;
}

async function createPost(owner, title, topic, message, expiryMilliseconds) {
  const result = await request('POST', '/api/posts', tokens[owner], {
    title,
    topics: [topic],
    message,
    expiresAt: new Date(Date.now() + expiryMilliseconds).toISOString()
  });
  assert(result.status === 201, `Expected post creation 201, received ${result.status}`);
  assert(result.data.post?._id, 'Created post did not contain an identifier');
  return result.data.post._id;
}

async function main() {
  console.log(`\nPiazza coursework test run: ${BASE_URL}\n`);

  await test(1, 'Olga, Nick, Mary and Nestor register', async () => {
    for (const name of ['Olga', 'Nick', 'Mary', 'Nestor']) {
      const response = await request('POST', '/api/auth/register', null, {
        name,
        email: userEmail(name),
        password
      });
      assert(response.status === 201, `${name} registration returned ${response.status}`);
    }
  });

  await test(2, 'All four users log in and receive JWT tokens', async () => {
    for (const name of ['Olga', 'Nick', 'Mary', 'Nestor']) {
      const response = await request('POST', '/api/auth/login', null, {
        email: userEmail(name),
        password
      });
      assert(response.status === 200, `${name} login returned ${response.status}`);
      assert(response.data.token, `${name} did not receive a token`);
      tokens[name] = response.data.token;
    }
  });

  await test(3, 'Olga is rejected when browsing without a token', async () => {
    const response = await request('GET', '/api/posts/topic/Tech');
    assert(response.status === 401, `Expected 401, received ${response.status}`);
  });

  await test(4, 'Olga posts a Tech message', async () => {
    postIds.Olga = await createPost('Olga', 'Cloud deployment choices', 'Tech', 'Olga discusses suitable cloud deployment approaches.', 5 * 60 * 1000);
  });

  await test(5, 'Nick posts a Tech message', async () => {
    postIds.Nick = await createPost('Nick', 'Container design', 'Tech', 'Nick shares an opinion about containerised services.', 5 * 60 * 1000);
  });

  await test(6, 'Mary posts a Tech message', async () => {
    postIds.Mary = await createPost('Mary', 'Responsible artificial intelligence', 'Tech', 'Mary starts a discussion about responsible AI services.', 5 * 60 * 1000);
  });

  await test(7, 'Nick and Olga browse three untouched Tech posts', async () => {
    for (const name of ['Nick', 'Olga']) {
      const response = await request('GET', '/api/posts/topic/Tech', tokens[name]);
      assert(response.status === 200, `${name} browse returned ${response.status}`);
      const created = response.data.posts.filter((post) => Object.values(postIds).includes(post._id));
      assert(created.length === 3, `Expected 3 project posts, found ${created.length}`);
      assert(created.every((post) => post.likeCount === 0 && post.dislikeCount === 0 && post.comments.length === 0), 'A new post already had interactions');
    }
  });

  await test(8, 'Nick and Olga like Mary’s Tech post', async () => {
    for (const name of ['Nick', 'Olga']) {
      const response = await request('POST', `/api/posts/${postIds.Mary}/like`, tokens[name]);
      assert(response.status === 200, `${name} like returned ${response.status}`);
    }
  });

  await test(9, 'Nestor likes Nick’s post and dislikes Mary’s post', async () => {
    const like = await request('POST', `/api/posts/${postIds.Nick}/like`, tokens.Nestor);
    const dislike = await request('POST', `/api/posts/${postIds.Mary}/dislike`, tokens.Nestor);
    assert(like.status === 200, `Like returned ${like.status}`);
    assert(dislike.status === 200, `Dislike returned ${dislike.status}`);
  });

  await test(10, 'Nick sees the correct Tech interaction totals', async () => {
    const response = await request('GET', '/api/posts/topic/Tech', tokens.Nick);
    const mary = response.data.posts.find((post) => post._id === postIds.Mary);
    const nick = response.data.posts.find((post) => post._id === postIds.Nick);
    assert(mary?.likeCount === 2 && mary?.dislikeCount === 1, 'Mary should have 2 likes and 1 dislike');
    assert(nick?.likeCount === 1 && nick?.dislikeCount === 0, 'Nick should have 1 like and 0 dislikes');
    assert(mary.comments.length === 0, 'Mary should not have comments yet');
  });

  await test(11, 'Mary cannot like her own post', async () => {
    const response = await request('POST', `/api/posts/${postIds.Mary}/like`, tokens.Mary);
    assert(response.status === 403, `Expected 403, received ${response.status}`);
  });

  await test(12, 'Nick and Olga add two comments each in round-robin order', async () => {
    const comments = [
      ['Nick', 'This is a useful starting point.'],
      ['Olga', 'I agree that governance matters.'],
      ['Nick', 'Transparency should also be considered.'],
      ['Olga', 'A practical policy would strengthen the idea.']
    ];
    for (const [name, text] of comments) {
      const response = await request('POST', `/api/posts/${postIds.Mary}/comments`, tokens[name], { text });
      assert(response.status === 201, `${name} comment returned ${response.status}`);
    }
  });

  await test(13, 'Nick browses Tech posts and sees all comments', async () => {
    const response = await request('GET', '/api/posts/topic/Tech', tokens.Nick);
    const mary = response.data.posts.find((post) => post._id === postIds.Mary);
    assert(mary?.comments.length === 4, `Expected 4 comments, found ${mary?.comments.length}`);
    assert(mary.likeCount === 2 && mary.dislikeCount === 1, 'Mary interaction totals changed unexpectedly');
  });

  await test(14, 'Nestor posts a short-lived Health message', async () => {
    postIds.Health = await createPost('Nestor', 'Healthy remote-working habits', 'Health', 'Nestor shares a short discussion about healthy remote work.', 3500);
  });

  await test(15, 'Mary browses Health and sees only Nestor’s new post', async () => {
    const response = await request('GET', '/api/posts/topic/Health', tokens.Mary);
    const matching = response.data.posts.filter((post) => post._id === postIds.Health);
    assert(matching.length === 1, `Expected Nestor's Health post once, found ${matching.length}`);
  });

  await test(16, 'Mary comments on Nestor’s Health message before expiry', async () => {
    const response = await request('POST', `/api/posts/${postIds.Health}/comments`, tokens.Mary, { text: 'This is a helpful reminder.' });
    assert(response.status === 201, `Expected 201, received ${response.status}`);
  });

  await test(17, 'Mary cannot dislike the Health message after expiry', async () => {
    await wait(4000);
    const response = await request('POST', `/api/posts/${postIds.Health}/dislike`, tokens.Mary);
    assert(response.status === 409, `Expected 409, received ${response.status}`);
  });

  await test(18, 'Nestor sees one Health post with Mary’s comment', async () => {
    const response = await request('GET', '/api/posts/topic/Health', tokens.Nestor);
    const health = response.data.posts.find((post) => post._id === postIds.Health);
    assert(health, 'Health post was not returned');
    assert(health.comments.length === 1, `Expected 1 comment, found ${health.comments.length}`);
    assert(health.status === 'Expired', `Expected Expired status, received ${health.status}`);
  });

  await test(19, 'Nick sees no expired Sports posts created by this test', async () => {
    const response = await request('GET', '/api/posts/topic/Sport/expired', tokens.Nick);
    assert(response.status === 200, `Expected 200, received ${response.status}`);
    assert(response.data.count === 0, `Expected 0 expired Sports posts, found ${response.data.count}`);
  });

  await test(20, 'Nestor finds Mary’s post as the most active live Tech post', async () => {
    const response = await request('GET', '/api/posts/topic/Tech/most-active', tokens.Nestor);
    assert(response.status === 200, `Expected 200, received ${response.status}`);
    assert(response.data.post?._id === postIds.Mary, 'Mary’s post was not returned as most active');
    assert(response.data.post.interestScore === 3, `Expected interest score 3, found ${response.data.post.interestScore}`);
  });

  console.log(`\nResult: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
