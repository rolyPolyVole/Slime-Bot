import {APIEmbed, TextChannel} from "discord.js";
import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";
import {Event} from "types";
import {Colours, URLRegExp, isImageLink} from "../../../utility.js";

export const messageReactionAdd: Event<"messageReactionAdd"> = {
	async execute(client, reaction, user) {
		const {message, emoji, count} = reaction;

		const {guild, channelId, author, content, url, createdTimestamp, attachments, embeds} = message;

		if (guild) {
			const {emojis, id} = guild;

			const guildSettings = await guildSettingsSchema.findOne({id});

			if (guildSettings?.starboard?.channels?.length) {
				for (const channel of guildSettings.starboard.channels) {
					const {emojiID, emojiCount, channelID} = channel;

					if (emoji.id === emojiID && count === emojiCount) {
						// When the owner or an admin adds a channel, the bot would have checked that the channel is not of type CategoryChannel or type ForumChannel.
						// That means that the assertion that the channel is of type TextChannel is safe.
						const starboardChannel = (await (
							await client.guilds.fetch(id)
						).channels.fetch(channelID as string)) as TextChannel;

						if (starboardChannel) {
							const starboardEmoji = await emojis.fetch(emoji.id);

							const messageImageURLs = (content?.match(URLRegExp) ?? []).filter(isImageLink);

							await starboardChannel.send({
								embeds: [
									{
										title: `<:${starboardEmoji.animated ? "a:" : ""}_:${emojiID}> ${count} | <#${channelId}>`,
										description: `${content}\n\n[Jump to Message](${url})`.trim(),
										color: Colours.Transparent,
										author: {
											name: author?.username ?? "👤 Unknown",
											icon_url: author?.avatarURL() ?? "" // TODO: Add a question mark icon for if the avatar URL fails to load.
										},
										footer: {
											text: `${client.user?.username as string} - Message ID • Time sent at - ${message.id}`,
											icon_url: client.user?.displayAvatarURL({
												forceStatic: false,
												size: 4096
											})
										},
										timestamp: new Date(createdTimestamp).toISOString()
									},
									...embeds
										.map((embed) => embed.data)
										// Filter out embedded image links saved from the original message.
										// There has to be a complicated statement because embed.type is deprecated.
										.filter((embed) => {
											const embedKeys = Object.keys(embed);

											const {thumbnail} = embed;

											if (embed.url && thumbnail?.url) {
												const {proxy_url} = thumbnail;

												const urlIndex = messageImageURLs.indexOf(embed.url);
												const thumbnailURLIndex = messageImageURLs.indexOf(thumbnail.url);

												if (
													embedKeys.length === 3 &&
													// Only have to check for one of the variables if they are equal to -1 since the variables are compared either way.
													urlIndex !== -1 &&
													urlIndex === thumbnailURLIndex &&
													proxy_url ===
														`https://media.discordapp.net${
															/(?<=https:\/\/cdn.discordapp.com)[\s\S]+/.exec(thumbnail.url)?.[0]
														}`
												) {
													return false;
												}
											}

											return true;
										})
										.map((embed) => {
											if (embed.video) {
												const newEmbed: APIEmbed = {...embed};

												// This conversion is safe & necessary because if the embed contains a video, it will have a thumbnail and a URL.
												newEmbed.image = {url: newEmbed.thumbnail?.url as string};
												newEmbed.footer = {
													text: `${newEmbed.provider?.name}`,
													icon_url: "../../../../assets/video-play-icon.png"
												};

												return newEmbed;
											}

											return embed;
										})
										// Make sure that the limit of embeds per message is not exceeded.
										.slice(0, 24)
								],
								// Note: The following code matches links in the content of the message and then filters out any non-image links as they behave in a bit of a strange way.
								// This doesn't apply to message's *files* as those behave the same way as in the original message.
								files: [...Array.from(attachments.values()).map((attachment) => attachment.url), ...messageImageURLs]
							});
						}
					}
				}
			}
		}
	}
};
