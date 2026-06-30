#!/bin/bash
set -e

echo "Release type?"
select TYPE in patch minor major; do
  case $TYPE in
    patch|minor|major) break ;;
  esac
done

npm version $TYPE
git push --tags
echo "Tag pushed — CI will publish to npm."
