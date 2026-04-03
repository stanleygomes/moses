import { confirm, input, password, select } from '@inquirer/prompts';
import { AI_TOOLS, CONFIG_VERSION, DEFAULT_MAX_DIFF_CHANGES, FEEDBACK_STYLES, MESSAGES, } from '../constants.js';
import { ensureDefaultContextFiles } from '../services/context.js';
import { validateToken } from '../services/gitlab.js';
import { checkAndFixConfigPermissions, getConfigPath, readConfig, saveConfig, } from '../utils/config-store.js';
import * as display from '../utils/display.js';
import { validateToolInstallation } from '../utils/tool-validator.js';
import { validateGitlabUrl } from '../utils/url-parser.js';
async function chooseGitlabBaseUrl() {
    const gitlabType = await select({
        message: 'Which GitLab do you want to use?',
        choices: [
            { name: 'GitLab.com (gitlab.com) — Default', value: 'default' },
            { name: 'Self-Hosted GitLab (provide a custom URL)', value: 'self' },
        ],
    });
    if (gitlabType === 'default') {
        return 'https://gitlab.com';
    }
    while (true) {
        const url = await input({ message: 'GitLab URL:', default: 'https://gitlab.your-domain.com' });
        if (validateGitlabUrl(url))
            return url;
        display.error('Invalid URL. Use https:// and a valid domain.');
    }
}
async function chooseAiTool() {
    while (true) {
        const chosen = await select({
            message: 'Choose the AI tool for review:',
            choices: AI_TOOLS.map((tool) => ({ name: tool.name, value: tool.key })),
        });
        const toolInfo = AI_TOOLS.find((tool) => tool.key === chosen);
        if (!toolInfo) {
            throw new Error(`Unsupported AI tool: ${String(chosen)}`);
        }
        const toolSpinner = display.spinner(`Checking ${toolInfo.name} installation...`);
        const validation = validateToolInstallation(toolInfo.key);
        toolSpinner.stop();
        if (validation.installed) {
            display.success(`${toolInfo.name} found at ${validation.path}`);
            return toolInfo.key;
        }
        display.error(`${toolInfo.name} not found!`);
        display.info(`\n📦 Install with:\n   ${validation.installCmd ?? toolInfo.install}`);
        display.info(`\n📖 Documentation: ${validation.installUrl}\n`);
        const retry = await confirm({ message: 'Do you want to choose another tool?', default: true });
        if (!retry) {
            throw new Error('AI tool not installed. Install a supported tool and run again.');
        }
    }
}
async function chooseFeedbackStyle(existingStyle) {
    const defaultStyle = FEEDBACK_STYLES.find((item) => item.key === existingStyle)?.key ?? FEEDBACK_STYLES[1].key;
    return select({
        message: 'Choose MR feedback style:',
        choices: FEEDBACK_STYLES.map((item) => ({ name: item.label, value: item.key })),
        default: defaultStyle,
    });
}
async function chooseMaxDiffChanges(existingLimit) {
    const fallback = typeof existingLimit === 'number' && Number.isInteger(existingLimit) && existingLimit > 0
        ? existingLimit
        : DEFAULT_MAX_DIFF_CHANGES;
    while (true) {
        const value = await input({
            message: 'Maximum allowed diff changes before interrupting validation:',
            default: String(fallback),
        });
        const parsed = Number.parseInt(value, 10);
        if (Number.isInteger(parsed) && parsed > 0)
            return parsed;
        display.error('Invalid value. Please inform a positive integer.');
    }
}
export async function runInit() {
    display.banner();
    display.info(MESSAGES.welcome);
    let existingConfig = null;
    try {
        existingConfig = await readConfig();
        const permissionStatus = await checkAndFixConfigPermissions();
        if (permissionStatus.fixed) {
            display.warn(`Permissions were automatically fixed to 600 at ${getConfigPath()}`);
        }
    }
    catch {
        // config not found yet
    }
    if (existingConfig) {
        const overwrite = await confirm({
            message: 'Existing configuration found. Do you want to overwrite/add a new instance?',
            default: true,
        });
        if (!overwrite) {
            display.info('No changes applied.');
            return;
        }
    }
    display.section('📋 GITLAB CONFIGURATION');
    const gitlabName = await input({
        message: 'Instance name:',
        default: existingConfig?.defaultGitlab ?? 'gitlab-main',
    });
    const gitlabUrl = await chooseGitlabBaseUrl();
    const token = await password({
        message: 'Personal Access Token (scope: api):',
        mask: '*',
    });
    const tokenSpinner = display.spinner('Validating token...');
    try {
        const user = await validateToken(gitlabUrl, token);
        tokenSpinner.succeed(`Valid token! User: @${user.username}`);
    }
    catch (error) {
        tokenSpinner.fail('Invalid or expired token.');
        display.info('See: https://docs.gitlab.com/user/profile/personal_access_tokens/');
        throw error;
    }
    display.section('🤖 AI TOOL CONFIGURATION');
    const aiTool = await chooseAiTool();
    const feedbackStyle = await chooseFeedbackStyle(existingConfig?.ai?.feedbackStyle);
    const maxDiffChanges = await chooseMaxDiffChanges(existingConfig?.ai?.maxDiffChanges);
    const baseConfig = existingConfig ?? {
        version: CONFIG_VERSION,
        defaultGitlab: gitlabName,
        gitlabs: [],
        ai: {
            tool: aiTool,
            customCommand: null,
            model: null,
            feedbackStyle,
            maxDiffChanges,
        },
        output: { dir: '~/.config/moses/reviews', keepFiles: true },
    };
    const remainingGitlabs = baseConfig.gitlabs.filter((item) => item.name !== gitlabName);
    const gitlabs = [
        ...remainingGitlabs,
        { name: gitlabName, url: gitlabUrl, token, default: true },
    ].map((item) => ({
        ...item,
        default: item.name === gitlabName,
    }));
    const config = {
        ...baseConfig,
        version: CONFIG_VERSION,
        defaultGitlab: gitlabName,
        gitlabs,
        ai: {
            ...baseConfig.ai,
            tool: aiTool,
            customCommand: null,
            model: null,
            feedbackStyle,
            maxDiffChanges,
        },
    };
    const configPath = await saveConfig(config);
    await ensureDefaultContextFiles();
    display.success(MESSAGES.done);
    display.info(`📁 Config saved at ${configPath} (mode 600)`);
    display.info(MESSAGES.next);
}
