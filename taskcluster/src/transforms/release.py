from taskgraph.transforms.base import TransformSequence

from ..constants import RELEASE_DEADLINE, RELEASE_NOTIFY, RELEASE_SECRET, STAGING_RELEASE_SECRET
from ..release import release_info, toolchain_setup

transforms = TransformSequence()


@transforms.add
def select_release_tasks(config, tasks):
    """Generate release tasks only for release or staging-release pushes, and
    give every one the shared version environment, deadline and requirement."""
    info = release_info(
        config.params["head_ref"], config.params["tasks_for"], config.params["project"]
    )
    for task in tasks:
        release_only = task.pop("release-only", False)
        if info is None or (info.staging and release_only):
            continue
        task.setdefault("attributes", {})["only-on"] = (
            "staging-release" if info.staging else "release"
        )
        task["deadline-after"] = RELEASE_DEADLINE
        task["requires"] = "all-completed"
        # Staging releases send no email: the staging-releases project has no
        # notify scopes (createTask would be rejected) and staging runs are
        # developer-watched. Strip any statically declared email routes too.
        if info.staging and "routes" in task:
            task["routes"] = [
                r for r in task["routes"] if not r.startswith("notify.email.")
            ]
        if "worker" in task:
            if not info.staging:
                # Email on failure right away: a failed build leaves
                # release-notify unscheduled until its deadline, so on-resolved
                # there is not enough. (on-exception also fires for auto-retried
                # worker losses.)
                routes = task.setdefault("routes", [])
                routes += [
                    f"{RELEASE_NOTIFY}.on-failed",
                    f"{RELEASE_NOTIFY}.on-exception",
                ]
            env = task["worker"].setdefault("env", {})
            env["RELEASE_VERSION"] = info.version
            env["RELEASE_REPO"] = info.repo
            if info.staging:
                env["STAGING"] = "1"
        yield task


toolchain = TransformSequence()


@toolchain.add
def add_toolchain(config, tasks):
    """Install only what each task opts into: `release-toolchains` (subset of
    go, rust, node, uv), `yarn-install` (monorepo `yarn --immutable`, needs
    node) and `full-clone` (all branches and tags instead of a depth-1 fetch)."""
    for task in tasks:
        install, mounts = toolchain_setup(
            task.pop("release-toolchains", []),
            yarn_install=task.pop("yarn-install", False),
            full_clone=task.pop("full-clone", False),
        )
        task["run"]["install"] = install
        worker = task.setdefault("worker", {})
        worker["mounts"] = mounts + worker.get("mounts", [])
        worker["taskcluster-proxy"] = True
        worker["run-task-as-current-user"] = True
        yield task


secret = TransformSequence()


@secret.add
def add_release_secret(config, tasks):
    info = release_info(
        config.params["head_ref"], config.params["tasks_for"], config.params["project"]
    )
    for task in tasks:
        name = STAGING_RELEASE_SECRET if info.staging else RELEASE_SECRET
        task.setdefault("scopes", []).append(f"secrets:get:{name}")
        yield task


depend_on_all = TransformSequence()


@depend_on_all.add
def depend_on_kind_dependencies(config, tasks):
    """Make a task depend on every task of its kind-dependencies (used by the
    gate and notify tasks, so new builds or publishes are covered automatically)."""
    for task in tasks:
        deps = task.setdefault("dependencies", {})
        for label in sorted(config.kind_dependencies_tasks):
            deps[label] = label
        yield task
