/**
const question = await QuestionModel.create({
			creatorId: message.member?.id,
			value: `What is asked?`,
			placeholder: 'Some description'
		});

		await FormModel.create({
			creatorId: message.member?.id,
			author: {
				userId: message.member?.id,
				name: 'Edrian',
				avatarURL: message.member?.user.avatarURL()
			},
			title: 'Test form',
			description: 'Some description',
			requiredRoles: ['950994824973127720'],
			rewardRoles: ['950985316922163210'],
			destination: [
				{
					type: 'GUILD_CHANNEL',
					ids: ['951135784839307274']
				}
			],
			resultDestination: {
				type: 'GUILD_CHANNEL',
				id: '951135784839307274'
			},
			verification: true,
			questions: [question._id]
		});
 */
