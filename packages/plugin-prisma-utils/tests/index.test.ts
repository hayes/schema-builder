import { execute, printSchema } from 'graphql';
import { gql } from 'graphql-tag';
import { prisma } from './examples/simple/builder';
import schema from './examples/simple/schema';

let queries: unknown[] = [];
prisma.$use((params, next) => {
  queries.push(params);

  return next(params);
});

describe('prisma utils', () => {
  afterEach(() => {
    queries = [];
  });

  it('generates schema', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('returns filtered posts', async () => {
    const query = gql`
      query {
        posts(
          order: [{ author: { name: Desc, profile: null } }, {id: Asc }]
          filter: { id: { not: { equals: 11 } } }
        ) {
          id
          author {
            name
          }
        }
      }
    `;

    const result = await execute({
      schema,
      document: query,
      contextValue: { user: { id: 1 } },
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "posts": [
            {
              "author": {
                "name": "Schuyler Bergnaum",
              },
              "id": "26",
            },
            {
              "author": {
                "name": "Schuyler Bergnaum",
              },
              "id": "27",
            },
            {
              "author": {
                "name": "Schuyler Bergnaum",
              },
              "id": "28",
            },
          ],
        },
      }
    `);

    expect(queries).toMatchInlineSnapshot(`
      [
        {
          "action": "findMany",
          "args": {
            "include": {
              "author": true,
            },
            "orderBy": [
              {
                "author": {
                  "name": "desc",
                  "profile": undefined,
                },
              },
              {
                "id": "asc",
              },
            ],
            "take": 3,
            "where": {
              "id": {
                "not": {
                  "equals": 11,
                },
              },
            },
          },
          "dataPath": [],
          "model": "Post",
          "runInTransaction": false,
        },
      ]
    `);
  });
});
