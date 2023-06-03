import guildSettingsSchema from "../../schemas/guildSettingsSchema.js";
import {BotClient} from "types";
import Parser from "rss-parser";
import {CategoryChannel, ForumChannel, GuildBasedChannel} from "discord.js";
const parser = new Parser();

export default (client: BotClient) => {
	client.checkUploads = async () => {
		const guilds = await guildSettingsSchema.find();

		for (const guild of guilds) {
			if (guild.youtube?.channels) {
				let index = 0;
				for (const channel of guild.youtube.channels) {
					const channelData = await parser.parseURL(
						`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.youtubeChannelID}`
					);

					const latestVideoID = channelData.items[0].id.slice(9);

					if (channel.latestVideoID !== latestVideoID) {
						guild.youtube.channels[index].latestVideoID = latestVideoID;

						const discordGuild = await client.guilds.fetch(guild.id);

						const discordChannel = (await discordGuild.channels.fetch(channel.discordChannelID as string)) as Exclude<
							Exclude<GuildBasedChannel, CategoryChannel>,
							ForumChannel
						>;

						const {title, link, author, isoDate} = channelData.items[0];

						await discordChannel.send({
							embeds: [
								{
									title,
									url: link,
									color: 0xff0000,
									timestamp: isoDate,
									image: {url: `https://img.youtube.com/vi/${latestVideoID}/maxresdefault.jpg`},
									author: {
										name: author,
										icon_url: `https://yt3.googleusercontent.com/${channel.youtubeChannelProfilePictureURL}`,
										url: `${channelData.link}/?sub_confirmation=1`
									},
									footer: {
										text: client.user?.username as string,
										icon_url: client.user?.displayAvatarURL()
									}
								}
							]
						});
					}
					index++;
				}

				await guildSettingsSchema.updateOne({id: guild.id}, {youtube: guild.youtube});
			}
		}
	};
};
