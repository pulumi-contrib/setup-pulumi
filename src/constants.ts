import * as core from "@actions/core";

export const GITHUB_TOKEN = core.getInput("github-token");

export const PULUMI_VERSION = core.getInput("pulumi-version");
