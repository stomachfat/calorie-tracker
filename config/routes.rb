Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'auth'
  # Default route goes to home#index
  root to: "home#index"

  get 'home/index'
  

  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
  post "/graphql", to: "graphql#execute"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
