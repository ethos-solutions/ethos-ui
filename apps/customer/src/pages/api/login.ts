import fetch from 'node-fetch';

interface Login {
  statusCode: number;
  message: string;
  accessToken: string;
  businessType: string;
  language: string[];
  order_type: string[];
  orgName: string;
  restaurantName: string;
  isEnabled: boolean;
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse {
  data?: {
    login: Login;
  };
  errors?: GraphQLError[];
}

const apiEndPoint = process.env.NEXT_PUBLIC_API_GRAPH_URL;

export default async function handler(
  req: { body: { id: unknown } },
  res: {
    setHeader: (arg0: string, arg1: string) => void;
    status: (arg0: number) => {
      (): unknown;
      new (): unknown;
      json: {
        (arg0: { success?: boolean; error?: string }): void;
        new (): unknown;
      };
    };
  }
) {
  const { id } = req.body;

  const graphqlResponse = await fetch(`${apiEndPoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query Login {
        login(params: { _id: "${id}"}) {
          message
          accessToken
          businessType
          language
          order_type
          orgName
          restaurantName
          restaurantType
          taxMode
          imageUrl
          isEnabled
          colorCode
          background
          default_language
          country
          serviceFee {
            valueType
            value
          }
          currency{
            code
            symbol
          }
          tips
        }
      }
      `,
    }),
  });

  const jsonResponse = (await graphqlResponse.json()) as GraphQLResponse;

  if (jsonResponse.data && jsonResponse.data.login) {
    res.status(200).json({ success: true, ...jsonResponse.data });
  } else {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
