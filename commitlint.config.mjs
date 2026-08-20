/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // `content` covers everything published from content/ (blog posts, project
    // pages). `docs` stays reserved for repository documentation such as the
    // README, so a new article never shows up as a docs or feat change.
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'content',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
}
