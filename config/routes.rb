CraftyA::Application.routes.draw do
  get "foo/index"
  root to: "foo#index"

end