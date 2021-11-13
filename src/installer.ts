import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as github from "@actions/github";
import * as io from "@actions/io";
import * as tc from "@actions/tool-cache";
import * as os from "os";
import * as path from "path";

import { GITHUB_TOKEN, PULUMI_VERSION } from "./constants";

const platform = os.platform();
const arch = os.arch();

const IS_WINDOWS = platform === "win32";

function getPlatform() {
  switch (platform) {
    case "darwin":
      return "darwin";
    case "linux":
      return "linux";
    case "win32":
      return "windows";
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function getArch() {
  switch (arch) {
    case "x64":
      return "x64";
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }
}

async function getLatestVersion() {
  const octokit = github.getOctokit(GITHUB_TOKEN);
  const {
    data: { tag_name: version },
  } = await octokit.rest.repos.getLatestRelease({
    owner: "pulumi",
    repo: "pulumi",
  });
  return version;
}

async function getVersion(version: string) {
  if (version === "latest") {
    const latestVersion = await getLatestVersion();
    return latestVersion;
  } else {
    return version;
  }
}

function composeDownloadUrl(version: string) {
  const platform = getPlatform();
  const arch = getArch();
  const ext = IS_WINDOWS ? "zip" : "tar.gz";
  const url = `https://get.pulumi.com/releases/sdk/pulumi-${version}-${platform}-${arch}.${ext}`;
  return url;
}

function addPath(baseDir: string) {
  const pulumiPath = IS_WINDOWS
    ? path.join(baseDir, "Pulumi", "bin")
    : path.join(baseDir, "pulumi");
  core.addPath(pulumiPath);
}

export async function acquirePulumi(): Promise<void> {
  const version = await getVersion(PULUMI_VERSION);
  const downloadUrl = composeDownloadUrl(version);
  const cachedPath = tc.find("pulumi", version);
  if (cachedPath === "") {
    const downloadedPath = await tc.downloadTool(downloadUrl);
    const extractedPath = IS_WINDOWS
      ? await tc.extractZip(downloadedPath)
      : await tc.extractTar(downloadedPath);
    const cachedPath = await tc.cacheDir(extractedPath, "pulumi", version);
    addPath(cachedPath);
  } else {
    addPath(cachedPath);
  }
  const pulumiBinPath = await io.which("pulumi", true);
  await exec(pulumiBinPath, ["version"]);
}
