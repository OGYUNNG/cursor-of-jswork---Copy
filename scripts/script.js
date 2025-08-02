async function hashExistingPasswords() {
  const users = await db('logged');

  for (const user of users) {
    if (!user.password.startsWith('$2a$')) { // Already hashed?
      const hashed = bcrypt.hashSync(user.password, 10);
      await db('logged')
        .where({ id: user.id })
        .update({ password: hashed });
      console.log(`Updated user ${user.username}`);
    }
  }

  console.log('All passwords hashed.');
}
