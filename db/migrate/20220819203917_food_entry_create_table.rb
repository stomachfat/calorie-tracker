class FoodEntryCreateTable < ActiveRecord::Migration[7.0]
  def change
    create_table(:food_entries) do |t|
      t.string :name
      t.integer :calories
      t.integer :price_in_cents
      t.belongs_to :created_by, index: true

      t.timestamps
    end
  end
end
