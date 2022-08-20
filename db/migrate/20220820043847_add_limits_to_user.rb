class AddLimitsToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :daily_calorie_limit, :integer, default: 2100
    add_column :users, :monthly_spending_limit_in_cents, :integer, default: 1_000_00
  end
end
