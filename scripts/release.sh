#!/bin/bash
set -e

echo "Release type?"
select TYPE in patch minor major; do
  case $TYPE in
    patch|minor|major) break ;;
  esac
done

NEW_VERSION=$(npm version $TYPE --no-git-tag-version | sed 's/^v//')

git tag "v$NEW_VERSION"
git push origin "v$NEW_VERSION"

echo ""
echo "✓ Tag v$NEW_VERSION pushed — CI will publish to npm."
