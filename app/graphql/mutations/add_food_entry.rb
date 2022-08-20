module Mutations
  class AddFoodEntry < BaseMutation
    # arguments passed to the `resolve` method
    argument :name, String, required: true
    argument :calories, Int, required: true
    argument :price_in_cents, Int, required: true

    # return type from the mutation
    type Types::FoodEntryType

    def resolve(name: nil, calories: nil, price_in_cents: nil)
      FoodEntry.create!(
        name: name,
        calories: calories,
        price_in_cents: price_in_cents,
        created_by: context[:current_user],
      )
    end
  end
end