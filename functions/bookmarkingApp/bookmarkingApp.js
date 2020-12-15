const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const faunabQuery = faunadb.query;
require("dotenv").config();

var client = new faunadb.Client({
  secret: process.env.FAUNADB_ADMIN_SECRET,
});

const typeDefs = gql`
  type Query {
    bookmark: [Bookmark]
  }
  type Bookmark {
    id: ID!
    url: String!
    title: String!
    image: String!
    description: String!
  }
  type Mutation {
    addBookMark(
      url: String!
      description: String!
      title: String!
      image: String!
    ): Bookmark
    removeBookMark(id: ID!): Bookmark
  }
`;

const resolvers = {
  Query: {
    bookmark: async (root, args, context) => {
      try {
        var result = await client.query(
          faunabQuery.Map(
            faunabQuery.Paginate(faunabQuery.Match(faunabQuery.Index("bookmarkUrl"))),
            faunabQuery.Lambda((x) => faunabQuery.Get(x))
          )
        );
        return result.data.map((d) => {
          return {
            id: d.ref.id,
            url: d.data.url,
            title: d.data.title,
            image: d.data.image,
            description: d.data.description,
          };
        });
      } catch (error) {
        console.log("error", error);
      }
    },
  },
  Mutation: {
    addBookMark: async (_, { url, description, title, image }) => {
      try {
        var result = await client.query(
          faunabQuery.Create(faunabQuery.Collection("bookmark"), {
            data: {
              title,
              url,
              description,
              image,
            },
          })
        );
        console.log("Document Created : ", result.ref.id);
        return result.ref.data;
      } catch (error) {
        console.log("error", error);
      }
      console.log("Url : ", url, " Descp :", descprition);
    },
    removeBookMark: async (_, id) => {
      console.log("Id inside Bookmark :", id);
      try {
        var result = await client.query(
          faunabQuery.Delete(
            faunabQuery.Ref(faunabQuery.Collection("bookmark"), id.id)
          )
        );
        console.log("Document Deleted : ", result.ref.id);
        return result.ref.data;
      } catch (error) {
        console.log("Id inside Bookmark :", id);
        console.log("error ", error);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler();
