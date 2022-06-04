module Types
  class QueryType < Types::BaseObject
    # Add `node(id: ID!) and `nodes(ids: [ID!]!)`
    include GraphQL::Types::Relay::HasNodeField
    include GraphQL::Types::Relay::HasNodesField

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :users, [Types::UserType], null: false,
      description: "Users of Hey Honey!"
    def users
      [
        {
          id: 1,
          name: "Erin Upton",
        },
        {
          id: 2,
          name: "Jimmy Truong",
        },
      ]
    end
  end
end
