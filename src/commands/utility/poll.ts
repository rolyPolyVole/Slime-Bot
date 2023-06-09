import {SlashCommandBuilder, ChannelType} from "discord.js";
import {evaluate} from "mathjs";
import mongoose from "mongoose";
import {
	createSuccessMessage,
	createErrorMessage,
	PollMessageBuilder,
	checkPermissions,
	resolveDate
} from "../../utility.js";
import temporaryDataSchema from "../../schemas/temporaryDataSchema.js";
import {Command} from "../../types";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("📊 Create a poll for others to vote on!")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("create")
				.setDescription("📝 Create a poll.")
				.addStringOption((option) =>
					option.setName("message").setDescription("💬 What do you want to be voted on?").setRequired(true)
				)
				.addStringOption((option) => option.setName("description").setDescription("📜 The description of the poll."))
				.addStringOption((option) =>
					option
						.setName("colour")
						.setDescription("The colour of the poll embed. Accepts colour codes and the names of colours.")
				)
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription("The channel that the poll should be sent in")
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption((option) =>
					option
						.setName("max-options")
						.setDescription("The maximum number of options that a user can select.")
						.addChoices(
							{name: "Unlimited", value: "Unlimited"},
							{name: "1", value: "1"},
							{name: "2", value: "2"},
							{name: "3", value: "3"},
							{name: "4", value: "4"},
							{name: "5", value: "5"},
							{name: "6", value: "6"},
							{name: "7", value: "7"},
							{name: "8", value: "8"},
							{name: "9", value: "9"},
							{name: "10", value: "10"},
							{name: "11", value: "11"},
							{name: "12", value: "12"},
							{name: "13", value: "13"},
							{name: "14", value: "14"},
							{name: "15", value: "15"}
						)
				)
				.addStringOption((option) =>
					option.setName("duration").setDescription(
						// eslint-disable-next-line quotes
						'The poll duration. E.g. "5m", "5 minutes", "3 hours", "5 days", "1 week".'
					)
				)
				.addBooleanOption((option) =>
					option.setName("anonymous").setDescription("Whether the poll should be sent anonymously.")
				)
				.addRoleOption((option) =>
					option.setName("required-role").setDescription("The role required to vote on the poll.")
				)
				.addRoleOption((option) => option.setName("ping").setDescription("The role that the bot should ping."))
				.addStringOption((option) =>
					option
						.setName("thread-name")
						.setDescription("If a name is provided, a thread will be created with that name.")
				)
				.addStringOption((option) =>
					option
						.setName("attachments")
						.setDescription("Send an attachment. Send multiple by separating links with commas.")
				)
				.addStringOption((option) => option.setName("choice-1").setDescription("The first option."))
				.addStringOption((option) => option.setName("choice-2").setDescription("The second option."))

				.addStringOption((option) => option.setName("choice-3").setDescription("The third option."))
				.addStringOption((option) => option.setName("choice-4").setDescription("The fourth option."))
				.addStringOption((option) => option.setName("choice-5").setDescription("The fifth option."))
				.addStringOption((option) => option.setName("choice-6").setDescription("The sixth option."))
				.addStringOption((option) => option.setName("choice-7").setDescription("The seventh option."))
				.addStringOption((option) => option.setName("choice-8").setDescription("The eighth option."))
				.addStringOption((option) => option.setName("choice-9").setDescription("The ninth option."))
				.addStringOption((option) => option.setName("choice-10").setDescription("The tenth option."))
		),
	usage: [
		"poll create message: poll question description: description of the poll question channel: channel to send the poll message to colour: colour of the embed of the poll message max-options: maximum number of options a user can select duration: the duration of time users can vote on the poll"
	],
	examples: [
		"poll create message: Is Cereal a Soup? description: Top scientists have been consumed by this question for years. choice-1: Yes choice-2: No",
		"poll create message: Is Slime Bot the best bot? description: Truly an intriguing conundrum. choice-1: Yes"
	],
	/* .addSubcommand((subcommand) =>
			subcommand
				.setName("results")
				.setDescription("Shows the results of a poll")
				.addStringOption((option) =>
					option
						.setName("message")
						.setDescription("The ID or link of the poll message.")
						.setRequired(true)
				)
		)*/ async execute(interaction, client) {
		if (interaction.options.getSubcommand() === "create") {
			let duration: string | null | number = interaction.options.getString("duration");

			if (duration) {
				try {
					duration = evaluate(
						`${resolveDate(/^in.+/.test(duration.trim()) ? duration.match(/(?<=^in).+/)[0] : duration)}`
					);
				} catch (error) {
					return interaction.reply(createErrorMessage(`**Invalid duration provided:** ${duration}\n\n> ${error}`));
				}
			}

			const channel = interaction.options.getChannel("channel") ?? interaction.channel;

			const permissions = await checkPermissions(
				["ViewChannel", "SendMessages", "EmbedLinks"],
				[interaction.user, client.user],
				channel,
				interaction.guild,
				interaction.user
			);

			if (!permissions.value) {
				return interaction.reply(createErrorMessage(permissions.message));
			}

			await interaction.deferReply({
				ephemeral: true
			});

			const poll = await new PollMessageBuilder().create(interaction, client);

			const embedMessage = await channel.send(poll);

			for (const emoji of poll.emojis.filter((emoji) => emoji)) {
				await embedMessage.react(emoji);
			}

			if (duration) {
				const temporary = new temporaryDataSchema({
					_id: new mongoose.Types.ObjectId(),
					type: "poll",
					data: {message: embedMessage.id, channel: channel.id},
					creationDate: Date.now(),
					lifeSpan: Math.floor((Date.now() + parseInt(`${duration}`)) / 1000)
				});

				await temporary.save();
			}

			if (interaction.options.getString("thread-name")) {
				const thread = await embedMessage.startThread({
					name: `${interaction.options.getString("thread-name")}`,
					autoArchiveDuration: 60
				});
				if (interaction.options.getRole("ping")) {
					await thread.send(`<@&${interaction.options.getRole("ping").id}>`);
				}
			}

			await interaction.editReply(createSuccessMessage(`Successfully created and sent the poll in ${channel}.`));
		}
	} /* else {
			const input = interaction.options.getString("message").split("/");

			const message =
				(await interaction.channel.messages.fetch(input)) ??
				(await client.channels.fetch(input[5]).messages.fetch(input[6]));

			switch (message.author.id) {
				case "880368773960437840": // Slime Bot
					break;
				case "155149108183695360": // Dyno
					break;

				case "235148962103951360": // Carl Bot
					break;

				case "261157845376958464": // Rock Puppy
					break;

				case "853327905357561948": // Appy
					break;

				case "437618149505105920": // Easy Poll
					break;

				case "324631108731928587": // Simple Poll
					break;

				case "767149423574515712": // Straw Poll
					break;

				default:
			}
		}*/
};
