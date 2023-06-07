import {APIEmbed, GuildEmoji, TextChannel} from "discord.js";
import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";
import {Event} from "types";
import {Colours, URLRegExp, displayAvatarURLOptions, isImageLink} from "../../../utility.js";

export const messageReactionAdd: Event<"messageReactionAdd"> = {
	async execute(client, reaction) {
		const {message} = reaction;
		const {guild} = message;

		if (guild) {
			const guildSettings = await guildSettingsSchema.findOne({id: guild.id});

			if (guildSettings?.starboard?.channels.length) {
				const {emoji} = reaction;

				for (const channel of guildSettings.starboard.channels) {
					if (
						(emoji.id ?? emoji.name) === channel.emojiID && // The emoji is the one of the starboard channel.
						channel.channelID !== message.channelId // The message is not in the starboard channel
					) {
						// When the owner or an admin adds a channel, the bot would have checked that the channel is not of type CategoryChannel or type ForumChannel.
						// That means that the assertion that the channel is of type TextChannel is safe.
						const starboardChannel = (await (
							await client.guilds.fetch(guild.id)
						).channels.fetch(channel.channelID as string)) as TextChannel;

						const starredMessageID = channel.starredMessageIDs?.[message.id];

						if (
							starredMessageID
							// The message has been sent already => reaction count needs to be updated.
						) {
							const starredMessage = await starboardChannel.messages.fetch(starredMessageID);

							const {title} = starredMessage.embeds[0].data;

							// Assertion necessary because the embed needs to be edited.
							// Updating the reaction count.
							(starredMessage.embeds[0].data as APIEmbed).title = title?.replace(/> \d+/, `> ${reaction.count}`);

							await starredMessage.edit({
								embeds: starredMessage.embeds
							});
						} else if (
							// Message hasn't been sent to the starboard channel => needs to be sent.
							// Both of these values are going to be numbers so the assertion is safe.
							(reaction.count as number) >= (channel.emojiCount as number)
						) {
							const {author, content, url, createdTimestamp, attachments, embeds} = message;
							const {emojis} = guild;

							const starboardEmoji = emoji.id ? await emojis.fetch(emoji.id) : null;

							const messageImageURLs = (content?.match(URLRegExp) ?? []).filter(isImageLink);

							const starboardMessage = await starboardChannel.send({
								embeds: [
									{
										// If emoji.id is truthy, that means that it is a string, and therefore the starboardEmoji is a GuildEmoji, since the bot checks whenever a starboard emoji is deleted.
										title: `${emoji.id ? `<:${(starboardEmoji as GuildEmoji).animated ? "a:" : ""}_:` : ""}${
											channel.emojiID
										}${emoji.id ? ">" : ""} ${reaction.count} | <t:${Math.round(Date.now() / 1000)}:R> | <#${
											message.channelId
										}>`,
										description: `${content}\n\n[Jump to Message](${url})`.trim(),
										color: Colours.Transparent,
										author: {
											name: author?.username ?? "👤 Unknown",
											icon_url:
												author?.avatarURL() ??
												"https://cdn.discordapp.com/attachments/1020058739526619186/1115270152544596018/800px-Blue_question_mark_icon.png"
										},
										footer: {
											text: `${client.user?.username as string} - Message ID • Time sent at - ${message.id}`,
											icon_url: client.user?.displayAvatarURL(displayAvatarURLOptions)
										},
										timestamp: new Date(createdTimestamp).toISOString()
									},
									...embeds
										.map((embed) => embed.data)
										// Filter out embedded image links saved from the original message.
										// There has to be a complicated statement because embed.type is deprecated.
										.filter((embed) => {
											const {thumbnail} = embed;

											if (embed.url && thumbnail?.url) {
												const {proxy_url} = thumbnail;

												const embedKeys = Object.keys(embed);
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
													icon_url:
														"https://cdn.discordapp.com/attachments/1020058739526619186/1115247093301391360/video-play-icon.png"
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

							channel.starredMessageIDs ??= {};
							channel.starredMessageIDs[message.id] = starboardMessage.id;

							const {starboard} = guildSettings;
							await guildSettingsSchema.updateOne({id: guild.id}, {starboard});
						}
					}
				}
			}
		}
	}
};
