# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false
    field :full_name, String, null: false
    field :user_name, String, null: false
    field :email, String, null: false
    field :daily_calorie_limit, Int, null: false
    field :monthly_spending_limit_in_cents, Int, null: false
  end
end
