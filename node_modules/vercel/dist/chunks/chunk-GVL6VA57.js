import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  confirmOption,
  forceOption,
  packageName,
  yesOption
} from "./chunk-KGLPAIXW.js";

// src/commands/deploy/command.ts
var deprecatedArchiveSplitTgz = "split-tgz";
var deployCommand = {
  name: "deploy",
  aliases: [],
  description: "Deploy your project to Vercel. The `deploy` command is the default command for the Vercel CLI, and can be omitted (`vc deploy my-app` equals `vc my-app`).",
  arguments: [
    {
      name: "project-path",
      required: false
    }
  ],
  options: [
    {
      ...forceOption,
      description: "Force a new deployment even if nothing has changed"
    },
    {
      name: "with-cache",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: 'Retain build cache when using "--force"'
    },
    {
      name: "public",
      shorthand: "p",
      type: Boolean,
      deprecated: false,
      description: "Deployment is public (`/_src`) is exposed)"
    },
    {
      name: "env",
      shorthand: "e",
      type: [String],
      argument: "KEY=VALUE",
      deprecated: false,
      description: "Specify environment variables during run-time (e.g. `-e KEY1=value1 -e KEY2=value2`)"
    },
    {
      name: "build-env",
      shorthand: "b",
      type: [String],
      argument: "KEY=VALUE",
      deprecated: false,
      description: "Specify environment variables during build-time (e.g. `-b KEY1=value1 -b KEY2=value2`)"
    },
    {
      name: "meta",
      shorthand: "m",
      type: [String],
      argument: "KEY=VALUE",
      deprecated: false,
      description: "Specify metadata for the deployment (e.g. `-m KEY1=value1 -m KEY2=value2`)"
    },
    {
      name: "regions",
      shorthand: null,
      type: String,
      argument: "REGION",
      deprecated: false,
      description: "Set default regions to enable the deployment on"
    },
    {
      name: "prebuilt",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: "Use in combination with `vc build`. Deploy an existing build"
    },
    {
      name: "prod",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: "Create a production deployment (shorthand for `--target=production`)"
    },
    {
      name: "archive",
      shorthand: null,
      type: String,
      argument: "FORMAT",
      deprecated: false,
      description: "Compress the deployment code into an archive before uploading it"
    },
    {
      name: "no-wait",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: "Don't wait for the deployment to finish"
    },
    {
      name: "skip-domain",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: "Disable the automatic promotion (aliasing) of the relevant domains to a new production deployment. You can use `vc promote` to complete the domain-assignment process later"
    },
    {
      ...yesOption,
      description: "Use default options to skip all prompts"
    },
    {
      name: "logs",
      shorthand: "l",
      type: Boolean,
      deprecated: false,
      description: "Print the build logs"
    },
    {
      name: "guidance",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: "Receive command suggestions once deployment is complete"
    },
    {
      name: "no-logs",
      shorthand: null,
      type: Boolean,
      deprecated: true,
      description: "Do not print the build logs"
    },
    {
      name: "name",
      shorthand: "n",
      type: String,
      deprecated: true
    },
    {
      name: "no-clipboard",
      shorthand: null,
      type: Boolean,
      deprecated: true
    },
    {
      name: "target",
      shorthand: null,
      type: String,
      argument: "TARGET",
      deprecated: false,
      description: "Specify the target deployment environment"
    },
    confirmOption
  ],
  examples: [
    {
      name: "Deploy the current directory",
      value: "vercel"
    },
    {
      name: "Deploy a custom path",
      value: "vercel /usr/src/project"
    },
    {
      name: "Deploy with run-time Environment Variables",
      value: "vercel -e NODE_ENV=production"
    },
    {
      name: "Deploy with prebuilt outputs",
      value: ["vercel build", "vercel deploy --prebuilt"]
    },
    {
      name: "Write Deployment URL to a file",
      value: "vercel > deployment-url.txt"
    }
  ]
};

// src/commands/login/command.ts
var loginCommand = {
  name: "login",
  aliases: [],
  description: "Sign in to your Vercel account.",
  arguments: [
    {
      name: "email or team id",
      required: false
    }
  ],
  options: [
    {
      name: "github",
      description: "Log in with GitHub",
      shorthand: null,
      type: Boolean,
      deprecated: true
    },
    {
      name: "oob",
      description: 'Log in with "out of band" authentication',
      shorthand: null,
      type: Boolean,
      deprecated: true
    },
    { name: "gitlab", shorthand: null, type: Boolean, deprecated: true },
    { name: "bitbucket", shorthand: null, type: Boolean, deprecated: true },
    {
      name: "future",
      description: "Sign in using OAuth Device Authorization",
      shorthand: null,
      type: Boolean,
      deprecated: true
    }
  ],
  examples: [
    {
      name: "Sign in to your Vercel account.",
      value: `${packageName} login`
    }
  ]
};

