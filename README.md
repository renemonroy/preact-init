# Preact Init
Initiate Preact projects from different starting points, fast and easy.

### Overview
This tool make use of [preact-roller](https://github.com/churris/preact-roller), a Rollup/Bublé alternative to [preact-cli](https://github.com/developit/preact-cli), to start new Preact projects.

Preact Init is highly inspired by [create-react-app](https://github.com/facebookincubator/create-react-app) and [vue-cli](https://github.com/vuejs/vue-cli) and tries to merge good ideas from both approaches while keeping it as simple as possible.

If Rollup or Bublé aren't your thing, I recommend you to look at [preact-cli](https://github.com/developit/preact-cli).

### Features
* Begin Preact projects from different starting points (templates).
* Templates can be installed from public or private Git repositories.
* One-command option: `preact-init`

### Requirements
Preact Init requires at least **Node 6** but an 8 version is highly recommended.

### Installation
Install it once globally:

`npm install -g preact-init`

### Usage

There’s only **1** command that you can run in **3** different ways:

* `preact-init` - Assists you to start a new Preact project.
* `preact-init <project-name>` - Starts a project with a custom name and default template.
* `preact-init <project-name> <template-repo>` - Starts a project with a custom name from a specific repo.

> *template-repo* must follow the shorthand repo notation of [download-git-repo](https://github.com/flipxfx/download-git-repo). Example: `github:churris/preact-simple-template`

Additionally, you can pass the available options:

| Options                            | Alias     | Description                                             |
| ---------------------------------- | --------- | ------------------------------------------------------- |
| `--ssh`                            | `-s`      | Clones the template repo with SSH                       |
| `--help`                           | `-h`      | Shows additional help                                   |
| `--version`                        | `-v`      | Shows the version of preact-init                        |

Example: `preact-init my-app -s`
