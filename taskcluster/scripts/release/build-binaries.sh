#!/usr/bin/env bash
# Build one set of release binaries or npm tarballs into release-out/.
# Run from the repository root.
set -euo pipefail

target="${1:?usage: build-binaries.sh <target>}"
out="$(pwd)/release-out"
mkdir -p "$out"

case "$target" in
  generic-worker)
    (cd workers/generic-worker && ./build.sh -p -o "$out")
    ;;
  worker-runner)
    (cd tools/worker-runner && ./build.sh "$out")
    ;;
  livelog)
    (cd tools/livelog && ./build.sh "$out")
    ;;
  taskcluster-proxy)
    (cd tools/taskcluster-proxy && ./dockerbuild.sh "$out")
    ;;
  client-shell)
    # Staging branches carry no release tag, so goreleaser can only snapshot.
    # Publishing (including the Homebrew tap) is skipped here: publish-homebrew
    # commits the cask only after the GitHub release is public.
    if [ "${STAGING:-}" = "1" ]; then
      go tool goreleaser release --clean --snapshot
    else
      go tool goreleaser release --clean --skip=publish,announce
    fi
    mv dist/taskcluster-*.tar.gz dist/taskcluster-*.zip "$out/"
    test -f dist/homebrew/Casks/taskcluster.rb
    ;;
  npm-client)
    (cd clients/client && mv "$(npm pack | tail -1)" "$out/")
    ;;
  npm-client-web)
    (cd clients/client-web && yarn install && mv "$(npm pack | tail -1)" "$out/")
    ;;
  *)
    echo "unknown target $target" >&2
    exit 1
    ;;
esac

ls -l "$out"
