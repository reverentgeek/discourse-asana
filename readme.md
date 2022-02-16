# Discourse Forum to Asana integration

This is used at ActiveCampaign to synchronize a specific Discourse Forum (developer topics) to an Asana project. This code uses several custom fields to sync using the forum post ID, the URL, and an enum to tag the task as a support task.

## Setup

* Clone or download project
* Install dependencies using `npm install`
* Copy `.env.sample` to `.env`
* Update `.env` with your Discourse and Asana environment settings

## Run Integration Manually

```sh
node .
```

## Deployment

This code is designed to be deployed with minor modifications to a scheduled task runner such as [Pipedream](https://pipedream.com/).
