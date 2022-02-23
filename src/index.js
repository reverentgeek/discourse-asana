"use strict";

const axios = require( "axios" );
const dotenv = require( "dotenv" );
dotenv.config();

function formatCustomId( id ) {
	return `Forum: ${ id }`;
}

async function getTopics( baseUrl, slug, topicId, days ) {
	try {
		const dt = new Date();
		dt.setDate( dt.getDate() - days );

		const config = {
			method: "get",
			url: `${ baseUrl }/c/${ slug }/${ topicId }.json`
		};

		const res = await axios( config );
		const topics = res.data["topic_list"].topics;
		// console.log( topics );
		return topics.filter( t => {
			const d = new Date( Date.parse( t.last_posted_at ) );
			return d > dt;
		} );
	} catch ( err ) {
		console.log( err );
		return [];
	}
}

async function getTaskByCustomId( id ) {
	try {
		const {
			ASANA_PAT: asanaToken,
			ASANA_WORKSPACE: workspaceId,
			ASANA_PROJECT: projectId,
			ASANA_CUSTOM_FIELD_EXTERNAL_ID: fieldId
		} = process.env;

		const config = {
			method: "get",
			url: `https://app.asana.com/api/1.0/workspaces/${ workspaceId }/tasks/search?project.all=${ projectId }&custom_fields.${ fieldId }.value=${ formatCustomId( id ) }`,
			headers: {
				Authorization: `Bearer ${ asanaToken }`
			}
		};

		const res = await axios( config );
		return res.data;
	} catch( err ) {
		console.log( err );
		return { data: [] };
	}
}

async function createTask( { title, id, url } ) {
	try {
		const {
			ASANA_PAT: asanaToken,
			ASANA_WORKSPACE: workspaceId,
			ASANA_PROJECT: projectId,
			ASANA_CUSTOM_FIELD_EXTERNAL_ID: fieldId,
			ASANA_CUSTOM_FIELD_URL_ID: urlId,
			ASANA_CUSTOM_FIELD_TASK_TYPE_ID: taskTypeId,
			ASANA_CUSTOM_FIELD_TASK_TYPE_SUPPORT_VALUE: taskTypeValue
		} = process.env;

		const config = {
			method: "post",
			url: "https://app.asana.com/api/1.0/tasks",
			headers: {
				Authorization: `Bearer ${ asanaToken }`
			},
			data: {
				data: {
					name: title,
					workspace: workspaceId,
					projects: [ projectId ],
					custom_fields: { }
				}
			}
		};

		config.data.data.custom_fields[`${ fieldId }`] = formatCustomId( id );
		config.data.data.custom_fields[`${ urlId }`] = url;
		config.data.data.custom_fields[`${ taskTypeId }`] = taskTypeValue;

		const res = await axios( config );
		return res.data;

	} catch ( err ) {
		console.log( err );
		return "Error: " + err.message;
	}
}

( async () => {
	const {
		DISCOURSE_BASE_URL: baseUrl,
		DISCOURSE_TOPIC_SLUG: slug,
		DISCOURSE_TOPIC_ID: topicId,
		DISCOURSE_DAYS_TO_SEARCH: days
	} = process.env;

	const topics = await getTopics( baseUrl, slug, topicId, days );
	for( const { id, title, slug: topicSlug } of topics ) {
		const tasks = await getTaskByCustomId( id );
		if ( !tasks.data.length ) {
			console.log( `Creating task for [${ id }], [${ title }]` );
			const url = `${ baseUrl }/t/${ topicSlug }/${ id }`;
			await createTask( { title, id, url } );
		}
	}
} )();
