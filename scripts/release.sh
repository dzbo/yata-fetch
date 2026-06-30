#!/bin/bash
set -e

echo "Release type?"
select TYPE in patch minor major; do
  case $TYPE in
    patch|minor|major) break ;;
  esac
done

# Bump package.json only (no commit, no tag)
npm version $TYPE --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
BRANCH="chore/bump-version-$NEW_VERSION"

# Commit the version bump on a new branch and open a PR
git checkout -b "$BRANCH"
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"
git push -u origin "$BRANCH"
gh pr create --base master --title "chore: bump version to $NEW_VERSION" --body "Version bump to $NEW_VERSION."

# Tag current HEAD and push — triggers CI publish
git tag "v$NEW_VERSION"
git push origin "v$NEW_VERSION"

echo ""
echo "✓ Tag v$NEW_VERSION pushed — CI will publish to npm."
echo "✓ PR opened to sync the version bump back to master."
