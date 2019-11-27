import RabbitManagmentAPI from '../lib/rabbit-mngmt';
import { getEnv } from '../lib/common';

let env;
let rmngmt;

export const handler = async (event) => {
  console.log(`event: ${JSON.stringify(event, null, 2)}`);

  if (!env) {
    env = await getEnv([
      'RABBITMQ_MNGMT_HOST',
      'RABBITMQ_MNGMT_HTTAUTH_ENCRYPTED',
    ]);

    const hostname = env.RABBITMQ_MNGMT_HOST;
    const [username, password] = env.RABBITMQ_MNGMT_HTTAUTH.split(':');

    console.log(`rabbit management user: ${username} [${password.substr(0, 4)}]`);
    console.log(`rabbit management host: ${hostname}`);

    if (!rmngmt) {
      rmngmt = new RabbitManagmentAPI({
        username,
        password,
        hostname,
        protocol: 'https',
      });
    }
  }

  const { body: bodyJson, pathParameters: { vhost, name: exchangeName } } = event;

  console.log(`vhost: ${vhost}, exchange: ${exchangeName}`);

  rmngmt.sendRequest('post', event.path);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'ok' }),
  };
};
