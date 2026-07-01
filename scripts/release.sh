#!/bin/bash
set -e

TYPE=$1

if [ -z "$TYPE" ]; then
  echo "Release type?"
  select TYPE in patch minor major; do
    case $TYPE in
      patch|minor|major) break ;;
    esac
  done
fi

case $TYPE in
  patch|minor|major) ;;
  *) echo "Invalid release type: $TYPE (expected patch, minor, or major)"; exit 1 ;;
esac

npm version $TYPE --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")

git add package.json
git commit -m "chore: Release $NEW_VERSION"
git push

git tag "v$NEW_VERSION"
git push origin "v$NEW_VERSION"

echo ""
echo "✓ Tag v$NEW_VERSION pushed — CI will publish to npm."
