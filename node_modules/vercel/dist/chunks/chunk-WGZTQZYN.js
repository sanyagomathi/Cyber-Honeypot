import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  STANDARD_ENVIRONMENTS,
  getCommandName,
  require_lib2 as require_lib
} from "./chunk-KGLPAIXW.js";
import {
  output_manager_default
} from "./chunk-7K6FEHYP.js";
import {
  __toESM,
  require_source
} from "./chunk-A2M6YJ6J.js";

// src/util/target/format-environment.ts
var import_chalk = __toESM(require_source(), 1);
var import_title = __toESM(require_lib(), 1);
function formatEnvironment(orgSlug, projectSlug, environment) {
  const projectUrl = `https://vercel.com/${orgSlug}/${projectSlug}`;
  const boldName = import_chalk.default.bold(
    STANDARD_ENVIRONMENTS.includes(environment.slug) ? (0, import_title.default)(environment.slug) : environment.slug
  );
  return output_manager_default.link(
    boldName,
    `${projectUrl}/settings/environments/${environment.slug}`,
    { fallback: () => boldName, color: false }
  );
}

// src/util/output-format.ts
var OUTPUT_FORMATS = ["json"];
function parseOutputFormat(value) {
  const normalized = value.toLowerCase();
  if (OUTPUT_FORMATS.includes(normalized)) {
    return normalized;
  }
  throw new Error(
    `Invalid output format: "${value}". Valid formats: ${OUTPUT_FORMATS.join(", ")}`
  );
}
function getOutputFormat(flags) {
  const formatFlag = flags["--format"];
  const jsonFlag = flags["--json"];
  if (formatFlag) {
    return parseOutputFormat(formatFlag);
  }
  if (jsonFlag) {
    return "json";
  }
  return void 0;
}
function isJsonOutput(flags) {
  return getOutputFormat(flags) === "json";
}
function validateJsonOutput(flags) {
  try {
    const jsonOutput = isJsonOutput(flags);
    return { valid: true, jsonOutput };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// src/util/validate-ls-args.ts
var import_chalk2 = __toESM(require_source(), 1);
function validateLsArgs(options) {
  const { commandName, args, maxArgs = 0, exitCode = 1, usageString } = options;
  if (args.length > maxArgs) {
    const usage = usageString || getCommandName(commandName);
    output_manager_default.error(`Invalid number of arguments. Usage: ${import_chalk2.default.cyan(usage)}`);
    return exitCode;
  }
  return 0;
}

export {
  formatEnvironment,
  validateJsonOutput,
  validateLsArgs
};
