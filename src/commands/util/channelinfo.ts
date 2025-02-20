import { Message, Snowflake, TextChannel, VoiceChannel, Constants } from "discord.js";
import Command from "structures/Command";
import Bot from "structures/Bot";

const voiceChannel: (keyof typeof Constants.ChannelTypes)[] = ["GUILD_VOICE", "GUILD_STAGE_VOICE"];

export default class ChannelInfoCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "channelinfo",
      description: "Get information about a channel",
      category: "util",
      aliases: ["channel"],
    });
  }

  async execute(message: Message, args: string[]) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);

    try {
      const channel =
        message.mentions.channels.first() ||
        message.guild?.channels.cache.get(args[0] as Snowflake) ||
        message.channel;

      const topic = (channel as TextChannel)?.topic ?? "N/A";
      const channelId = channel?.id;
      const { date, tz } = await this.bot.utils.formatDate(channel.createdAt, message.guild?.id);
      const type = lang.UTIL.CHANNEL_TYPES[channel?.type.toUpperCase()];

      const embed = this.bot.utils
        .baseEmbed(message)
        .setTitle(`${(channel as TextChannel)?.name}`)
        .addField(lang.BOT_OWNER.EVAL_TYPE, type, true)
        .addField(lang.UTIL.CHANNEL_TOPIC, topic, true)
        .addField(lang.MEMBER.ID, channelId, true)
        .addField(lang.MEMBER.CREATED_ON, `${date} (${tz})`, true);

      if (voiceChannel.includes(channel.type)) {
        const regions = lang.OTHER.REGIONS;
        const region = regions[(channel as VoiceChannel)?.rtcRegion ?? "us-central"];

        embed.addField(lang.GUILD.REGION, region);
      }

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      this.bot.utils.sendErrorLog(err, "error");
      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
