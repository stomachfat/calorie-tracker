module Types
  class MutationType < Types::BaseObject
    # TODO: remove me
    field :test_field, String, null: false,
      description: "An example field added by the generator"
    def test_field
      "Hello World"
    end

    # field :add_food_entry, Types::FoodEntryType, null: false,
    #   description: "Allows users a food entry"
    # def add_food_entries
    #   # TODO
    # end

    field :add_food_entry, mutation: Mutations::AddFoodEntry
  end
end
