#!/usr/bin/env bash
set -e
# set -x

export SENTRY_AUTH_TOKEN=1b60695f38bf46cc8e06ff388311cae0d35995f94f8841deb9d96738eb8470ea
export SENTRY_ORG=josh-hunt

VERSION=$(./node_modules/.bin/sentry-cli releases propose-version)
./node_modules/.bin/sentry-cli releases new -p destinysetscom  $VERSION
./node_modules/.bin/sentry-cli releases set-commits --auto $VERSION

yarn run deploy
