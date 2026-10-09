"""Decide whether a decision task is building a release, a staging release, or neither."""

import re
from dataclasses import dataclass
from typing import Optional

_RELEASE_TAG = re.compile(r"^refs/tags/v(\d+\.\d+\.\d+)$")
_STAGING_BRANCH = re.compile(r"^refs/heads/staging-release/v(\d+\.\d+\.\d+)$")


@dataclass(frozen=True)
class ReleaseInfo:
    version: str
    staging: bool
    repo: str


def release_info(head_ref: str, tasks_for: str, project: str) -> Optional[ReleaseInfo]:
    # Only pushes can be releases; a pull request from a branch named like a
    # staging release must never produce release tasks.
    if tasks_for != "github-push":
        return None
    # Releases come only from taskcluster/taskcluster and staging releases only
    # from taskcluster/staging-releases; the same ref in any other project (a
    # fork, or the other repo) is not a release and must not fail the decision.
    if project == "taskcluster":
        if match := _RELEASE_TAG.match(head_ref):
            return ReleaseInfo(match[1], staging=False, repo="taskcluster/taskcluster")
        if head_ref.startswith("refs/tags/v"):
            raise ValueError(f"release tags must be of the form vX.Y.Z; got {head_ref}")
    elif project == "staging-releases":
        if match := _STAGING_BRANCH.match(head_ref):
            return ReleaseInfo(match[1], staging=True, repo="taskcluster/staging-releases")
    return None
