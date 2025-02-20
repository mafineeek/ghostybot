import { Message, version } from "discord.js";
import dayJs from "dayjs";
import duration from "dayjs/plugin/duration";
import Command from "structures/Command";
import Bot from "structures/Bot";
import BotModel from "models/Bot.model";
import { hyperlink, inlineCode } from "@discordjs/builders";
dayJs.extend(duration);

export default class BotInfoCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "botinfo",
      description: "Shows info about the bot",
      category: "util",
      aliases: ["bot", "ping"],
    });
  }

  async execute(message: Message) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);

    try {
      const uptime = dayJs
        .duration(this.bot?.uptime ?? 0)
        .format(" D [days], H [hrs], m [mins], s [secs]");

      const { total_used_cmds, used_since_up } = await BotModel.findOne({
        bot_id: this.bot.user?.id,
      });
      const userCount = this.bot.utils.formatNumber(
        this.bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
      );

      const RAM_USAGE = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

      const BOT_REPO = hyperlink("Click Here", "https://github.com/dev-caspertheghost/ghostybot");
      const SUPPORT_SERVER = hyperlink("Click Here", "https://discord.gg/XxHrtkA");
      const DASHBOARD = hyperlink("Click Here", process.env["NEXT_PUBLIC_DASHBOARD_URL"]!);

      const BOT_DEV = hyperlink(lang.BOT.DEVELOPER, "https://caspertheghost.me");
      const CONTRIBUTORS = hyperlink(
        lang.BOT.CONTRIBUTORS,
        "https://github.com/Dev-CasperTheGhost/ghostybot/contributors",
      );
      const BOT_INVITE = hyperlink(
        lang.BOT.INVITE_BOT,
        `https://discord.com/oauth2/authorize?client_id=${this.bot.user?.id}&scope=applications.commands+bot&permissions=8`,
      );

      const embed = this.bot.utils
        .baseEmbed(message)
        .setTitle(lang.BOT.INFO_2)
        .addField(`${lang.MEMBER.USERNAME}:`, this.bot.user?.username ?? "GhostyBot")
        .addField(lang.BOT.LATENCY, Math.round(this.bot.ws.ping).toString(), true)
        .addField(
          `${lang.HELP.COMMANDS}:`,
          `
**${lang.BOT.USED_SINCE_UP}:** ${inlineCode(this.bot.utils.formatNumber(used_since_up))}
**${lang.BOT.TOTAL_USED_CMDS}:** ${inlineCode(this.bot.utils.formatNumber(total_used_cmds))}`,
        )
        .addField(
          `**${lang.BOT.INFO}:**`,
          `
**${lang.BOT.USERS}:** ${inlineCode(userCount)}
**${lang.BOT.GUILDS}:** ${inlineCode(this.bot.utils.formatNumber(this.bot.guilds.cache.size))}
**${lang.BOT.CHANNELS}:** ${inlineCode(this.bot.utils.formatNumber(this.bot.channels.cache.size))}
**${lang.BOT.COMMAND_COUNT}:** ${inlineCode(this.bot.commands.size.toString())}
              `,
          true,
        )
        .addField(
          `**${lang.BOT.SYSTEM_INFO}**`,
          `**${lang.BOT.RAM_USAGE}:**  ${RAM_USAGE}MB
**${lang.BOT.UPTIME}:** ${uptime}
**${lang.BOT.DJS_V}:** ${version}`,
          true,
        )
        .addField(
          "Links",
          `
${BOT_DEV}
${CONTRIBUTORS}
${BOT_INVITE}`,
          true,
        )
        .addField(lang.BOT.REPO, BOT_REPO, true)
        .addField(lang.UTIL.SUPPORT_SERVER, SUPPORT_SERVER, true)
        .addField(`${lang.BOT.DASHBOARD}`, DASHBOARD, true)
        .setImage(
          "https://raw.githubusercontent.com/Dev-CasperTheGhost/ghostybot/main/.github/Ghostybot-banner.png",
        );

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      this.bot.utils.sendErrorLog(err, "error");
      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
