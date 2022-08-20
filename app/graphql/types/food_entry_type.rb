# frozen_string_literal: true

module Types
  class FoodEntryType < Types::BaseObject
    alias :food_entry :object

    field :id, ID, null: false
    field :name, String, null: false
    field :calories, Int, null: false
    field :price_in_cents, Int, null: false
    field :created_by, Types::UserType, null: false
    field :created_at, String, null: false

    def created_at
      food_entry.created_at.iso8601
    end
  end
end
