#!/bin/bash
set -e

# Anchor to the repo root so the script works from any cwd — every step below
# (package.json reads, npm version, git add) is relative to it.
cd "$(git rev-parse --show-toplevel)"

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
  *) echo "Invalid release type: $TYPE (expected patch, minor, or major)" >&2; exit 1 ;;
esac

# `npm version` bumps from whatever package.json currently says. If that has
# already been changed by hand it silently skips a version — e.g. a manual
# 3.0.0 plus `major` yields 4.0.0. Refuse to guess when the two disagree.
CURRENT=$(node -p "require('./package.json').version")
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
LAST_RELEASED=${LAST_TAG#v}

if [ "$CURRENT" != "$LAST_RELEASED" ]; then
  echo "package.json is $CURRENT but the last tag is $LAST_TAG." >&2
  echo "" >&2
  echo "Bumping now would skip a version. Either:" >&2
  echo "  • tag the current version as-is:  git tag v$CURRENT && git push origin v$CURRENT" >&2
  echo "  • or reset package.json to $LAST_RELEASED and re-run this script" >&2
  exit 1
fi

npm version "$TYPE" --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")

git add package.json
git commit -m "chore: Release $NEW_VERSION"
git push

git tag "v$NEW_VERSION"
git push origin "v$NEW_VERSION"

echo ""
echo "✓ Tag v$NEW_VERSION pushed — CI will publish to npm."