// src/commands/logs/command.ts
var CommandTimeout = "5 minutes";
var logsCommand = {
  name: "logs",
  aliases: ["log"],
  description: "Display request logs for a project.\n\nSource types: \u03BB = serverless, \u03B5 = edge/middleware, \u25C7 = static/external",
  arguments: [
    {
      name: "url|deploymentId",
      required: false
    }
  ],
  options: [
    {
      name: "project",
      shorthand: "p",
      type: String,
      deprecated: false,
      description: "Project ID or name (defaults to linked project)"
    },
    {
      name: "deployment",
      shorthand: "d",
      type: String,
      deprecated: false,
      description: "Filter logs to a specific deployment ID or URL (alternative to positional argument)"
    },
    {
      name: "environment",
      shorthand: null,
      type: String,
      deprecated: false,
      description: "Filter by environment: production or preview"
    },
    {
      name: "level",
      shorthand: null,
      type: [String],
      deprecated: false,
      description: "Filter by log level: error, warning, info, fatal"
    },
    {
      name: "status-code",
      shorthand: null,
      type: String,
      deprecated: false,
      description: "Filter by HTTP status code (e.g., 500, 4xx)"
    },
    {
      name: "source",
      shorthand: null,
      type: [String],
      deprecated: false,
      description: "Filter by source: serverless, edge-function, edge-middleware, static"
    },
    {
      name: "since",
      shorthand: null,
      type: String,
      deprecated: false,
      description: "Start time (ISO format or relative: 1h, 30m)"
    },
    {
      name: "until",
      shorthand: null,
      type: String,
      deprecated: false,
      description: "End time (ISO format or relative, default: now)"
    },
    {
      name: "limit",
      shorthand: "n",
      type: Number,
      deprecated: false,
      description: "Maximum number of results (default: 100)"
    },
    {
      name: "json",
      shorthand: "j",
      type: Boolean,
      deprecated: false,
      description: "Output logs as JSON Lines for piping to other tools"
    },
    {
      name: "follow",
      shorthand: "f",
      type: Boolean,
      deprecated: false,
      description: "Stream live runtime logs (implicit when deployment URL/ID is specified)"
    },
    {
      name: "no-follow",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: "Disable implicit --follow for deployment arguments"
    },
    {
      name: "query",
      shorthand: "q",
      type: String,
      deprecated: false,
      description: "Full-text search query"
    },
    {
      name: "request-id",
      shorthand: null,
      type: String,
      deprecated: false,
      description: "Filter by request ID"
    },
    {
      name: "expand",
      shorthand: "x",
      type: Boolean,
      deprecated: false,
      description: "Show full log message below each request line"
    },
    {
      name: "branch",
      shorthand: "b",
      type: String,
      deprecated: false,
      description: "Filter by git branch (defaults to current branch when in a git repo)"
    },
    {
      name: "no-branch",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: "Disable auto-detection of git branch"
    }
  ],
  examples: [
    {
      name: "Stream live logs for a deployment URL",
      value: `${packageName} logs https://my-app-xxxxx.vercel.app`
    },
    {
      name: "Stream live logs for a deployment ID",
      value: `${packageName} logs dpl_xxxxx`
    },
    {
      name: "Display recent logs for the linked project",
      value: `${packageName} logs`
    },
    {
      name: "Display error logs from the last hour",
      value: `${packageName} logs --level error --since 1h`
    },
    {
      name: "Display logs for a specific deployment (historical)",
      value: `${packageName} logs dpl_xxxxx --no-follow`
    },
    {
      name: "Filter logs by status code and output as JSON",
      value: `${packageName} logs --status-code 500 --json`
    },
    {
      name: "Search logs and pipe to jq",
      value: `${packageName} logs --query "timeout" --json | jq '.message'`
    },
    {
      name: "Display production logs only",
      value: `${packageName} logs --environment production`
    },
    {
      name: "Display logs for a specific request",
      value: `${packageName} logs --request-id req_xxxxx`
    },
    {
      name: "Display logs with full message details",
      value: `${packageName} logs --expand`
    },
    {
      name: "Display logs for a specific branch",
      value: `${packageName} logs --branch feature-x`
    },
    {
      name: "Display logs for all branches (disable auto-detection)",
      value: `${packageName} logs --no-branch`
    }
  ]
};

export {
  deprecatedArchiveSplitTgz,
  deployCommand,
  loginCommand,
  CommandTimeout,
  logsCommand
};
