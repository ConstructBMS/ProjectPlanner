#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const CHANGELOG_PATH = 'CHANGELOG.md';
const COMMIT_MESSAGE_PREFIX = 'feat: ';

// Get current timestamp
const getTimestamp = () => {
  return new Date().toISOString().split('T')[0];
};

// Get current time
const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    timeZone: 'UTC',
  });
};

// Get Git status
const getGitStatus = () => {
  try {
    return execSync('git status --porcelain', { encoding: 'utf8' });
  } catch {
    console.error('Error getting Git status');
    return '';
  }
};

// Get changed files
const getChangedFiles = () => {
  const status = getGitStatus();
  if (!status) return [];

  return status
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const status = line.substring(0, 2).trim();
      const file = line.substring(3);
      return { status, file };
    });
};

// Get commit hash
const getLastCommitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

// Update changelog
const updateChangelog = (commitMessage, changedFiles) => {
  try {
    let changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');

    // Create new entry
    const timestamp = getTimestamp();
    const time = getCurrentTime();
    const commitHash = getLastCommitHash();

    const newEntry = `
### ${timestamp} - ${time}
- **${commitHash}** - ${commitMessage}
  - Files changed: ${changedFiles.length}
  - Changed files: ${changedFiles.map(f => f.file).join(', ')}
  - Status: ${changedFiles.map(f => `${f.status} ${f.file}`).join(', ')}

`;

    // Insert new entry after the "## Commit Log" section
    const commitLogIndex = changelog.indexOf('## Commit Log');
    if (commitLogIndex !== -1) {
      const beforeCommitLog = changelog.substring(0, commitLogIndex);
      const afterCommitLog = changelog.substring(commitLogIndex);

      changelog = beforeCommitLog + newEntry + afterCommitLog;
    } else {
      // If no commit log section, add it
      changelog += `\n## Commit Log\n\n${newEntry}`;
    }

    fs.writeFileSync(CHANGELOG_PATH, changelog);
    console.log('✅ Changelog updated successfully');
  } catch (error) {
    console.error('❌ Error updating changelog:', error.message);
  }
};

// Main function
const main = () => {
  console.log('🚀 Starting auto-commit process...\n');

  // Check if there are changes to commit
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('📝 No changes detected. Nothing to commit.');
    return;
  }

  console.log(`📊 Found ${changedFiles.length} changed files:`);
  changedFiles.forEach(({ status, file }) => {
    console.log(`  ${status} ${file}`);
  });

  // Generate commit message
  const timestamp = getTimestamp();
  const time = getCurrentTime();
  const commitMessage = `Development session ${timestamp} ${time} - ${changedFiles.length} files updated`;

  try {
    // Add all changes
    console.log('\n📦 Adding files to staging...');
    execSync('git add .', { stdio: 'inherit' });

    // Commit changes
    console.log('\n💾 Committing changes...');
    execSync(`git commit -m "${COMMIT_MESSAGE_PREFIX}${commitMessage}"`, {
      stdio: 'inherit',
    });

    // Update changelog
    console.log('\n📝 Updating changelog...');
    updateChangelog(commitMessage, changedFiles);

    // Push to remote
    console.log('\n🚀 Pushing to GitHub...');
    execSync('git push origin master', { stdio: 'inherit' });

    console.log('\n✅ Auto-commit completed successfully!');
    console.log(`📋 Commit: ${commitMessage}`);
    console.log(
      `🔗 Repository: https://github.com/ConstructBMS/ProjectPlanner`
    );
  } catch (error) {
    console.error('\n❌ Error during auto-commit:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, updateChangelog, getChangedFiles };
