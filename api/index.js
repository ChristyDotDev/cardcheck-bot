const {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} = require('discord-interactions');
const getRawBody = require('raw-body');

const CARDCHECK_COMMAND = {
  name: 'Card Check',
  description: 'Checks your lineups',
};

const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&scope=applications.commands`;

module.exports = async (request, response) => {
  console.log("GOT REQUEST")
  console.log(request)

  if (request.method === 'POST') {
    const signature = request.headers['x-signature-ed25519'];
    const timestamp = request.headers['x-signature-timestamp'];
    const rawBody = await getRawBody(request);

    const isValidRequest = verifyKey(
      rawBody,
      signature,
      timestamp,
      process.env.PUBLIC_KEY
    );

    if (!isValidRequest) {
      console.error('Invalid Request');
      return response.status(401).send({ error: 'Bad request signature ' });
    }

    const message = request.body;

    if (message.type === InteractionType.PING) {
      console.log('PINGED');
      response.send({
        type: InteractionResponseType.PONG,
      });
    } else if (message.type === InteractionType.APPLICATION_COMMAND) {
      switch (message.data.name.toLowerCase()) {
        case CARDCHECK_COMMAND.name.toLowerCase():
          response.status(200).send({
            type: 4,
            data: {
              content:
                "Test Cardcheck response",
              flags: 64,
            },
          });
          console.log('Cardcheck request');
          break;
        default:
          console.error('Unknown Command');
          response.status(400).send({ error: 'Unknown Type' });
          break;
      }
    } else {
      console.error('Unknown Type');
      response.status(400).send({ error: 'Unknown Type' });
    }
  }
};
