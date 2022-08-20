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
      User.all
    end

    field :food_entries, [Types::FoodEntryType], null: false,
      description: "All food entries"
    def food_entries
      FoodEntry.where(created_by_id: context[:current_user].id)
    end

    field :user, Types::UserType, null: false,
      description: "Current User"
    def user
      # {
      #   id: 1, 
      #   provider: "email", 
      #   uid: "thamestruong@gmail.com", 
      #   full_name: "Jimmy Truong", 
      #   user_name: "stomachfat", 
      #   email: "thamestruong@gmail.com", 
      #   daily_calorie_limit: 2100, 
      #   monthly_spending_limit_in_cents: 100000
      # }
      User.find_by_id(context[:current_user].id)
    end

  end
end
