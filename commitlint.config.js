module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system or external dependencies
        'ci', // CI/CD changes
        'chore', // Other changes (maintenance, etc.)
        'revert', // Revert previous commit
        'wip', // Work in progress
        'hotfix', // Critical hotfix
        'release', // Release commits
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        // Apps
        'web',
        'mobile',

        // Packages
        'types',
        'ui',
        'auth',
        'api-client',
        'business-logic',
        'shared',
        'config',

        // Infrastructure
        'docker',
        'database',
        'supabase',
        'n8n',
        'redis',

        // Development
        'dev-tools',
        'scripts',
        'docs',
        'tests',
        'ci',

        // Film Production Features
        'casting',
        'locations',
        'scenes',
        'characters',
        'props',
        'scheduling',
        'breakdown',
        'stripboard',
        'call-sheets',
        'production',
        'post-production',

        // General
        'deps',
        'config',
        'security',
        'performance',
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 120],
    'footer-max-line-length': [2, 'always', 120],
  },
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description:
              'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description:
              'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description:
              'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description:
              'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
          wip: {
            description: 'Work in progress',
            title: 'Work in Progress',
            emoji: '🚧',
          },
          hotfix: {
            description: 'Critical hotfix',
            title: 'Hotfixes',
            emoji: '🚑',
          },
          release: {
            description: 'Release commits',
            title: 'Releases',
            emoji: '🎉',
          },
        },
      },
      scope: {
        description:
          'What is the scope of this change (e.g. component or file name)',
      },
      subject: {
        description:
          'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
